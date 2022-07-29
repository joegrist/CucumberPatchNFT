import { ref } from 'vue'
import { ethers } from 'ethers'
import { getProvider } from '@/utils'

const smartContract = ref(null)

export default function useSmartContract({abi, address, chainId}, signer = null) {

    const provider = getProvider(chainId)
    
    if(ethers.Signer.isSigner(signer)) {
        signer.provider ??= provider
        smartContract.value = new ethers.Contract(address, abi, signer)
    } else {
        smartContract.value = new ethers.Contract(address, abi, provider)
    }

    return smartContract
}