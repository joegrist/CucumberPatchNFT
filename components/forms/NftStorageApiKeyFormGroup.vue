<template>
	<b-form-group
		description="The key is only stored locally in your browser and never on our servers"
	>
		<template #label>
			<div class="d-flex">
				<ExternalLink
					text="get nft.storage API key"
					href="https://nft.storage/docs/#get-an-api-token"
				>
				</ExternalLink>
				<b-form-checkbox
					class="ml-auto"
					switch
					v-model="rememberApiKey"
					@change="rememberKey"
					>Remember Key
				</b-form-checkbox>
			</div>
		</template>
		<b-form-input
			autofocus
			v-model="localData"
			:state="validateState('localData')"
			placeholder="Enter nft.storage api key."
		/>
		<b-form-invalid-feedback :state="state.localData">
			Please provide the nft.storage api key.
		</b-form-invalid-feedback>
	</b-form-group>
</template>
<script>
import { required } from 'vuelidate/lib/validators'
import { ZEROCODENFT_STORAGE_API_KEY } from '@/constants/'
import { validateState } from '@/utils'

export default {
	props: {
		value: String,
	},
	data() {
		return {
			rememberApiKey: null,
			localData: this.value,
		}
	},
	validations: {
		localData: { required },
	},
	watch: {
		localData(nv) {
			this.$emit('input', nv)
			this.rememberKey(this.rememberApiKey)
			this.$v.$touch()
		},
	},
	computed: {
		state() {
			return {
				localData: !this.$v.localData.$error,
			}
		},
	},
	created() {
		this.localData = localStorage.getItem(ZEROCODENFT_STORAGE_API_KEY)
		if (this.localData) {
			this.$emit('input', this.localData)
			this.rememberApiKey = true
		}
	},
	methods: {
		validateState,
		rememberKey(remember) {
			if (remember) {
				localStorage.setItem(ZEROCODENFT_STORAGE_API_KEY, this.localData)
			} else {
				localStorage.removeItem(ZEROCODENFT_STORAGE_API_KEY)
			}
		},
	},
}
</script>
