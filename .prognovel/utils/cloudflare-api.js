const fetch = require("node-fetch");
const { Readable } = require("stream");
const CF_API_BASE_ENDPOINT = "https://api.cloudflare.com/client/v4/";
const { CF_ACCOUNT_ID, CF_NAMESPACE_ID, CF_AUTH_KEY } = process.env;
const { FormData } = require("formdata-node");
const { FormDataEncoder } = require("form-data-encoder");
const { fileFromPath } = require("formdata-node/file-from-path");

function cfWorkerKV() {
  return {
    put: async function (key, data) {
      const url =
        CF_API_BASE_ENDPOINT +
        `accounts/${CF_ACCOUNT_ID}/storage/kv/namespaces/${CF_NAMESPACE_ID}/values/${key}`;

      const form = new FormData();

      const res = await fetch(url, {
        headers: {
          Authorization: "Bearer " + CF_AUTH_KEY,
        },
        body: data,
        method: "PUT",
      });
      const json = await res.json();
      console.log(`Uploading ${key} is ${json.success ? "sucess" : "failed"}`);
    },
  };
}

module.exports = {
  cfWorkerKV,
};
