import { host } from "./hosting";
import { check } from "./check";
import { fixTypo } from "./fix-typo";
import { failBuild } from "./utils/build";
import { novelFiles, publishFiles, siteFiles } from "./_files";
declare function init(opts?: any): Promise<void>;
declare function addNovel(opts?: any): Promise<void>;
declare function build(opts?: any): Promise<void>;
export { init, build, addNovel, host, check, fixTypo, failBuild, siteFiles, novelFiles, publishFiles };
