const BLOCKCHAIN = Object.freeze({
	Ethereum: 1,
	Solana: 2,
	Fantom: 3,
	BinanceSmartChain: 4,
	Cardano: 5,
	Polygon: 6,
	Flow: 7,
	Avalanche: 8,
	Legacy: 9,
	Cronos: 10,
	1: 'Ethereum',
	2: 'Solana',
	3: 'Fantom',
	4: 'BinanceSmartChain',
	6: 'Polygon',
	8: 'Avalanche',
	9: 'Legacy',
	10: 'Cronos'
})

const WEBSITE_STATUS = Object.freeze({
	Unknown: 0,
	Building: 1,
	Ready: 2,
	1: 'Building',
	2: 'Ready'
})

const MARKETPLACE = Object.freeze({
	Other: 0,
	OpenSea: 1,
	0:'Other',
	1:'OpenSea'
})

const SALE_STATUS = Object.freeze({
	Paused: 0,
	Presale: 1,
	Public: 2,
	0: 'Paused',
	1: 'Presale',
	2: 'Public'
})

export { BLOCKCHAIN, WEBSITE_STATUS, MARKETPLACE, SALE_STATUS }
