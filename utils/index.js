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

// this function is not fat arrowed on purpose: it needs parent scope to access this.$bvToast
const copyToClipboard = async function(value) {
    await navigator.clipboard.writeText(value)
    this.$bvToast.toast('Copied to clipboard!', {
        title: 'Clipboard',
        variant: 'info',
    })
}

const scrollTo = (id) => {
    document.getElementById(id).scrollIntoView({behavior: 'smooth'})
}

export {
    getMerkleRoot,
    wait,
    copyToClipboard,
    scrollTo
}