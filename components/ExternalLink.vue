<template>
    <b-link :href="href" target="_blank">
        {{ text }} <b-icon icon="box-arrow-up-right" />
    </b-link>
</template>

<script>
export default {
    props: {
        href: String,
        text: String
    }
}
</script>