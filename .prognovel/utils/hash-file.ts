import { createHash } from "crypto";
import { createReadStream } from "fs";

export async function createHashFromFile(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash("sha1");
    createReadStream(filePath)
      .on("data", (data) => hash.update(data))
      .on("end", () => resolve(hash.digest("hex")))
      .on("error", (err) => reject(err));
  });
}
