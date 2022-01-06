<template>
	<div>
		<b-navbar toggleable="lg" type="light" variant="light">
			<b-navbar-brand href="https://zerocodenft.com">
				<b-img img src="/logo.png" alt="logo" width="100px" />
			</b-navbar-brand>

			<b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

			<b-collapse id="nav-collapse" is-nav>
				<b-navbar-nav>
					<b-nav-item to="/" class="gradient-text"
						>Wizard</b-nav-item
					>
					<b-nav-item v-if="$wallet.account" to="/dashboard" class="gradient-text"
						>Dashboard</b-nav-item
					>
				</b-navbar-nav>

				<!-- Right aligned nav items -->
				<b-navbar-nav class="ml-auto">
					<span v-if="$wallet.account" class="mr-2 my-auto">{{ $wallet.balance }} </span>

					<b-button
						class="bg-gradient-primary border-0"
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
