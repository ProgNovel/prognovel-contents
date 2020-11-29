import chalk from "chalk";

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
  contributors: Array<{ contributor: string; where: string }>,
  margin = 0,
) {
  const EMPTY_SPACES = 44; // length
  const l = contributors.length;
  const m = Array(margin).fill(" ").join("");
  if (!l) return;
  // console.log("");
  console.log(m + chalk.bold.yellow("**********************************************"));
  console.log(m + chalk.bold.yellow("*                                            *"));
  console.log(
    m +
      chalk.bold.yellow(
        `*  ${chalk.underline(l + (l > 10 ? "" : " ") + "unregistered contributors found ")}        *`,
      ),
  );
  console.log(chalk.bold.yellow(m + "*                                            *"));
  contributors.forEach((warn) => {
    const text = `  - ${warn.contributor} at ${warn.where}`;
    const spaces =
      EMPTY_SPACES - text.length > 0 ? new Array(EMPTY_SPACES - text.length).join(" ") + " " : "";
    console.log(m + chalk.bold.yellow("*" + text + spaces + "*"));
  });
  console.log(m + chalk.bold.yellow("*                                            *"));
  console.log(m + chalk.bold.yellow("**********************************************"));
  console.log("");
}
