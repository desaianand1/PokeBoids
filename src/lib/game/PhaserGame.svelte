<script module lang="ts">
	import type { Game, Scene } from 'phaser';

	export type TPhaserRef = {
		game: Game | null;
		scene: Scene | null;
	};
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import StartGame from '$game/main';
	import { EventBus } from '$game/event-bus';
	import type { BoidConfig } from '$boid/config';

	interface PhaserGameProps {
		currentActiveScene: (scene: Scene, config: BoidConfig) => void | undefined;
		phaserRef: TPhaserRef;
		initialConfig: BoidConfig;
	}
	const {
		currentActiveScene,
		phaserRef = $bindable(),
		initialConfig,
	}: PhaserGameProps = $props();
	onMount(() => {
		phaserRef.game = StartGame('game-container');
		EventBus.on('current-scene-ready', (scene_instance: Scene) => {
			console.debug('current-scene-ready event received for scene:', scene_instance.scene.key);
			phaserRef.scene = scene_instance;

			if (currentActiveScene) {
				currentActiveScene(scene_instance, initialConfig);
			}
		});
		return () => {
			EventBus.removeAllListeners();
		};
	});
</script>

<div id="game-container"></div>
