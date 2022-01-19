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
	1: 'Ethereum',
	2: 'Solana',
	3: 'Fantom',
	4: 'BinanceSmartChain',
	6: 'Polygon',
	8: 'Avalanche'
})

const WEBSITE_STATUS = Object.freeze({
	Unknown: 0,
	Building: 1,
	Ready: 2,
	1: 'Building',
	2: 'Ready'
})

export { BLOCKCHAIN, WEBSITE_STATUS }
