/// <reference types="node" />
import { Readable } from "stream";
interface ChapterBufferResult {
    chapterIndex: ChapterIndex;
}
declare type ChapterIndex = {
    [range: string]: [from: number, to: number];
};
export declare function readChapterBuffer(stream: Readable, chapter?: string): Promise<ChapterBufferResult>;
export {};
