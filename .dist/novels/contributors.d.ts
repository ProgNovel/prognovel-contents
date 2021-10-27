import type { RevShareNovelMetadata } from "../novels/types";
interface ContributorProfile {
    name: string;
    payment: string;
    email?: string;
}
export declare const contributors: {
    pool: Map<string, ContributorProfile[]>;
    addContributor(novel: string, contributor: ContributorProfile): void;
    bulkAddContributors(novel: string, data: any): void;
    getNovelContributors(novel: string): any;
};
export declare const contributionRoles: {
    roles: any[];
    contributorAssignedRoles: {};
    set(roles: string[]): void;
    get(): any;
    assignRole(contributor: string, role: string): void;
    setAssignedRolesForNovel(novel: string): void;
};
export declare const revSharePerChapter: {
    rev_share: {};
    set(rev_share: any): void;
    get(): any;
};
export declare function calculateContributors(novel: any, contributions: any): RevShareNovelMetadata[];
export declare function warnUnregisteredContributors(unregisteredContributors: Array<{
    contributor: string;
    where: string;
}>, margin: number, novel: string): void;
export {};
