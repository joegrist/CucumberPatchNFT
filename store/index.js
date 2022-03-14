export const state = () => ({
	user: JSON.parse(localStorage.getItem('user') || '{}'),
	accessToken: localStorage.getItem('accessToken'),
    network: null,
    txInProgress: null,
    txInProgressHash: null,
    txResult: null,
    isBusy: false,
    isSidebarOpen: false,
    dashboardItems: [],
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
    }
  })

export const getters = {
	isLoggedIn: (state) => !!state.accessToken,
	userId: (state) => state.user?.id,
    userCredits: (state) => state.user?.credits,
    referral: (state) => state.user?.referral,
}
  
export const mutations = {
    showSidebar(state, value) {
        state.isSidebarOpen = value
    },
    setBusy(state, isBusy) {
        state.isBusy = isBusy
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
    }
}

export const actions = {
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
            commit('setBusy', true)
	
			const { data: contracts } = await this.$axios.get(
				`/users/${state.user.id}/smartcontracts`
			)
			const { data: websites } = await this.$axios.get(
				`/users/${state.user.id}/websites`
			)
	
			contracts.forEach((sc) => {
				sc.website = websites.find((x) => sc.id === x.smartContractId)
			})
	
			commit('setDashboardItems', contracts)
        } catch(err) {
			console.error(err)
		} finally {
			commit('setBusy', false)
        }
    },
    async cloneDashboardCard(actionObj, id) {
        await this.$axios.post(`/smartcontracts/${id}/clone`)
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
    async getCreditsCount({commit, state, getters }) {
        const { data: userCredits } = await this.$axios.get(`/users/${state.user.id}/credits`)
        if(getters.isLoggedIn) { // user might have logged out between the time request was send and response received
            commit('updateUserCredits', userCredits)
        }
        return userCredits
    },
    async login({commit}, payload) {
		try {
			
			if(!this.$wallet.account) {
				await this.$wallet.connect()
			}
			
			const { account: publicKey } = this.$wallet
			
			let { data: nonce } = await this.$axios.get("/users/nonce", { params: { publicKey }})
		
			if(!nonce) {
				const { data: createdUser } = await this.$axios.post("/users", { publicKey, ...payload })
				// console.log({createdUser})
				nonce = createdUser.nonce
			}
			
			const signature = await this.$wallet.requestSignature(nonce)
			const { data: authData } = await this.$axios.post("auth", {
				publicKey,
				signature,
			})
			// console.log( {authData} )
		
			const { accessToken, user: authUser } = authData

			localStorage.setItem('accessToken', accessToken)
			localStorage.setItem('user', JSON.stringify(authUser))
			commit('setUser', authUser)
			commit('setAccessToken', accessToken)

            return authUser
		} catch (err) {
			this._vm.$bvToast.toast(err.message || 'Login failed', {
                title: 'Login',
                variant: 'danger',
            })

            return null
		}
    },

    logout({commit}) {
        this.$wallet.disconnect()
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')
        commit('setUser', null)
        commit('setAccessToken', null)
    }
}