import { ref } from 'vue'
import { ethers } from 'ethers'
import { getProvider } from '@/utils'

const smartContract = ref(null)

export default function useSmartContract({abi, address, chainId}, provider = null, signer = null) {

    const defaultProvider = provider ?? getProvider(chainId)
    
    if(ethers.Signer.isSigner(signer)) {
        signer.provider ??= defaultProvider
        smartContract.value = new ethers.Contract(address, abi, signer)
    } else {
        smartContract.value = new ethers.Contract(address, abi, defaultProvider)
    }

    return smartContract
}