<template>
    <b-container class="mt-5 px-5" fluid>
        <b-row align-h="center" class="mb-4">
            <b-col>
                <h1 class="text-center">Checkout</h1>
            </b-col>
        </b-row>
        <b-row align-h="center">
            <b-col sm="12" md="4">
                <h3 class="mb-3">Standard Deployment {{ calcTotal || 'Loading...' }} eth</h3>
                <p> x1 Smart Contract Deployment </p>
				<b-form-group
					label="Add-ons"
					v-slot="{ ariaDescribedby }"
					>
					<b-form-checkbox
						v-for="addon in addons"
						v-model="selectedAddons"
						:key="addon.value"
						:value="addon.value"
						:aria-describedby="ariaDescribedby"
						name="addons"
					>
						{{ addon.text }}
					</b-form-checkbox>
				</b-form-group>
                <b-overlay :show="isBusy">
                    <b-button
						:disabled="payWithEthDisabled"
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
				<h3 class="mb-0">Custom Deployment</h3>
				<span class="text-muted">starting from 2 eth</span>
				<p class="pt-3"> For bespoke project we offer: </p>
				<ul>
					<li>Smart contract deployed and verified by our team</li>
					<li>OpenSea or any other marketplace setup, royalties split, etc.</li>
					<li>Dedicated launch day support</li>
					<li>Multisig wallet setup</li>
					<li>Custom designed & built dApp (website). See examples >></li>
				</ul>
				<b-button size="lg" variant="primary" href="https://discord.gg/NdEpB6ZYKn" target="_blank"><b-icon icon="discord"></b-icon></b-button>
				<b-button size="lg" variant="primary" href="http://twitter.com/zero_code_nft" target="_blank"><b-icon icon="twitter"></b-icon></b-button>
				<b-button size="lg" variant="primary" :href="`mailto:drop@zerocodenft.com?subject=Custom Deployment for ${smartContractId}`" target="_blank"><b-icon icon="envelope"></b-icon></b-button>
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
						}"
                    >
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
import { PAYMENT_METHOD, ZERO_CODE_ETH_ADDRESS, ADDONS } from '@/constants'

export default {
    data() {
        return {
			selectedAddons: [],
			addons: [
				{
					text: 'Smart contract source code verification (recommended, increases trust)',
					value: ADDONS.SourceCodeVerification
				},
				{
					text: 'White label mint page (no Powered by Zero Code text or logos)',
					value: ADDONS.Whitelabel
				}
			],
			payWithEthDisabled: false,
		    ethPayTxHash: null,
            smartContractId: null,
			smartContractTotal: 0,
			returnUrl: '/'
        }
    },
    async created() {
        try {
            this.smartContractId = this.$route.query['smId']
            if(!this.smartContractId) this.$router.push('/')

			this.returnUrl = `/smartcontract?id=${this.smartContractId}&deploy=true`

			const { data } = await this.$axios.get(`/smartcontracts/${this.smartContractId}/total`)

			this.smartContractTotal = data.totalEth
            
			// await loadScript({
			// 	'client-id': this.$config.PAYPAL_CLIENT_ID,
            //     debug: false,
			// 	// 'debug': process.env.ENVIRONMENT !== 'production',
			// 	'disable-funding': 'credit',
			// 	'enable-funding': 'venmo',
			// })
            // this.renderPayPalButtons(this.smartContractId)
		} catch (err) {
			this.payWithEthDisabled = true
			console.error('init error', err)
		}
    },
    computed: {
		...mapState(['isBusy']),
		...mapGetters(['userId']),
		calcTotal() {
			const addons = this.selectedAddons.reduce((acc,val) => {
				if(val === ADDONS.SourceCodeVerification) acc += 0.05
				if(val === ADDONS.Whitelabel) acc += this.smartContractTotal * 3
				return acc
			}, 0)

			return Number((this.smartContractTotal + addons).toFixed(2))
		}
    },
    methods: {
		...mapMutations(['setBusy']),
        // onPaymentModalHidden() {
		// 	const container = document.getElementById('paypal-container')
		// 	if (container.firstChild) {
		// 		container.removeChild(container.firstChild)
		// 	}
		// },
        // async renderPayPalButtons() {
        //     const total = this.total
		// 	paypal
		// 		.Buttons({
        //             createOrder: function (data, actions) {
        //                 // console.log('createOrder', data)
		// 				// Set up the transaction
		// 				return actions.order.create({
		// 					purchase_units: [
		// 						{
		// 							amount: {
		// 								value: total,
		// 							},
		// 						},
		// 					],
		// 					application_context: {
		// 						brand_name: 'Zero Code NFT',
		// 						shipping_preference: 'NO_SHIPPING',
		// 						user_action: 'PAY_NOW',
		// 					},
		// 				})
		// 			},
		// 			onApprove: (data, actions) => {
		// 				// console.log('onApprove', data)
		// 				// This function captures the funds from the transaction.
		// 				return actions.order.capture().then(async (details) => {
		// 					// This function shows a transaction success message to your buyer.
		// 					// console.log({ details })
		// 					const {
		// 						id: orderId,
		// 						address,
		// 						email_address,
		// 						name,
		// 						payer_id,
		// 					} = details.payer
		// 					await this.$axios.post('transactions', {
		// 						paymentMethod: PAYMENT_METHOD.PayPal,
		// 						amount: this.total,
		// 						orderId: orderId,
		// 						countryCode: address.country_code,
		// 						payerId: payer_id,
		// 						payerName: `${name.given_name} ${name.surname}`,
		// 						payerEmail: email_address,
		// 						smartContractId: this.smartContractId
		// 					})
		// 					// const tran = await this.$axios.get(`/transactions/paypal/${id}`)
		// 					// console.log(tran)
		// 					this.$bvModal.show('paymentSuccess')
		// 				})
		// 			},
		// 			onCancel: () => {
		// 				// this.$bvModal.hide('payment')
		// 				// this.onPaymentModalHidden()
		// 			},
		// 			onError: (err) => {
		// 				console.error({ err })
		// 				// this.$bvModal.hide("payment")
		// 				// this.onPaymentModalHidden()
		// 				this.$bvToast.toast(err.message || 'Payment failed', {
		// 					title: 'PayPal',
		// 					variant: 'danger',
		// 				})
		// 			},
		// 		})
        //         .render('#paypal-container')
		// },
        async payWithEth() {
			try {
				this.setBusy({isBusy: true})

                if(this.$wallet.chainId !== 1) {
                    await this.$wallet.switchNetwork(1)
                }
				
				// const data = await fetch(
				// 	'https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD'
				// )
				// const { USD: ethPrice } = await data.json()
				// const value = this.total / ethPrice
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
                    message: `Confirming ETH transaction... <br/> DO NOT CLOSE THIS WINDOW! <br/> Hash: ${txRes.hash}`
                })

                const confirmedTx = await txRes.wait()
				console.log({confirmedTx})

				this.ethPayTxHash = confirmedTx.transactionHash

				const user = this.$store.state.user
				const payload = {
					paymentMethod: PAYMENT_METHOD.ETH,
					amount: this.calcTotal,
					orderId: confirmedTx.transactionHash,
					countryCode: null,
					payerId: this.userId,
					payerName: `${user.firstName} ${user.lastName}`,
					addons: this.selectedAddons,
					payerEmail: user.email,
					smartContractId: this.smartContractId
				}

				console.log({payload})
				await this.$axios.post('transactions', payload)

				this.$bvModal.show('paymentSuccess')

				// this.$bvModal.hide('payment')
			} catch (err) {
				const { data, reason, message, error } = err
				this.$bvToast.toast(
					error?.message ||
						data?.message ||
						reason ||
						message ||
						'Check your metamask balance. Do not attempt payment again. Contact us.',
					{
						title: 'ETH Payment',
						variant: 'danger',
					}
				)
			} finally {
                this.setBusy({isBusy:false})
            }
		},
    }
}
</script>

