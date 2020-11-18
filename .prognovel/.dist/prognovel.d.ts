import { host } from "./hosting";
import { check } from "./check";
declare function init(cwd: string, opts?: any): Promise<void>;
declare function addNovel(cwd: string, opts?: any): Promise<void>;
declare function build(cwd: string, opts?: any): Promise<void>;
export { init, build, addNovel, host, check };
