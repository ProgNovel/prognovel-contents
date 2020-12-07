interface Options {
    hash?: boolean;
}
declare type Cache = {
    file: {
        body: string;
        data: any;
        lastModified: DOMHighResTimeStamp;
        contributions: any;
        unregistered: string[];
        hash: string;
    };
};
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
