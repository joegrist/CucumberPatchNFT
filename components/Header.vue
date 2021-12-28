<template>
	<div>
		<b-navbar toggleable="lg" type="dark" variant="dark">
			<b-navbar-brand to="/">
				ZERO Code NFT
				<!-- <b-img img src="/icon.png" alt="logo" width="50px" /> -->
			</b-navbar-brand>

			<b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

			<b-collapse id="nav-collapse" is-nav>
				<b-navbar-nav>
					<b-nav-item to="/"
						>Wizard</b-nav-item
					>
					<b-nav-item v-if="$wallet.account" to="/dashboard"
						>Dashboard</b-nav-item
					>
				</b-navbar-nav>

				<!-- Right aligned nav items -->
				<b-navbar-nav class="ml-auto">
					<span v-if="$wallet.account" class="text-light mr-2 my-auto">{{ $wallet.balance }} </span>

					<b-button
						variant="info"
						:disabled="!!$wallet.account"
						@click="$wallet.connect">
						<strong>{{
							!!$wallet.account ? $wallet.accountCompact : 'Connect Wallet'
						}}</strong>
					</b-button>
				</b-navbar-nav>
			</b-collapse>
		</b-navbar>
	</div>
</template>
