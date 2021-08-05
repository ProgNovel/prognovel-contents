import chalk from "chalk";
import { Log } from "../../utils/logging/_shared";
import { warnUnregisteredContributors } from "../contributors";

export const benchmark = {
  glob: {
    start: 0,
    end: 0,
  },
  sorting_chapters: {
    start: 0,
    end: 0,
  },
  markdown: {
    start: 0,
    end: 0,
  },
  rev_share: {
    start: 0,
    end: 0,
  },
  filesystem: {
    start: 0,
    end: 0,
  },
};

export function outputMessage({
  id,
  title,
  files,
  unchangedFiles,
  contributors,
  totalDuration,
  unregisteredContributors,
}) {
  const logTitle = chalk.bold.blueBright("[" + title + "]:");
  const log = new Log({ marginLeft: 0 });
  const contributorsNumber = contributors.getNovelContributors(id)?.length;
  const { glob, sorting_chapters, markdown, rev_share, filesystem } = benchmark;

  const texts = [
    `Generating ${chalk.bold.underline.blue(title)} metadata...`,
    "",
    `${logTitle} Finding markdown files takes ${(glob.end - glob.start).toFixed(2)} ms.`,
    `${logTitle} Sorting chapters takes ${(sorting_chapters.end - sorting_chapters.start).toFixed(2)} ms.`,
    `${logTitle} Calculating revenue sharing takes ${(rev_share.end - rev_share.start).toFixed(2)} ms.`,
    `${logTitle} Processing ${files.length} markdown${files.length !== 1 ? "s" : ""} (${
      files.length - unchangedFiles
    } changed) takes ${(markdown.end - markdown.start).toFixed(2)} ms.`,
    `${logTitle} ${
      contributorsNumber === 1 ? "person contributes" : contributorsNumber + " people contribute"
    } over ${files.length} chapters.`,
    `${logTitle} Generating output files takes ${(filesystem.end - filesystem.start).toFixed(2)} ms.`,
  ];

  if (unregisteredContributors.length) {
    log.marginBottom = 0;
    texts.push(...[`    ${chalk.bold.yellowBright("*")}`, `    ${chalk.bold.yellowBright("*")}`]);
  } else {
    texts.push(
      ...["", `${chalk.bold.underline.greenBright("SUCCESS")} processing ${title} in ${totalDuration} ms.`],
    );
  }

  log.show(texts);
  warnUnregisteredContributors(unregisteredContributors, log.padding + log.marginLeft, id);
}
