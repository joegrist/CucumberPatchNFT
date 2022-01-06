import Vue from 'vue'
import { ethers } from 'ethers'
import { getCurrency } from '@/constants/metamask'
import MetaMaskOnboarding from '@metamask/onboarding'


export default ({env}, inject) => {

    const wallet = Vue.observable({
        account: null,
        accountCompact: null,
        network: null,
        balance: null,
        provider: new ethers.providers.Web3Provider(window.ethereum),

        async init() {
            console.log('init', this)
            const [account] = await this.provider.listAccounts()
            this.network = await this.provider.getNetwork()
            // console.log('wallet init', {account})

            !!account && this.setAccount(account)
        },
        async setAccount(newAccount) {
            if(newAccount) {
                this.account = newAccount
                this.accountCompact = `${newAccount.substring(0, 4)}...${newAccount.substring(newAccount.length - 4)}`

                const balance = (await this.provider.getBalance(newAccount)).toString()
                this.balance = `${(+ethers.utils.formatEther(balance)).toFixed(3)} ${getCurrency(this.network.chainId)}`
            }
            else {
                this.account = null
                this.accountCompact = null
                this.balance = null
            }
        },
        async connect() {
            if(!MetaMaskOnboarding.isMetaMaskInstalled()) {
                const onboarding = new MetaMaskOnboarding()
                onboarding.startOnboarding()
                return
            }
        
            wallet.network = await wallet.provider.getNetwork()

            const [account] = await wallet.provider.send('eth_requestAccounts')
            console.log('wallet connect', {account})

            if(account) {
                await wallet.setAccount(account)
            }
        },
        async switchNetwork(config) {
            console.log(this.network, config)
            if(this.network?.chainId === config.chainId || this.network?.chainId.toString(16) === config.chainId) {
                return
            }

			try {
				await this.provider.send('wallet_switchEthereumChain', [
					{ chainId: config.chainId },
				])
			} catch (err) {
				// This error code indicates that the chain has not been added to MetaMask.
				if (err.code === 4902) {
                    await this.provider.send('wallet_addEthereumChain', [config])
                }
			}
		},
    })

    if(window.ethereum) {
        window.ethereum.on('connect', (data) => {
            console.log('connect', data)
        })
    
        window.ethereum.on('disconnect', (data) => {
            console.log('disconnect', data)
        })
    
        window.ethereum.on('accountsChanged', ([newAddress]) => {
            console.log('accountsChanged', newAddress)
            wallet.setAccount(newAddress)
        })
    
        window.ethereum.on('chainChanged', (chainId) => {
            console.log('chainChanged', chainId)
            setTimeout(() => {
                window.location.reload()
            }, 200)
        })
    
        window.ethereum.on('error', (e) => {
            console.error('on error', e)
        })

        wallet.init()
    }

    inject('wallet', wallet)
}