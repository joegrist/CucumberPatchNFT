import { MerkleTree } from 'merkletreejs'
import { ethers } from 'ethers'
import { get } from 'lodash-es'
import { CHAINID_CONFIG_MAP } from '@/constants/metamask'

const getMerkleRoot = (whitelist) => {
	const leafNodes = whitelist.map((a) => ethers.utils.keccak256(a))
	const merkleTree = new MerkleTree(leafNodes, ethers.utils.keccak256, {
		sortPairs: true,
	})
	return merkleTree.getRoot()
}

const wait = (delay) => {
	return new Promise((resolve) => setTimeout(resolve, delay))
}

// this function is not fat arrowed on purpose: it needs parent scope to access this.$v
function validateState(path) {
	const { $dirty, $error } = get(this.$v, path, {})
	return $dirty ? !$error : null
}

const mustBeURL = val => /^[\w:\/]*$/.test(val)
const hasValidAddress = val => val && ethers.utils.isAddress(val)

// this function is not fat arrowed on purpose: it needs parent scope to access this.$bvToast
const copyToClipboard = async function (value) {
	await navigator.clipboard.writeText(value)
	this.$bvToast.toast('Copied to clipboard!', {
		title: 'Clipboard',
		variant: 'info',
	})
}

/**
 * 
 * @param {string} id - DOM element ID to scroll to 
 */
const scrollTo = (id) => {
	document.getElementById(id).scrollIntoView({ behavior: 'smooth' })
}

/**
 * 
 * @param {(int|string)} chainId 
 * @param {('nonstatic'|'batch')} [type] 
 * @returns 
 */
const getProvider = (chainId, type = null) => {
    const providerUrl = CHAINID_CONFIG_MAP[chainId.toString()].rpcUrls[0]
    switch(type) {
        case 'nonstatic': return new ethers.providers.JsonRpcProvider(providerUrl)
        case 'batch': return new ethers.providers.JsonRpcBatchProvider(providerUrl)
        default: return new ethers.providers.StaticJsonRpcProvider(providerUrl)
    }
}

/**
 * Parses metamask error
 * @param {Object} err 
 * @param {string} [defaultMsg=Unknown Error] 
 * @returns 
 */
const getMetamaskError = (err, defaultMsg = 'Unknown Error') => {
	const { data, reason, message, code, method, error } = err
	return reason || message || error?.message || data?.message || defaultMsg
}

export {
	getMerkleRoot,
	wait,
	validateState,
	mustBeURL,
	hasValidAddress,
	copyToClipboard,
	scrollTo,
	getProvider,
    getMetamaskError
}
