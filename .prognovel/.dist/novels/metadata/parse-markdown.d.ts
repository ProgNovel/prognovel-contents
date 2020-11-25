interface Cache {
    file: {
        body: string;
        data: any;
        lastModified: DOMHighResTimeStamp;
        contributions: any;
        unregistered: string[];
    };
}
export declare function parseMarkdown(novel: string, files: string[]): {
    content: {};
    chapters: any[];
    chapterTitles: {};
    contributions: {};
    unregisteredContributors: any[];
    unchangedFiles: number;
    cache: {} | Cache;
    cacheFile: string;
};
export {};
