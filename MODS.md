# Haxx

- In wizard.vue, deleted the first two steps in the Buildsteps structure
- Set up the blockchain we want in `metamask.js`, add all the infos...
  - `CHAINID_CONFIG_MAP` needs the test and main net IDs
  - `testMainChainIdMap` maps the test to the main
- In `smartContractBuilder` structure within `index.js` need the following elements hard-coded:
  - `type: 'ERC721'`
  - `chainId: [[something]]`. This number is the test one from `CHAINID_CONFIG_MAP`