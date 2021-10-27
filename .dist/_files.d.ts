export declare const publishFiles: (isNew?: boolean) => PublishFiles;
export declare const siteFiles: (isNew?: boolean) => SiteFiles;
export declare const cacheFiles: () => CacheFiles;
export declare const novelFiles: (id: NovelID, isNew?: boolean) => NovelFiles;
export declare const imageExt: string[];
export declare type NovelID = string;
export declare type NovelImageType = "banner" | "cover" | "UserProfile";
export declare type NovelImageCoverType = "book" | "thumbnail";
interface SiteFiles {
    settings: string;
    contributors: string;
}
interface PublishFiles {
    folder: string;
    fullMetadata: string;
    siteMetadata: string;
    novelFolder: (novel: NovelID) => string;
    novelMetadata: (novel: NovelID) => string;
    novelChapterTitles: (novel: NovelID) => string;
    novelCompiledContent: (novel: NovelID) => string;
    novelBinary: (novel: NovelID) => string;
    novelBinaryRange: (novel: NovelID) => string;
    novelCoverFolder: (novel: NovelID) => string;
    novelCover: (novel: NovelID, type: NovelImageCoverType, ext: NovelImageType, size?: "" | "2x" | "3x") => string;
}
interface CacheFiles {
    folder: string;
    siteMetadata: string;
    typoCache: string;
    novelCompileCache: (novel: NovelID) => string;
}
interface NovelFiles {
    metadata: string;
    contentFolder: string;
    banner: string;
    cover: string;
    synopsis: string;
    info: string;
    contributorsConfig: string;
}
export {};
