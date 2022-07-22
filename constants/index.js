const BLOCKCHAIN = Object.freeze({
	// ORDER IS IMPORTANT, ADD HIGHEST NUM +1
	Ethereum: 1,
	Polygon: 6,
	BinanceSmartChain: 4,
	Fantom: 3,
	// Cardano: 5,
	// Flow: 7,
	Avalanche: 8,
	Arbitrum: 13,
	// Legacy: 9,
	Optimism: 14,
	Cronos: 10,
	Klaytn: 16,
	Cube:18,
	Harmony: 15,
	// Heco: 17,
	Thinkium: 12,
	Songbird: 11,
	Solana: 2,

	
	1: 'Ethereum',
	2: 'Solana',
	3: 'Fantom',
	4: 'BinanceSmartChain',
	6: 'Polygon',
	8: 'Avalanche',
	// 9: 'Legacy',
	10: 'Cronos',
	11: 'Songbird',
	12: 'Thinkium',
	13: 'Arbitrum',
	14: 'Optimism',
	15: 'Harmony',
	16: 'Klaytn',
	17: 'Heco',
	18:"Cube"
})

const MARKETPLACE = Object.freeze({
	Other: 0,
	OpenSea: 1,
	0: 'Other',
	1: 'OpenSea',
})

const WEBSITE_STATUS = Object.freeze({
	Unknown: 0,
	Building: 1,
	Ready: 2,
	1: 'Building',
	2: 'Ready',
})

const SMARTCONTRACT_STATUS = Object.freeze({
	Unknown: 0,
	Draft: 1,
	Testnet: 2,
	Mainnet: 3,
	Deleted: 4,
	1: 'Draft',
	2: 'Testnet',
	3: 'Mainnet',
	4: 'Deleted',
})

const PAYMENT_METHOD = Object.freeze({
	PayPal: 1,
	ETH: 2
})

const SALE_STATUS = Object.freeze({
	Paused: 0,
	Presale: 1,
	Public: 2,
	0: 'Paused',
	1: 'Presale',
	2: 'Public',
})

const WEBSITE_TEMPLATE = Object.freeze({
	Unknown: 0,
	Tabs: 1,
	Button: 2,
	Full: 3,
	0: 'Unknown',
	1: 'Tabs',
	2: 'Button',
	3: 'Full'
})

const WEBSITE_TYPE = Object.freeze({
	Full: 0,
	Embedded: 1,
	EmbeddedCompact: 2,
	0: 'Full',
	1: 'Embedded',
	2: 'EmbeddedCompact',
})

const CONTRACT_TYPE = Object.freeze({
	Unknown: 0,
	ERC721: 1,
	ERC721A: 2,
	ERC20: 3,
	ERC1155: 4,
	MintPass: 5,
	DAO: 6,
	0: 'Unknown',
	1: 'ERC721',
	2: 'ERC721A',
	3: 'ERC20',
	4: 'ERC1155',
	5: 'MintPass',
	6: 'DAO'
})

const MINT_SELECTOR_TYPE = Object.freeze({
	SpinButton: 0,
	Range: 1
})

const SMART_CONTRACT_FEATURES = Object.freeze({
	Base: 0,
	Whitelabel: 1,
	SourceCodeVerification: 2,
	CustomASCIIArt: 3,
	0: 'Base',
	1: 'Whitelabel',
	2: 'SourceCodeVerification',
	3: 'CustomASCIIArt'
})

const DEFAULT_CONFIG_STRING = JSON.stringify({
    widgetBot: {},
    analytics: {}
})

const ANALYTICS_EVENTS = Object.freeze({
	WalletConected: 'zerocodenft_wallet_connected',
	CheckoutBegin: 'zerocodenft_checkout_begin',
	CheckoutComplete: 'zerocodenft_checkout_complete',
	CheckoutError: 'zerocodenft_checkout_failed',
	ZeroCodeLinkClicked: 'zerocodenft_link_clicked'
})

const ZERO_CODE_ETH_ADDRESS = '0x34Eca06DB779169003117e8999B5E008086f4cc3'

const ZEROCODENFT_ASCII_ART = `
 /$$$$$$$$                                /$$$$$$                  /$$           /$$   /$$ /$$$$$$$$ /$$$$$$$$
|_____ $$                                /$$__  $$                | $$          | $$$ | $$| $$_____/|__  $$__/
     /$$/   /$$$$$$   /$$$$$$   /$$$$$$ | $$  \__/  /$$$$$$   /$$$$$$$  /$$$$$$ | $$$$| $$| $$         | $$
    /$$/   /$$__  $$ /$$__  $$ /$$__  $$| $$       /$$__  $$ /$$__  $$ /$$__  $$| $$ $$ $$| $$$$$      | $$
   /$$/   | $$$$$$$$| $$  \__/| $$  \ $$| $$      | $$  \ $$| $$  | $$| $$$$$$$$| $$  $$$$| $$__/      | $$
  /$$/    | $$_____/| $$      | $$  | $$| $$    $$| $$  | $$| $$  | $$| $$_____/| $$\  $$$| $$         | $$
 /$$$$$$$$|  $$$$$$$| $$      |  $$$$$$/|  $$$$$$/|  $$$$$$/|  $$$$$$$|  $$$$$$$| $$ \  $$| $$         | $$
|________/ \_______/|__/       \______/  \______/  \______/  \_______/ \_______/|__/  \__/|__/         |__/
Drop Your NFT Collection With ZERO Coding Skills at https://zerocodenft.com
`
const ZEROCODENFT_STORAGE_API_KEY = 'zcnft_nft_storage_api_key';

export {
	BLOCKCHAIN,
	MARKETPLACE,
	WEBSITE_STATUS,
	SMARTCONTRACT_STATUS,
	SALE_STATUS,
	WEBSITE_TYPE,
	CONTRACT_TYPE,
	PAYMENT_METHOD,
	WEBSITE_TEMPLATE,
	ZERO_CODE_ETH_ADDRESS,
	MINT_SELECTOR_TYPE,
	SMART_CONTRACT_FEATURES,
	DEFAULT_CONFIG_STRING,
	ANALYTICS_EVENTS,
	ZEROCODENFT_ASCII_ART,
	ZEROCODENFT_STORAGE_API_KEY
}
