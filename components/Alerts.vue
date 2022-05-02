<template>
	<b-container :class="{'mt-2': alerts.length > 0 }">
		<b-row v-for="alert in alerts" :key="alert.id">
			<b-col>
				<b-alert
					:show="alert.show"
					:variant="alert.variant"
					dismissible
					@dismissed="e => $store.commit('removeAlert', alert.id)">
					<span v-html="alert.text"></span>
				</b-alert>
			</b-col>
		</b-row>
	</b-container>
</template>

<script>
export default {
    computed: {
        alerts() {
            return [...this.$store.state.alerts.values()]
        }
    }
}
</script>
