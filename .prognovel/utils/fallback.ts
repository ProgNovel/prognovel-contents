import path from "path";

global.__dirname = path
  .resolve(path.dirname(decodeURI(new URL(import.meta.url).pathname)))
  .slice(3);
