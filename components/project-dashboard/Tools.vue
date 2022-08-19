<template>
	<b-container fluid>
		<b-row class="mb-2">
			<b-col sm="12" md="8">
				<h4>Tools</h4>
			</b-col>
		</b-row>
        <b-row>
            <b-col>
                <b-form @submit.prevent="updateJsonFiles">
                    <b-form-group label="Field name" label-class="required">
                        <b-form-input v-model="jsonUpdate.field" required placeholder="e.g. image"></b-form-input>
                    </b-form-group>
                    <b-form-group label="Field value" label-class="required">
                        <b-form-input v-model="jsonUpdate.value" required placeholder="e.g. ipfs://"></b-form-input>
                    </b-form-group>
                    <b-form-group label="Files (.json)" label-class="required">
                        <b-row no-gutters class="w-100">
							<b-col sm="12" md="10">
                                <b-form-file
                                    :value="jsonFiles"
                                    @input="onFilesSelected"
                                    :file-name-formatter="formatterFn"
                                    directory
                                    no-traverse
                                    multiple
                                    placeholder="Choose folder"
                                />
                            </b-col>
							<b-col sm="12" md="2">
                                <b-button block variant="primary" class="ml-2" type="submit">Run</b-button>
                            </b-col>
                        </b-row>
                    </b-form-group>
                </b-form>
            </b-col>
        </b-row>
	</b-container>
</template>

<script>
import JSZip from 'jszip/dist/jszip.min.js'
import { saveAs } from 'file-saver';

export default {
    data() {
        return {
            jsonFiles: [],
            jsonUpdate: {
                field: null,
                value: null
            }
        }
    },
    methods: {
        onFilesSelected(files) {
			this.jsonFiles = files
                .filter(f => !f.name.startsWith('.') && f.name.endsWith('.json'))
		},
        formatterFn(files) {
            return files
                .filter(f => !f.name.startsWith('.') && f.name.endsWith('.json'))
                .map(f => f.name)
                .join(', ')
        },
        async updateJsonFiles() {
            
            const promises = this.jsonFiles.map((f) => f.text())
            const contents = await Promise.all(promises)

            const zip = new JSZip()

            contents.forEach((x, i) => {
                const fileName = this.jsonFiles[i].name
                const json = JSON.parse(x)
                json[this.jsonUpdate.field] = this.jsonUpdate.value
                zip.file(fileName, JSON.stringify(json, null, 2))
            })

            const zipped = await zip.generateAsync(
            {
                type: 'blob',
                comment: 'Generated with Zero Code NFT',
            },
            ({percent, currentFile}) => console.log(percent, currentFile)
            )

            saveAs(zipped, 'metadata')
        }
    }
}
</script>
