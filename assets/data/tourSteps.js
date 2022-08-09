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
				'View and interact with your Contract here',
			position: 'right',
		},
	},
	{
		element: '#assets___BV_tab_button__',
		popover: {
			title: 'Assets',
			description:
				'Upload your artwork and metadata to IPFS',
			position: 'right',
		},
	},
	{
		element: '#whitelist___BV_tab_button__',
		popover: {
			title: 'Whitelist',
			description: 'Upload whitelisted wallet addresses',
			position: 'right',
		},
	},
	{
		element: '#delayed-reveal___BV_tab_button__',
		popover: {
			title: 'Delayed Reveal',
			description:
				'Upload image and metadata that will be used before the reveal',
			position: 'right',
		},
	},
	{
		element: '#mint-page___BV_tab_button__',
		popover: {
			title: 'Mint page',
			description:
				'Customize, test and learn how to integrate your NFT minting page into any website builder',
			position: 'right',
		},
	},
	{
		element: '#snapshot___BV_tab_button__',
		popover: {
			title: 'Snapshot',
			description: 'Run and export a report on your NFT holders',
			position: 'right',
		},
	},
	{
		element: '#source-code___BV_tab_button__',
		popover: {
			title: 'Source Code',
			description: 'Preview of the source code for auditing and analyzing',
			position: 'right',
		},
	},
	{
		element: '#other-config___BV_tab_button__',
		popover: {
			title: 'Analytics and more',
			description: `<ul>
											<li>Discord chat window integration</li>
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
				'Checkout/Deploy to the mainnet. Add-ons available at the checkout.',
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
							<li>Refresh your contract's balance.</li>
							<li>Withdraw balance</li>
						</ul>`,
			position: 'left',
		},
	},
	{
		element: '#sale-status',
		popover: {
			title: 'Status',
			description: 'Currently activated sales phase. (Paused, Presale, Public)',
			position: 'right',
		},
	},
	{
		element: '#saleStatus-dropdown',
		popover: {
			title: 'Sale Status Actions',
			description: `<ul>
							<li>Refresh your contract's sale status.</li>
							<li>Pause sales.</li>
							<li>Start Pre-sale (when applicable).</li>
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
				'Block Explorer hyperlink like Etherscan to review all the transaction activity.',
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
			title: "Advanced Functionality",
			description: "Toggle to view all smart contract functions.",
			position:'left'
		}
	},
	{
		element: '.gas-badge:first-child',
		popover: {
			title: 'Write Contract',
			description: 'Functions marked <b>"Gas"</b> write information to the smart contract and incur gas fees.',
			position: 'bottom',
		},
	},
	{
		element: '.eco-badge:first-child',
		popover: {
			title: 'Read Contract', 
			description: 'Functions marked <b>"Eco"</b> are readonly and don\'t incur any gas fees.',
			position: 'bottom',
		},
	},
]

export { dashboard, project }
