<template>
	<div role="tab" class="border rounded">
		<div
			class="d-flex justify-content-between p-2"
			v-b-toggle="uniqueId">
			<b-badge
				v-if="func.constant"
				pill
				size="sm"
				variant="success"
				class="my-auto"
				>Eco</b-badge
			>
			<b-badge v-else pill size="sm" variant="warning" class="my-auto"
				>Gas</b-badge
			>
			<span variant="link">
				{{ func.name | startCase }}
			</span>
			<b-icon icon="chevron-down" class="my-auto" />
		</div>
		<b-collapse
			:id="uniqueId"
			class="px-3 py-1"
			accordion="eco-accordion"
			role="tabpanel">
			<b-form @submit.prevent="onSubmit">
				<ul
					v-if="func.inputs.length > 0 && func.name !== 'setSaleStatus'"
					class="mb-2 list-unstyled">
					<li
						v-for="(funcParam, idx) in funcParams" :key="idx">
						<b-form-group :label="funcParam.name">
							<b-form-input
								required
								:type="funcParam.type.includes('uint') ? 'number' : 'text'"
								@change="(val) => onParamChange(funcParam.name, val)" />
						</b-form-group>
					</li>
				</ul>
				<div>
					<b-overlay
						:show="isBusy"
						rounded
						class="w-100"
						opacity="0.5"
						spinner-small>
						<b-button-group v-if="func.name === 'setSaleStatus'" class="w-100">
							<b-button
								variant="warning"
								@click="onUpdateSaleStatus(SALE_STATUS.Paused)"
								>Pause Sales</b-button
							>
							<b-button
								v-if="smartContract.hasWhitelist"
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
						<b-button v-else class="w-100" type="submit" variant="success">{{
							func.constant ? 'View' : 'Submit'
						}}</b-button>
					</b-overlay>
				</div>
				<div v-show="response" class="font-weight-bold mt-2 text-center">
					{{ formattedResponse }}
				</div>
			</b-form>
		</b-collapse>
	</div>
</template>

<script>
import { SALE_STATUS } from '@/constants'
import { getCurrency, getExplorerUrl } from '@/constants/metamask'
import { isNumber, startCase } from 'lodash-es'
import { ethers } from 'ethers'
import { getMetamaskError } from '@/utils'
import useSmartContract from '@/hooks/useSmartContract'
import { nanoid } from 'nanoid'

export default {
	setup(props) {
		const contract = useSmartContract(props.smartContract)
        const uniqueId = nanoid()
		return { uniqueId, contract }
	},
	props: {
		func: Object,
		smartContract: Object,
	},
	data() {
		return {
			SALE_STATUS,
			isBusy: false,
			response: null,
			funcArgs: null,
		}
	},
	computed: {
		funcParams() {
			return this.func.inputs.filter((x) => !x.name.startsWith('_'))
		},
		formattedResponse() {
			if (!this.response) return null

			const prefix = this.func.inputs.length > 0 
                ? 'Response' 
                : startCase(this.func.name)

			if (this.response === 'true' || this.response === 'false') {
				this.response = this.response === 'true' ? 'Yes' : 'No'
			}

			return `${prefix}: ${this.response}`
		},
	},
	methods: {
        onUpdateSaleStatus(value) {
            this.onParamChange('status', value)
			this.onSubmit()
        },
		onParamChange(name, value) {
			const args = (this.funcArgs ??= new Map())
			args.set(name, value)
		},
		async executeConstant() {
			const txResponse = await this.contract[this.func.name]()
			let value = txResponse.toString()

			if (this.func.name.includes('PRICE')) {
                const ethValue = ethers.utils.formatEther(txResponse)
                const currency = getCurrency(this.smartContract.chainId)
				value = `${ethValue} ${currency}`
			}
			if (this.func.name === 'saleStatus') {
				value = SALE_STATUS[txResponse]
                this.$emit('valueUpdated', value)
			}

			this.$bvToast.toast(`Returned value: ${value}`, {
				title: startCase(this.func.name),
				variant: 'success',
			})

			this.response = value
		},
		async executeGas() {
			if (!this.$wallet.isConnected) {
				await this.$wallet.connect()
			}
			if (this.$wallet.chainId !== +this.smartContract.chainId) {
				await this.$wallet.switchNetwork(this.smartContract.chainId)
			}

			const signedContract = this.contract.connect(
				this.$wallet.provider.getSigner()
			)

			const txOverrides = {
				gasPrice: await this.$wallet.provider.getGasPrice(),
			}

			let txResponse, args

			const { name: functionName, payable, inputs } = this.func

			const hasFuncArgs = this.funcArgs?.size > 0
			if (hasFuncArgs) {
				// to preserve correct argument order we run mapping based on original function inputs order
				// since we can't guarantee the correct order in funcArgs Map
				args = inputs.map((x) => {
					const value = this.funcArgs.get(x.name)
					return isNumber(value) ? ethers.BigNumber.from(value) : value
				})
				console.log({ args })

				if (payable) {
					if (functionName === 'mint') {
						const mintPrice = await scInstance.MINT_PRICE()
                        const ethMintPrice = Number(ethers.utils.formatEther(mintPrice))
                        const howMany = Number(args[0])
						const paymentValue = (ethMintPrice * howMany).toString()
						txOverrides.value = ethers.utils.parseEther(paymentValue)
					}
				}

				if (functionName === 'setPublicMintPrice') {
					const newPrice = this.funcArgs.get(inputs[0].name)
					args = [ethers.utils.parseUnits(newPrice)]
				}

				txResponse = await signedContract[functionName].call(
					null,
					...args,
					txOverrides
				)
			} else {
				txResponse = await signedContract[functionName](txOverrides)
			}

			const msg = this.createToastMessage(txResponse.hash, this.smartContract.chainId)
			this.$bvToast.toast(msg, {
				title: `${startCase(functionName)} - processing, please wait.`,
				variant: 'success',
			})

			await txResponse.wait()

            this.$bvToast.toast(msg, {
                title: `${startCase(functionName)} - completed`,
                variant: 'success',
            })

            this.funcArgs = null
		},
		async onSubmit() {
			try {
				console.log(`Calling ${this.func.name}`, this.func)

				this.isBusy = true

				this.func.constant
					? await this.executeConstant()
					: await this.executeGas()

				if (this.func.name === 'setPreRevealUrl') {
					await this.$axios.patch(`/smartcontracts/${this.smartContract.id}`, {
						delayedRevealURL: this.funcArgs[0],
					})
				}

				if (this.func.name === 'transferOwnership') {
					await this.$axios.patch(`/smartcontracts/${this.smartContract.id}`, {
						ownerAddress: this.funcArgs[0],
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
