# ZeroCodeNFT

[Dashboard](assets/images/dashboard_screenshot.png)

## wallet plugin

contains all the interactions and event listeners necessary to interact with the metamask or another provider

## Build Setup

```bash
# install dependencies
$ npm install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm run start

# generate static project
$ npm run generate
```

For detailed explanation on how things work, check out the [documentation](https://nuxtjs.org).

## How to add new blockchain support

* find 2 .svg images of the blockchain logo and drop them into /assets/blockchain/ folders
* add config to constants/metamask.js and update other objects in there
* update constants/index.js
* update mixins/blockchainImage.js
* update Blockchain.vue