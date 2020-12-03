export declare const contributors: {
    pool: Map<any, any>;
    addContributor(novel: string, contributor: string): void;
    bulkAddContributors(novel: string, people: string[]): void;
    get(novel: string): any;
};
export declare const contributionRoles: {
    roles: any[];
    set(roles: string[]): void;
    get(): any;
};
export declare const revSharePerChapter: {
    rev_share: {};
    set(rev_share: any): void;
    get(): any;
};
export declare function addContributor(novel: string, contributor: string): void;
export declare function calculateContributors(novel: any, contributions: any): string[];
export declare function warnUnregisteredContributors(unregisteredContributors: Array<{
    contributor: string;
    where: string;
}>, margin: number, novel: string): void;
