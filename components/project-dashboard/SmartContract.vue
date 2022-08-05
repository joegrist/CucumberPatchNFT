<template>
	<b-container fluid>
		<b-row class="mb-3">
			<b-col sm="12" md="8">
				<b-row>
					<b-col>
						<span class="lead font-weight-bold" id="contract-name-network">
							{{ rawContract.name }}
							{{ isReady ? 'deployed' : 'pending' }} on
							{{ rawContract.blockchain | blockchainName }}
							{{
								rawContract.status === SMARTCONTRACT_STATUS.Testnet
									? '(testnet)'
									: '(mainnet)'
							}}
						</span>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-button-toolbar
							class="my-1"
							key-nav
							aria-label="Smart Contract Actions"
						>
							<b-button-group>
								<b-button
									v-if="rawContract.status !== SMARTCONTRACT_STATUS.Mainnet"
									:disabled="!canDeployMainnet"
									variant="primary"
									@click="onMainnetDeploy"
									id="mainnet-deploy"
								>
									Deploy to Mainnet
									<b-icon
										v-if="!rawContract.isClearedForMainnet"
										icon="wallet2"
									/>
								</b-button>
								<b-button
									variant="primary"
									v-if="canVerify"
									@click="onVerify"
									id="verify-source-code"
								>
									Verify Source Code
								</b-button>
							</b-button-group>
						</b-button-toolbar>
					</b-col>
				</b-row>
			</b-col>
			<b-col sm="12" md="4" class="d-flex flex-column">
				<div class="d-flex justify-content-between mb-1">
					<span class="lead font-weight-bold" id="contract-balance">
						Balance: {{ contractBalance }}
						{{ getCurrency(rawContract.chainId) }}
					</span>
					<b-dropdown
						right
						lazy
						variant="primary"
						size="sm"
						text="Actions"
						:disabled="!isReady"
					>
						<b-dd-item-btn @click="onRefreshBalance(true)">
							<b-icon icon="bootstrap-reboot" />
							Refresh
						</b-dd-item-btn>
						<b-dd-item-btn
							@click="callFuncByName('withdraw')"
							:disabled="contractBalance === 0"
						>
							<b-icon icon="cash-stack" />
							Withdraw
						</b-dd-item-btn>
					</b-dropdown>
				</div>
				<div class="d-flex justify-content-between">
					<span class="lead font-weight-bold" id="sale-status">
						Sale Status:
						<span
							:class="{
								'text-warning': saleStatus === 'Paused',
								'text-dark': saleStatus === 'Presale',
								'text-success': saleStatus === 'Public',
							}"
							>{{ saleStatus }}</span
						>
					</span>
					<b-dropdown
						right
						lazy
						variant="primary"
						size="sm"
						text="Actions"
						:disabled="!isReady"
					>
						<b-dd-item-btn @click="callFuncByName('saleStatus')">
							<b-icon icon="bootstrap-reboot" />
							Refresh Sale Status
						</b-dd-item-btn>
						<b-dd-item-btn
							@click="callFuncByName('setSaleStatus', [SALE_STATUS.Paused])"
						>
							<b-icon icon="pause-fill" />
							Pause Sales
						</b-dd-item-btn>
						<b-dd-item-btn
							v-if="rawContract.hasWhitelist"
							@click="callFuncByName('setSaleStatus', [SALE_STATUS.Presale])"
						>
							<b-icon icon="play-fill" />
							<b-icon icon="list-check" />
							Start Presale (WL)
						</b-dd-item-btn>
						<b-dd-item-btn
							@click="callFuncByName('setSaleStatus', [SALE_STATUS.Public])"
						>
							<b-icon icon="play-fill" />
							<b-icon v-if="rawContract.hasWhitelist" icon="people-fill" />
							Start Public Sale
						</b-dd-item-btn>
					</b-dropdown>
				</div>
			</b-col>
		</b-row>
		<b-row v-if="!isReady">
			<b-col class="text-center">
				<h4 class="pt-3">
					Pending smart contract deployment, please wait. Some functions are
					disabled.
				</h4>
			</b-col>
		</b-row>
		<b-row v-else>
			<b-col>
				<b-row class="mb-2">
					<b-col sm="12" md="8" class="d-flex flex-wrap">
						<h4 class="m-0 mr-1" id="contract-type">
							{{ CONTRACT_TYPE[rawContract.contractType] }}
						</h4>
						<b-icon
							v-if="rawContract.isVerified"
							class="my-auto"
							icon="check-circle"
							variant="success"
							title="Source code verified"
						></b-icon>
						<b-button
							size="sm"
							class="ml-2"
							variant="outline-primary"
							target="_blank"
							:href="`${getExplorerUrl(rawContract.chainId)}/address/${
								rawContract.address
							}`"
							id="block-explorer"
							>{{ rawContract.address | compactAddress }}
							<b-icon icon="box-arrow-up-right"
						/></b-button>
						<b-button
							size="sm"
							class="ml-2"
							variant="outline-primary"
							@click="
								downloadTextFile(
									`${rawContract.name}-abi.txt`,
									JSON.stringify(JSON.parse(rawContract.abi), null, 2)
								)
							"
							id="download-contract-abi"
							>ABI <b-icon icon="download"
						/></b-button>
						<b-button
							v-if="rawContract.rawCode"
							size="sm"
							class="ml-2"
							variant="outline-primary"
							@click="
								downloadTextFile(`${rawContract.name}.sol`, rawContract.rawCode)
							"
							id="download-source-code"
							>Source Code <b-icon icon="download" />
						</b-button>
					</b-col>
					<b-col
						sm="12"
						md="4"
						class="d-flex justify-content-left justify-content-md-end my-auto"
					>
						<span class="pr-1">Advanced</span>
						<b-form-checkbox
							v-model="showAdvancedFunctions"
							name="check-button"
							switch
						/>
					</b-col>
				</b-row>
				<b-row v-for="(func, idx) in filteredFunctions" :key="idx">
					<b-col class="mb-2">
						<FunctionForm
							:func="func"
							:smartContract="smartContract"
						></FunctionForm>
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
			@hidden="$router.push('/')"
		>
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
import { mapMutations, mapState } from 'vuex'
import { startCase } from 'lodash-es'
import {
	SALE_STATUS,
	SMARTCONTRACT_STATUS,
	SMART_CONTRACT_FEATURES,
	CONTRACT_TYPE,
} from '@/constants'
import {
	getExplorerUrl,
	getCurrency,
	getMainnetConfig,
} from '@/constants/metamask'
import { ethers } from 'ethers'
import { downloadTextFile, getMetamaskError } from '@/utils'
import useSmartContract from '@/hooks/useSmartContract'
import FunctionForm from './smart-contract/FunctionForm'
import ProductTour from '@/mixins/productTour'

const basicFunctions = [
	'airdrop',
	'COLLECTION_SIZE',
	'MINT_PRICE',
	'PRESALE_MINT_PRICE',
	'setSaleStatus',
	'saleStatus',
	'owner',
	'reveal',
	'totalSupply',
	'setPublicMintPrice',
	'setPreRevealUrl',
	'setBaseURL',
]

export default {
	setup(props) {
		const contract = useSmartContract(props.smartContract)
		return { contract, rawContract: props.smartContract }
	},
	mixins: [ProductTour],
	props: {
		smartContract: Object,
	},
	components: {
		FunctionForm,
	},
	data: () => ({
		SMARTCONTRACT_STATUS,
		CONTRACT_TYPE,
		SALE_STATUS,
		showAdvancedFunctions: false,
		mainnetContract: {},
		contractBalance: 0,
		saleStatus: 'N/A',
		isReady: false,
		busyStates: {
			withdraw: false,
			setSaleStatus: false,
		},
	}),
	fetchOnServer: false,
	fetchKey: 'smart-contract-tab',
	async fetch() {
		try {
			await this.contract.deployed() // throws if not deployed
			await this.onReady()
		} catch {
			// if not deployed setup one-time listener
			this.contract.once('OwnershipTransferred', async (from, to) => {
				console.log('OwnershipTransferred', from, to)
				if (from === ethers.constants.AddressZero) {
					await this.onReady()
				}
			})
		}
	},
	watch: {
		'$wallet.balance': function (newVal) {
			if (newVal > 0) {
				this.removeAlert('insufficientBalance')
			}
		},
		'isReady'(nv) {
			if (nv && this.tourPrompts.project) {
				this.initTour('project')
				this.updateTourPrompts({
					project: false,
				})
			}
		},
	},
	computed: {
		...mapState(['tourPrompts']),
		isBusy() {
			return this.$fetchState.pending || this.$store.state.isBusy
		},
		deployedExplorerUrl() {
			if (!this.mainnetContract?.address) return

			return `${getExplorerUrl(this.mainnetContract.chainId)}/address/${
				this.mainnetContract.address
			}`
		},
		canDeployMainnet() {
			return this.rawContract.status === SMARTCONTRACT_STATUS.Testnet
		},
		functions() {
			return Object.values(
				this.contract.interface?.functions || {}
			).sort((a, b) => a.name.localeCompare(b.name))
		},
		filteredFunctions() {
			return this.functions?.filter(
				(f) => this.showAdvancedFunctions || basicFunctions.includes(f.name)
			)
		},
		canVerify() {
			const { isVerified, status, addons } = this.rawContract
			const feature =
				SMART_CONTRACT_FEATURES[SMART_CONTRACT_FEATURES.SourceCodeVerification]
			return (
				!isVerified &&
				status === SMARTCONTRACT_STATUS.Mainnet &&
				addons?.includes(feature)
			)
		},
	},
	methods: {
		...mapMutations([
			'setBusy',
			'addAlert',
			'removeAlert',
			'updateTourPrompts',
		]),
		getExplorerUrl,
		getCurrency,
		downloadTextFile,
		async onReady() {
			this.$emit('ready')
			this.isReady = true
			await this.onRefreshBalance()
			const saleStatus = await this.contract.saleStatus()
			this.saleStatus = SALE_STATUS[saleStatus]
		},
		async onVerify() {
			try {
				this.setBusy({
					isBusy: true,
					message: 'Verifying... this might take up to 5 mins.',
				})
				await this.$axios.post(`/smartcontracts/${this.rawContract.id}/verify`)
				this.rawContract.isVerified = true
				this.$bvToast.toast(
					'Verified! Please allow 5-10 minutes to reflect on block explorer',
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
			} finally {
				this.setBusy({ isBusy: false })
			}
		},
		async onRefreshBalance(showNotification = false) {
			const balance =
				(await this.contract.provider.getBalance(this.rawContract.address)) ||
				'0'
			this.contractBalance = +ethers.utils.formatEther(balance)
			showNotification &&
				this.$bvToast.toast('Balance successfully refreshed', {
					title: 'Balance',
					variant: 'success',
				})
		},
		async onMainnetDeploy() {
			try {
				if (!this.canDeployMainnet) return

				const { id, chainId, isClearedForMainnet } = this.rawContract

				const userCredits = await this.$store.dispatch('getCreditsCount')
				const isPaid = userCredits > 0 || isClearedForMainnet

				if (!isPaid) {
					this.$router.push(`/checkout?smId=${id}`)
					return
				}

				const mainnetConfig = getMainnetConfig(chainId)
				if (!mainnetConfig) {
					this.$bvToast.toast('Mainnet configuration not found.', {
						title: 'Contract Deployment',
						variant: 'danger',
					})
				}

				if (!this.$wallet.isConnected) {
					await this.$wallet.connect()
				}
				await this.$wallet.switchNetwork(mainnetConfig.chainId)

				if (this.$wallet.balance === 0) {
					this.addAlert({
						id: 'insufficientBalance',
						variant: 'danger',
						text:
							"Connected wallet doesn't have enough balance to cover the deployment gas fees.",
					})
					return
				}

				this.setBusy({
					isBusy: true,
					message: 'Confirm metamask transaction to deploy',
				})

				const { data } = await this.$axios.post(`/smartcontracts/${id}/compile`)
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

				const gasPrice = await this.$wallet.provider.getGasPrice()
				console.info(
					`GAS PRICE: ${ethers.utils.formatUnits(gasPrice, 'gwei')} gwei`
				)

				const contract = await contractFactory.deploy({
					gasPrice,
				})

				const { data: mainnetContract } = await this.$axios.post(
					`/smartcontracts/${id}/deploy-mainnet`,
					{
						ownerAddress: this.$wallet.account,
						address: contract.address,
						chainId: this.$wallet.chainId,
					}
				)

				this.mainnetContract = mainnetContract

				this.$bvModal.show('deployment')
			} catch (err) {
				console.error({ err })
				this.$bvToast.toast(getMetamaskError(err, 'Deployment failed'), {
					title: 'Contract Deployment',
					variant: 'danger',
				})
			} finally {
				this.setBusy({ isBusy: false })
			}
		},
		async callFuncByName(name, args = []) {
			try {
				console.log('calling ', name)
				const func = this.functions.find((val) => val.name === name)
				if (!func) throw new Error(`Function ${name} not found`)

				this.busyStates[name] = true

				let txResponse

				if (func.constant) {
					txResponse = await this.contract.saleStatus()

					if (name === 'saleStatus') {
						this.saleStatus = SALE_STATUS[txResponse]
						this.$bvToast.toast('Sale Status successfully refreshed', {
							title: `${startCase(name)}`,
							variant: 'success',
						})
					}
				} else {
					if (!this.$wallet.isConnected) {
						await this.$wallet.connect()
					}
					if (this.$wallet.chainId !== +this.rawContract.chainId) {
						await this.$wallet.switchNetwork(this.rawContract.chainId)
					}

					const txOverrides = {
						gasPrice: await this.$wallet.provider.getGasPrice(),
					}

					const signedContract = this.contract.connect(
						this.$wallet.provider.getSigner()
					)

					txResponse = await signedContract[name].call(
						null,
						...args,
						txOverrides
					)

					const msg = this.createToastMessage(
						txResponse.hash,
						this.rawContract.chainId
					)

					this.$bvToast.toast(msg, {
						title: `${startCase(name)} - processing, please wait.`,
						variant: 'success',
					})

					await txResponse.wait()

					this.$bvToast.toast(msg, {
						title: `${startCase(name)} - completed`,
						variant: 'success',
					})
				}
			} catch (err) {
				console.error({ err })
				const { method, code } = err
				this.$bvToast.toast(getMetamaskError(err, 'Function call failed'), {
					title: method || code || 'Error',
					variant: 'danger',
				})
			} finally {
				this.busyStates[name] = false
			}
		},
		createToastMessage(hash, chainId) {
			const h = this.$createElement
			return [
				h('span', [
					h(
						'b-link',
						{
							props: {
								target: '_blank',
								href: `${getExplorerUrl(chainId)}/tx/${hash}`,
							},
						},
						['View on block explorer >']
					),
				]),
			]
		},
	},
}
</script>
