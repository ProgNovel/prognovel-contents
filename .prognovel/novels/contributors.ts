import chalk from "chalk";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import { findBestMatch } from "string-similarity/src/index";
import { cacheFiles } from "../_files";
import type {
  UnregisterContributor,
  TypoUnregisteredContributor,
  RevShareNovelMetadata,
} from "../novels/types";

interface ContributorProfile {
  name: string;
  payment: string;
  email?: string;
}

export const contributors = {
  pool: new Map() as Map<string, ContributorProfile[]>,
  addContributor(novel: string, contributor: ContributorProfile) {
    if (!this.pool[novel]) this.pool[novel] = [];
    this.pool[novel] = [...this.pool[novel], contributor];
  },
  bulkAddContributors(novel: string, data: any) {
    for (const contributor in data) {
      if (typeof data[contributor] === "string") {
        data[contributor] = {
          payment: data[contributor],
        };
      }
      data[contributor].name = contributor;
      this.addContributor(novel, data[contributor]);
    }
  },
  getNovelContributors(novel: string) {
    return this.pool[novel];
  },
};
export const contributionRoles = {
  roles: [],
  contributorAssignedRoles: {},
  set(roles: string[]) {
    this.roles = roles;
  },
  get() {
    return this.roles;
  },
  // TODO - allow role unassign after a change in the markdown
  assignRole(contributor: string, role: string) {
    this.contributorAssignedRoles[contributor] = Array.from(
      new Set([...(this.contributorAssignedRoles[contributor] || []), role]),
    );
  },
  setAssignedRolesForNovel(novel: string) {
    try {
      this.contributorAssignedRoles = JSON.parse(readFileSync(`.cache/${novel}.json`, "utf-8")).assignedRoles;
    } catch (err) {}
  },
};
export const revSharePerChapter = {
  rev_share: {},
  set(rev_share) {
    this.rev_share = rev_share;
  },
  get() {
    return this.rev_share;
  },
};

export function calculateContributors(novel, contributions): RevShareNovelMetadata[] {
  return Object.keys(contributions).map((contributor) => {
    const contributorData = contributors.getNovelContributors(novel).find((c) => c.name === contributor);
    const result: RevShareNovelMetadata = {
      name: contributor,
      weight: contributions[contributor],
      paymentPointer: `${contributorData.payment}`,
      webfundingPaymentPointer: `${contributorData.payment}#${contributions[contributor]}`,
      roles: contributionRoles.contributorAssignedRoles[contributor],
    };

    if (contributorData.email) result.email = contributorData.email;

    return result;
  });
}

export function warnUnregisteredContributors(
  unregisteredContributors: Array<{ contributor: string; where: string }>,
  margin = 0,
  novel: string,
) {
  const EMPTY_SPACES = 44; // length
  const l = unregisteredContributors.length;
  const m = Array(margin).fill(" ").join("");
  let i = 0;
  const typos = unregisteredContributors.length ? showTypoError() : [];
  if (!l) return;
  console.log(
    m +
      chalk.bold.yellow(
        Array(EMPTY_SPACES + 2)
          .fill("*")
          .join(""),
      ) +
      (typos[i++] || ""),
  );
  console.log(m + chalk.bold.yellow("*" + Array(EMPTY_SPACES).fill(" ").join("") + "*") + (typos[i++] || ""));
  console.log(
    m +
      chalk.bold.yellow(
        `*  ${chalk.underline(l + " unregistered contributors found" + (l > 9 ? "" : " "))}        *`,
      ) +
      (typos[i++] || ""),
  );
  console.log(chalk.bold.yellow(m + "*                                            *") + (typos[i++] || ""));
  unregisteredContributors.forEach((warn) => {
    const text = `  - ${warn.contributor} at ${warn.where}`;
    const spaces =
      EMPTY_SPACES - text.length > 0 ? new Array(EMPTY_SPACES - text.length).join(" ") + " " : "";
    console.log(m + chalk.bold.yellow("*" + text + spaces + "*") + (typos[i++] || ""));
  });
  console.log(m + chalk.bold.yellow("*" + Array(EMPTY_SPACES).fill(" ").join("") + "*") + (typos[i++] || ""));
  console.log(
    m +
      chalk.bold.yellow(
        Array(EMPTY_SPACES + 2)
          .fill("*")
          .join(""),
      ) +
      (typos[i++] || ""),
  );
  console.log("");

  function showTypoError() {
    const c = chalk.bold.grey;
    let i = 0;
    let prefix = "  // ";
    let text = [];
    text[i++] = c(prefix + chalk.underline("possible typos:"));
    text[i++] = c(prefix);
    const processedUnregisteredContributors = unregisteredContributors
      .map((obj: UnregisterContributor) => {
        const contributorNames = contributors
          .getNovelContributors(novel)
          .reduce((prev: string[], cur: ContributorProfile): string[] => {
            return [...prev, cur.name];
          }, []);
        let typo = findBestMatch(obj.contributor, contributorNames);
        return {
          ...obj,
          rating: typo.bestMatch.rating,
          fixedName: typo.bestMatch.target,
        };
      })
      .filter((contributor: TypoUnregisteredContributor) => contributor.rating > 0.2)
      .sort((a: TypoUnregisteredContributor, b: TypoUnregisteredContributor) => b.rating - a.rating);

    processedUnregisteredContributors.forEach(
      ({ contributor, fixedName, where, rating }: TypoUnregisteredContributor) => {
        text[i++] = c(
          prefix + `${contributor} -> ${fixedName} (${where}) ...${Math.floor(rating * 100)}% likely`,
        );
      },
    );

    text[i++] = "";
    text[i++] =
      "  " +
      chalk.bgGreen.whiteBright(" TIPS ") +
      ` Use command ${chalk.bold.green("prognovel fix-typo")} to fix above typos`;
    text[i++] = "         in batches (make sure suggestions above correct first).";

    if (!existsSync(cacheFiles().folder)) mkdirSync(cacheFiles().folder);

    let typoCache;
    try {
      typoCache = JSON.parse(readFileSync(cacheFiles().typoCache, "utf-8"));
    } catch (error) {
      typoCache = {};
    }
    typoCache[novel] = processedUnregisteredContributors;

    writeFileSync(cacheFiles().typoCache, JSON.stringify(typoCache));

    return processedUnregisteredContributors.length ? text : [];
  }
}
