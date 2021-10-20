const fetch = require("node-fetch");
const CF_API_BASE_ENDPOINT = "https://api.cloudflare.com/client/v4/";
const { CF_ACCOUNT_ID, CF_NAMESPACE_ID, CF_AUTH_KEY } = process.env;

function cfWorkerKV() {
  return {
    put: async function (key, data) {
      const url =
        CF_API_BASE_ENDPOINT +
        `accounts/${CF_ACCOUNT_ID}/storage/kv/namespaces/${CF_NAMESPACE_ID}/values/${key}`;
      // `accounts/${CF_ACCOUNT_ID}/storage/kv/namespaces/${CF_NAMESPACE_ID}/keys`;
      const res = await fetch(url, {
        headers: {
          Authorization: "Bearer " + CF_AUTH_KEY,
          "Content-Type": "text/plain",
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
