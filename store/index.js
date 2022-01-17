export const state = () => ({
	user: JSON.parse(localStorage.getItem('user') || '{}'),
	accessToken: localStorage.getItem('accessToken'),
    smartContractList: [],
    network: null,
    txInProgress: null,
    txInProgressHash: null,
    txResult: null,
    isBusy: false,
    smartContractBuilder: {
        blockchain: null,
        chainId: null,
        hasWhitelist: false,
        hasDelayedReveal: false,
        hasOpenSeaRoyalties: true,
        hasRaribleRoylties: false,
        hasMintableRoylaties: false
    }
  })

export const getters = {
	isLoggedIn: (state) => !!state.accessToken,
	userId: (state) => state.user?.id,
}
  
export const mutations = {
    setBusy(state, isBusy) {
        state.isBusy = isBusy
    },
    setNetwork(state, network) {
        state.network = network
    },
    setTx(state, tx) {
        state.txInProgress = tx
        state.txInProgressHash = tx?.hash
    },
    setTxResult(state, txResult) {
        state.txResult = txResult
    },
    updateUserCredits(state, count) {
        state.user.credits = count
        localStorage.setItem('user', JSON.stringify(state.user))
    },
    setUser(state, user) {
        state.user = user
    },
    setAccessToken(state, accessToken) {
		state.accessToken = accessToken
	},
    updateSmartContractBuilder(state, payload) {
        state.smartContractBuilder = { ...state.smartContractBuilder, ...payload}
    },
    setSmartContractList(state, payload) {
        state.smartContractList = payload
    }
}

export const actions = {
    async getCreditsCount({commit, state}) {
        const { data: userCredits } = await this.$axios.get(`/users/${state.user.id}/credits`)
        commit('updateUserCredits', userCredits)
        return userCredits
    },
    async login({commit, state}, payload) {
		try {
			
			if(!this.$wallet.account) {
				await this.$wallet.connect()
			}
			
			const { account: publicKey } = this.$wallet
			
			let { data: nonce } = await this.$axios.get("/users/nonce", { params: { publicKey }})
			console.log({nonce})
		
			if(!nonce) {
				const { data: createdUser } = await this.$axios.post("/users", { publicKey, ...payload })
				console.log({createdUser})
				nonce = createdUser.nonce
			}
			
			const signature = await this.$wallet.requestSignature(nonce)
			const { data: authData } = await this.$axios.post("auth", {
				publicKey,
				signature,
			})
			console.log( {authData} )
		
			const { accessToken, user: authUser } = authData

			localStorage.setItem('accessToken', accessToken)
			localStorage.setItem('user', JSON.stringify(authUser))
			commit('setUser', authUser)
			commit('setAccessToken', accessToken)

            return authUser
		} catch (err) {
			console.log({err})
			alert(err.message || "Login Error")

            return null
		}
    },

    logout({commit, state}) {
        this.$wallet.disconnect()
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')
        commit('setUser', null)
        commit('setAccessToken', null)
    }
}