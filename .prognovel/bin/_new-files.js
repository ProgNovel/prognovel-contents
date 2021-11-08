const siteFilesContent = {
  "site-settings.yml": `site_title: ProgNovel
contact: prognovel@gmail.com
backend_api: https://api.prognovel.workers.dev
use_image_optimization_microservice: true
disqus_id: prog-novel

### PUBLISHED BOOKS ###
# you can left out a book folder if you're not ready to publish a certain book
novels:
  - yashura-legacy

### WEBMONETIZATION REVSHARE OPTIONS ###

# edit file site-contributors.yml to set up payments for website owners and staff

# when subscribers are reading novels, payment pointers for website owner
# and staffs will be limited to make spaces for novel authors and contributors
# revenue share.
#
# example: 30% limit means owners and staffs will receive 0.3x of their
# usual revenue for subscribers who reading novel, while the rest will be
# distributed among authors and their contributors (editors, proofreaders, illustrators, etc)
limit_global_payment_pointers_share_in_novel: 30%

# unlike global revshare, total revenue share rate for novel contributors
# will be accumulated for every chapters a person credited for
#
# example: authors who wrote 10 chapters with share of 5 will have
# 50 revshare weight, while editor who edits 5 chapter with share of 4
# will have 20 revshare weight

rev_share_contribution_per_chapter:
  author: 5
  translator: 4
  editor: 3
  proofreader: 2
  `,
  "site-contributors.yml": `ProgNovel:
  email: prognovel@gmail.com
  payment: $ilp.uphold.com/edR8erBDbRyq
  rate: 25

JS_Developer:
  payment: $ilp.uphold.com/edR8erBDbRyq
  rate: 10

Backend_Developer:
  payment: $ilp.uphold.com/edR8erBDbRyq
  rate: 14

generalStaff:
  payment: $ilp.uphold.com/edR8erBDbRyq
  rate: 20

m4naG3R:
  payment: $ilp.uphold.com/edR8erBDbRyq
  rate: 22
`,
};

const novelFilesContent = {
  "contributors.yml": `# all payment pointers below will use non-profit organizations' pointer address
# since I have some problems in signing up for ILP-enabled digital wallets
#
# more info for non-profit organizations' payment pointer address:
# https://community.webmonetization.org/grantfortheweb/non-profit-payment-pointers-2890

# Author
Radhy:
  payment: $ilp.uphold.com/LJmbPn7WD4JB # ILP address - FreeCodeCamp
  email: prognovel@gmail.com

# Editor
MyEditor: $ilp.uphold.com/D7BwPKMQzBiD # ILP address - Internet Archive

# Proofreader
MyProofreader: $ilp.uphold.com/rKe8mMbUGkBm # ILP address - Web Foundation
Zoom: $ilp.uphold.com/edR8erBDbRyq # ILP address - Creative Commons
Kabooom: $ilp.uphold.com/JWP2Um9RFi9a # ILP address - Artist Rescue Trust
Wowee: $ilp.uphold.com/QkG86UgXzKq8 # ILP address - Defold Foundation
  `,
  "info.yml": `title: Yashura Legacy
author: Radhy
contact: prognovel@gmail.com
demographic: seinen
genre: fantasy, drama, comedy
tags: demo novel, translated novel, indonesian novel

# have Discord group you want readers to join?
# uncomment below by remove # and set the value to your group ID
# discord_group_id: 676722349441024000
  `,
  "synopsis.md": `This will be shown as novel synopsis. Synopsis accepts Markdown format.
  
Lorem, ipsum dolor sit amet consectetur adipisicing elit. Veritatis, libero et maiores voluptate facilis quis ut? Deleniti incidunt a minima veniam quibusdam, est eum modi inventore, corrupti non assumenda ipsa?`,
};

const githubActionContent = {
  "pull-request": `on:
  pull_request:
    branches:
      - main
    types: [closed]

jobs:
  publish:
    runs-on: ubuntu-latest
    if: |
      github.event.pull_request.merged == true &&
      github.actor!= 'depbot'
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: "16"
      - run: npm install
      - run: npm link
      - run: prognovel build
      - run: prognovel publish
`,
};

const components = {
  "home-page": {
    "ComponentsLazy.svelte": `<script lang="ts">
    import UpdatesModule from "components/updates-page/UpdatesModule.svelte";
    import WebMonetizationBanner from "components/web-monetization/WebMonetizationBanner.svelte";
    import Warning from "components/home-page/HomeWarning.svelte";
    import ProgNovelPromo from "components/home-page/ProgNovelPromo.svelte";
  </script>
  
  <div class="home-page__contained-component">
    <Warning />
    <WebMonetizationBanner />
    <UpdatesModule seeAllLink="updates" />
  </div>
  
  <ProgNovelPromo />
  `,
  },
};
module.exports = {
  siteFilesContent,
  novelFilesContent,
  githubActionContent,
  components,
};
