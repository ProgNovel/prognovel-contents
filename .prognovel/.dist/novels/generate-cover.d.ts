export declare function generateBookCover(novel: string, placeholderRatio?: number): Promise<{
    book: {
        jpeg: {};
        webp: {};
    };
    thumbnail: {};
    placeholder: string;
}>;
