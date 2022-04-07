export default function ({ store, redirect, route }) {
    // If the user is not authenticated
    if (!store.getters.isLoggedIn) {
        const refCode = route.query['ref']
		if(refCode) {
			sessionStorage.setItem('ref', refCode)
		}
        
        return redirect('/login')
    }
  }