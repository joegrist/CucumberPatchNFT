export default ({ $axios, store }) => {
    // console.log($wallet)
    $axios.onRequest(config => {
      if (store.state.accessToken) {
        $axios.setHeader('Authorization', `Bearer ${ store.state.accessToken }`)
      }
    });
    $axios.onError(async err => {
      // TODO: check for auth failed requests and call loginUser store action
      // if(err.response.status === 401) {
      //   await store.dispatch('loginUser')
        
      // }
    })
  }