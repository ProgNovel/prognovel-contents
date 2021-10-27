export declare const benchmark: {
    glob: {
        start: number;
        end: number;
    };
    sorting_chapters: {
        start: number;
        end: number;
    };
    markdown: {
        start: number;
        end: number;
    };
    rev_share: {
        start: number;
        end: number;
    };
    filesystem: {
        start: number;
        end: number;
    };
};
export declare function outputMessage({ id, title, files, unchangedFiles, contributors, totalDuration, unregisteredContributors, }: {
    id: any;
    title: any;
    files: any;
    unchangedFiles: any;
    contributors: any;
    totalDuration: any;
    unregisteredContributors: any;
}): void;
