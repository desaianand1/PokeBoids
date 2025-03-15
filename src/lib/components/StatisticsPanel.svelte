<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$ui/card';
	import { ChartColumn } from '@lucide/svelte';
	import { phaserGameRef, gameStats, getRuntimeDuration } from '$game/phaser-signals.svelte';
	import { cn } from '$utils';

	let frameRate = $state(0);
	const runtimeDuration = $derived(getRuntimeDuration());

	// Performance tracking
	let frameRateInterval: NodeJS.Timeout;

	// Format time as MM:SS
	function formatTime(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	}

	// FPS indicator style helper
	function getFpsIndicator(fps: number) {
		if (fps > 55) {
			return { class: 'bg-green-100 text-green-800', text: 'Good' };
		} else if (fps > 30) {
			return { class: 'bg-yellow-100 text-yellow-800', text: 'OK' };
		} else {
			return { class: 'bg-red-100 text-red-800', text: 'Low' };
		}
	}

	// Update frame rate
	function updateFrameRate() {
		if (phaserGameRef.game) {
			frameRate = Math.round(phaserGameRef.game.loop.actualFps);
		}
	}

	// Start tracking performance
	function startPerformanceTracking() {
		frameRateInterval = setInterval(updateFrameRate, 1000);
	}

	// Clean up
	function stopPerformanceTracking() {
		clearInterval(frameRateInterval);
	}

	onMount(startPerformanceTracking);
	onDestroy(stopPerformanceTracking);
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
			{@render statItem('Total Boids', gameStats.totalBoids)}
			{@render statItem('Prey', gameStats.preyCount, 'text-green-500')}
			{@render statItem('Predators', gameStats.predatorCount, 'text-red-500')}
			{@render statItem('Runtime', formatTime(runtimeDuration))}

			<!-- Performance Stats -->
			<div class="space-y-1">
				<p class="text-xs uppercase tracking-wider text-muted-foreground">FPS</p>
				<p class="flex items-center text-2xl font-semibold">
					{frameRate}
					{#if frameRate > 0}
						{@const indicator = getFpsIndicator(frameRate)}
						<span class={cn('ml-2 rounded-full px-1.5 py-0.5 text-xs', indicator.class)}>
							{indicator.text}
						</span>
					{/if}
				</p>
			</div>

			<!-- Event Stats -->
			{@render statItem('Births', gameStats.reproductionEvents, 'text-blue-500')}
			{@render statItem('Deaths', gameStats.deathEvents, 'text-gray-500')}
		</div>
	</CardContent>
</Card>

{#snippet statItem(label: string, value: number | string, textClass = '')}
	<div class="space-y-1">
		<p class="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
		<p class={cn('text-2xl font-semibold', textClass)}>{value}</p>
	</div>
{/snippet}
