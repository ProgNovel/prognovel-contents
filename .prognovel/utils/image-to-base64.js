function imageBase64Encode(arrayBuffer, type) {
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

module.exports = {
  imageBase64Encode,
};
