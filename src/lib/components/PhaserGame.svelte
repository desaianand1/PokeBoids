<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { initialize, destroy, phaserGameRef } from '$game/phaser-signals.svelte';
	import { EventBus } from '$events/event-bus';
	import type Phaser from 'phaser';
	import { ResponsiveDialog } from '$ui/responsive-dialog';
	import { AlertDialogAction } from '$ui/alert-dialog';
	import { Button, buttonVariants } from '$ui/button';
	import { OctagonAlert } from 'lucide-svelte';
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
	let errorDialogOpen = $derived(formattedError !== null);

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
	<!-- Game Error Dialog -->
	{#if formattedError}
		<ResponsiveDialog bind:open={errorDialogOpen}>
			{#snippet title()}
				<span
					class="inline-flex items-center justify-center gap-2 text-lg font-bold text-destructive"
				>
					<OctagonAlert class="stroke-2 text-destructive" />
					{formattedError.title}
				</span>
			{/snippet}
			{#snippet description()}
				<p class="text-muted-foreground">
					{formattedError.description}
				</p>
			{/snippet}
			{#snippet footer(isDesktop: boolean)}
				{#if isDesktop}
					<AlertDialogAction
						class={buttonVariants({ variant: 'destructive' })}
						onclick={restartGame}
					>
						Reload Page
					</AlertDialogAction>
				{:else}
					<Button variant="destructive" onclick={restartGame}>Reload Page</Button>
				{/if}
			{/snippet}
		</ResponsiveDialog>
	{/if}

	<div bind:this={gameContainer} id="game-container" class="h-full w-full"></div>
</div>
