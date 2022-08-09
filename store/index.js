import { nanoid } from 'nanoid'
import Vue from 'vue'

const tourPromptsKey = 'zerocode_tour_prompts'

export const state = () => ({
	user: JSON.parse(localStorage.getItem('user') || '{}'),
	accessToken: localStorage.getItem('accessToken'),
    network: null,
    txInProgress: null,
    txInProgressHash: null,
    txResult: null,
    isBusy: false,
    isBusyMessage: null,
    isSidebarOpen: false,
    dashboardItems: [],
    alerts: [],
    smartContractBuilder: {
        baseURL: null,
        blockchain: null,
        chainId: null,
        collectionSize: null,
        email: null,
        hasWhitelist: false,
        hasDelayedReveal: false,
        hasOpenSeaRoyalties: true,
        name: null,
        symbol: null,
        marketplace: null,
        marketplaceCollection: {},
        revenueSplits: []
    },
    tourPrompts: JSON.parse(localStorage.getItem(tourPromptsKey)) || {
        dashboard: true,
        project: true
    }
  })

export const getters = {
	isLoggedIn: (state) => !!state.accessToken,
	userId: (state) => state.user?.id,
    userCredits: (state) => state.user?.credits,
    referral: (state) => state.user?.referral
}
  
export const mutations = {
    addAlert(state, payload) {
        const defaults = {
            id: nanoid(),
            variant: "warning",
            show: true,
        }
        const alert = {
            ...defaults,
            ...payload
        }
        let existingIdx = state.alerts.findIndex(a => a.id === payload.id)
        if(existingIdx === -1) {
            state.alerts.push(alert)
            existingIdx = state.alerts.length - 1
        }
        Vue.set(state.alerts, existingIdx, alert)
    },
    removeAlert(state, id) {
        const alerts = state.alerts.filter(a => a.id !== id)
        Vue.set(state, 'alerts', alerts)
    },
    clearAlerts(state) {
        state.alerts = []
    },
    showSidebar(state, value) {
        state.isSidebarOpen = value
    },
    setBusy(state, {isBusy, message}) {
        state.isBusy = isBusy
        state.isBusyMessage = message
    },
    updateUserCredits(state, count) {
        state.user.credits = count
    },
    setUser(state, user) {
        state.user = user
    },
    setAccessToken(state, accessToken) {
		state.accessToken = accessToken
	},
    updateSmartContractBuilder(state, payload) {
        if(payload.marketplaceCollection === null) {
            state.smartContractBuilder.marketplaceCollection = null
        } else {
            state.smartContractBuilder.marketplaceCollection = {
                ...state.smartContractBuilder.marketplaceCollection,
                ...payload.marketplaceCollection,
            }
        }

        delete payload.marketplaceCollection

        state.smartContractBuilder = { 
            ...state.smartContractBuilder,
            ...payload,
        }
    },
    updateBuilderRevenueSplits(state, payload) {
        state.smartContractBuilder.revenueSplits = payload
    },
    setDashboardItems(state, payload) {
        state.dashboardItems = payload
    },
    resetSmartContractBuilder(state) {
        state.smartContractBuilder = { 
            marketplaceCollection: {}
        }
    },
    linkOpenSea(state, payload) {
        const item = state.dashboardItems.find(x => x.id === payload.smartContractId)
        item.marketplaceCollection = payload
    },
    setAmbassador(state, payload) {
        state.user.referral = payload
    },
    updateTourPrompts(state, payload) {
        state.tourPrompts = {
            ...state.tourPrompts,
            ...payload
        }
        localStorage.setItem(tourPromptsKey, JSON.stringify(state.tourPrompts))
    }
}

export const actions = {
    async becomeAmbassador({commit, getters}, payload) {
        const { data } = await this.$axios.post(`/users/${getters.userId}/referral`, payload)
        commit('setAmbassador', data)
    },
    async loadUser({commit}, id) {
        try {
            const { data } = await this.$axios.get(`/users/${id}`)
            localStorage.setItem('user', JSON.stringify(data))
			commit('setUser', data)
        } catch (err) {
            this._vm.$bvToast.toast(err.message || 'Refresh failed', {
                title: 'Refresh',
                variant: 'danger',
            })
        }
    },
    async loadDashboardCards({commit, state}) {
        try {
            commit('setBusy', {
                isBusy: true,
                message: 'Loading Dashboard...'
            })
	
			const { data: contracts } = await this.$axios.get(
				`/users/${state.user.id}/smartcontracts`
			)
	
			commit('setDashboardItems', contracts)
        } catch(err) {
			console.error(err)
		} finally {
			commit('setBusy', {isBusy: false})
        }
    },
    async cloneDashboardCard(actionObj, { id, name }) {
        await this.$axios.post(`/smartcontracts/${id}/clone`, { name })
        await actionObj.dispatch('loadDashboardCards')
    },
    async removeDashboardCard({commit, state}, id) {
        await this.$axios.delete(`/smartcontracts/${id}`)
        commit('setDashboardItems', state.dashboardItems.filter(x => x.id !== id))
    },
    async linkOpenSea({commit}, payload) {
        const { data } = await this.$axios.post('/marketplaceCollections/link', payload)
        commit('linkOpenSea', data)
    },

    async getCreditsCount({commit, getters}) {
        const { data: userCredits } = await this.$axios.get(`/users/${getters.userId}/credits`)
        if(getters.isLoggedIn) { // user might have logged out between the time request was send and response received
            commit('updateUserCredits', userCredits)
        }
        return userCredits
    },

    async signUp({dispatch}, payload) {
        let success = false
        try {
            await this.$axios.post("/users", payload)
            await dispatch('login')
            success = true
        } catch (err) {
            this._vm.$bvToast.toast(err.message || 'Registration failed', {
                title: 'Registration',
                variant: 'danger',
            })
        }
        return success
    },

    async login({commit, dispatch}) {
		try {
			if(!this.$wallet.isConnected) {
                await this.$wallet.connect()
            }
            
            const { account: publicKey } = this.$wallet
            
            const { data: nonce } = await this.$axios.get("/users/nonce", { params: { publicKey }})
    
			if(!nonce) {
				throw new Error('User doesnt exist!')
			}

            const signature = await this.$wallet.requestSignature(nonce)
            const { data: authData } = await this.$axios.post("auth", {
                publicKey: this.$wallet.account,
                signature,
            })
            // console.log( {authData} )
        
            const { accessToken, user: authUser } = authData
    
            localStorage.setItem('accessToken', accessToken)
            localStorage.setItem('user', JSON.stringify(authUser))
            commit('setUser', authUser)
            commit('setAccessToken', accessToken)
		} catch (err) {
			this._vm.$bvToast.toast(err.message || 'Login failed', {
                title: 'Login',
                variant: 'danger',
            })
		}
    },

    logout({commit}) {
        this.$wallet.disconnect()
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')
        localStorage.removeItem(tourPromptsKey);
        commit('setUser', null)
        commit('setAccessToken', null)
    }
}