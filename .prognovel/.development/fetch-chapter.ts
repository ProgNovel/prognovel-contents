// @ts-ignore
import md from 'marked';
// import { Remarkable } from 'remarkable';
import fm from 'front-matter';
import { cleanHTML } from '../utils/string';
import { getGithubContentURL } from '../utils/github';

const CACHE_EXPIRE = 60;
const DEFAULT_INDEX = 2;
const MARKDOWN_OPTIONS = {};
// const md = new Remarkable({ html: true });

export async function fetchChapter(
  params: ChapterParams,
  event: FetchEvent,
): Promise<ChapterResponse> {
  const chapter = await getRawChapter(params, event);

  return {
    title: chapter.title || '',
    monetization: chapter.monetization || false,
    html: chapter.content || '',
    index: DEFAULT_INDEX,
  };
}

async function getRawChapter(
  { novel, name, format, book }: ChapterParams,
  event: FetchEvent,
): Promise<RawChapter> {
  const url = getGithubContentURL(
    event,
    `/novels/${novel}/contents/${book ? book + '/' : ''}${name}.${format}`,
  );

  const res = await fetch(url, {
    cf: {
      // @ts-ignore
      cacheTtl: CACHE_EXPIRE,
    },
  });

  console.log('Fetching', url);
  const text = await res.text();
  const frontmatter = fm(text);
  const content = md(frontmatter.body);
  // @ts-ignore
  const isMonetized = ('' + frontmatter.attributes.monetization).toLowerCase() === 'true';

  return {
    //@ts-ignore
    title: frontmatter.attributes.title || '',
    monetization: isMonetized,
    content: cleanHTML(content),
    raw_url: url,
    status: res.status,
  };
}
