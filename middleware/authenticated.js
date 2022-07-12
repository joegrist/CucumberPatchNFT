export default function ({ store, redirect, route }) {
    // If the user is not authenticated
    if (!store.getters.isLoggedIn) {
        // forward query params to preserve things like ads_source params on redirect etc.
        const query = new URLSearchParams(route.query).toString()
        const redirectUrl = `$/login?${query}`

        return redirect(redirectUrl)
    }
  }