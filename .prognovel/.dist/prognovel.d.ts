import { host } from "./hosting";
import { check } from "./check";
import { fixTypo } from "./fix-typo";
declare function init(opts?: any): Promise<void>;
declare function addNovel(opts?: any): Promise<void>;
declare function build(opts?: any): Promise<void>;
export { init, build, addNovel, host, check, fixTypo };
