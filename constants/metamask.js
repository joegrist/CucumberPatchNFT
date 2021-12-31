export const AVALANCHE_MAINNET_PARAMS = {
	chainId: '0xA86A',
	chainName: 'Avalanche Mainnet C-Chain',
	nativeCurrency: {
		name: 'Avalanche',
		symbol: 'AVAX',
		decimals: 18,
	},
	rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
	blockExplorerUrls: ['https://snowtrace.io'],
}

export const AVALANCHE_TESTNET_PARAMS = {
	chainId: '0xA869',
	chainName: 'Avalanche Testnet C-Chain',
	nativeCurrency: {
		name: 'Avalanche',
		symbol: 'AVAX',
		decimals: 18,
	},
	rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
	blockExplorerUrls: ['https://testnet.snowtrace.io'],
}


export const POLYGON_MAINNET_PARAMS = {
	chainId: '0x89',
	chainName: 'Polygon Mainnet',
	nativeCurrency: {
		name: 'Polygon',
		symbol: 'MATIC',
		decimals: 18,
	},
	rpcUrls: [
		'https://polygon-rpc.com',
		'https://rpc-mainnet.matic.network',
		'https://rpc-mainnet.maticvigil.com',
		'https://rpc-mainnet.matic.quiknode.pro',
	],
	blockExplorerUrls: ['https://polygonscan.com'],
}

export const POLYGON_MUMBAI_TESTNET_CONFIG = {
	chainId: '0x13881',
	chainName: 'Polygon Testnet',
	nativeCurrency: {
		name: 'Polygon',
		symbol: 'MATIC',
		decimals: 18,
	},
	rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
	blockExplorerUrls: ['https://mumbai.polygonscan.com'],
}

export const FANTOM_TESTNET_CONFIG = {
	chainId: '0xfa2',
	chainName: 'Fantom Testnet',
	nativeCurrency: {
		name: 'Fantom',
		symbol: 'FTM',
		decimals: 18,
	},
	rpcUrls: ['https://rpc.testnet.fantom.network/'],
	blockExplorerUrls: ['https://testnet.fantom.network/'],
}

export const ETHEREUM_RINKEBY = {
	chainId: '0x4',
	chainName: 'Rinkeby',
	nativeCurrency: {
		name: 'Ethereum',
		symbol: 'ETH',
		decimals: 18
	},
	rpcUrls: [],
	blockExplorerUrls: ['https://rinkeby.etherscan.io'],
}

export const ETHEREUM_MAINNET = {
	chainId: '1',
	chainName: 'Mainnet',
	nativeCurrency: {
		name: 'Ethereum',
		symbol: 'ETH',
		decimals: 18
	},
	rpcUrls: [],
	blockExplorerUrls: ['https://etherscan.io'],
}

export const CHAINID_CONFIG_MAP = {
	'43114': AVALANCHE_MAINNET_PARAMS,
	'43113': AVALANCHE_TESTNET_PARAMS,
	'80001': POLYGON_MUMBAI_TESTNET_CONFIG,
	'4': ETHEREUM_RINKEBY,
	'1': ETHEREUM_MAINNET,
	'4002': FANTOM_TESTNET_CONFIG,
	
	'0xA86A': AVALANCHE_MAINNET_PARAMS,
	'0xA869': AVALANCHE_TESTNET_PARAMS,
	'0x13881': POLYGON_MUMBAI_TESTNET_CONFIG,
	'0x89': POLYGON_MAINNET_PARAMS,
	'0x4': ETHEREUM_RINKEBY,
	'0x1': ETHEREUM_MAINNET,
	'0xFA2': FANTOM_TESTNET_CONFIG
}

export const isTestnet = (chainId) => {
	return ['43113', '80001', '4', '4002', '0xA869', '0x13881', '0x4', '0xFA2'].includes(chainId)
}

export function getExplorerUrl(chainId) {
	return CHAINID_CONFIG_MAP[chainId]?.blockExplorerUrls[0]
}

export function getCurrency(chainId) {
	return CHAINID_CONFIG_MAP[chainId]?.nativeCurrency.symbol
}

export function getNetwork(chainId) {
	return CHAINID_CONFIG_MAP[chainId]?.chainName
}
