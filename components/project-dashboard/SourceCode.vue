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
import { ref } from 'vue'
import { downloadTextFile } from '@/utils'

export default {
    props: {
		smartContract: Object,
	},
    setup(props) {
        const canDownload = ref(props.smartContract.isClearedForMainnet)
        const code = ref(props.smartContract.rawCode)

        function onDownload() {
            const filename = `${this.smartContract.name}.sol`
            downloadTextFile(filename, this.smartContract.rawCode)
        }

        return { canDownload, code, onDownload }
    }
}
</script>