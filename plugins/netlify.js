export default function ({ $axios }, inject) {
    // Create a custom axios instance
    const netlify = $axios.create({
      headers: {
        common: {
          Authorization: `Bearer ${process.env.NETLIFY_API_TOKEN}`
        }
      }
    })
  
    netlify.setBaseURL('https://api.netlify.com/api/v1')
  
    // Inject to context as $api
    inject('netlify', netlify)
  }