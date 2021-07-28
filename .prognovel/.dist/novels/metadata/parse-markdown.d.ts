import type { UnregisterContributor } from "../types";
interface Options {
    hash?: boolean;
}
interface Cache {
    [novel: string]: CacheValue;
    assignedRoles: any;
}
interface CacheValue {
    body: string;
    data: any;
    lastModified: DOMHighResTimeStamp;
    contributions: any;
    unregistered: UnregisterContributor[];
    hash?: string;
}
export declare function parseMarkdown(novel: string, files: string[], opts?: Options): Promise<parsingMarkdownResult>;
interface parsingMarkdownResult {
    content: any;
    chapters: string[];
    chapterTitles: object;
    contributions: object;
    unregisteredContributors: string[];
    unchangedFiles: number;
    cache: Cache;
}
export {};
