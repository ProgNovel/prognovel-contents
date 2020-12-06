import chalk from "chalk";
import { NovelImageType } from "../../_files";
export declare function errorImageNotFound(novel: string, imageType: NovelImageType): void;
export declare function failBuild(reason: string | string[], color?: chalk.Chalk): void;
