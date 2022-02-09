import https from 'https'

export default ({ $axios, store }) => {
    $axios.defaults.httpsAgent = new https.Agent({ rejectUnauthorized: false });
    // console.log($wallet)
    $axios.onRequest(config => {
      if (store.state.accessToken) {
        $axios.setHeader('Authorization', `Bearer ${ store.state.accessToken }`)
      }
    });
    $axios.onError(async err => {
      // TODO: check for auth failed requests and call login store action
      // if(err.response.status === 401) {
      //   await store.dispatch('login')
        
      // }
    })
  }