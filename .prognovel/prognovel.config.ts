import path from "path";

export const BOOK_COVER = {
  sizes: {
    book: [250, 250],
    thumbnail: [187, 187],
    placeholder: [50, 50],
  },
  formats: ["webp", "jpeg"],
  quality: 80,
};

export const WORKING_FOLDER = path.resolve(__dirname, "../novels");
