<script module lang="ts">
	import type { Game, Scene } from 'phaser';

	export interface TPhaserRef {
		game: Game | null;
		scene: Scene | null;
	}
</script>

<script lang="ts">
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	import { createGame } from '$game';
	import { EventBus } from '$game/event-bus';
	import {
		AlertDialog,
		AlertDialogContent,
		AlertDialogHeader,
		AlertDialogTitle,
		AlertDialogDescription,
		AlertDialogFooter
	} from '$ui/alert-dialog';
	import { Button } from '$ui/button';

	interface PhaserGameProps {
		onSceneReady: ((scene: Scene) => void) | undefined;
		onGameError: ((error: Error) => void) | undefined;
		phaserRef: TPhaserRef;
	}
	interface GameInitializationError {
		title: string;
		description: string;
	}

	const { onSceneReady, onGameError, phaserRef = $bindable() }: PhaserGameProps = $props();

	let error = $state<GameInitializationError | null>(null);
	let gameContainer = $state<HTMLDivElement | null>(null);
	let isReady = $state<boolean>(false);

	// Event dispatcher
	const dispatch = createEventDispatcher<{
		'scene-ready': { scene: Phaser.Scene };
		'game-error': { error: Error };
		'game-start': void;
		'game-reset': void;
	}>();

	onMount(() => {
		try {
			if (gameContainer) {
				// Initialize the game
				phaserRef.game = createGame(gameContainer.id);

				// Listen for game events
				EventBus.on('scene-ready', ({ scene }) => {
					phaserRef.scene = scene;
					isReady = true;
					dispatch('scene-ready', { scene });

					// Call the callback if provided
					if (onSceneReady) onSceneReady(scene);
				});

				EventBus.on('game-started', () => {
					dispatch('game-start', undefined);
				});

				EventBus.on('game-reset', () => {
					dispatch('game-reset', undefined);
				});
			}
		} catch (err) {
			const errorObj = err instanceof Error ? err : new Error('Unknown error');
			error = {
				title: 'Uh Oh! Something went wrong',
				description: errorObj.message || 'Failed to initialize game. Please try reloading the page'
			};
			dispatch('game-error', { error: errorObj });

			// Call the error callback if provided
			if (onGameError) onGameError(errorObj);
		}
	});

	onDestroy(() => {
		// Clean up event listeners
		EventBus.off('scene-ready');
		EventBus.off('game-started');
		EventBus.off('game-reset');

		// Destroy the game instance
		if (phaserRef.game) {
			phaserRef.game.destroy(true);
			phaserRef.game = null;
			phaserRef.scene = null;
		}
	});

	// Helper functions
	function restartGame() {
		location.reload();
	}
</script>

<div class="relative h-full w-full overflow-hidden">
	{#if error}
		<AlertDialog open={true}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle class="text-rose-400">
						{error.title}
					</AlertDialogTitle>
					<AlertDialogDescription class="text-slate-500">
						{error.description}
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
