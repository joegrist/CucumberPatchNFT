import Driver from 'driver.js'
import 'driver.js/dist/driver.min.css'

export default {
  methods: {
    async initTour() {
      // TODO: pass tour ID to start e.g dashboard, project, etc.
        this.$bvToast.toast('Initiating the tour.', {
          title: 'Tour',
          variant: 'info',
        })
        setTimeout(() => {
          const driver = new Driver({
            allowClose: false,
          })

          driver.defineSteps([{
              element: '.card',
              popover: {
                title: 'Project Card',
                description: 'Shows project summary.',
                position: 'right',
              },
            },
            {
              element: '#project-name',
              popover: {
                title: 'Project Name',
                description: 'Name of your project.',
                position: 'right',
              },
            },
            {
              element: '#project-type-network',
              popover: {
                title: 'Contract Network & Type',
                description: 'The network contract is deployed to and type: ERC721, ERC721A, etc.',
                position: 'right',
              },
            },
            {
              element: '#contract-actions',
              popover: {
                title: 'Project Actions',
                description: `<ul>
									<li> See contract on etherscan </li>
									<li> Clone project </li>
									<li> Link OpenSea (when applicable) </li>
									<li> Remove the project from Zero Code NFT </li>
								</ul>`,
                position: 'right',
              },
            },
            {
              element: '#project-status',
              popover: {
                title: 'Project Status',
                description: 'Status of the deployment: Draft or Live.',
                position: 'right',
              },
            },
            {
              element: '#feature-preview',
              popover: {
                title: 'Project Features',
                description: 'Information about the selected project features. Whitelist(WL) / Delayed Reveal(DR).',
                position: 'right',
              },
            },
            {
              element: '#mint-count',
              popover: {
                title: 'Mint Count',
                description: 'Shows how many NFTs have been minted so far.',
                position: 'right',
              },
            },
            {
              element: '#withdraw-balance',
              popover: {
                title: 'Contract Balance',
                description: 'Shows balance available for withdrawal (your revenue).',
                position: 'right',
              },
            },
            {
              element: '#blockchain-logo',
              popover: {
                title: 'Blockchain Logo',
                description: 'Blockchain your smart contract is deployed on.',
                position: 'right',
              },
            },
            {
              element: '#owners-count',
              popover: {
                title: 'Owners Count',
                description: 'Shows how many people hold your NFTs.',
                position: 'right',
              },
            },
            {
              element: '#total-volume',
              popover: {
                title: 'Total Volume',
                description: 'Total volume of secondary marketplace transactions.',
                position: 'right',
              },
            },
            {
              element: '#marketplace',
              popover: {
                title: 'Marketplace',
                description: 'Click to navigate to secondary marketplace webpage. Currently, only OpenSea is supported. Others N/A.',
                position: 'right',
              },
            },
            {
              element: '#floor-price',
              popover: {
                title: 'Floor Price',
                description: 'The lowest price someone has listed their NFT from your collection for sale on a secondary marketplace.',
                position: 'right',
              },
            },
            {
              element: '#total-sales',
              popover: {
                title: 'Total Sales',
                description: 'Shows how many times your NFTs have been sold on a secondary marketplace.',
                position: 'right',
              },
            },
            {
              element: '#manage-project',
              popover: {
                title: 'Manage Project',
                description: 'Deploy to the mainnet, withdraw balance, customize minting page and more!',
                position: 'right',
              },
            },
          ])
          driver.start()
        }, 1000)
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
