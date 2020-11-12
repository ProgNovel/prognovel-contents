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
