declare type NovelID = string;
export declare const files: {
    cache: string;
    novel: (id: NovelID) => {
        metadata: string;
        contentFolder: string;
        banner: any;
        cover: any;
    };
};
export {};
