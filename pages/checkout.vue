<template>
	<b-container class="mt-5 px-5" fluid>
		<b-row align-h="center" class="mb-4">
			<b-col>
				<h1 class="text-center">Checkout</h1>
			</b-col>
		</b-row>
		<b-row align-h="center">
			<b-col sm="12" md="6">
				<h3 class="mb-3">Self-Deployment</h3>
				<b-form-group label="Add-ons" v-slot="{ ariaDescribedby }">
					<b-form-checkbox
						v-for="addon in addons"
						v-model="selectedAddons"
						:key="addon.value"
						:value="addon.value"
						:aria-describedby="ariaDescribedby"
						name="addons">
						{{ addon.text }}
						<b-icon
							v-if="addon.value === SMART_CONTRACT_FEATURES.CustomASCIIArt"
							id="ascii-art-popover"
							icon="question-circle"
							class="cursor-help"></b-icon>
					</b-form-checkbox>
					<b-popover
						target="ascii-art-popover"
						triggers="hover"
						placement="rightbottom"
						noninteractive
						variant="primary"
						custom-class="ascii-art-popover">
						<template #title>What's ASCII Art ?</template>
						<div>
							<p>
								ASCIIArt is added to your smart contract's code to make it
								unique and it just looks cool :)
							</p>
							<ExternalLink
								href="https://polygonscan.com/address/0x357E3bDF5aD2D29c7dbe7e604e1B22611EaE8257#code"
								text="See Example"></ExternalLink>
							<ExternalLink
								href="https://patorjk.com/software/taag"
								text="Generate yours"></ExternalLink>
						</div>
					</b-popover>
				</b-form-group>
				<b-row v-show="showASCIIArtTextArea" class="my-3">
					<b-col>
						<pre contenteditable="true" @input="onArtInput" class="border p-3"></pre>
					</b-col>
				</b-row>
				<b-row v-for="fee in fees" :key="fee.description" class="mb-1">
					<b-col cols="9">{{ fee.description }}</b-col>
					<b-col cols="3" class="text-right">{{ fee.cost }} eth</b-col>
				</b-row>
				<b-row class="border-top font-weight-bold mb-3">
					<b-col cols="9">Total: </b-col>
					<b-col cols="3" class="text-right"> {{ calcTotal }} eth </b-col>
				</b-row>
				<b-alert :show="insufficientBalance" variant="warning">Insufficient balance. Your balance: {{ $wallet.balanceFormatted }}</b-alert>
				<b-overlay :show="isBusy">
					<b-button
						:disabled="insufficientBalance || payWithEthDisabled"
						class="mb-3 font-weight-bolder"
						size="lg"
						block
						variant="primary"
						@click="payWithEth"
						>Pay With ETH</b-button
					>
				</b-overlay>
			</b-col>
			<b-col sm="12" md="2" class="text-center"> <h3>OR</h3> </b-col>
			<b-col sm="12" md="4">
				<h3 class="mb-0">Custom Project</h3>
				<span class="text-muted">starting from 3 eth</span>
				<p class="pt-3">For bespoke project we offer:</p>
				<ul>
					<li>Smart contract deployed and verified by our team</li>
					<li>OpenSea or any other marketplace setup, royalties split, etc.</li>
					<li>Dedicated launch day support</li>
					<li>Multisig wallet setup</li>
					<li>
						<span>Custom designed & built dApp (website).</span>
						<b-link v-b-toggle.dappExamples variant="link"
							>See examples >></b-link
						>
					</li>
				</ul>
				<b-collapse id="dappExamples">
					<ul>
						<li><ExternalLink href="https://69fsailingnft.io/" /></li>
						<li><ExternalLink href="https://lipsoflove.io/" /></li>
						<li><ExternalLink href="https://genesisreborn.com" /></li>
						<li><ExternalLink href="https://crypticvisions.io/" /></li>
						<li><ExternalLink href="https://metazoidsocialclub.io/" /></li>
						<li><ExternalLink href="https://phunkyfungi.io" /></li>
					</ul>
				</b-collapse>
				<b-button
					size="lg"
					variant="primary"
					href="https://discord.gg/NdEpB6ZYKn"
					target="_blank"
					><b-icon icon="discord"></b-icon
				></b-button>
				<b-button
					size="lg"
					variant="primary"
					href="http://twitter.com/zero_code_nft"
					target="_blank"
					><b-icon icon="twitter"></b-icon
				></b-button>
				<b-button
					size="lg"
					variant="primary"
					:href="`mailto:drop@zerocodenft.com?subject=Custom Deployment for ${smartContractId}`"
					target="_blank"
					><b-icon icon="envelope"></b-icon
				></b-button>
				<!-- <div id="paypal-container"></div> -->
			</b-col>
		</b-row>
		<b-modal
			id="paymentSuccess"
			title="Thank You!"
			centered
			hide-header-close
			no-close-on-esc
			no-close-on-backdrop
			hide-footer>
			<div class="text-center">
				<p>We've received your payment!</p>
				<div v-if="ethPayTxHash">
					Ethereum transaction hash:
					<p class="break-word">
						{{ ethPayTxHash | compactAddress }} <Copy :value="ethPayTxHash" />
					</p>
				</div>
				<b-button
					variant="primary"
					@click="
						() => {
							this.$bvModal.hide('paymentSuccess')
							this.$router.push(this.returnUrl)
						}
					">
					Awesome!
				</b-button>
			</div>
		</b-modal>
	</b-container>
</template>

<script>
// import { loadScript } from '@paypal/paypal-js'
import { ethers } from 'ethers'
import { mapState, mapGetters, mapMutations } from 'vuex'
import {
	PAYMENT_METHOD,
	ZERO_CODE_ETH_ADDRESS,
	SMART_CONTRACT_FEATURES,
} from '@/constants'
import { nanoid } from 'nanoid'
import { startCase } from 'lodash-es'
import { getMetamaskError } from '@/utils'

export default {
	data() {
		return {
			selectedAddons: [],
			addons: [
				{
					text: 'Source code verification (RECOMMENDED)',
					value: SMART_CONTRACT_FEATURES.SourceCodeVerification,
				},
				{
					text: 'White label mint page (no Powered by Zero Code text or logos)',
					value: SMART_CONTRACT_FEATURES.Whitelabel,
				},
				{
					text: 'Custom ASCII Art (experimental)',
					value: SMART_CONTRACT_FEATURES.CustomASCIIArt,
				},
			],
			payWithEthDisabled: false,
			ethPayTxHash: null,
			smartContractId: null,
			returnUrl: '/',
			feeStructure: [],
			smartContract: null,
			asciiArt: null,
			SMART_CONTRACT_FEATURES,
		}
	},
	async created() {
		try {
			this.smartContractId = this.$route.query['smId']
			if (!this.smartContractId) this.$router.push('/')

			this.returnUrl = `/smartcontract?id=${this.smartContractId}`

			const { data: sc } = await this.$axios.get(
				`/smartcontracts/${this.smartContractId}`
			)
			this.smartContract = sc

			const { data: feeStructure } = await this.$axios.get(
				'/smartcontracts/feature-fees'
			)
			this.feeStructure = feeStructure
		} catch (err) {
			this.payWithEthDisabled = true
			console.error('init error', err)
		}
	},
	computed: {
		...mapState(['isBusy']),
		...mapGetters(['userId']),
		showASCIIArtTextArea() {
			return this.selectedAddons.includes(
				SMART_CONTRACT_FEATURES.CustomASCIIArt
			)
		},
		insufficientBalance() {
			return this.$wallet.chainId === 1 && this.$wallet.balance < this.calcTotal
		},
		fees() {
			if (!this.smartContract) return []

			const fees1 = this.smartContract.features.map((f) => {
				return {
					description: startCase(f),
					cost: this.feeStructure.find((x) => x.name === f)?.fee,
				}
			})

			const fees2 = this.selectedAddons.map((a) => {
				const description = this.addons
					.find((x) => x.value === a)
					.text.replace(/\([\w\s]+\)/g, '')

				return {
					description: startCase(description),
					cost: this.feeStructure.find(
						(x) => x.name === SMART_CONTRACT_FEATURES[a]
					)?.fee,
				}
			})

			return fees1.concat(fees2)
		},
		calcTotal() {
			if (!this.feeStructure) return '0.00'

			const total = this.fees.reduce((acc, val) => {
				acc += val.cost
				return acc
			}, 0)

			return total.toFixed(2)
		},
	},
	methods: {
		...mapMutations(['setBusy']),
		onArtInput(e) {
			this.asciiArt = e.target.innerText
		},
		async payWithEth() {
			try {
				this.setBusy({ isBusy: true })

				if (this.$wallet.chainId !== 1) {
					await this.$wallet.switchNetwork(1)
				}

				// const data = await fetch(
				// 	'https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD'
				// )
				// const { USD: ethPrice } = await data.json()
				// const value = this.calcTotal / ethPrice

				const tx = {
					from: this.$wallet.account,
					to: ZERO_CODE_ETH_ADDRESS,
					value: ethers.utils.parseEther(this.calcTotal.toString()),
					nonce: this.$wallet.provider.getTransactionCount(
						this.$wallet.account,
						'latest'
					),
				}

				const txRes = await this.$wallet.provider
					.getSigner()
					.sendTransaction(tx)

				this.setBusy({
					isBusy: true,
					message: `Confirming ETH transaction... <br/> DO NOT CLOSE THIS WINDOW! <br/> Hash: ${txRes.hash}`,
				})

				const confirmedTx = await txRes.wait()
				console.log({ confirmedTx })

				this.ethPayTxHash = confirmedTx.transactionHash

				// const confirmedTx = {
				// 	transactionHash: nanoid()
				// }

				const { firstName, lastName, email } = this.$store.state.user
				const payload = {
					paymentMethod: PAYMENT_METHOD.ETH,
					amount: this.calcTotal,
					orderId: confirmedTx?.transactionHash,
					countryCode: null,
					payerId: this.userId,
					payerName: `${firstName} ${lastName}`,
					features: this.selectedAddons,
					payerEmail: email,
					smartContractId: this.smartContractId,
					customASCIIArt: this.asciiArt
				}

				// console.log({payload})
				await this.$axios.post('transactions', payload)

				this.$bvModal.show('paymentSuccess')

				// this.$bvModal.hide('payment')
			} catch (err) {
				this.$bvToast.toast(
					getMetamaskError(err, 'Check your metamask balance. Do not attempt payment again. Contact us.'),
					{
						title: 'ETH Payment',
						variant: 'danger',
					}
				)
			} finally {
				this.setBusy({ isBusy: false })
			}
		},
	},
}
</script>
