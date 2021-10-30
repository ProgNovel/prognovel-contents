import glob from "tiny-glob";
import isImage from "is-image";
export function imageBase64Encode(arrayBuffer, type) {
  let b64encoded = btoa(
    [].reduce.call(
      new Uint8Array(arrayBuffer),
      (p, c) => {
        return p + String.fromCharCode(c);
      },
      "",
    ),
  );

  let mimetype = "image/" + type;
  return "data:" + mimetype + ";base64," + b64encoded;
}

export async function pickImage(path: string): Promise<string> {
  return (await glob(path)).filter((file) => {
    return isImage(file);
  })[0];
}
