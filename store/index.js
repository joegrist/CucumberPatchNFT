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
    async login({commit, state}, payload) {
		try {
			
			if(!this.$wallet.account) {
				await this.$wallet.connect()
			}
			
			const { account: publicKey } = this.$wallet
			
			const { data: users } = await this.$axios.get("/users", { params: { publicKey }})
			let user = users.length ? users[0] : null
			console.log({user})
		
			if(user === null) {
				const { data: createdUser } = await this.$axios.post("/users", { publicKey, ...payload })
				console.log({createdUser})
				user = createdUser
			}
			
			const { nonce } = user;
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
			alert(err.message || "Login error")

            return null
		}
    },

    logout({commit, state}) {
        this.$wallet.disconnect()
        localStorage.setItem('accessToken', null)
        localStorage.setItem('user', null)
        commit('setUser', null)
        commit('setAccessToken', null)
    }
}