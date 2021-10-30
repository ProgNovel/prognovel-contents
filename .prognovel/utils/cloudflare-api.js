const fetch = require("node-fetch");
const CF_API_BASE_ENDPOINT = "https://api.cloudflare.com/client/v4/";
const { CF_ACCOUNT_ID, CF_NAMESPACE_ID, CF_AUTH_KEY } = process.env;
const FormData = require("form-data");

function cfWorkerKV() {
  return {
    put: async function (key, data, opts = {}) {
      const { metadata } = opts;
      const url =
        CF_API_BASE_ENDPOINT +
        `accounts/${CF_ACCOUNT_ID}/storage/kv/namespaces/${CF_NAMESPACE_ID}/values/${key}`;

      const form = new FormData();
      let body;
      if (metadata) {
        form.append("value", data);
        form.append("metadata", JSON.stringify(metadata));
        body = form;
      } else {
        body = data;
      }
      await fetch(url, {
        headers: {
          Authorization: "Bearer " + CF_AUTH_KEY,
          "Content-Type": metadata ? "multiple/form-data" : "text/plain",
        },

        body: data,
        method: "PUT",
      });
    },
  };
}

module.exports = {
  cfWorkerKV,
};
