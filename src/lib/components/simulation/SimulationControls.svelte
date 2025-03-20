<script lang="ts">
	import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$ui/card';
	import { Label } from '$ui/label';
	import { Separator } from '$ui/separator';
	import { Switch } from '$ui/switch';
	import { Cpu } from '@lucide/svelte';
	import { MediaQuery } from 'svelte/reactivity';

	import {
		isSimulationPlaying,
		getCurrentSimulationSpeed,
		getDebugMode,
		togglePlayPause,
		toggleDebugMode,
		resetSimulation,
		updateSimulationConfig,
		getSimulationConfig,
		slowSimulationSpeed,
		advanceSimulationSpeed,
		getSimulationSpeedRange
	} from '$config/simulation-signals.svelte';

	// Import subcomponents
	import PlaybackControls from '$components/simulation/PlaybackControls.svelte';
	import SpeedControls from '$components/simulation/SpeedControls.svelte';
	import PopulationControls from '$components/simulation/PopulationControls.svelte';

	// State
	const isLargeScreen = new MediaQuery('min-width: 768px');
	const { min: minSimSpeed, max: maxSimSpeed } = getSimulationSpeedRange();

	const simulationConfig = $derived(getSimulationConfig());
	const isPlaying = $derived(isSimulationPlaying());
	const debugMode = $derived(getDebugMode());
	const simulationSpeed = $derived(getCurrentSimulationSpeed());

	function handleUpdateConfig<K extends keyof typeof simulationConfig>(
		key: K,
		value: (typeof simulationConfig)[K]
	): void {
		updateSimulationConfig(key, value);
	}
</script>

<Card class="w-full shadow-md">
	<CardHeader  class="pb-4">
		<CardTitle class="flex items-center text-lg">
			<Cpu class="mr-2 h-5 w-5" />
			Simulation Controls
		</CardTitle>
	</CardHeader>
	<CardContent class="space-y-8">
		<!-- Playback Controls -->
		<div class="mb-4 flex flex-col items-center gap-4 md:flex-row">
			<PlaybackControls {isPlaying} onTogglePlayPause={togglePlayPause} onReset={resetSimulation} />

			{#if isLargeScreen.current}
				<Separator orientation="vertical" class="mx-2 h-8" />
			{:else}
				<Separator orientation="horizontal" />
			{/if}

			<SpeedControls
				speed={simulationSpeed}
				minSpeed={minSimSpeed}
				maxSpeed={maxSimSpeed}
				onSlowDown={slowSimulationSpeed}
				onSpeedUp={advanceSimulationSpeed}
			/>

			{#if isLargeScreen.current}
				<Separator orientation="vertical" class="mx-2 h-8" />
			{:else}
				<Separator orientation="horizontal" />
			{/if}

			<div class="flex items-center gap-2">
				<Label for="debug-mode" class="cursor-pointer text-sm font-medium">Debug</Label>
				<Switch id="debug-mode" checked={debugMode} onCheckedChange={toggleDebugMode} />
			</div>
		</div>

		<!-- Population Controls -->
		<PopulationControls
			initialPreyCount={simulationConfig.initialPreyCount}
			initialPredatorCount={simulationConfig.initialPredatorCount}
			obstacleCount={simulationConfig.obstacleCount}
			onUpdate={handleUpdateConfig}
		/>
	</CardContent>
	<CardFooter>
		<div class="text-xs text-muted-foreground">
			Changes to population counts and obstacles will apply on Reset
		</div>
	</CardFooter>
</Card>
