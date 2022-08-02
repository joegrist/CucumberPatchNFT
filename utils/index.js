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

const scrollTo = (id) => {
	document.getElementById(id).scrollIntoView({ behavior: 'smooth' })
}

const downloadTextFile = (
	filename,
	data,
	format = 'data:text/plain',
	encoding = 'charset=utf-8'
) => {
	const element = document.createElement('a')
	element.setAttribute(
		'href',
		`${format};${encoding},${encodeURIComponent(data)}`
	)
	element.setAttribute('download', filename)

	element.style.display = 'none'
	document.body.appendChild(element)

	element.click()

	document.body.removeChild(element)
}

const getProvider = (chainId, isStatic = true) => {
	const providerUrl = CHAINID_CONFIG_MAP[chainId.toString()].rpcUrls[0]
	return isStatic
		? new ethers.providers.StaticJsonRpcProvider(providerUrl)
		: new ethers.providers.JsonRpcProvider(providerUrl)
}

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
	downloadTextFile,
	getProvider,
    getMetamaskError
}
