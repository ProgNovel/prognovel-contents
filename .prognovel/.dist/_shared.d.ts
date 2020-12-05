declare type NovelID = string;
declare type cacheFiles = {
    folder: string;
    siteMetadata: string;
    typoCache: string;
    novelMetadata: (novel: NovelID) => string;
};
export declare const files: {
    cache: () => cacheFiles;
    novel: (id: NovelID) => {
        metadata: string;
        contentFolder: string;
        banner: any;
        cover: any;
    };
};
export {};
