<script lang="ts">
	import type { Scene } from 'phaser';
	import PhaserGame, { type TPhaserRef } from '$game/PhaserGame.svelte';
	import { onMount } from 'svelte';
	import { EventBus } from '$game/event-bus';
	import BoidConfigPanel from '$components/ConfigPanel.svelte';
	import { type BoidConfig, BoidConfigValidator } from '$boid/config';

	let phaserRef: TPhaserRef = $state({ game: null, scene: null });

	const initialConfig = BoidConfigValidator.createDefaultConfig();
	
	const currentScene = (scene: Scene, config: BoidConfig) => {
		EventBus.emit('init-boid-simulation', scene, config);
	};

	onMount(() => {
		return () => {
			// Clean up Phaser game on component unmount
			phaserRef.game?.destroy(true);
		};
	});
</script>

<div class="flex h-screen">
	<div class="w-3/4">
		<div id="app" class="flex h-full items-center justify-center overflow-hidden">
			<PhaserGame bind:phaserRef {initialConfig} currentActiveScene={currentScene} />
		</div>
	</div>
	<div class="w-1/4 overflow-y-auto bg-gray-100 p-4">
		<BoidConfigPanel {initialConfig} />
	</div>
</div>
