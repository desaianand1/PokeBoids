<!-- src/lib/components/StatsPanel.svelte -->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$ui/card';
	import { ChartColumn } from '@lucide/svelte';
	import { EventBus } from '$game/event-bus';
	import { type TPhaserRef } from '$components/PhaserGame.svelte';

	const { phaserRef }: { phaserRef: TPhaserRef } = $props();

	// Stats
	let totalBoids = $state(0);
	let preyCount = $state(0);
	let predatorCount = $state(0);
	let frameRate = $state<number>(0);
	let runTime = $state(0);
	let reproductionEvents = $state(0);
	let deathEvents = $state(0);

	// Performance tracking
	let frameRateInterval: NodeJS.Timeout;
	let runtimeInterval: NodeJS.Timeout;

	onMount(() => {
		// Set up listeners
		EventBus.on('flock-updated', ({ count }) => {
			totalBoids = count;
		});

		EventBus.on('prey-count-updated', ({ count }) => {
			preyCount = count;
		});

		EventBus.on('predator-count-updated', ({ count }) => {
			predatorCount = count;
		});

		EventBus.on('boid-reproduced', () => {
			reproductionEvents++;
		});

		EventBus.on('boid-removed', () => {
			deathEvents++;
		});

		// Start tracking FPS
		frameRateInterval = setInterval(() => {
			if (phaserRef.game) {
				frameRate = Math.round(phaserRef.game.loop.actualFps);
			}
		}, 1000);

		// Start tracking runtime
		const startTime = Date.now();
		runtimeInterval = setInterval(() => {
			runTime = Math.floor((Date.now() - startTime) / 1000);
		}, 1000);

		// Reset stats when simulation resets
		EventBus.on('game-reset', () => {
			reproductionEvents = 0;
			deathEvents = 0;
		});

		return () => {
			// Clean up
			clearInterval(frameRateInterval);
			clearInterval(runtimeInterval);
			EventBus.off('flock-updated');
			EventBus.off('prey-count-updated');
			EventBus.off('predator-count-updated');
			EventBus.off('boid-reproduced');
			EventBus.off('boid-removed');
			EventBus.off('game-reset');
		};
	});

	onDestroy(() => {
		clearInterval(frameRateInterval);
		clearInterval(runtimeInterval);
	});

	// Format time as MM:SS
	function formatTime(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	}
</script>

<Card class="w-full shadow-md">
	<CardHeader>
		<CardTitle class="flex items-center text-lg">
			<ChartColumn class="mr-2 h-5 w-5" />
			Simulation Statistics
		</CardTitle>
	</CardHeader>
	<CardContent>
		<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
			<!-- Population Stats -->
			<div class="space-y-1">
				<p class="text-muted-foreground text-xs tracking-wider uppercase">Total Boids</p>
				<p class="text-2xl font-semibold">{totalBoids}</p>
			</div>
			<div class="space-y-1">
				<p class="text-muted-foreground text-xs tracking-wider uppercase">Prey</p>
				<p class="text-2xl font-semibold text-green-500">{preyCount}</p>
			</div>
			<div class="space-y-1">
				<p class="text-muted-foreground text-xs tracking-wider uppercase">Predators</p>
				<p class="text-2xl font-semibold text-red-500">{predatorCount}</p>
			</div>
			<div class="space-y-1">
				<p class="text-muted-foreground text-xs tracking-wider uppercase">Runtime</p>
				<p class="text-2xl font-semibold">{formatTime(runTime)}</p>
			</div>

			<!-- Performance Stats -->
			<div class="space-y-1">
				<p class="text-muted-foreground text-xs tracking-wider uppercase">FPS</p>
				<p class="flex items-center text-2xl font-semibold">
					{frameRate}
					<span
						class="ml-2 rounded-full px-1.5 py-0.5 text-xs"
						class:bg-green-100={frameRate > 55}
						class:text-green-800={frameRate > 55}
						class:bg-yellow-100={frameRate <= 55 && frameRate > 30}
						class:text-yellow-800={frameRate <= 55 && frameRate > 30}
						class:bg-red-100={frameRate <= 30}
						class:text-red-800={frameRate <= 30}
					>
						{#if frameRate > 55}
							Good
						{:else if frameRate > 30}
							OK
						{:else}
							Low
						{/if}
					</span>
				</p>
			</div>

			<!-- Event Stats -->
			<div class="space-y-1">
				<p class="text-muted-foreground text-xs tracking-wider uppercase">Births</p>
				<p class="text-2xl font-semibold text-blue-500">{reproductionEvents}</p>
			</div>
			<div class="space-y-1">
				<p class="text-muted-foreground text-xs tracking-wider uppercase">Deaths</p>
				<p class="text-2xl font-semibold text-gray-500">{deathEvents}</p>
			</div>
		</div>
	</CardContent>
</Card>
