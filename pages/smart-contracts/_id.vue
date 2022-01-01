<template>
	<b-container class="mt-5">
		<b-row>
			<b-col sm="12" md="8">
				<h2>Interact with smart contract at 
					<br/> 
					<b-link :to="`https://${getExplorerUrl(rawContract.chainId)}/address/${rawContract.address}`">{{ rawContract.address }}</b-link>
				</h2>
			</b-col>
			<b-col sm="12" md="4">
				<!-- <b-button>Deploy to Mainnet</b-button> -->
			</b-col>
		</b-row>
		<b-row>
			<b-col cols="6">
				<h3 class="text-success text-center py-3">Eco Friendly 🌱</h3>
				<ul>
					<li class="mb-2" v-for="(func, idx) in greenFunctions" :key="idx">
						<b-button class="text-capitalized" @click="callFunc(func, idx)">{{func.name | startCase}} 
							<b-badge pill size="sm" variant="success">Eco</b-badge>
						</b-button>

						<h4 class="d-inline pl-2" v-show="responses[func.name]">{{ responses[func.name] }}</h4>

						<ul v-if="func.inputs.length > 0">
							<li v-for="(param, idx) in func.inputs" :key="idx">
								<span> {{ param.name }} </span>
								<b-input @change="val => onParamChange(val, func, param)" />
							</li>
						</ul>
					</li>
				</ul>
			</b-col>
			<b-col cols="6">
				<h3 class="text-warning text-center py-3">Requires Gas ⛽</h3>
				<ul>
					<li class="mb-2" v-for="(func, idx) in gasFunctions" :key="idx">
						<b-button @click="callFunc(func)">{{func.name | startCase}} 
							<b-badge v-if="func.payable" pill size="sm" variant="warning">Payable</b-badge>
							<b-badge v-if="!func.constant" pill size="sm" variant="warning">Gas</b-badge>
						</b-button>
						<h4 class="d-inline pl-2" v-show="responses[func.name]">{{ responses[func.name] }}</h4>
					</li>
				</ul>
			</b-col>
		</b-row>
	</b-container>
</template>

<script>
import Vue from 'vue'
import { CHAINID_CONFIG_MAP, getExplorerUrl, getCurrency, getNetwork, isTestnet } from '@/constants/metamask'
import { ethers } from 'ethers';
import { isNumber } from 'lodash-es'
const FormatTypes = ethers.utils.FormatTypes;

const paramTypeInputTypeMap = {
	address: 'text',
	uint128: 'number',
	uint256: 'number',
}

export default {
    data: () => ({
		FormatTypes,
		paramTypeInputTypeMap,
		rawContract: {},
		contract: {},
		responses: {},
		callFuncArgs: {}
	}),
	computed: {
		greenFunctions() {
			return Object.values(this.contract.interface?.functions || {}).filter(val => val.constant)
		},
		gasFunctions() {
			return Object.values(this.contract.interface?.functions || {}).filter(val => !val.constant)
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
		this.rawContract = data
		this.contract = new ethers.Contract(data.address, data.abi, await this.$wallet.provider.getSigner())

		console.log('smart-contract', this.contract)
	},
	methods: {
		getExplorerUrl,
		onParamChange(value, func, param) {
			const args = this.callFuncArgs[func.name] ??= new Map()
			args.set(param.name, value)
		},
		async callFunc(func, idx) {
			try{
				console.log('calling ', func)
				const txOverrides = {}

				if(!func.constant) {
					const gasPrice = await this.contract.signer.getGasPrice();
					console.log("gasPrice", ethers.utils.formatUnits(gasPrice));

					txOverrides.gasPrice = gasPrice
				}
				
				let txResponse

				const hasFuncArgs = !!this.callFuncArgs[func.name]
				if(hasFuncArgs) {
					const args = [...this.callFuncArgs[func.name].values()]
						.map(value => {
							console.log(value, isNumber(value))
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
					let value
					if(func.name.includes('PRICE')) value = ethers.utils.formatEther(txResponse) + ' ' + getCurrency(this.rawContract.chainId)
					else value = txResponse.toString()

					Vue.set(this.responses, func.name, value)

					this.$bvToast.toast(`Returned value: ${value}`, {
						title: func.name,
						variant: 'success',
						autoHideDelay: 5000
					})
				}
				else {
					txResponse.wait().then(async (res) => {
						console.log({ res });
					});
				}
			} catch (err) {
				console.error({err});
				this.$bvToast.toast(err.data?.message || err.reason || err.message || 'Function call failed', {
					title: err.code || 'Error',
					variant: 'danger',
					autoHideDelay: 5000
				})
			}
		}
	}
}
</script>