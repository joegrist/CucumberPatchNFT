import { mapState, mapMutations } from 'vuex'

const smartContractWizardMixin = {
	data() {
		return {
			showForm: true,
		}
	},
	props: ['clickedNext', 'currentStep'],
	computed: {
		...mapState(['smartContractBuilder']),
	},
	watch: {
		$v: {
			handler: function (val) {
				this.$emit('can-continue', { value: !val?.$invalid })
			},
			deep: true,
			immediate: true,
		},
		clickedNext(val) {
			if (val) {
				this.$v.smartContractBuilder?.$touch()
			}
		},
	},
	methods: {
		...mapMutations(['updateSmartContractBuilder', 'updateBuilderRevenueSplits']),
		onFormReset(value) {
			this.updateSmartContractBuilder(value)
			// Trick to reset/clear native browser form validation state
			this.showForm = false
			this.$nextTick(() => {
				this.showForm = true
			})
		},
		goNext() {
			setTimeout(() => document.getElementsByClassName('stepper-button next')[0]?.click(), 250)
		}
	},
}

export default smartContractWizardMixin
