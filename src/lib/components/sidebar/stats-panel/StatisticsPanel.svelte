<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$ui/card';
	import { ChartColumn } from '@lucide/svelte';
	import { phaserGameRef, gameStats, getRuntimeDuration } from '$game/phaser-signals.svelte';
	import StatItem from '$components/sidebar/stats-panel/StatItem.svelte';
	import FpsIndicator from '$components/sidebar/stats-panel/FpsIndicator.svelte';

	// State
	let frameRate = $state(0);
	const runtimeDuration = $derived(getRuntimeDuration());

	// Format time as MM:SS
	function formatTime(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	}

	// Performance tracking using runes
	$effect(() => {
		const interval = setInterval(() => {
			if (phaserGameRef.game) {
				frameRate = Math.round(phaserGameRef.game.loop.actualFps);
			}
		}, 1000);

		return () => clearInterval(interval);
	});
</script>

<Card class="w-full shadow-md">
	<CardHeader class="pb-4">
		<CardTitle class="flex items-center text-lg">
			<ChartColumn class="mr-2 size-5" />
			Simulation Statistics
		</CardTitle>
	</CardHeader>
	<CardContent>
		<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
			<!-- Population Stats -->
			<StatItem label="Total Boids" value={gameStats.totalBoids} />
			<StatItem label="Prey" value={gameStats.preyCount} textClass="text-green-500" />
			<StatItem label="Predators" value={gameStats.predatorCount} textClass="text-red-500" />
			<StatItem label="Runtime" value={formatTime(runtimeDuration)} />

			<!-- Performance Stats -->
			<FpsIndicator fps={frameRate} />

			<!-- Event Stats -->
			<StatItem label="Births" value={gameStats.reproductionEvents} textClass="text-blue-500" />
			<StatItem label="Deaths" value={gameStats.deathEvents} textClass="text-gray-500" />
		</div>
	</CardContent>
</Card>
