const { failBuild } = require("../.dist/fail");

function fail() {
  failBuild(
    `ProgNovel doesn't recognize this folder. 
  Make sure you open the CLI in your project root folder that contains
  file site-settings.yml and site-contributors.yml.

  If you haven't got that folder already, you can create a new one by using
  command "prognovel new" in a blank folder.`,
    "is not ProgNovel project folder",
  );
}

module.exports = {
  fail,
};
