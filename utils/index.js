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

export {
    getMerkleRoot,
    wait
}