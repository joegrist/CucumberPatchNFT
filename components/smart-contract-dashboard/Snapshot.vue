<template>
	<b-container fluid>
        <b-row class="mb-2">
            <b-col sm="12" md="8" class="my-auto">
                <h4>{{ smartContract.name }} Snapshot</h4>
            </b-col>
            <b-col sm="12" md="4" class="text-right">
                <b-overlay :show="isRunning">
                    <b-button variant="primary" @click="runSnapshot">Run Snapshot</b-button>
                    <b-dropdown split variant="success" text="Export As" class="m-2">
                        <b-dropdown-item-button @click="onExport('asIs')">All</b-dropdown-item-button>
                        <b-dropdown-item-button @click="onExport('wl')">Whitelist</b-dropdown-item-button>
                    </b-dropdown>
                </b-overlay>
            </b-col>
        </b-row>
		<b-row>
			<b-col>
                <b-progress v-show="showProgress" :value="progress" :max="supply" show-progress animated></b-progress>
				<b-table striped hover :items="snapshotData"></b-table>
			</b-col>
		</b-row>
	</b-container>
</template>

<script>
import { ethers } from 'ethers'
import Vue from 'vue'
// import { mapMutations, mapState } from 'vuex'
import { downloadTextFile } from '@/utils'
import { CHAINID_CONFIG_MAP } from '@/constants/metamask'

export default {
	props: {
		smartContract: Object,
	},
    data() {
        return {
            contract: null,
            isRunning: false,
            showProgress: false,
            ownerMap: {},
            progress: 0,
            supply: this.smartContract.collectionSize
        }
    },
    created() {
        const { abi, address, chainId } = this.smartContract
        const providerUrl = CHAINID_CONFIG_MAP[chainId.toString()].rpcUrls[0]
        const jsonRpcProvider = new ethers.providers.JsonRpcProvider(providerUrl)
        this.contract = new ethers.Contract(address, abi, jsonRpcProvider)
    },
    computed: {
        snapshotData() {
            return Object.values(this.ownerMap)
                .sort((a,b) => a.count - b.count)
                .map((item, idx) => {
                    return { rank: idx+1, ...item }
                })
        }
    },
    methods: {
        async runSnapshot() {
            this.ownerMap = {}
            try {
                this.supply = await this.contract.totalSupply()
            } catch {}
            try {
                this.isRunning = true
                this.showProgress = true
                for(let i = 1; i <= this.supply; i++) {
                    const address = await this.contract.ownerOf(i)
                    this.progress = i
                    if(!this.ownerMap[address]) {
                        const balance = await this.contract.balanceOf(address)
                        const newEntry = {
                            address: address,
                            count: balance
                        }
                        Vue.set(this.ownerMap, address, newEntry)
                    }
                }
            } catch (err) {
                console.log(err)
            } finally {
                this.isRunning = false
            }
        },
        onExport(type) {
            const data = this.snapshotData
                .map(row => {
                    if(type === 'wl') {
                        // remove other cols an only leave address
                        row = {
                            address: row.address
                        }
                    }
                    const cols = Object.values(row)
                    return cols.join(",")
                })
                .join("\n")

            const filename = `${this.smartContract.name}_snapshot_${Date.now()}.csv`
            downloadTextFile(filename, data, 'data:text/csv')
        }
    },
}
</script>
