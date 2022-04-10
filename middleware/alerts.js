export default function ({ store }) {
    // remove all alerts before navigation
    store.commit('clearAlerts')
}