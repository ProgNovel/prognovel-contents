import { novelFiles } from "../../_files";
import { load } from "js-yaml";
import { readFileSync } from "fs";
import type { ChapterData } from "./chapter";

export function generateContributorData(chapterData: any, novel: string): ChapterData {
  let { contributors, title, body, monetization, banner } = chapterData;
  const config = novelFiles(novel).contributorsConfig;
  const contributorData = load(readFileSync(config));

  return {
    title,
    body,
    monetization,
    banner,
    contributors: Object.keys(contributors).reduce((prev, cur) => {
      if (contributors[cur])
        prev[cur] = contributors[cur]
          .split(",")
          .map((name: string) => name.trim())
          .filter((name: string) => !!name)
          .map((contributor) => {
            if (typeof contributorData[contributor] === "string") {
              contributorData[contributor] = {
                payment: contributorData[contributor],
              };
            }

            return {
              name: contributor,
              ...(contributorData[contributor] || {}),
            };
          });

      return prev;
    }, {}),
  };
}
