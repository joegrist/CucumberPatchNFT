import Driver from 'driver.js'
import 'driver.js/dist/driver.min.css'

export default {
  methods: {
    async initTour(tourId) {
      const driver = new Driver({
        allowClose: false,
      })

      const { [tourId]: steps } = await import('@/assets/data/tourSteps')
      driver.defineSteps(steps)
      driver.start()
    },

    initProjectActionsTour() {
      const driver = new Driver()
      driver.defineSteps([{
          element: '#block-explorer',
          popover: {
            title: 'Block Explorer',
            description: '',
            position: 'right',
          },
        },
        {
          element: '#clone-contract',
          popover: {
            title: 'Clone Contract',
            description: '',
            position: 'right',
          },
        },
        {
          element: '#link-opensea',
          popover: {
            title: 'Link Opensea',
            description: '',
            position: 'right',
          },
        },
        {
          element: '#remove-card',
          popover: {
            title: 'Remove Project',
            description: '',
            position: 'right',
          },
        },
      ])
      driver.start()
    },
  },
}
