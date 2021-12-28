export const state = () => ({
    user: null,
    network: null,
    txInProgress: null,
    txInProgressHash: null,
    txResult: null,
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
  
export const mutations = {
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
    updateSmartContractBuilder(state, payload) {
        state.smartContractBuilder = { ...state.smartContractBuilder, ...payload}
    }
}