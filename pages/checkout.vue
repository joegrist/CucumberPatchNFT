<template>
    <b-container class="mt-5">
        <b-row>
            <b-col>
                <h1 class="mb-3 text-center">Checkout</h1>
            </b-col>
        </b-row>
        <b-row>
            <b-col sm="12" md="6">
                <h3 class="mb-3">Total: ${{total}}</h3>
                <p> x1 Smart Contract Deployment</p>
                <!-- <h3 class="mb-3">Payment Options</h3> -->
                <b-overlay :show="isBusy">
                    <b-button
                        class="mb-3 p-3 font-weight-bolder"
                        block
                        variant="primary"
                        @click="payWithEth"
                        >Pay With ETH</b-button
                    >
                </b-overlay>
				<!-- <b-button class="mb-3 p-2 font-weight-bolder" block variant="info" @click="onFTXPay">Pay with FTX US</b-button> -->
				<div id="paypal-container"></div>
            </b-col>
        </b-row>
        <b-modal
			id="paymentSuccess"
			title="Thank You!"
			size="sm"
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
                        {{ ethPayTxHash }} <Copy :value="ethPayTxHash" />
                    </p>
                </div>
				<b-button
					:disabled="isBusy"
					variant="primary"
					@click="
						() => {
							this.$bvModal.hide('paymentSuccess')
							this.$router.push(`/smartcontract?id=${this.smartContractId}`)
						}"
                    >
					Awesome!
				</b-button>
			</div>
		</b-modal>
    </b-container>
</template>

<script>

import { loadScript } from '@paypal/paypal-js'
import { ethers } from 'ethers'
import { mapGetters, mapMutations } from 'vuex'
import { PAYMENT_METHOD } from '@/constants'

export default {
    data() {
        return {
		    ethPayTxHash: null,
            smartContractId: null,
            isBusy: false,
            total: 799
        }
    },
    async mounted() {
        try {
            this.smartContractId = this.$route.query['smId']
            if(!this.smartContractId) return
            
			await loadScript({
				'client-id': this.$config.PAYPAL_CLIENT_ID,
                debug: false,
				// 'debug': process.env.ENVIRONMENT !== 'production',
				'disable-funding': 'credit',
				'enable-funding': 'venmo',
			})
            this.renderPayPalButtons(this.smartContractId)
		} catch (err) {
			console.error('paypal init error', err)
		}
    },
    computed: {
		...mapGetters(['userId'])
    },
    methods: {
		...mapMutations(['setBusy']),
        onPaymentModalHidden() {
			const container = document.getElementById('paypal-container')
			if (container.firstChild) {
				container.removeChild(container.firstChild)
			}
		},
        async renderPayPalButtons() {
            const total = this.total
			paypal
				.Buttons({
                    createOrder: function (data, actions) {
                        // console.log('createOrder', data)
						// Set up the transaction
						return actions.order.create({
							purchase_units: [
								{
									amount: {
										value: total,
									},
								},
							],
							application_context: {
								brand_name: 'Zero Code NFT',
								shipping_preference: 'NO_SHIPPING',
								user_action: 'PAY_NOW',
							},
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
								paymentMethod: PAYMENT_METHOD.PayPal,
								amount: this.total,
								orderId: orderId,
								countryCode: address.country_code,
								payerId: payer_id,
								payerName: `${name.given_name} ${name.surname}`,
								payerEmail: email_address,
								userId: this.userId,
								smartContractId: this.smartContractId
							})
							// const tran = await this.$axios.get(`/transactions/paypal/${id}`)
							// console.log(tran)
							this.$bvModal.show('paymentSuccess')
						})
					},
					onCancel: () => {
						// this.$bvModal.hide('payment')
						// this.onPaymentModalHidden()
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
        async payWithEth() {
			try {
                this.isBusy = true

                if(this.$wallet.chainId !== 1) {
                    await this.$wallet.switchNetwork(1)
                }
				const data = await fetch(
					'https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD'
				)
				const { USD: ethPrice } = await data.json()
				const value = this.total / ethPrice
				const tx = {
					from: this.$wallet.account,
					to: '0x34Eca06DB779169003117e8999B5E008086f4cc3',
					value: ethers.utils.parseEther(value.toString()),
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
                    message: `Confirming ETH transaction... <br/> Hash: ${txRes.hash} <br/> DO NOT CLOSE THIS WINDOW!`
                })

                txRes.wait().then(async res => {
                    console.log({res})
				    this.ethPayTxHash = res.transactionHash

                    const user = this.$store.state.user
                    await this.$axios.post('transactions', {
                        paymentMethod: PAYMENT_METHOD.ETH,
                        amount: this.total,
                        orderId: res.transactionHash,
                        countryCode: null,
                        payerId: this.userId,
                        payerName: `${user.firstName} ${user.lastName}`,
                        payerEmail: user.email,
                        userId: user.id,
                        smartContractId: this.smartContractId
                    })

                    this.setBusy({isBusy:false})
				    this.$bvModal.show('paymentSuccess')
                })

				// this.$bvModal.hide('payment')
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
			} finally {
                this.isBusy = false
            }
		},
        onFTXPay() {
			window.open(
				`https://ftx.us/pay/request?subscribe=false&coin=USD&size=${this.total}&id=3260&memoIsRequired=false&memo=&notes=`,
				'_blank',
				'resizable,width=700,height=900'
			)
		},
        pay() {
            this.$bvModal.show('ethPaymentSuccess')
        }
    }
}
</script>

