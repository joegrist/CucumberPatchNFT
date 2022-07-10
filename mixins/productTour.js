import Driver from 'driver.js'
import 'driver.js/dist/driver.min.css'
import { mapGetters } from 'vuex'
export default {
	computed: {
		...mapGetters(['startProductTour']),
	},
	watch: {
		startProductTour(nv) {
			if (nv) {
				this.initTour()
			}
		},
	},
	methods: {
		async initTour() {
			if (this.isTourCard) {
				this.$bvToast.toast('Initiating the product tour.', {
					title: 'Product Tour',
					variant: 'success',
				})
				const driver = new Driver()
				driver.defineSteps([
					{
						element: '#tour-card',
						popover: {
							title: 'Project Card',
							description: 'A quick insight of the project.',
							position: 'right',
						},
					},
					{
						element: '#project-name',
						popover: {
							title: 'Project Name',
							description:
								"Name of the project that's associated with zerocodenft.",
							position: 'right',
						},
					},
					{
						element: '#project-type-network',
						popover: {
							title: 'Contract Type and Network',
							description:
								"The network of contract that's deployed on and the contract's type (ERC721,ERC721A)",
							position: 'right',
						},
						/* 	onNext: () => {
							// driver.preventMove();
							// document.querySelector('.card-menu').click();
							this.$refs.cardMenu.show();
							this.$nextTick(() => {
								driver.moveNext();
							})
						} */
					},
					{
						element: '#contract-actions',
						popover: {
							title: 'Contract Actions',
							description:
								'Link to the block explorer of the contract, cloning the contract to new one, linking the opensea page and option to remove the project from zerocodenft.',
							position: 'right',
						},
					},
					{
						element: '#project-status',
						popover: {
							title: 'Project Status',
							description:
								"Status of the project. It can be 'Draft' or 'Live'.",
							position: 'right',
						},
					},
					{
						element: '#feature-preview',
						popover: {
							title: "Contract's feature",
							description:
								'Information about the selected feature for the contract. Whitelist(WL) / Delayed Reveal(DR).',
							position: 'right',
						},
					},
					{
						element: '#mint-count',
						popover: {
							title: 'Mint Count',
							description: 'Mint count of the tokens from the contract.',
							position: 'right',
						},
					},
					{
						element: '#withdraw-balance',
						popover: {
							title: 'Withdraw Balance',
							description: 'Available Balance for the withdrawl.',
							position: 'right',
						},
					},
					{
						element: '#blockchain-logo',
						popover: {
							title: 'Blockchain Logo',
							description:
								'Blockchain logo of network the contract is deployed on.',
							position: 'right',
						},
					},
					{
						element: '#owners-count',
						popover: {
							title: 'Owners Count',
							description: 'Total number of owners for the token.',
							position: 'right',
						},
					},
					{
						element: '#total-volume',
						popover: {
							title: 'Total Volume',
							description: 'Total volume of transactions till now.',
							position: 'right',
						},
					},
					{
						element: '#marketplace',
						popover: {
							title: 'Marketplace',
							description: 'Marketplace for the token.',
							position: 'right',
						},
					},
					{
						element: '#floor-price',
						popover: {
							title: 'Floor Price',
							description: 'Floor Price of the token.',
							position: 'right',
						},
					},
					{
						element: '#total-sales',
						popover: {
							title: 'Total Sales',
							description: 'Total Sales count of the token.',
							position: 'right',
						},
					},
					{
						element: '#manage-project',
						popover: {
							title: 'Manage Project',
							description: 'Manage your project with different functions available to interact with the contract.',
							position: 'right',
						},
					},
				])
				driver.start()
			} 
		},
	},
}
