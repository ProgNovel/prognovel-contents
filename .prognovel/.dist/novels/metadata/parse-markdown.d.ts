interface Cache {
    file: {
        body: string;
        data: any;
        lastModified: DOMHighResTimeStamp;
        contributions: any;
        unregistered: string[];
    };
}
export declare function parseMarkdown(novel: string, files: string[]): parsingMarkdownResult;
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
