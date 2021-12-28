export default ({ $axios, $wallet }) => {
    // console.log($wallet)
    $axios.onRequest(config => {
      // config.headers.common['x-wallet'] = $wallet.account; // TODO doesnt work
    });
  }