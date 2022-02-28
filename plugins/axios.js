import https from 'https'

export default ({ $axios, store }) => {
    $axios.defaults.httpsAgent = new https.Agent({ rejectUnauthorized: false });
    // console.log($wallet)
    $axios.onRequest(config => {
      // store.commit('setBusy', true)
      if (store.state.accessToken) {
        $axios.setHeader('Authorization', `Bearer ${ store.state.accessToken }`)
      }
    });
    $axios.onResponse(() => {
      // store.commit('setBusy', false)
    })
    $axios.onError(async err => {
      // store.commit('setBusy', false)
      console.log(err)
      // TODO: check for auth failed requests and call login store action
      // if(err.response.status === 401) {
      //   await store.dispatch('login')
        
      // }
    })
  }