import { Readable } from "stream";
interface ChapterBufferResult {
  chapterIndex: ChapterIndex;
}

type ChapterIndex = {
  [range: string]: [from: number, to: number];
};

const SEPARATOR: string = "---";

export async function readChapterBuffer(stream: Readable, chapter?: string): Promise<ChapterBufferResult> {
  try {
    const chapterIndex = await _getMetadataFromBuffer(stream);
    return {
      chapterIndex,
    };
  } catch (err) {
    return { chapterIndex: { error: [0, 0] } };
  }

  async function _getMetadataFromBuffer(stream: Readable): Promise<ChapterIndex> {
    let data = "";
    console.log(stream);
    for await (const chunk of stream) {
      console.log(chunk);
      data += chunk;
      const result: string = data.split(SEPARATOR)[0];
      if (result) {
        stream.destroy();
        return JSON.parse(result) as ChapterIndex;
      }
    }

    console.error("Chapter Index not found on stream.");
    throw "";
  }
}
