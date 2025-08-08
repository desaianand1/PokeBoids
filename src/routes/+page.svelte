<script lang="ts">
	import PhaserGame from '$components/PhaserGame.svelte';
	import SidebarLayout from '$components/SidebarLayout.svelte';
	import type Phaser from 'phaser';

	// Game event handlers
	const gameHandlers = {
		onSceneReady: (scene: Phaser.Scene) => {
			console.debug('Scene ready:', scene.scene.key);
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
</script>

<main class="relative h-screen w-screen overflow-hidden bg-background">
	<!-- Fullscreen Game Container -->
	<div class="absolute inset-0">
		<PhaserGame {...gameHandlers} />
	</div>

	<!-- Sidebar System -->
	<SidebarLayout />
</main>
