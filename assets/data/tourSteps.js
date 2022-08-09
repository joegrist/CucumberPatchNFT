const dashboard = [
	{
		element: '#search-bar',
		popover: {
			title: 'Search Bar',
			description: 'Search all your projects by name or symbol.',
			position: 'bottom',
		},
	},
	{
		element: '#add-new-btn',
		popover: {
			title: 'Create New Project',
			description:
				'Navigates you to the wizard so you can craft a new project.',
			position: 'left',
		},
	},
	{
		element: '#user-profile-btn',
		popover: {
			title: 'Your Account',
			description:
				'Avatar (from ENS), address and balance. Click for more options.',
			position: 'left',
		},
	},
	{
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
			description:
				'The network contract is deployed on and its type: ERC721, ERC721A, etc.',
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
                          <li> Checkout </li>
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
			description:
				'Information about the selected project features. Whitelist(WL) / Delayed Reveal(DR).',
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
			description:
				'Click to navigate to secondary marketplace webpage. Currently, only OpenSea is supported. Others N/A.',
			position: 'right',
		},
	},
	{
		element: '#floor-price',
		popover: {
			title: 'Floor Price',
			description:
				'The lowest price someone has listed their NFT from your collection for sale on a secondary marketplace.',
			position: 'right',
		},
	},
	{
		element: '#total-sales',
		popover: {
			title: 'Total Sales',
			description:
				'Shows how many times your NFTs have been sold on a secondary marketplace.',
			position: 'right',
		},
	},
	{
		element: '#manage-project',
		popover: {
			title: 'Manage Project',
			description:
				'Deploy to the mainnet, withdraw balance, customize minting page and more!',
			position: 'right',
		},
	},
	{
		element: '#project-created-on',
		popover: {
			title: 'Created On',
			description: 'Date the project was created',
			position: 'right',
		},
	},
]
const project = [
	{
		element: '#smart-contract___BV_tab_button__',
		popover: {
			title: 'Smart Contract',
			description:
				'Overview of the Contract with the functions available to interact with it.',
			position: 'right',
		},
	},
	{
		element: '#assets___BV_tab_button__',
		popover: {
			title: 'Assets',
			description:
				'Upload your NFT Assets using nft.storage. You would need your nft.storage API key.',
			position: 'right',
		},
	},
	{
		element: '#whitelist___BV_tab_button__',
		popover: {
			title: 'Whitelist',
			description: 'Add the whitelist addresses for your collection.',
			position: 'right',
		},
	},
	{
		element: '#delayed-reveal___BV_tab_button__',
		popover: {
			title: 'Delayed Reveal',
			description:
				'Upload your Delayed reveal image and metadata using nft.storage. You would need your nft.storage API key.',
			position: 'right',
		},
	},
	{
		element: '#mint-page___BV_tab_button__',
		popover: {
			title: 'Mint page',
			description:
				'Page to mint your NFTs. Customize the UI of the page with different options available.',
			position: 'right',
		},
	},
	{
		element: '#snapshot___BV_tab_button__',
		popover: {
			title: 'Snapshot',
			description: 'The list of the addresses and the number of tokens it hold.',
			position: 'right',
		},
	},
	{
		element: '#source-code___BV_tab_button__',
		popover: {
			title: 'Source Code',
			description: 'Source code of the contract for auditing and analyzing.',
			position: 'right',
		},
	},
	{
		element: '#other-config___BV_tab_button__',
		popover: {
			title: 'Extra config for mint page',
			description: `<ul>
											<li>Discord server ID or channel ID</li>
											<li>Google Analytics</li>
										</ul>`,
			position: 'right',
		},
	},
	{
		element: '#contract-name-network',
		popover: {
			title: 'Contract Name & Network',
			description: "Name of the contract and the network it's deployed on.",
			position: 'right',
		},
	},
	{
		element: '#mainnet-deploy',
		popover: {
			title: 'Mainnet Deployment',
			description:
				'Deploy on the mainnet. You can select different add-ons in the checkout page.',
			position: 'right',
		},
	},
	{
		element: '#contract-balance',
		popover: {
			title: 'Contract Balance',
			description: 'Available balance on the contract to withdraw.',
			position: 'right',
		},
	},
	{
		element: '#balance-dropdown',
		popover: {
			title: 'Balance Actions',
			description: `<ul>
											<li>Refresh your contract balance.</li>
											<li>Withdraw balance to the addresses you added as revenue split address.</li>
										</ul>`,
			position: 'left',
		},
	},
	{
		element: '#sale-status',
		popover: {
			title: 'Status',
			description: 'Sale status of the contract. (Paused, Presale, Public)',
			position: 'right',
		},
	},
	{
		element: '#saleStatus-dropdown',
		popover: {
			title: 'Sale Status Actions',
			description: `<ul>
											<li>Refresh your contract sale status.</li>
											<li>Pause sales.</li>
											<li>Start Pre-sale.</li>
											<li>Start Public Sale</li>
										</ul>`,
			position: 'left',
		},
	},
	{
		element: '#contract-type',
		popover: {
			title: 'Contract Type',
			description: 'The type of the contract. ERC721, ERC721A, etc.',
			position: 'right',
		},
	},
	{
		element: '#block-explorer',
		popover: {
			title: 'Block Explorer',
			description:
				'Block Explorer for the contract, view all the transactions until now.',
			position: 'right',
		},
	},
	{
		element: '#download-contract-abi',
		popover: {
			title: 'Contract ABI',
			description:
				'Download ABI (Application Binary Interface) of the contract.',
			position: 'right',
		},
	},
	{
		element: '#download-source-code',
		popover: {
			title: 'Source Code',
			description: 'Download source code of the contract.',
			position: 'right',
		},
	},
	{
		element: '#advanced-function',
		popover: {
			title: "Advanced Function",
			description: "Toggle switch to view other available functions in the contract.",
			position:'left'
		}
	},
	{
		element: '.gas-badge:first-child',
		popover: {
			title: 'Write Contract',
			description: 'Functions that costs the <b>Gas fees</b> to interact with the contract.',
			position: 'bottom',
		},
	},
	{
		element: '.eco-badge:first-child',
		popover: {
			title: 'Read Contract', 
			description: 'Functions that are called without any <b>Gas Fees</b>.',
			position: 'bottom',
		},
	},
]

export { dashboard, project }
