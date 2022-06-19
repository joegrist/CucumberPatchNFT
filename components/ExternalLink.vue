<template>
    <b-link v-if="href" :href="formatUrl(href)" target="_blank">
        <span v-if="!iconOnly">{{ text || href }}</span>
        <b-icon :icon="icon" />
    </b-link>
    <div v-else>
        <span>{{ text || href }}</span>
    </div>
</template>

<script>
export default {
    props: {
        href: String,
        text: String,
        iconOnly: Boolean,
        icon: {
            type: String,
            default: "box-arrow-up-right"
        }
    },
    methods: {
        formatUrl(url) {
            return url.startsWith('http') ? url : `https://${url}`
		},
    }
}
</script>