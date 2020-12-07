import chalk from "chalk";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import { findBestMatch } from "string-similarity/src/index";
import { cacheFiles } from "../_files";
import type { UnregisterContributor, TypoUnregisteredContributor } from "../novels/types";

export const contributors = {
  pool: new Map(),
  addContributor(novel: string, contributor: string) {
    this.pool[novel] = (this.pool[novel] || []).push(contributor);
  },
  bulkAddContributors(novel: string, people: string[]) {
    this.pool[novel] = people;
  },
  get(novel: string) {
    return this.pool[novel];
  },
};
export const contributionRoles = {
  roles: [],
  set(roles: string[]) {
    this.roles = roles;
  },
  get() {
    return this.roles;
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

export function addContributor(novel: string, contributor: string) {
  contributors[novel] = (contributors[novel] || []).push(contributor);
}

export function calculateContributors(novel, contributions): string[] {
  // console.log(contributors.get(novel));
  return Object.keys(contributions).map((contributor) => {
    return `${contributors.get(novel)[contributor]}#${contributions[contributor]}`;
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
        `*  ${chalk.underline(l + (l > 10 ? "" : " ") + "unregistered contributors found ")}        *`,
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
        let typo = findBestMatch(obj.contributor, Object.keys(contributors.get(novel)));
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
