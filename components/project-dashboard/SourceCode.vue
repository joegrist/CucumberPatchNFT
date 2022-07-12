<template>
   	<b-container fluid>
        <b-row class="mb-2">
            <b-col sm="12" md="8" class="my-auto">
                <h4>Source Code Preview</h4>
            </b-col>
            <b-col sm="12" md="4" class="text-left text-md-right">
                <b-button v-if="canDownload" variant="primary" @click="onDownload">Download</b-button>
            </b-col>
        </b-row>
		<b-row>
			<b-col>
                <pre class="border rounded no-user-select px-2 language-sol">
                    <code>
                        {{ code }}
                    </code>
                </pre>
			</b-col>
		</b-row>
	</b-container>
</template>

<script>
import { downloadTextFile } from '@/utils'

export default {
    props: {
		smartContract: Object,
	},
    computed: {
        canDownload() {
            return this.smartContract.isClearedForMainnet
        },
        code() {
            return this.smartContract.rawCode.replace(/[\n]+/g, "\n")
        }
    },
    methods: {
        onDownload() {
            const filename = `${this.smartContract.name}.sol`
            downloadTextFile(filename, this.smartContract.rawCode)
        }
    }
}
</script>