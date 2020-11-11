import {
  responseError,
  chapterNameNotFound,
  chapterNovelNotFound,
  chaptersStreamedNotFound,
} from "../utils/errors";
import { headers } from "../handler";
import { fetchChapter } from "./fetch-chapter";
import { streamChapters } from "./stream-chapters";

const MAX_AGE = 60 * 60; // 1 hour
const DEFAULT_CHAPTER_STREAM = 4;

export async function handleChapter(event: FetchEvent): Promise<Response> {
  const url = new URL(event.request.url);
  const params: ChapterParams = {
    name: url.searchParams.get("name") || "",
    novel: url.searchParams.get("novel") || "",
    format: url.searchParams.get("format") || "md",
    book: url.searchParams.get("book") || "",
    stream: !!(url.searchParams.get("stream") || false),
    // chaptersStreamed: url.searchParams.get('chaptersStreamed') || [DEFAULT_CHAPTER_STREAM],
  };

  // required params checks
  if (!params.novel) return responseError(chapterNovelNotFound);

  if (params.stream) {
    if (!params.chaptersStreamed) return responseError(chaptersStreamedNotFound);
    return streamChapters(event, params);
  } else {
    if (!params.name) return responseError(chapterNameNotFound);
    let result = await fetchChapter(params, event);
    const init = { headers };
    init.headers["Cache-Control"] = `private, max-age=${result.status < 300 ? MAX_AGE : 5}`;

    return new Response(JSON.stringify(result, null, 2), init);
  }
}
