<script lang="ts">
	import FloatingDock from '$components/dock/FloatingDock.svelte';
	import PhaserGame from '$components/PhaserGame.svelte';
	import SidebarLayout from '$sidebar/SidebarLayout.svelte';
	import WelcomeDialog from '$components/onboarding/WelcomeDialog.svelte';
	import { onboardingStore } from '$components/onboarding/onboarding-store.svelte';
	import type Phaser from 'phaser';

	// Sidebar state
	let sidebarVisible = $state(false);

	// Game event handlers
	const gameHandlers = {
		onSceneReady: (scene: Phaser.Scene) => {
			console.debug('Scene ready:', scene.scene.key);
			// Mark game as ready for onboarding
			onboardingStore.setGameReady();
			onboardingStore.showWelcomeIfNeeded();
		},
		onGameError: (error: Error) => {
			console.error('Game error:', error);
		},
		onGameStart: () => {
			console.debug('Game started');
		},
		onGameReset: () => {
			console.debug('Game reset');
		}
	};

	// Dock event handlers
	function onControlsClick() {
		sidebarVisible = true;
	}

	function onHelpClick() {
		onboardingStore.openDrawer();
	}

	function onSettingsClick() {
		// Future: Open settings dialog
		console.debug('Settings clicked');
	}

	// Sidebar event handlers
	function onSidebarClose() {
		sidebarVisible = false;
	}
</script>

<main class="relative h-screen w-screen overflow-hidden bg-background">
	<!-- Fullscreen Game Container -->
	<div class="absolute inset-0">
		<PhaserGame {...gameHandlers} />
	</div>

	<!-- Floating Dock -->
	<FloatingDock
		{onControlsClick}
		{onHelpClick}
		{onSettingsClick}
		class={sidebarVisible ? '-translate-x-2/3' : '-translate-x-1/2'}
	/>

	<!-- Sidebar System -->
	<SidebarLayout bind:visible={sidebarVisible} onClose={onSidebarClose} />

	<!-- Welcome Dialog -->
	<WelcomeDialog />
</main>
