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
	Cronos: 10,
	Thinkium: 12,
	Optimism: 14,
	Songbird: 11,
	Solana: 2,
	Harmony: 15,
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
	15: 'Harmony'
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
	0: 'Unknown',
	1: 'ERC721',
	2: 'ERC721A',
	3: 'ERC20',
	4: 'ERC1155'
})

const ZERO_CODE_ETH_ADDRESS = '0x34Eca06DB779169003117e8999B5E008086f4cc3'

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
	ZERO_CODE_ETH_ADDRESS
}
