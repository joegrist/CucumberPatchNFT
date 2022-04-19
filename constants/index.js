const BLOCKCHAIN = Object.freeze({
	// ORDER IS IMPORTANT
	Ethereum: 1,
	Polygon: 6,
	BinanceSmartChain: 4,
	Fantom: 3,
	// Cardano: 5,
	// Flow: 7,
	Avalanche: 8,
	// Legacy: 9,
	Cronos: 10,
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

const SALE_STATUS = Object.freeze({
	Paused: 0,
	Presale: 1,
	Public: 2,
	0: 'Paused',
	1: 'Presale',
	2: 'Public',
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

export {
	BLOCKCHAIN,
	MARKETPLACE,
	WEBSITE_STATUS,
	SMARTCONTRACT_STATUS,
	SALE_STATUS,
	WEBSITE_TYPE,
	CONTRACT_TYPE
}
