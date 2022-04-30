<template>
	<b-container fluid>
		<b-row class="mb-3">
			<b-col sm="12" md="8">
				<p class="lead font-weight-bold mb-1">
					Deployed on {{ rawContract.blockchain | blockchainName }}
					{{
						rawContract.status === SMARTCONTRACT_STATUS.Testnet
							? '(Testnet)'
							: '(Mainnet)'
					}}
					<br />
					Address: 
					<b-link
						:href="`${getExplorerUrl(rawContract.chainId)}/address/${
							rawContract.address
						}`"
						target="_blank"
						>{{ rawContract.address | compactAddress }}</b-link
					>
				</p>
				<div class="d-flex">
					<b-overlay :show="isBusy" rounded opacity="0.6" spinner-small>
						<b-button
							v-if="rawContract.status !== SMARTCONTRACT_STATUS.Mainnet"
							:disabled="!canDeployMainnet"
							variant="primary"
							@click="onMainnetDeploy">
							<b-icon icon="wallet2" /> Deploy to Mainnet
						</b-button>
						<!-- <b-button
								class="bg-gradient-primary border-0"
								:disabled="rawContract.status !== SMARTCONTRACT_STATUS.Mainnet || rawContract.isVerified"
								@click="onVerify">
								{{ rawContract.isVerified ? '✅ Verified' : 'Verify Code' }}
							</b-button> -->
					</b-overlay>
				</div>
			</b-col>
			<b-col sm="12" md="4" class="d-flex flex-column">
				<div class="lead font-weight-bold">
					Sale Status:
					<span
						:class="{
							'text-warning': saleStatus === 'Paused',
							'text-dark': saleStatus === 'Presale',
							'text-success': saleStatus === 'Public',
						}"
						>{{ saleStatus }}</span
					>
					<b-icon
						v-if="isBusy"
						class="pointer"
						font-scale="0.9"
						icon="bootstrap-reboot"
						variant="success"
						animation="spin"
						:disabled="true" />
					<b-icon
						v-else
						class="pointer"
						font-scale="0.9"
						icon="bootstrap-reboot"
						variant="success"
						@click="callFuncByName('saleStatus')" />
				</div>
				<div class="lead font-weight-bold mb-1">
					Contract Balance: {{ contractBalance }}
					{{ getCurrency(rawContract.chainId) }}
					<b-icon
						v-if="isBusy"
						class="pointer"
						font-scale="0.9"
						icon="bootstrap-reboot"
						variant="success"
						animation="spin"
						:disabled="true" />
					<b-icon
						v-else
						class="pointer"
						font-scale="0.9"
						icon="bootstrap-reboot"
						variant="success"
						@click="onRefreshBalance(true)" />
				</div>
				<b-button
					variant="success"
					:disabled="contractBalance === 0"
					@click="callFuncByName('withdraw')"
					>Withdraw</b-button
				>
			</b-col>
		</b-row>
		<b-row v-if="isOnWrongNetwork">
			<b-col class="d-flex flex-column align-items-center mt-3">
				<h3>Detected network is different than this smart contract</h3>
				<b-button variant="warning" @click="switchNetwork">
					Switch network
				</b-button>
			</b-col>
		</b-row>
		<b-row v-else-if="!isReady">
			<b-col>
				<h3 class="pt-3 text-center">
					Contract deployment is still in progress, please check back in a few
					minutes
				</h3>
			</b-col>
		</b-row>
		<b-row v-else>
			<b-col sm="12">
				<b-row class="mb-2">
					<b-col cols="6" class="d-flex">
						<h4 class="m-0">Update Smart Contract</h4>
						<b-button
							size="sm"
							variant="link"
							@click="
								downloadTextFile(
									'abi.txt',
									JSON.stringify(JSON.parse(rawContract.abi), null, 2)
								)
							"
							>[ABI]</b-button
						>
					</b-col>
					<b-col cols="6" class="d-flex justify-content-end my-auto">
						<span class="pr-2">Advanced</span>
						<b-form-checkbox
							v-model="showAdvancedFunctions"
							name="check-button"
							switch />
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<ul class="list-unstyled">
							<li
								class="mb-2 border rounded"
								v-for="(func, idx) in filteredFunctions"
								:key="idx"
								role="tab">
								<div
									class="d-flex justify-content-between p-2"
									v-b-toggle="`${func.name + idx}`">
									<template v-if="func.constant">
										<b-badge pill size="sm" variant="success" class="my-auto"
											>Eco</b-badge
										>
									</template>
									<template v-else>
										<b-badge pill size="sm" variant="warning" class="my-auto"
											>Gas</b-badge
										>
									</template>
									<span variant="link">
										{{ func.name | startCase }}
									</span>
									<b-icon icon="chevron-down" class="my-auto" />
								</div>
								<b-collapse
									:id="func.name + idx"
									class="p-2"
									accordion="eco-accordion"
									role="tabpanel">
									<ul
										v-if="
											func.inputs.length > 0 && func.name !== 'setSaleStatus'
										"
										class="mb-2">
										<li
											v-for="(param, idx) in func.inputs.filter(
												(x) => !x.name.startsWith('_')
											)"
											:key="idx">
											<span> {{ param.name }} </span>
											<b-input
												@change="(val) => onParamChange(val, func, param)" />
										</li>
									</ul>
									<div>
										<b-overlay
											:show="busyState[func.name]"
											rounded
											class="w-100"
											opacity="0.5"
											spinner-small>
											<b-button-group
												v-if="func.name === 'setSaleStatus'"
												class="w-100">
												<b-button
													variant="warning"
													@click="onUpdateSaleStatus(SALE_STATUS.Paused)"
													>Pause Sales</b-button
												>
												<b-button
													v-if="rawContract.hasWhitelist"
													variant="dark"
													@click="onUpdateSaleStatus(SALE_STATUS.Presale)"
													>Start Presale</b-button
												>
												<b-button
													variant="success"
													@click="onUpdateSaleStatus(SALE_STATUS.Public)"
													>Start Public Sale</b-button
												>
											</b-button-group>
											<b-button
												v-else
												class="w-100"
												variant="success"
												@click="callFunc(func)"
												>Call</b-button
											>
										</b-overlay>
									</div>
									<div
										v-show="responses[func.name]"
										class="font-weight-bold mt-2">
										{{ formatFuncResponse(func) }}
									</div>
								</b-collapse>
							</li>
						</ul>
					</b-col>
				</b-row>
			</b-col>
		</b-row>
		<b-modal
			id="deployment"
			title="Deployed!"
			size="md"
			centered
			ok-only
			@hidden="$router.push('/')">
			<div class="text-center">
				<h3 class="text-success">Success!!</h3>
				<b-link :href="deployedExplorerUrl" target="_blank">
					Contract has been deployed!
				</b-link>
				<p>Please allow some time for the transaction to clear.</p>
				<b-button variant="link" to="/">Go To Dashboard</b-button>
			</div>
		</b-modal>
	</b-container>
</template>

<script>
import Vue from 'vue'
import { mapMutations, mapState } from 'vuex'
import { SALE_STATUS, SMARTCONTRACT_STATUS, BLOCKCHAIN } from '@/constants'
import {
	getExplorerUrl,
	getCurrency,
	getMainnetConfig,
	testMainChainIdMap,
} from '@/constants/metamask'
import { ethers } from 'ethers'
import { isNumber, startCase } from 'lodash-es'
import { downloadTextFile } from '@/utils'

const basicFunctions = [
	'airdrop',
	'canReveal',
	'COLLECTION_SIZE',
	'MINT_PRICE',
	'PRESALE_MINT_PRICE',
	'setSaleStatus',
	'saleStatus',
	'owner',
	'reveal',
	'totalSupply',
	'setPublicMintPrice',
	'setPlaceholderUri',
]

export default {
	middleware: 'authenticated',
	props: {
		smartContract: Object,
		deploy: Boolean
	},
	data: () => ({
		SMARTCONTRACT_STATUS,
		SALE_STATUS,
		showAdvancedFunctions: false,
		rawContract: {},
		contract: {},
		deployedContract: {},
		responses: {},
		callFuncArgs: {},
		contractBalance: 0,
		saleStatus: 'N/A',
		busyState: {},
		isReady: false,
		currentOwner: null
	}),
	async mounted() {
		try {
			
			this.rawContract = this.smartContract
			const { address, abi, ownerAddress } = this.rawContract
			this.currentOwner = ownerAddress

			if(this.deploy) { // trigger deploy right away
				this.onMainnetDeploy()
				return
			}

			this.setBusy({ isBusy: true })

			if (this.isOnWrongNetwork) {
				await this.switchNetwork()
			}

			this.contract = new ethers.Contract(
				address,
				abi,
				this.$wallet.provider.getSigner()
			)
			this.isReady = !!(await this.contract.deployed())

			if (this.isReady) {
				await this.onRefreshBalance()
				const saleStatus = await this.contract.saleStatus()
				this.saleStatus = SALE_STATUS[saleStatus]
				this.currentOwner = await this.contract.owner()
			}
			this.checkOwner(this.$wallet.account)
		} catch (err) {
			console.error(err)
			this.$bvToast.toast(err.message || 'Smart contract load failed', {
				title: 'Smart Contract',
				variant: 'danger',
			})
		} finally {
			this.setBusy({ isBusy: false })
		}

		// console.log(
		// 	'loaded smart-contract',
		// 	this.rawContract,
		// 	this.contract,
		// 	this.contractBalance,
		// 	this.isReady
		// )
	},
	watch: {
		'$wallet.account': {
			handler: 'checkOwner'
		},
	},
	computed: {
		...mapState(['isBusy']),
		deployedExplorerUrl() {
			if (!this.deployedContract?.address) return
			const mainnetChainId = testMainChainIdMap[this.rawContract.chainId]
			return `${getExplorerUrl(mainnetChainId)}/address/${
				this.deployedContract.address
			}`
		},
		canDeployMainnet() {
			return this.rawContract.status === SMARTCONTRACT_STATUS.Testnet
		},
		functions() {
			return Object.values(this.contract.interface?.functions || {}).sort(
				(a, b) => a.name.localeCompare(b.name)
			)
		},
		filteredFunctions() {
			return this.functions?.filter(
				(f) => this.showAdvancedFunctions || basicFunctions.includes(f.name)
			)
		},
		isOnWrongNetwork() {
			return this.$wallet.chainId !== +this.rawContract.chainId
		},
	},
	methods: {
		...mapMutations(['setBusy', 'addAlert']),
		getExplorerUrl,
		getCurrency,
		downloadTextFile,
		checkOwner(newVal, oldVal) {
			// console.log('here', newVal, this.currentOwner)
			if (!newVal || !this.currentOwner) return

			const mismatch =
				ethers.utils.getAddress(newVal) !==
				ethers.utils.getAddress(this.currentOwner)

			if (mismatch) {
				const addr = this.rawContract.ownerAddress
				const addrTo = `${addr.substring(0, 4)}...${addr.substring(addr.length - 4)}`
				this.addAlert({
					id: 'smartContractOwnerMismatch',
					show: true,
					text: `Connected wallet address ${this.$wallet.accountCompact} is not the smart contract owner. Please switch to ${addrTo} to perform updates.`,
				})
			}
		},
		async onVerify() {
			if (!this.rawContract.blockchain === BLOCKCHAIN.Ethereum) {
				alert('Only Ethereum contracts are supported for now')
				return
			}
			try {
				await this.$axios.patch(`${this.rawContract.id}/verify`)
				this.rawContract.isVerified = true
				this.$bvToast.toast(
					'Verified! Please allow a 10-15 minutes to reflect on etherscan',
					{
						title: 'Code Verification',
						variant: 'success',
					}
				)
			} catch (err) {
				this.$bvToast.toast('Smart contract code verification falied', {
					title: 'Code Verification',
					variant: 'danger',
				})
			}
		},
		async onRefreshBalance(showNotification = false) {
			this.setBusy({ isBusy: true })
			const balance =
				(await this.$wallet.provider.getBalance(this.rawContract.address)) ||
				'0'
			this.contractBalance = +ethers.utils.formatEther(balance)
			this.setBusy({ isBusy: false })
			showNotification &&
				this.$bvToast.toast('Balance successfully refreshed', {
					title: 'Balance',
					variant: 'success',
				})
		},
		formatFuncResponse(func) {
			let actualResponse = this.responses[func.name]
			const prefix = func.inputs.length > 0 ? 'Response' : startCase(func.name)
			if (actualResponse === 'true' || actualResponse === 'false') {
				actualResponse = actualResponse === 'true' ? 'Yes' : 'No'
			}
			return `${prefix}: ${actualResponse}`
		},
		async switchNetwork() {
			await this.$wallet.switchNetwork(this.rawContract.chainId)
		},
		onParamChange(value, func, param) {
			const args = (this.callFuncArgs[func.name] ??= new Map())
			args.set(param.name, value)
		},
		async onMainnetDeploy() {
			try {
				if (!this.canDeployMainnet) return
				// if(!this.rawContract.isClearedForMainnet) {
				// 	//redirect to discord
				// 	window.open(this.$config.DISCORD_INVITE_URL, '_blank')
				// 	return
				// }

				const { id, chainId } = this.rawContract

				const userCredits = await this.$store.dispatch('getCreditsCount')
				const hasToPay = +userCredits < 1

				if (hasToPay) {
					this.$router.push(`/checkout?smId=${id}`)
					return
				}

				const mainnetConfig = getMainnetConfig(chainId)
				if (!mainnetConfig) {
					alert('Mainnet configuration not found.')
					return
				}

				await this.$wallet.switchNetwork(mainnetConfig.chainId)

				this.setBusy({ isBusy: true, message: 'Confirm metamask transaction to deploy' })

				const { data } = await this.$axios.get(
					`/smartcontracts/${id}/compiled`,
					{
						params: { ownerAddress: this.$wallet.account },
					}
				)
				const { abi, bytecode } = data

				const signer = this.$wallet.provider?.getSigner()
				const contractFactory = new ethers.ContractFactory(
					abi,
					bytecode,
					signer
				)

				// const deploymentData = contractFactory.interface.encodeDeploy([])
				// const estimatedGas = await this.$wallet.provider.estimateGas({ data: deploymentData })
				// console.log('CONTRACT gas estimate', estimatedGas.toString())

				const contract = await contractFactory.deploy()

				const { data: mainnetContract } = await this.$axios.post(
					`/smartcontracts/${id}/deploy-mainnet`,
					{
						ownerAddress: this.$wallet.account,
						address: contract.address,
						chainId: this.$wallet.chainId,
					}
				)

				this.deployedContract = mainnetContract

				this.$bvModal.show('deployment')
			} catch (err) {
				console.error({ err })
				this.$bvToast.toast(err.message || 'Deployment failed', {
					title: 'Mainnet Deployment',
					variant: 'danger',
				})
			} finally {
				this.setBusy({ isBusy: false })
			}
		},
		onUpdateSaleStatus(value) {
			const func = this.functions.find((val) => val.name === 'setSaleStatus')
			if (func) {
				this.onParamChange(value, func, { name: 'status' })
				this.callFunc(func)
			}
		},
		callFuncByName(name) {
			this.setBusy({ isBusy: true })
			const func = this.functions.find((val) => val.name === name)
			func && this.callFunc(func)
			this.setBusy({ isBusy: false })
		},
		async callFunc(func) {
			try {
				console.log('calling ', func)

				// console.log(this.rawContract.chainId, func)

				Vue.set(this.busyState, func.name, true)

				const txOverrides = {}

				let txResponse

				const hasFuncArgs = this.callFuncArgs[func.name]?.size > 0
				let args

				if (hasFuncArgs) {
					// to preserve correct argument order we run mapping based on original function inputs order
					// since we can't guarantee the correct order in callFuncArgs Map
					args = func.inputs.map((x) => {
						const value = this.callFuncArgs[func.name].get(x.name)
						return isNumber(value) ? ethers.BigNumber.from(value) : value
					})
					console.log({ args })

					if (func.payable) {
						if (func.name === 'mint') {
							const mintPrice = await this.contract.MINT_PRICE()
							const value =
								Number(ethers.utils.formatEther(mintPrice)) * Number(args[0])
							txOverrides.value = ethers.utils.parseEther(value.toString())
						}
					}

					if (func.name === 'setPublicMintPrice') {
						const value = this.callFuncArgs[func.name].get(func.inputs[0].name)
						args = [ethers.utils.parseUnits(value)]
					}

					txResponse = await this.contract[func.name].call(
						null,
						...args,
						txOverrides
					)
				} else {
					txResponse = await this.contract[func.name](txOverrides)
				}

				console.log({ txResponse })

				if (func.name === 'setPlaceholderUri') {
					await this.$axios.patch(`/smartcontracts/${this.rawContract.id}`, {
						delayedRevealURL: args[0],
					})
				}

				if (func.name === 'transferOwnership') {
					await this.$axios.patch(`/smartcontracts/${this.rawContract.id}`, {
						ownerAddress: args[0],
					})
				}

				if (func.constant) {
					let value = txResponse.toString()
					if (func.name.includes('PRICE')) {
						value = `${+ethers.utils.formatEther(txResponse)} ${getCurrency(
							this.rawContract.chainId
						)}`
					}
					if (func.name === 'saleStatus') {
						value = SALE_STATUS[txResponse]
						this.saleStatus = SALE_STATUS[txResponse]
					}

					Vue.set(this.responses, func.name, value)

					this.$bvToast.toast(`Returned value: ${value}`, {
						title: startCase(func.name),
						variant: 'success',
					})
				} else {
					const msg = [this.createToastMessage(txResponse.hash)]
					this.$bvToast.toast(msg, {
						title: `Processing '${startCase(func.name)}'`,
						variant: 'success',
					})
					txResponse.wait().then(async (res) => {
						this.$bvToast.toast(msg, {
							title: `${startCase(func.name)} completed`,
							variant: 'success',
						})
					})
				}
			} catch (err) {
				console.error({ err })
				const { data, reason, message, code, method, error } = err
				this.$bvToast.toast(
					error?.message ||
						data?.message ||
						reason ||
						message ||
						'Function call failed',
					{
						title: method || code || 'Error',
						variant: 'danger',
					}
				)
			} finally {
				Vue.set(this.busyState, func.name, false)
			}
		},
		createToastMessage(hash) {
			const h = this.$createElement
			return h('span', [
				'Transaction accepted! ',
				h(
					'b-link',
					{
						props: {
							target: '_blank',
							href: `${this.getExplorerUrl(
								this.rawContract.chainId
							)}/tx/${hash}`,
						},
					},
					['View on block explorer >']
				),
			])
		},
	},
}
</script>
