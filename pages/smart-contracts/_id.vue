<template>
    <div class="p-5">
        <h2>Smart contract at <br/>{{ contract.address }}</h2>
    </div>
</template>

<script>

export default {
    data: () => ({
		contract: {}
	}),
    fetchOnServer: false,
	fetchKey: 'smart-contracts-id',
	async fetch() {
		if (!this.$wallet.account) return
		const { data } = await this.$axios.get(`/smartcontracts/${this.$route.params.id}`, {
			params: { ownerAddress: this.$wallet.account },
		})
		this.contract = data
		console.log('smart-contract', this.contract)
	},
}
</script>