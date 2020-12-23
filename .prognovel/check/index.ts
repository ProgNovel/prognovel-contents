import { readChapterBuffer } from "../novels/metadata/read-buffer";
import { Readable } from "stream";

const mock = [`{"test":[0,`, `12], "w`, `ew":[13, 20]}--`, `-testing tes`, `ting oi oi oi`];

export async function check() {
  const readable = new Readable();
  readable.push(mock[0], "utf-8");
  readable.push(mock[1], "utf-8");
  readable.push(mock[2], "utf-8");
  readable.push(mock[3], "utf-8");
  readable.push(mock[4], "utf-8");
  // readable.pipe(readChapterBuffer);
  // readChapterBuffer(readable);
}
