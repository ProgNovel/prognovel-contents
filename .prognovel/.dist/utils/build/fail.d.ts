import { ChalkFunction } from "chalk";
import { NovelImageType } from "../../_files";
export declare function errorImageNotFound(novel: string, imageType: NovelImageType): void;
export declare function errorSiteSettingsNotFound(): void;
export declare function failBuild(reason: string | string[], title?: string, color?: ChalkFunction): void;
