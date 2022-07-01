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
import HeadTagMixin from '@/mixins/headTag'

export default {
	mixins: [HeadTagMixin],
	components: {
		LoginHeader,
		LoginFooter,
	},
}
</script>
