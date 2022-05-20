<template>
	<div>
		<MintPage :smartContractId="$route.query['scId']" />
	</div>
</template>

<script>
import MintPage from '@/components/smart-contract-dashboard/MintPage.vue'
export default {
	components: {
		MintPage
	}
}
</script>

