<template>
	<b-container fluid>
		<b-row class="mb-3">
			<b-col sm="12" md="8">
				<p class="lead font-weight-bold mb-1">
					{{ rawContract.name }}
					{{ CONTRACT_TYPE[rawContract.contractType] }} Deployed on
					{{ rawContract.blockchain | blockchainName }}
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
					<b-icon v-if="rawContract.isVerified" icon="check-circle" variant="success" title="Source code verified"></b-icon>
				</p>
				<div class="d-flex">
					<b-overlay :show="isBusy" rounded opacity="0.6" spinner-small>
						<b-button
							v-if="rawContract.status !== SMARTCONTRACT_STATUS.Mainnet"
							:disabled="!canDeployMainnet"
							variant="primary"
							@click="onMainnetDeploy">
							<template v-if="rawContract.isClearedForMainnet">
								Deploy to Mainnet
							</template>
							<template v-else>
								Checkout <b-icon icon="wallet2" />
							</template>
						</b-button>
						<b-button
							variant="primary"
							v-if="canVerify"
							@click="onVerify">
							Verify Source Code
						</b-button>
					</b-overlay>
				</div>
			</b-col>
			<b-col sm="12" md="4" class="d-flex flex-column">
				<div class="lead font-weight-bold mb-1">
					Balance: {{ contractBalance }}
					{{ getCurrency(rawContract.chainId) }}
					<b-button-group size="sm">
						<b-button variant="success">
							<b-icon
								v-if="isBusy"
								icon="bootstrap-reboot"
								animation="spin"
								:disabled="true" />
							<b-icon
								v-else
								icon="bootstrap-reboot"
								@click="onRefreshBalance(true)" />
						</b-button>
						<b-button
							:disabled="contractBalance === 0"
							variant="success"
							@click="callFuncByName('withdraw')">
							<b-icon icon="cash-stack" /> Withdraw
						</b-button>
					</b-button-group>
				</div>
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
					<b-button-toolbar
						key-nav
						justify
						aria-label="Smart contract sales menu">
						<b-overlay :show="isBusy">
							<b-button-group>
								<b-button
									variant="success"
									title="Refresh Status"
									@click="callFuncByName('saleStatus')">
									<b-icon icon="bootstrap-reboot" />
								</b-button>
								<b-button
									variant="warning"
									title="Pause Sale"
									@click="callFuncByName('setSaleStatus', [SALE_STATUS.Paused])">
									<b-icon icon="pause-fill" />
								</b-button>
								<b-button
									v-if="rawContract.hasWhitelist"
									variant="dark"
									title="Start Presale"
									@click="callFuncByName('setSaleStatus', [SALE_STATUS.Presale])">
									<b-icon icon="play-fill" />
									<b-icon icon="list-check" />
								</b-button>
								<b-button
									variant="success"
									title="Start Public Sale"
									@click="callFuncByName('setSaleStatus', [SALE_STATUS.Public])">
									<b-icon icon="play-fill" />
									<b-icon v-if="rawContract.hasWhitelist" icon="people-fill" />
								</b-button>
							</b-button-group>
						</b-overlay>
					</b-button-toolbar>
				</div>
			</b-col>
		</b-row>
		<b-row v-if="!isReady">
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
									`${rawContract.name}-abi.txt`,
									JSON.stringify(JSON.parse(rawContract.abi), null, 2)
								)
							"
							>[ABI]</b-button
						>
						<b-button
							v-if="rawContract.rawCode"
							size="sm"
							variant="link"
							@click="
								downloadTextFile(
									`${rawContract.name}.sol`,
									rawContract.rawCode
								)
							"
							>[Source Code]</b-button
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
				<b-row v-for="(func, idx) in filteredFunctions" :key="idx" >
					<b-col class="mb-2">
						<FunctionForm :func="func" :smartContract="smartContract"></FunctionForm>
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
]

export default {
	setup(props) {
		const contract = useSmartContract(props.smartContract)
		return { contract }
	},
	props: {
		smartContract: Object,
	},
	components: {
		FunctionForm
	},
	data: () => ({
		SMARTCONTRACT_STATUS,
		CONTRACT_TYPE,
		SALE_STATUS,
		showAdvancedFunctions: false,
		rawContract: {},
		deployedContract: {},
		contractBalance: 0,
		saleStatus: 'N/A',
		isReady: false,
		currentOwner: null,
		isBusy: false,
	}),
	async mounted() {
		try {
			this.rawContract = this.smartContract
			const { ownerAddress } = this.rawContract
			this.currentOwner = ownerAddress

			this.setBusy({ isBusy: true })

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
	},
	watch: {
		'$wallet.account': {
			handler: 'checkOwner',
		},
	},
	computed: {
		// ...mapState(['isBusy']),
		deployedExplorerUrl() {
			if (!this.deployedContract?.address) return

			return `${getExplorerUrl(this.deployedContract.chainId)}/address/${
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
		canVerify() {
			const { isVerified, status, addons } = this.rawContract
			const feature = SMART_CONTRACT_FEATURES[SMART_CONTRACT_FEATURES.SourceCodeVerification]
			return !isVerified && status === SMARTCONTRACT_STATUS.Mainnet && addons?.includes(feature)
		}
	},
	methods: {
		...mapMutations(['setBusy', 'addAlert', 'removeAlert']),
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
				const addrTo = `${addr.substring(0, 4)}...${addr.substring(
					addr.length - 4
				)}`
				this.addAlert({
					id: 'smartContractOwnerMismatch',
					show: true,
					text: `Connected wallet address ${this.$wallet.accountCompact} is not the smart contract owner. Please switch to ${addrTo} to perform updates.`,
				})
			} else {
				this.removeAlert('smartContractOwnerMismatch')
			}
		},
		async onVerify() {
			try {
				this.setBusy({isBusy: true, message: 'Verifying... this might take up to 5 mins.'})
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
			this.setBusy({ isBusy: true })
			const balance =
				(await this.contract.provider.getBalance(this.rawContract.address)) || '0'
			this.contractBalance = +ethers.utils.formatEther(balance)
			this.setBusy({ isBusy: false })
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

				this.setBusy({
					isBusy: true,
					message: 'Confirm metamask transaction to deploy',
				})

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

				const gasPrice = await this.$wallet.provider.getGasPrice()
				console.info(
					`GAS PRICE: ${ethers.utils.formatUnits(gasPrice, 'gwei')} gwei`
				)

				const contract = await contractFactory.deploy({
					gasPrice
				})

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
				const func = this.functions.find((val) => val.name === name)
				if(!func) throw new Error(`Function ${name }not found`)

				this.isBusy = true

				if (!this.$wallet.isConnected) {
					await this.$wallet.connect()
				}
				if (this.$wallet.chainId !== +this.rawContract.chainId) {
					await this.$wallet.switchNetwork(this.rawContract.chainId)
				}

				const signedContract = this.contract.connect(
					this.$wallet.provider.getSigner()
				)

				const txOverrides = {
					gasPrice: await this.$wallet.provider.getGasPrice()
				}

				const txResponse = await signedContract[name].call(
					null,
					...args,
					txOverrides
				)

				if(name === 'saleStatus' && func.constant) {
					this.saleStatus = SALE_STATUS[txResponse]
				}

				if(!func.constant) {
					const msg = this.createToastMessage(txResponse.hash, this.rawContract.chainId)

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
				this.isBusy = false
			}
		},
		createToastMessage(hash, chainId) {
			const h = this.$createElement
			return [h('span', [
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
			])]
		},
	},
}
</script>
