<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$ui/card';
	import { ChartColumn } from '@lucide/svelte';
	import { phaserGameRef, gameStats, getRuntimeDuration } from '$game/phaser-signals.svelte';
	import StatItem from '$sidebar/stats-panel/StatItem.svelte';
	import FpsIndicator from '$sidebar/stats-panel/FpsIndicator.svelte';
	import { getCurrentStrategy } from '$config/simulation-signals.svelte';
	import { UIDisplayStrategyFactory } from '$strategies/ui-display';
	import { cn } from '$lib/utils';

	// State
	let frameRate = $state(0);
	const runtimeDuration = $derived(getRuntimeDuration());

	// Reactive UI strategy based on current simulation mode
	const currentSimStrategy = $derived(getCurrentStrategy());
	const uiStrategy = $derived(UIDisplayStrategyFactory.createUIStrategy(currentSimStrategy.mode));
	const visibilityConfig = $derived(uiStrategy.getVisibilityConfig());
	const labels = $derived(uiStrategy.getLabels());

	// Format time with hybrid approach: MM:SS under 1hr, adaptive above
	function formatTime(seconds: number): string {
		if (seconds < 3600) {
			// Under 1 hour: use MM:SS format
			const mins = Math.floor(seconds / 60);
			const secs = seconds % 60;
			return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
		}

		// 1 hour and above: use adaptive format
		const days = Math.floor(seconds / 86400);
		const hours = Math.floor((seconds % 86400) / 3600);
		const mins = Math.floor((seconds % 3600) / 60);

		if (days > 0) {
			return `${days}d ${hours}h ${mins}m`;
		} else {
			return `${hours}h ${mins}m`;
		}
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
		<div
			class={cn(
				'grid gap-4',
				visibilityConfig.showBiologicalStats
					? 'grid-cols-2 md:grid-cols-4'
					: 'grid-cols-2 md:grid-cols-3'
			)}
		>
			<!-- Population Stats -->
			<StatItem label="Total Boids" value={gameStats.totalBoids} />

			{#if visibilityConfig.showPreyStats}
				<StatItem label={labels.preyLabel} value={gameStats.preyCount} textClass="text-green-500" />
			{/if}

			{#if visibilityConfig.showPredatorStats}
				<StatItem
					label={labels.predatorLabel}
					value={gameStats.predatorCount}
					textClass="text-red-500"
				/>
			{/if}

			<StatItem label="Runtime" value={formatTime(runtimeDuration)} />

			<!-- Performance Stats -->
			<FpsIndicator fps={frameRate} />

			<!-- Biological Event Stats - Only show in predator-prey mode -->
			{#if visibilityConfig.showBiologicalStats}
				<StatItem label="Births" value={gameStats.reproductionEvents} textClass="text-blue-500" />
				<StatItem label="Deaths" value={gameStats.deathEvents} textClass="text-gray-500" />
			{/if}
		</div>
	</CardContent>
</Card>
