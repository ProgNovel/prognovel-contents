import { ChalkFunction } from "chalk";
import { NovelImageType } from "../../_files";
export declare function errorImageNotFound(novel: string, imageType: NovelImageType): void;
export declare function errorSiteSettingsNotFound(): void;
export declare function errorNovelInfoNotFound(novel: string): void;
interface failBuildOptions {
    label?: string;
    color?: ChalkFunction;
    labelColor?: ChalkFunction;
}
export declare function failBuild(reason: string | string[], title?: string, opts?: failBuildOptions): void;
export {};
