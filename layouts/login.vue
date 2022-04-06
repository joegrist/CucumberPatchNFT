<template>
	<div>
		<LoginHeader />
		<Nuxt />
		<LoginFooter />
	</div>
</template>

<script>
import LoginHeader from '~/components/login/LoginHeader.vue'
import LoginFooter from '~/components/login/LoginFooter.vue'

export default {
	components: {
		LoginHeader,
		LoginFooter,
	},
}
</script>
