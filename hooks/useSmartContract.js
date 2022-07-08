import { ref } from 'vue'
import { ethers } from 'ethers'
import { CHAINID_CONFIG_MAP } from '@/constants/metamask'

const smartContract = ref(null)

export default function useSmartContract({abi, address, chainId}, signer = null) {

    if(signer) {
        smartContract.value = new ethers.Contract(address, abi, signer)
    } else {
        const providerUrl = CHAINID_CONFIG_MAP[chainId.toString()].rpcUrls[0]
        const jsonRpcProvider = new ethers.providers.StaticJsonRpcProvider(
            providerUrl
        )
        smartContract.value = new ethers.Contract(address, abi, jsonRpcProvider)
    }

    return smartContract
}