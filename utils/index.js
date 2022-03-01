import { MerkleTree } from 'merkletreejs'
import { ethers } from 'ethers'

const getMerkleRoot = (whitelist) => {
    const leafNodes = whitelist.map(a => ethers.utils.keccak256(a))
    const merkleTree = new MerkleTree(leafNodes, ethers.utils.keccak256, { sortPairs: true })
    return merkleTree.getRoot()
}

const wait = (delay) => {
    return new Promise((resolve) => setTimeout(resolve, delay));
}

const getCompactAddress = (address) => {
    if(!address) return address
    
	const length = address.length
    return `${address.substring(0, 4)}...${address.substring(
        length - 4,
        length
    )}`
}

export {
    getMerkleRoot,
    wait,
    getCompactAddress
}