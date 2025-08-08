<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { initialize, destroy, phaserGameRef } from '$game/phaser-signals.svelte';
	import { EventBus } from '$events/event-bus';
	import type Phaser from 'phaser';
	import {
		AlertDialog,
		AlertDialogContent,
		AlertDialogHeader,
		AlertDialogTitle,
		AlertDialogDescription,
		AlertDialogFooter
	} from '$ui/alert-dialog';
	import { Button } from '$ui/button';
	import type { Scene } from 'phaser';

	interface PhaserGameProps {
		onSceneReady?: (scene: Scene) => void;
		onGameError?: (error: Error) => void;
		onGameStart?: () => void;
		onGameReset?: () => void;
	}

	const { onSceneReady, onGameError, onGameReset }: PhaserGameProps = $props();

	let gameContainer = $state<HTMLDivElement | null>(null);
	let gameError = $derived(phaserGameRef.error);

	// Format error for dialog display
	const formattedError = $derived(
		gameError
			? {
					title: 'Uh Oh! Something went wrong',
					description:
						gameError.message || 'Failed to initialize game. Please try reloading the page'
				}
			: null
	);

	// Event handlers
	function handleSceneReady({ scene }: { scene: Phaser.Scene }) {
		if (onSceneReady) onSceneReady(scene);
	}

	function handleGameReset() {
		if (onGameReset) onGameReset();
	}

	// Initialize game
	function initializeGame() {
		if (!gameContainer) return;

		// Initialize the game using signals
		initialize(gameContainer.id);

		// Set up error callback
		$effect(() => {
			if (gameError && onGameError) {
				onGameError(gameError);
			}
		});

		// Set up event listeners
		EventBus.on('scene-ready', handleSceneReady);
		EventBus.on('game-reset', handleGameReset);
	}

	// Clean up resources
	function cleanupResources() {
		// Remove event listeners
		EventBus.off('scene-ready', handleSceneReady);
		EventBus.off('game-reset', handleGameReset);

		// Destroy game
		destroy();
	}

	function restartGame() {
		location.reload();
	}

	onMount(initializeGame);
	onDestroy(cleanupResources);
</script>

<div class="relative h-full w-full overflow-hidden">
	{#if formattedError}
		<AlertDialog open={true}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle class="text-rose-400">
						{formattedError.title}
					</AlertDialogTitle>
					<AlertDialogDescription class="text-slate-500">
						{formattedError.description}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<Button variant="outline" onclick={restartGame}>Reload Page</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	{/if}
	<div bind:this={gameContainer} id="game-container" class="h-full w-full"></div>
</div>
