<template>
	<b-container class="mt-5">
		<b-overlay :show="isBusy" opacity="1">
			<b-row class="mb-3">
				<b-col sm="12" md="9">
					<p class="lead font-weight-bold mb-1">
						Deployed on {{ rawContract.blockchain | blockchainName }}
						{{ isTestnet(rawContract.chainId) ? 'TESTNET' : 'MAINNET' }} at
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
							:disabled="isBusy || !isTestnet(rawContract.chainId)"
							class="bg-gradient-primary border-0"
							@click="onMainnetDeploy">
							<b-icon icon="wallet2" /> Deploy to Mainnet
						</b-button>
					</b-overlay>
				</b-col>
				<b-col sm="12" md="3" class="d-flex flex-column justify-content-end">
					<p class="lead font-weight-bold">
						Contract Balance: {{ contractBalance }} {{ getCurrency(rawContract.chainId) }}
					</p>
					<b-button variant="success" :disabled="contractBalance === 0" @click="onWithdraw">Withdraw</b-button>
				</b-col>
			</b-row>
			<b-row v-if="isOnWrongNetwork">
				<b-col class="d-flex flex-column align-items-center mt-3">
					<h3>Detected network is different than the smart contract</h3>
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
					<b-row>
						<b-col cols="6">
							<h4>Update Smart Contract</h4>
						</b-col>
					</b-row>
					<b-row>
						<b-col>
						<ul class="list-unstyled">
						<li
							class="mb-2 border rounded"
							v-for="(func, idx) in functions"
							:key="idx"
							role="tab">
							<div class="d-flex justify-content-between p-2" v-b-toggle="`${func.name + idx}`">
								<template v-if="func.constant">
									<b-badge pill size="sm" variant="success" class="my-auto">Eco</b-badge>
								</template>
								<template v-else>
									<b-badge pill size="sm" variant="warning" class="my-auto">Gas</b-badge>
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
								<ul v-if="func.inputs.length > 0" class="mb-2">
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
								<div :class="['d-flex', func.inputs.length > 0 && 'justify-content-end']">
									<b-overlay
									:show="busyState[func.name]"
									rounded
									opacity="0.5"
									spinner-small>
										<b-button :class="['mt-1', func.inputs.length === 0 && 'w-100']" variant="success" @click="callFunc(func)"
											>Execute</b-button
										>
									</b-overlay>
								</div>
								<div
									v-show="responses[func.name]"
									class="lead font-weight-bold mt-2"
									>{{ func.inputs.length > 0 ? 'Result' : func.name | startCase }}: {{ responses[func.name] }}</div
								>
							</b-collapse>
						</li>
					</ul>
						</b-col>
					</b-row>
				</b-col>
				<b-col v-if="rawContract.hasWhitelist" cols="5">
					<b-row>
						<b-col cols="6">
							<h4>Whitelist</h4>
						</b-col>
					</b-row>
					<b-row class="h-100">
						<b-col>
							<b-form-tags
								class="mb-2"
								v-model="rawContract.whitelist"
								placeholder="Enter Wallet Address">
							</b-form-tags>
							<b-button
								class="align-self-end"
								variant="success"
								@click="updateWhitelist"
								>Update Whitelist</b-button
							>
						</b-col>
					</b-row>
				</b-col>
			</b-row>
		</b-overlay>
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
			<div id="payments-container"></div>
		</b-modal>
		<b-modal
			id="paymentSuccess"
			title="Thank You!!"
			size="sm"
			centered
			hide-footer>
			<div>
				<b-button
					:disabled="true || isBusy"
					class="bg-gradient-primary border-0 w-100"
					@click="
						() => {
							this.$bvModal.hide('paymentSuccess')
							this.onMainnetDeploy()
						}
					">
					<b-icon icon="wallet2" /> Deploy to Mainnet)
				</b-button>
			</div>
		</b-modal>
	</b-container>
</template>

<script>
import Vue from 'vue'
import { mapGetters } from 'vuex'
import {
	CHAINID_CONFIG_MAP,
	getExplorerUrl,
	getCurrency,
	isTestnet,
	getMainnetConfig,
} from '@/constants/metamask'
import { ethers } from 'ethers'
import { isNumber } from 'lodash-es'
import { loadScript } from '@paypal/paypal-js'

const FormatTypes = ethers.utils.FormatTypes

export default {
	middleware: 'authenticated',
	data: () => ({
		FormatTypes,
		advancedMode: false,
		rawContract: {},
		contract: {},
		deployedContract: {},
		responses: {},
		callFuncArgs: {},
		contractBalance: 0,
		busyState: {},
		isBusy: true,
		isReady: false,
		isOnWrongNetwork: false,
		paypal: null,
	}),
	fetchOnServer: false,
	fetchKey: 'smart-contracts-id',
	async fetch() {
		try {
			const { data } = await this.$axios.get(
				`/users/${this.userId}/smartcontracts/${this.$route.params.id}`
			)
			this.rawContract = data

			const { address, chainId, abi } = this.rawContract
			this.contract = new ethers.Contract(
				address,
				abi,
				this.$wallet.provider.getSigner()
			)
			const balance = (await this.$wallet.provider.getBalance(address)) || '0'

			this.contractBalance = +ethers.utils.formatEther(balance)
			this.isOnWrongNetwork = this.$wallet.chainId !== +chainId

			if (this.isOnWrongNetwork) {
				await this.$wallet.switchNetwork(CHAINID_CONFIG_MAP[chainId])
			}

			this.isReady = !!(await this.contract.deployed())
		} catch (err) {
			console.error(err)
		} finally {
			this.isBusy = false
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
				'client-id': process.env.PAYPAL_CLIENT_ID,
				'debug': false,
				'disable-funding': 'credit',
				'enable-funding': 'venmo',
			})
		} catch (err) {
			console.error('init error', err)
		}
	},
	computed: {
		...mapGetters(['userId']),
		functions() {
			return Object.values(this.contract.interface?.functions || {})
				.sort((a, b) => a.name.localeCompare(b.name))
		},
	},
	methods: {
		getExplorerUrl,
		isTestnet,
		getCurrency,
		switchNetwork() {
			this.$wallet.switchNetwork(CHAINID_CONFIG_MAP[this.rawContract.chainId])
		},
		async updateWhitelist() {
			await this.$axios.patch(
				`/smartcontracts/${this.rawContract.id}/whitelist`,
				{
					whitelist: this.rawContract.whitelist,
				}
			)
			this.$bvToast.toast('List updated', {
				title: 'Whitelist',
				variant: 'success',
			})
		},
		onParamChange(value, func, param) {
			const args = (this.callFuncArgs[func.name] ??= new Map())
			args.set(param.name, value)
		},
		onPaymentModalHidden() {
			const container = document.getElementById('payments-container')
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
							this.$bvModal.hide('payment')
							this.$bvModal.show('paymentSuccess')
							// alert('Transaction completed by ' + details.payer.name.given_name);
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
				.render('#payments-container')
		},
		async onMainnetDeploy() {
			try {
				const { id, chainId } = this.rawContract

				const userCredits = await this.$store.dispatch('getCreditsCount')
				const hasToPay = +userCredits < 1

				if (hasToPay) {
					const amount = 499
					this.handlePayment(id, amount)
					return
				}

				const mainnetConfig = getMainnetConfig(chainId)

				await this.$wallet.switchNetwork(mainnetConfig)

				this.isBusy = true

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
				const contract = await contractFactory.deploy()

				const { data: mainnetContract } = await this.$axios.post(
					`/smartcontracts/${id}/deploy-mainnet`,
					{
						ownerAddress: this.$wallet.account,
						address: contract.address,
						chainId: mainnetConfig.chainId,
					}
				)

				this.deployedContract = mainnetContract

				this.$bvModal.show('deployment')
			} catch (err) {
				this.isBusy = false
				console.error({ err })
				this.$bvToast.toast(err.message || 'Deployment failed', {
					title: 'Mainnet Deployment',
					variant: 'danger',
				})
			}
		},
		onWithdraw() {
			const func = this.functions.find((val) => val.name === 'withdraw')
			if(func) {
				this.callFunc(func)
			}
		},
		async callFunc(func) {
			try {
				console.log('calling ', func)

				// console.log(this.rawContract.chainId, func)

				if (this.rawContract.chainId != this.$wallet.network.chainId) {
					const config = CHAINID_CONFIG_MAP[this.rawContract.chainId]
					await this.$wallet.switchNetwork(config)
					return // the page will reload when chain was changed so doesnt make sense to continue
				}

				Vue.set(this.busyState, func.name, true)

				const txOverrides = {}

				if (!func.constant) {
					const gasPrice = await this.contract.signer.getGasPrice()
					console.log('gasPrice', ethers.utils.formatUnits(gasPrice))

					txOverrides.gasPrice = gasPrice
				}

				let txResponse

				const hasFuncArgs = this.callFuncArgs[func.name]?.size > 0
				if (hasFuncArgs) {
					// to preserve correct argument order we run mapping based on original function inputs order
					// since we can't guarantee the correct order in callFuncArgs Map
					const args = func.inputs.map((x) => {
						const value = this.callFuncArgs[func.name].get(x.name) || null
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

					txResponse = await this.contract[func.name].call(
						null,
						...args,
						txOverrides
					)
				} else {
					txResponse = await this.contract[func.name](txOverrides)
				}

				console.log({ txResponse })

				if (func.constant) {
					const value = func.name.includes('PRICE')
						? ethers.utils.formatEther(txResponse) +
						  ' ' +
						  getCurrency(this.rawContract.chainId)
						: txResponse.toString()

					Vue.set(this.responses, func.name, value)

					this.$bvToast.toast(`Returned value: ${value}`, {
						title: func.name,
						variant: 'success',
					})
				} else {
					const msg = [this.createToastMessage(txResponse.hash)]
					this.$bvToast.toast(msg, {
						title: `Processing ${func.name}`,
						variant: 'success',
					})
					txResponse.wait().then(async (res) => {
						console.log({ res })
						this.$bvToast.toast(msg, {
							title: `${func.name} completed`,
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
