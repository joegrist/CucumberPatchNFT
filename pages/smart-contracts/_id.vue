<template>
	<b-container class="mt-5">
		<b-row>
			<b-col sm="12" md="9">
				<h3>Smart contract deployed at 
					<br/> 
					<b-link :href="`${getExplorerUrl(rawContract.chainId)}/address/${rawContract.address}`" target="_blank">{{ rawContract.address }}</b-link>
				</h3>
			</b-col>
			<b-col sm="12" md="3" class="d-flex flex-column align-items-end">
				<b-overlay
					:show='isBusy'
					rounded
					opacity='0.6'
					spinner-small
				>
					<b-button v-if="isTestnet(rawContract.chainId)" class="bg-gradient-primary border-0 w-100" :disabled="isBusy" @click="onMainnetDeploy">
						<b-icon icon="wallet2" /> Deploy to Mainnet
					</b-button>
				</b-overlay>
				<p class="lead font-weight-bold">Contract Balance: {{ contractBalance }}</p>
			</b-col>
		</b-row>
		<b-row>
			<b-col cols="6">
				<h3 class="text-success text-center py-3">Eco Friendly 🌱</h3>
				<ul>
					<li class="mb-2" v-for="(func, idx) in greenFunctions" :key="idx" role="tab">

						<b-button variant="link" v-b-toggle="`${func.name+idx}`">
							{{func.name | startCase}} 
							<b-badge pill size="sm" variant="success">Eco</b-badge>
						</b-button>

						<b-collapse :id="func.name+idx" class="mt-2" accordion="eco-accordion" role="tabpanel">
							<ul v-if="func.inputs.length > 0">
								<li v-for="(param, idx) in func.inputs.filter(x => !x.name.startsWith('_'))" :key="idx">
									<span> {{ param.name }} </span>
									<b-input @change="val => onParamChange(val, func, param)" />
								</li>
							</ul>
							<b-button class="mt-1" variant="success" @click="callFunc(func, idx)">Execute</b-button>
							<span class="lead font-weight-bold align-middle pl-2" v-show="responses[func.name]">Result: {{ responses[func.name] }}</span>
						</b-collapse>
					</li>
				</ul>
			</b-col>
			<b-col cols="6">
				<h3 class="text-warning text-center py-3">Requires Gas ⛽</h3>
				<ul>
					<li class="mb-2" v-for="(func, idx) in gasFunctions" :key="idx" role="tab">
						<b-button variant="link" v-b-toggle="`${func.name+idx}`">
							{{func.name | startCase}} 
							<b-badge v-if="func.payable" pill size="sm" variant="warning">Payable</b-badge>
							<b-badge pill size="sm" variant="warning">Gas</b-badge>
						</b-button>
						<span class="lead font-weight-bold align-middle pl-2" v-show="responses[func.name]">Result: {{responses[func.name] }}</span>

						<b-collapse :id="func.name+idx" class="mt-2" accordion="gas-accordion" role="tabpanel">
							<ul v-if="func.inputs.length > 0">
								<li v-for="(param, idx) in func.inputs.filter(x => !x.name.startsWith('_'))" :key="idx">
									<span> {{ param.name }} </span>
									<b-input @change="val => onParamChange(val, func, param)" />
								</li>
							</ul>
							<b-overlay
								:show='busyState[func.name]'
								rounded
								opacity='0.6'
								spinner-small
							>
								<b-button class="mt-1" variant="success" @click="callFunc(func, idx)">Execute</b-button>
							</b-overlay>
						</b-collapse>
					</li>
				</ul>
			</b-col>
		</b-row>
		<b-modal 
			id='deployment' 
			title='Deployed' 
			size='md' 
			centered 
			ok-only
			@hidden="$router.push(`/smart-contracts/${deployedContract.id}`)"
      		@ok="$router.push(`/smart-contracts/${deployedContract.id}`)">
			<div class='text-center'>
				<h3>Success!!</h3>
				<p>Contract has been deployed! Address: {{ deployedContract.address }}</p>
			</div>
		</b-modal>
	</b-container>
</template>

<script>
import Vue from 'vue'
import { getExplorerUrl, getCurrency, isTestnet, getMainnetConfig } from '@/constants/metamask'
import { ethers } from 'ethers';
import { isNumber } from 'lodash-es'
const FormatTypes = ethers.utils.FormatTypes;

export default {
    data: () => ({
		FormatTypes,
		rawContract: {},
		contract: {},
		responses: {},
		callFuncArgs: {},
		contractBalance: 0,
		busyState: {},
		isBusy: false,
		deployedContract: {}
	}),
	computed: {
		greenFunctions() {
			return Object.values(this.contract.interface?.functions || {})
				.filter(val => val.constant)
				.sort((a,b) => a.name.localeCompare(b.name))
		},
		gasFunctions() {
			return Object.values(this.contract.interface?.functions || {})
				.filter(val => !val.constant)
				.sort((a,b) => a.name.localeCompare(b.name))
		},
		functions(){
			return this.contract.interface?.functions
		}
	},
    fetchOnServer: false,
	fetchKey: 'smart-contracts-id',
	async fetch() {
		if (!this.$wallet.account) return

		const { data } = await this.$axios.get(`/smartcontracts/${this.$route.params.id}`, {
			params: { ownerAddress: this.$wallet.account },
		})

		const { address, chainId, abi } = data
		this.rawContract = data
		this.contract = new ethers.Contract(address, abi, await this.$wallet.provider.getSigner())
		this.contractBalance = await this.$wallet.provider.getBalance(address) + ' ' + getCurrency(chainId)

		console.log('smart-contract', this.rawContract, this.contract, this.contractBalance)
	},
	methods: {
		getExplorerUrl,
		isTestnet,
		onParamChange(value, func, param) {
			const args = this.callFuncArgs[func.name] ??= new Map()
			args.set(param.name, value)
		},
		async switchNetwork(chainId) {
			const config = getMainnetConfig(chainId)

			let switchError

			try {
				await this.$wallet.provider.send('wallet_switchEthereumChain', [
					{ chainId: config.chainId },
				])
			} catch (err) {
				// This error code indicates that the chain has not been added to MetaMask.
				if (err.code === 4902) {
					try {
						await this.$wallet.provider.send('wallet_addEthereumChain', [config])
					} catch (addError) {
						switchError = err
					}
				} else {
					// handle other "switch" errors
					switchError = err
				}
			} finally {
				if(switchError) {
					this.$bvToast.toast(switchError.message || 'Network switch failed', {
						title: 'Network',
						variant: 'danger',
						autoHideDelay: 3000,
					})
				}
			}
		},
		async onMainnetDeploy() {
			try {
				const { id, chainId } = this.rawContract

				const mainnetConfig = getMainnetConfig(chainId)
				// console.log({mainnetConfig})

				await this.$wallet.switchNetwork(mainnetConfig)

				this.isBusy = true
				
				const { data } = await this.$axios.get(`/smartcontracts/${id}/compiled`, {
					params: { ownerAddress: this.$wallet.account },
				})
				const { abi, bytecode } = data

				const signer = this.$wallet.provider?.getSigner()
				const contractFactory = new ethers.ContractFactory(abi, bytecode, signer)
				const contract = await contractFactory.deploy()
				
				const { data: mainnetContract } = await this.$axios.post(`/smartcontracts/${id}/deploy-mainnet`, {
					ownerAddress: this.$wallet.account,
					address: contract.address,
					chainId: mainnetConfig.chainId
				})

				this.deployedContract = mainnetContract

				this.$bvModal.show("deployment")

			} catch (err) {
				this.isBusy = false
				console.error({err})
				this.$bvToast.toast(err.message || 'Deployment failed', {
					title: 'Mainnet Deployment',
					variant: 'danger',
					autoHideDelay: 3000
				})
			}
		},
		async callFunc(func, idx) {
			try{
				console.log('calling ', func)
				this.busyState[func.name] = true
				const txOverrides = {}

				if(!func.constant) {
					const gasPrice = await this.contract.signer.getGasPrice();
					console.log("gasPrice", ethers.utils.formatUnits(gasPrice));

					txOverrides.gasPrice = gasPrice
				}
				
				let txResponse

				const hasFuncArgs = this.callFuncArgs[func.name]?.size > 0
				if(hasFuncArgs) {
					// to preserve correct argument order we run mapping based on original function inputs order 
					// since we can't guarantee the correct order in callFuncArgs Map
					const args = func.inputs
						.map(x => {
							const value = this.callFuncArgs[func.name].get(x.name) || null
							return isNumber(value) 
								? ethers.BigNumber.from(value) 
								: value
							})
					console.log({args})
					txResponse = await this.contract[`${func.name}`].call(null, ...args, txOverrides)
				}
				else {
					txResponse = await this.contract[`${func.name}`](txOverrides)
				}

				console.log({ txResponse });
				
				if(func.constant) {
					const value = func.name.includes('PRICE') 
						? ethers.utils.formatEther(txResponse) + ' ' + getCurrency(this.rawContract.chainId)
						: txResponse.toString()

					Vue.set(this.responses, func.name, value)

					this.$bvToast.toast(`Returned value: ${value}`, {
						title: func.name,
						variant: 'success',
						autoHideDelay: 5000
					})
				}
				else {
					this.$bvToast.toast(`Transaction hash: ${txResponse.hash}`, {
						title: `Processing ${func.name}`,
						variant: 'success',
						autoHideDelay: 5000
					})
					txResponse.wait().then(async (res) => {
						console.log({ res });
						this.$bvToast.toast(`Transaction ${txResponse.hash} completed`, {
							title: `${func.name} completed`,
							variant: 'success',
							autoHideDelay: 5000
						})
					});
				}
			} catch (err) {
				console.error({err});
				this.$bvToast.toast(err.data?.message || err.reason || err.message || 'Function call failed', {
					title: err.code || 'Error',
					variant: 'danger',
					autoHideDelay: 5000
				})
			} finally {
				this.busyState[func.name] = false
			}
		}
	}
}
</script>