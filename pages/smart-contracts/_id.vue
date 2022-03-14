<template>
	<b-container class="mt-5">
			<b-row class="mb-3">
				<b-col sm="12" md="8">
					<p class="lead font-weight-bold mb-1">
						Deployed on {{ rawContract.blockchain | blockchainName }}
						{{ rawContract.status === SMARTCONTRACT_STATUS.Testnet ? '(Testnet)' : '(Mainnet)' }} at
						<br />
						<b-link
							:href="`${getExplorerUrl(rawContract.chainId)}/address/${
								rawContract.address
							}`"
							target="_blank"
							>{{ rawContract.address }}</b-link
						>
					</p>
					<b-overlay :show="isBusy" rounded opacity="0.6" spinner-small>
						<b-button
							:disabled="!canDeployMainnet"
							class="bg-gradient-primary border-0"
							@click="onMainnetDeploy">
							<b-icon icon="wallet2" /> Deploy to Mainnet
						</b-button>
					</b-overlay>
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
					<h3 class="pt-3">
						Contract deployment is still in progress, please check back in a
						minute
					</h3>
				</b-col>
			</b-row>
			<b-row v-else class="mt-4">
				<b-col>
					<b-row class="mb-2">
						<b-col cols="6">
							<h4 class="m-0">Update Smart Contract</h4>
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
				<b-col v-if="rawContract.hasWhitelist" cols="4" class="mb-3">
					<b-row class="mb-2">
						<b-col>
							<h4 class="m-0">Whitelist</h4>
							<b-link href="/whitelist-csv-example.csv" download
								>Download example</b-link
							>
						</b-col>
					</b-row>
					<b-row no-gutters>
						<b-col>
							<b-form-file
								accept=".csv"
								@input="onImportCsv"
								placeholder="Choose or drop .csv file"
								drop-placeholder="Drop file here...">
							</b-form-file>
							<div v-if="invalidAddresses.length > 0">
								<h5 class="text-danger">Invalid addresses</h5>
								<ul>
									<li v-for="(addr, idx) in invalidAddresses" :key="idx">{{ addr }}</li>
								</ul>
							</div>
						</b-col>
					</b-row>
					<b-row class="mt-3 mb-1">
						<b-col cols="6">
							<b-button block variant="warning" :disabled="isProcessingWhitelistCommit" @click="onWhitelistCommit"
								>Commit List</b-button
							>
						</b-col>
						<b-col cols="6">
							<b-button block variant="danger" :disabled="isProcessingWhitelistCommit" @click="onClearWhitelist"
								>Clear</b-button
							>
						</b-col>
					</b-row>
					<b-row>
						<b-col>
							<b-form-tags
								v-model="rawContract.whitelist"
								invalid-tag-text="Address is invalid"
								:tag-validator="whitelistValidator"
								placeholder="Enter Wallet Address">
							</b-form-tags>
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
			@hidden="$router.push(`/`)">
			<div class="text-center">
				<h3 class="text-success">Success!!</h3>
				<p>
					Contract has been deployed! Address: {{ deployedContract.address }}
				</p>
				<p>Please allow some time for the MetaMask transaction to clear.</p>
				<b-button variant="link" to="/">Go To Dashboard</b-button>
			</div>
		</b-modal>
		<b-modal
			id="payment"
			title="Buy Deployment Voucher"
			size="md"
			static
			centered
			scrollable
			hide-footer
			@hidden="onPaymentModalHidden">
			<div>
				<h4 class="mb-3">Total: $799</h4>
				<b-button class="mb-3 p-2 font-weight-bolder" block variant="primary" @click="payWithEth">Pay With ETH</b-button>
				<!-- <b-button class="mb-3 p-2 font-weight-bolder" block variant="info" @click="onFTXPay">Pay with FTX US</b-button> -->
				<div id="paypal-container"></div>
			</div>
		</b-modal>
		<b-modal
			id="paymentSuccess"
			title="Thank You!"
			size="sm"
			centered
			hide-footer>
			<div>
				<b-button
					:disabled="isBusy"
					class="bg-gradient-primary border-0 w-100"
					@click="
						() => {
							this.$bvModal.hide('paymentSuccess')
							this.onMainnetDeploy()
						}
					">
					<b-icon icon="wallet2" /> Deploy to Mainnet
				</b-button>
			</div>
		</b-modal>
		<b-modal
			id="ethPaymentSuccess"
			title="Thank You!"
			centered
			no-close-on-backdrop
			ok-only>
			<div>
				<p> We've received your payment. Please 
					<b-link href="https://discord.gg/E2byPVZKKV" target="_blank">open a Discord ticket</b-link> or 
					<b-link :href="`mailto:admin@zerocodenft.com?subject=ETH payment verification&body=${ethPayTxHash}`">send email</b-link> with the following
					transaction hash so we can verify and clear you for mainnet deployment.
				</p>
				<p class="break-word">{{ ethPayTxHash }} <Copy :value="ethPayTxHash" /></p>
			</div>
		</b-modal>
	</b-container>
</template>

<script>
import Vue from 'vue'
import { mapGetters, mapMutations, mapState } from 'vuex'
import { SALE_STATUS, SMARTCONTRACT_STATUS } from '@/constants'
import {
	getExplorerUrl,
	getCurrency,
	getMainnetConfig
} from '@/constants/metamask'
import { ethers } from 'ethers'
import { isNumber, startCase } from 'lodash-es'
import { loadScript } from '@paypal/paypal-js'
import { getMerkleRoot } from '@/utils'

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
	'setPlaceholderUri'
]

export default {
	middleware: 'authenticated',
	data: () => ({
		SMARTCONTRACT_STATUS,
		SALE_STATUS,
		invalidAddresses: [],
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
		isProcessingWhitelistCommit: false,
		paypal: null,
		ethPayTxHash: null
	}),
	fetchOnServer: false,
	fetchKey: 'smart-contracts-id',
	async fetch() {
		try {
			this.setBusy(true)

			const { data } = await this.$axios.get(
				`/users/${this.userId}/smartcontracts/${this.$route.params.id}`
			)
			this.rawContract = data
			this.rawContract.whitelist = this.rawContract.whitelist.filter(a => a !== ethers.utils.AddressZero)

			const { address, abi } = this.rawContract

			if (this.isOnWrongNetwork) {
				await this.switchNetwork()
			}

			this.contract = new ethers.Contract(
				address,
				abi,
				this.$wallet.provider.getSigner()
			)
			this.isReady = !!(await this.contract.deployed())

			if(this.isReady) {
				await this.onRefreshBalance()
				const saleStatus = await this.contract.saleStatus()
				this.saleStatus = SALE_STATUS[saleStatus]
			}
		} catch (err) {
			console.error(err)
		} finally {
			this.setBusy(false)
		}

		// console.log(
		// 	'loaded smart-contract',
		// 	this.rawContract,
		// 	this.contract,
		// 	this.contractBalance,
		// 	this.isReady
		// )
	},
	async mounted() {
		try {
			this.paypal = await loadScript({
				'client-id': this.$config.PAYPAL_CLIENT_ID,
				'debug': false,
				'disable-funding': 'credit',
				'enable-funding': 'venmo',
			})
		} catch (err) {
			console.error('init error', err)
		}
	},
	computed: {
		...mapState(['isBusy']),
		...mapGetters(['userId']),
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
		}
	},
	methods: {
		getExplorerUrl,
		getCurrency,
    	...mapMutations(['setBusy']),
		onFTXPay() {
			window.open('https://ftx.us/pay/request?subscribe=false&coin=USD&size=799&id=3260&memoIsRequired=false&memo=&notes=','_blank','resizable,width=700,height=900')
		},
		whitelistValidator(tag) {
			return ethers.utils.isAddress(tag)
		},
		async payWithEth() {
			try {
				const data = await fetch('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD')
				const { USD: ethPrice } = await data.json()
				const value = 799/ethPrice
				const tx = {
					from: this.$wallet.account,
					to: '0x34Eca06DB779169003117e8999B5E008086f4cc3',
					value: ethers.utils.parseEther(value.toString()),
					nonce: this.$wallet.provider.getTransactionCount(this.$wallet.account, "latest"),
				}
				const txRes = await this.$wallet.provider.getSigner().sendTransaction(tx)
				this.ethPayTxHash = txRes.hash
				this.$bvModal.hide('payment')
				this.$bvModal.show('ethPaymentSuccess')
			} catch (err) {
				const { data, reason, message, error } = err
				this.$bvToast.toast(
					error?.message ||
						data?.message ||
						reason ||
						message ||
						'Payment declined',
					{
						title: 'ETH Payment',
						variant: 'danger',
					}
				)
			}
		},
		async onWhitelistCommit() {
			this.setBusy(true)
			try {
				await this.$axios.patch(
					`/smartcontracts/${this.rawContract.id}/whitelist`,
					{
						whitelist: this.rawContract.whitelist,
					}
				)

				if(this.rawContract.whitelist.length === 0) {
					this.rawContract.whitelist = [ethers.constants.AddressZero]
				}
				const merkleRoot = getMerkleRoot(this.rawContract.whitelist)
				const txResponse = await this.contract.setMerkleRoot(merkleRoot)
				this.isProcessingWhitelistCommit = true;

				const msg = [this.createToastMessage(txResponse.hash)]
				this.$bvToast.toast(msg, {
					title: `Processing 'Commit List'`,
					variant: 'success',
				})
				txResponse.wait().then(async (res) => {
					this.isProcessingWhitelistCommit = false
					this.$bvToast.toast(msg, {
						title: 'Commit List',
						variant: 'success',
					})
				})
			} catch (err) {
				this.$bvToast.toast('Whitelist commit failed', {
					title: 'Whitelist',
					variant: 'danger',
				})
			} finally {
				this.isProcessingWhitelistCommit = false
				this.setBusy(false)
			}
		},
		async onClearWhitelist() {
			this.invalidAddresses = []
			this.rawContract.whitelist = []
		},
		async onImportCsv(file) {
			if(file === null) return

			try {
				const form = new FormData()
				form.append('file', file)
	
				const { data } = await this.$axios.post(
					`/smartcontracts/${this.rawContract.id}/whitelist`,
					form
				)

				this.rawContract.whitelist = data
	
				this.$bvToast.toast('You MUST commit the list to save it into the smart contract for it to take effect!', {
					title: 'Whitelist',
					variant: 'warning',
				})
				this.$bvToast.toast('File successfully uploaded', {
					title: 'Whitelist',
					variant: 'success',
				})
				this.invalidAddresses = []
			} catch (err) {
				console.log({err})
				if(err.response.data.errors?.invalidAddresses) {
					this.invalidAddresses = err.response.data.errors?.invalidAddresses
				}
				this.$bvToast.toast('File upload failed', {
					title: 'Whitelist',
					variant: 'danger',
				})
			}
		},
		async onRefreshBalance(showNotification = false) {
			this.setBusy(true)
			const balance =
				(await this.$wallet.provider.getBalance(this.rawContract.address)) ||
				'0'
			this.contractBalance = +ethers.utils.formatEther(balance)
			this.setBusy(false)
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
		onPaymentModalHidden() {
			const container = document.getElementById('paypal-container')
			if (container.firstChild) {
				container.removeChild(container.firstChild)
			}
		},
		async handlePayment(smartContractId, amount) {
			this.$bvModal.show('payment')
			await paypal
				.Buttons({
					createOrder: function (data, actions) {
						// console.log('createOrder', data)
						// Set up the transaction
						return actions.order.create({
							purchase_units: [
								{
									amount: {
										value: amount,
									},
								},
							],
							application_context: {
								brand_name: 'Zero Code NFT',
								shipping_preference: 'NO_SHIPPING',
								user_action: 'PAY_NOW'
							}
						})
					},
					onApprove: (data, actions) => {
						// console.log('onApprove', data)
						// This function captures the funds from the transaction.
						return actions.order.capture().then(async (details) => {
							// This function shows a transaction success message to your buyer.
							// console.log({ details })
							const {
								id: orderId,
								address,
								email_address,
								name,
								payer_id,
							} = details.payer
							await this.$axios.post('transactions', {
								paymentMethod: 'PayPal',
								amount: amount,
								orderId: orderId,
								countryCode: address.country_code,
								payerId: payer_id,
								payerName: `${name.given_name} ${name.surname}`,
								payerEmail: email_address,
								userId: this.userId,
								smartContractId: smartContractId,
							})
							// const tran = await this.$axios.get(`/transactions/paypal/${id}`)
							// console.log(tran)
							this.$bvModal.hide('payment')
							this.$bvModal.show('paymentSuccess')
						})
					},
					onCancel: () => {
						this.$bvModal.hide('payment')
						this.onPaymentModalHidden()
					},
					onError: (err) => {
						console.error({ err })
						// this.$bvModal.hide("payment")
						// this.onPaymentModalHidden()
						this.$bvToast.toast(err.message || 'Payment failed', {
							title: 'PayPal',
							variant: 'danger',
						})
					},
				})
				.render('#paypal-container')
		},
		async onMainnetDeploy() {
			try {
				if(!this.canDeployMainnet) return
				if(!this.rawContract.isClearedForMainnet) {
					//redirect to discord
					window.open(this.$config.DISCORD_INVITE_URL, '_blank')
					return
				}

				const { id, chainId } = this.rawContract

				const userCredits = await this.$store.dispatch('getCreditsCount')
				const hasToPay = +userCredits < 1

				if (!hasToPay) {
					const amount = 799
					this.handlePayment(id, amount)
					return
				}

				const mainnetConfig = getMainnetConfig(chainId)
				if(!mainnetConfig) {
					alert("Mainnet configuration not found.")
					return
				}
				
				await this.$wallet.switchNetwork(mainnetConfig.chainId)

				this.setBusy(true)

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
				this.setBusy(false)
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
			this.setBusy(true)
			const func = this.functions.find((val) => val.name === name)
			func && this.callFunc(func)
			this.setBusy(false)
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
							const value = Number(ethers.utils.formatEther(mintPrice)) * Number(args[0])
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
						delayedRevealURL: args[0]
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
