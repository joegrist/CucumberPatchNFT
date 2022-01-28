<template>
    <b-container class="pt-3">
        <h1 class="text-center">{{ site.title }} dApp</h1>
        <ul>
            <li v-if="site.status === WEBSITE_STATUS.Ready">
					Current URL:
					<b-link :href="site.url" target="_blank"
						>{{ site.url }} <b-icon icon="box-arrow-up-right"
					/></b-link>
            </li>
            <li v-else class="text-warning">
                Current URL: building <b-spinner small></b-spinner>
            </li>
            <li>Desired Domain: {{ site.desiredDomain }}</li>
            <li class="text-info">
                Status: {{ WEBSITE_STATUS[site.status] }}
                <b-button
                    v-if="
                        site.status !== WEBSITE_STATUS.Ready
                    "
                    variant="success"
                    size="sm"
                    :disabled="isBusy"
                    @click="refreshStatus"
                    >{{ isBusy ? 'Refreshing...' : 'Refresh' }}
                </b-button>
            </li>
            <li>Drop Date: {{ site.dropDate | toDate }}</li>
            <li v-if="site.discordURL">Discord: {{ site.discordURL }}</li>
            <li v-if="site.twitterURL">Twitter: {{ site.twitterURL }}</li>
            <li v-if="site.instagramURL">Instagram: {{ site.instagramURL }}</li>
            <li v-if="site.marketplaceURL">Marketplace URL: {{ site.marketplaceURL }}</li>
            <li>Created: {{ site.createdOn | toDate }}</li>
        </ul>
    </b-container>
</template>

<script>

import { WEBSITE_STATUS } from '@/constants'
import { mapGetters } from 'vuex'

export default {
    data() {
        return { 
            WEBSITE_STATUS,
            isBusy:false,
            site: {}
        }
    },
    fetchOnServer: false,
	fetchKey: 'website-id',
	async fetch() {
		const { data } = await this.$axios.get(`/websites/${this.$route.params.id}`)
		this.site = data

		console.log('loaded website', this.site)
	},
	computed: {
		...mapGetters(['userId']),
    },
    methods: {
        async refreshStatus() {
            try { 
                this.isBusy = true
    
                const { data } = await this.$axios.get(`/users/${this.userId}/websites/${this.site.id}/status`)
                console.log(data)
    
                this.site.status = data

                setTimeout(() => {
                    this.$bvToast.toast('Status refreshed!', {
                        title: 'Website',
                        variant: 'success',
                    })
                    this.isBusy = false
                }, 3000)

            } catch (err) {
                this.isBusy = false
                console.error(err)
            }
        },
    }
}
</script>