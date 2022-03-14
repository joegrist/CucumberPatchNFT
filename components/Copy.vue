<template>
    <b-icon icon="files" class="pointer" @click="copyToClipboard(value)"></b-icon>   
</template>

<script>
import { copyToClipboard } from '@/utils'

export default {
    props: ['value'],
    methods: {
        copyToClipboard
    }
}
</script>