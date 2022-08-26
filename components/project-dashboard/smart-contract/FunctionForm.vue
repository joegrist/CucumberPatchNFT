<template>
	<div role="tab" class="border rounded">
		<div class="d-flex justify-content-between p-2" v-b-toggle="uniqueId">
			<b-badge
				v-if="func.constant"
				pill
				size="sm"
				variant="success"
				class="my-auto eco-badge"
				>Eco</b-badge
			>
			<b-badge v-else pill size="sm" variant="warning" class="my-auto gas-badge"
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
			role="tabpanel"
		>
			<b-form @submit.prevent="onSubmit">
				<ul
					v-if="func.inputs.length > 0 && func.name !== 'setSaleStatus'"
					class="mb-2 list-unstyled"
				>
					<li v-for="(funcParam, idx) in funcParams" :key="idx">
						<b-form-group :label="funcParam.name">
							<b-form-input
								v-if="funcParam.name"
								required
								min="0"
								step="any"
								ref="paramInput"
								:type="funcParam.type.includes('uint') ? 'number' : 'text'"
								v-model="funcArgs[funcParam.name]"
							/>
						</b-form-group>
					</li>
				</ul>
				<div>
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
				</div>
				<div v-show="response" class="font-weight-bold mt-2 text-center break-word">
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
			funcArgs: {}
		}
	},
	computed: {
		funcParams() {
			return this.func.inputs.filter((x) => !x.name?.startsWith('_'))
		},
		formattedResponse() {
			if (!this.response) return null

			const { inputs, name } = this.func

			const prefix = inputs.length > 0 ? 'Response' : startCase(name)

			if (this.response === 'true' || this.response === 'false') {
				this.response = this.response === 'true' ? 'Yes' : 'No'
			}

			return `${prefix}: ${this.response}`
		},
	},
	methods: {
		getArgValues() {
			// to preserve correct argument order we run mapping based on original function inputs order
			// since we can't guarantee the correct order in funcArgs Map
			return this.func.inputs.map((x) => {
				const value = this.funcArgs[x.name]
				return isNumber(value) ? ethers.BigNumber.from(value) : value
			})
		},
		onUpdateSaleStatus(value) {
			this.funcArgs['status'] = value
			this.onSubmit()
		},
		async executeConstant() {
			const { name: functionName } = this.func

			const txResponse = await this.contract[functionName].call(
				null,
				...this.getArgValues(),
			)
			let value = txResponse.toString()

			if (functionName.includes('PRICE')) {
				const ethValue = ethers.utils.formatEther(txResponse)
				const currency = getCurrency(this.smartContract.chainId)
				value = `${ethValue} ${currency}`
			}
			if (functionName === 'saleStatus') {
				value = SALE_STATUS[txResponse]
				this.$emit('valueUpdated', value)
			}

			this.$bvToast.toast(`Returned value: ${value}`, {
				title: startCase(functionName),
				variant: 'success',
			})

			this.response = value
		},
		async executeGas() {

			const { name: functionName, payable } = this.func
			
			if (functionName === 'redeem') {
				throw new Error("This function is not supported")
			}
			if (!this.$wallet.isConnected) {
				await this.$wallet.connect()
			}
			if (this.$wallet.chainId !== +this.smartContract.chainId) {
				await this.$wallet.switchNetwork(this.smartContract.chainId)
			}

			const signedContract = this.contract.connect(
				this.$wallet.provider.getSigner()
			)

			let args = this.getArgValues()

			const txOverrides = {
				gasPrice: await this.$wallet.provider.getGasPrice(),
			}

			if (payable) {
				if (functionName === 'mint') {
					txOverrides.value = await signedContract.calcTotal(Number(args[0]))
				}
			}

			if (functionName === 'setPublicMintPrice') {
				args = [ethers.utils.parseUnits(args[0])]
			}

			const txResponse = await signedContract[functionName].call(
				null,
				...args,
				txOverrides
			)

			const msg = this.createToastMessage(
				txResponse.hash,
				this.smartContract.chainId
			)

			this.$bvToast.toast(msg, {
				title: `${startCase(functionName)} - processing, please wait.`,
				variant: 'success',
			})

			await txResponse.wait()

			this.$bvToast.toast(msg, {
				title: `${startCase(functionName)} - completed`,
				variant: 'success',
			})
		},
		async onSubmit() {
			try {
				console.log(`Calling ${this.func.name}`, this.func)

				this.isBusy = true

				const { name: functionName, constant: isFuncConstant } = this.func
				const [firstArgument] = this.getArgValues()

				isFuncConstant
					? await this.executeConstant()
					: await this.executeGas()

				if (functionName === 'setBaseURL') {
					await this.$axios.patch(`/smartcontracts/${this.smartContract.id}`, {
						baseURL: firstArgument
					})
				}

				if (functionName === 'setPreRevealUrl') {
					await this.$axios.patch(`/smartcontracts/${this.smartContract.id}`, {
						delayedRevealURL: firstArgument
					})
				}

				if (functionName === 'transferOwnership') {
					await this.$axios.patch(`/smartcontracts/${this.smartContract.id}`, {
						ownerAddress: firstArgument
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
