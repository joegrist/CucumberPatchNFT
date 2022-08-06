import Vue from 'vue'
import { ethers } from 'ethers'
import MetaMaskOnboarding from '@metamask/onboarding'
import { getCurrency, CHAINID_CONFIG_MAP } from '@/constants/metamask'

export default async (_, inject) => {

    let metamaskProvider = null

    if(window.ethereum?.providers) {
        metamaskProvider = window.ethereum.providers.find((p) => p.isMetaMask)
    } else if(window.ethereum?.isMetaMask) {
        metamaskProvider = window.ethereum
    }

    const wallet = Vue.observable({
        account: null,
        accountCompact: 'Connect Wallet',
        network: null,
        balance: null,
        balanceFormatted: null,
        provider: null,
        ensName: null,
        avatarUrl: null,

        get chainId() {
            return this.network?.chainId
        },
        get hexChainId() {
            return '0x' + this.network?.chainId?.toString(16)
        },
        get networkName() {
            return this.network?.name
        },
        get isConnected() {
            return this.account
        },
        
        async refreshBalance() {
            if(!this.account || !this.provider) return
            const balanceWei = await this.provider.getBalance(this.account)
            const balanceEth = Number(ethers.utils.formatEther(balanceWei.toString()))
            
            this.balance = Number(balanceEth.toFixed(3))
            this.balanceFormatted = `${this.balance} ${getCurrency(this.chainId)}`
        },

        async init() {
            this.provider = new ethers.providers.Web3Provider(metamaskProvider)
            this.network = await this.provider.getNetwork()
            const [account] = await this.provider.listAccounts()

            !!account && this.setAccount(account)
        },

        async setAccount(newAccount) {
            if(newAccount) {
                this.account = newAccount
                this.accountCompact = `${newAccount.substring(0, 4)}...${newAccount.substring(newAccount.length - 4)}`
                this.refreshBalance()

                try {
                    this.ensName = await this.provider.lookupAddress(newAccount)
                    if(this.ensName) {
                        this.avatarUrl = await this.provider.getAvatar(this.ensName)
                    }
                } catch {
                    this.ensName = null
                    this.avatarUrl = null
                }
            }
            else {
                this.disconnect()
            }
        },

        async connect() {
            if(!MetaMaskOnboarding.isMetaMaskInstalled()) {
                new MetaMaskOnboarding().startOnboarding()
                return
            }
        
            wallet.network = await wallet.provider.getNetwork()

            const [account] = await wallet.provider.send('eth_requestAccounts')
            console.info('wallet connected', {account})

            if(account) {
                await wallet.setAccount(account)
            }
        },

        disconnect() {
            wallet.account = null
            wallet.accountCompact = null
            wallet.balance = null
        },

        async switchNetwork(chainId) {

            if(!chainId || this.chainId === chainId || this.hexChainId === chainId) {
                return
            }

            const config = CHAINID_CONFIG_MAP[chainId]

			try {
				await this.provider.send('wallet_switchEthereumChain', [
					{ chainId: config.chainId },
				])

                await this.init()

                // create a small delay to let the wallet reset to new network
                return new Promise((resolve) => {
                    setTimeout(() => resolve(), 1000)
                })
			} catch (err) {
				// This error code indicates that the chain has not been added to MetaMask.
				if (err.code === 4902) {
                    await this.provider.send('wallet_addEthereumChain', [config])
                } else {
                    throw err
                }
			}
		},

        async requestSignature(nonce) {
            const signer = this.provider.getSigner()
            const msg = `Hi there from the Zero Code NFT! Sign this unique ID to sign in: ${nonce}`
            return signer.signMessage(msg)
        }
    })

    if(metamaskProvider) {

        // console.log(window.ethereum._metamask, window.ethereum._metamask.isUnlocked())
    
        metamaskProvider.on('accountsChanged', ([newAddress]) => {
            console.info('accountsChanged', newAddress)
            wallet.setAccount(newAddress)
        })
    
        metamaskProvider.on('chainChanged', async (chainId) => {
            console.info('chainChanged', chainId)
            wallet.init()
        })

        wallet.init()
    }

    inject('wallet', wallet)
}