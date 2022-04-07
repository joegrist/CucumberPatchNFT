<template>
    <b-card :class="['rounded contract-type-card', { pointer: isAvailable}]" :header="title" header-class="text-center font-weight-bold" header-bg-variant="transparent">
		<b-card-body>
            <p v-html="description"></p>
            <b-link v-if="!isAvailable" href="mailto:drop@zerocodenft.com?subject=ERC20 Inquiry">
                Inquire
            </b-link>
		</b-card-body>
	</b-card>
</template>

<script>
export default {
    props: {
        title: String,
        description: String,
        isAvailable: Boolean
    }
}
</script>

<style lang="scss" scoped>
    .contract-type-card {
        min-height: 250px;
    }
</style>