<script lang="ts">
	import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$ui/card';
	import { Label } from '$ui/label';
	import { Separator } from '$ui/separator';
	import { Switch } from '$ui/switch';
	import { Cpu, History } from '@lucide/svelte';
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
		getSimulationSpeedRange,
		resetToDefaults
	} from '$config/simulation-signals.svelte';

	// Import subcomponents
	import PlaybackControls from '$components/simulation/PlaybackControls.svelte';
	import SpeedControls from '$components/simulation/SpeedControls.svelte';
	import PopulationControls from '$components/simulation/PopulationControls.svelte';
	import BoundaryModeControls from '$components/simulation/BoundaryModeControls.svelte';
	import { Button } from '$ui/button';

	// State
	const { min: minSimSpeed, max: maxSimSpeed } = getSimulationSpeedRange();
	const isLargeScreen = new MediaQuery('min-width: 1024px');

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
	<CardHeader class="pb-4">
		<CardTitle class="flex items-center text-lg">
			<Cpu class="mr-2 h-5 w-5" />
			Simulation Controls
		</CardTitle>
	</CardHeader>
	<CardContent class="space-y-8">
		<!-- Playback Controls -->
		<div class="flex flex-col items-center gap-4 lg:flex-row">
			<!-- Playback Group -->
			<PlaybackControls {isPlaying} onTogglePlayPause={togglePlayPause} onReset={resetSimulation} />

			{#if isLargeScreen.current}
				<Separator orientation="vertical" class="mx-0.5 h-8" />
			{:else}
				<Separator orientation="horizontal" />
			{/if}

			<!-- Speed Group -->
			<SpeedControls
				speed={simulationSpeed}
				minSpeed={minSimSpeed}
				maxSpeed={maxSimSpeed}
				onSlowDown={slowSimulationSpeed}
				onSpeedUp={advanceSimulationSpeed}
			/>

			{#if isLargeScreen.current}
				<Separator orientation="vertical" class="mx-0.5 h-8" />
			{:else}
				<Separator orientation="horizontal" />
			{/if}

			<div class="flex items-center gap-4">
				<!-- Debug Group -->
				<div class="flex items-center justify-center gap-2 text-center">
					<Label for="debug-mode" class="text-sm font-medium">Debug</Label>
					<Switch id="debug-mode" checked={debugMode} onCheckedChange={toggleDebugMode} />
				</div>

				<Separator orientation="vertical" class="mx-1 h-8" />

				<!-- Defaults Group -->
				<Button
					variant="destructive"
					size="sm"
					class="h-8 px-2 text-xs"
					onclick={resetToDefaults}
					title="Reset to defaults"
				>
					<History class="mr-1 h-3.5 w-3.5" />
					Defaults
				</Button>
			</div>
		</div>

		<div class="space-y-2">
			<h3 class="mb-2 text-sm font-medium text-muted-foreground">Population Settings</h3>
			<div class="p-2">
				<PopulationControls
					initialPreyCount={simulationConfig.initialPreyCount}
					initialPredatorCount={simulationConfig.initialPredatorCount}
					obstacleCount={simulationConfig.obstacleCount}
					onUpdate={handleUpdateConfig}
				/>
			</div>
		</div>
		<Separator class="my-2" />
		<!-- Boundary Controls Section -->
		<div class="space-y-2">
			<h3 class="mb-2 text-sm font-medium text-muted-foreground">Boundary Settings</h3>
			<div class="p-2">
				<BoundaryModeControls
					boundaryMode={simulationConfig.boundaryMode}
					boundaryStuckThreshold={simulationConfig.boundaryStuckThreshold}
					onUpdate={handleUpdateConfig}
				/>
			</div>
		</div>
	</CardContent>
	<CardFooter class="border-t border-border py-4">	
		<div class="text-xs text-muted-foreground">
			Changes to population counts and obstacles will apply on Reset
		</div>
	</CardFooter>
</Card>
