<script lang="ts">
	import { Button } from '$ui/button';
	import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$ui/card';
	import { Input } from '$ui/input';
	import { Label } from '$ui/label';
	import { Separator } from '$ui/separator';
	import { Switch } from '$ui/switch';
	import { Play, Pause, RotateCcw, Cpu, FastForward, Rewind } from '@lucide/svelte';
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

	const isLargeScreen = new MediaQuery('min-width: 768px');
	const { min: minSimSpeed, max: maxSimSpeed } = getSimulationSpeedRange();

	const simulationConfig = $derived(getSimulationConfig());
	const isPlaying = $derived(isSimulationPlaying());
	const debugMode = $derived(getDebugMode());
	const simulationSpeed = $derived(getCurrentSimulationSpeed());

	function updatePreyCount(event: Event) {
		const value = parseInt((event.target as HTMLInputElement).value);
		if (!isNaN(value) && value >= 0) {
			updateSimulationConfig('initialPreyCount', value);
		}
	}

	function updatePredatorCount(event: Event) {
		const value = parseInt((event.target as HTMLInputElement).value);
		if (!isNaN(value) && value >= 0) {
			updateSimulationConfig('initialPredatorCount', value);
		}
	}

	function updateObstacleCount(event: Event) {
		const value = parseInt((event.target as HTMLInputElement).value);
		if (!isNaN(value) && value >= 0) {
			updateSimulationConfig('obstacleCount', value);
		}
	}
</script>

<Card class="w-full shadow-md">
	<CardHeader>
		<CardTitle class="flex items-center">
			<Cpu class="mr-2 h-5 w-5" />
			Simulation Controls
		</CardTitle>
	</CardHeader>
	<CardContent class="space-y-4">
		<!-- Playback Controls -->
		<div class="mb-4 flex flex-col items-center gap-4 md:flex-row">
			{@render playbackControls()}

			{@render separator()}
			{@render speedControls()}

			{@render separator()}
			{@render debugToggle()}
		</div>

		<!-- Population Controls -->
		<div class="grid grid-rows-3 gap-4 md:grid-cols-3 md:grid-rows-none">
			{@render populationInput(
				'prey-count',
				'Prey Count',
				simulationConfig.initialPreyCount,
				updatePreyCount
			)}
			{@render populationInput(
				'predator-count',
				'Predator Count',
				simulationConfig.initialPredatorCount,
				updatePredatorCount
			)}
			{@render populationInput(
				'obstacle-count',
				'Obstacles',
				simulationConfig.obstacleCount,
				updateObstacleCount
			)}
		</div>
	</CardContent>
	<CardFooter>
		<div class="text-xs text-muted-foreground">
			Changes to population counts and obstacles will apply on Reset
		</div>
	</CardFooter>
</Card>

{#snippet separator()}
	{#if isLargeScreen.current}
		<Separator orientation="vertical" class="mx-2 h-8" />
	{:else}
		<Separator orientation="horizontal" />
	{/if}
{/snippet}

{#snippet playbackControls()}
	<div class="flex items-center gap-4">
		<Button
			variant="outline"
			size="icon"
			onclick={togglePlayPause}
			aria-label={isPlaying ? 'Pause' : 'Play'}
		>
			{#if isPlaying}
				<Pause class="h-6 w-6" />
			{:else}
				<Play class="h-6 w-6" />
			{/if}
		</Button>
		<Button variant="destructive" size="icon" onclick={resetSimulation} aria-label="Reset">
			<RotateCcw class="h-6 w-6" />
		</Button>
	</div>
{/snippet}

{#snippet speedControls()}
	<div class="flex items-center gap-2">
		<Button
			variant="ghost"
			size="icon"
			class="h-8 w-8"
			onclick={slowSimulationSpeed}
			disabled={simulationSpeed <= minSimSpeed}
		>
			<Rewind class="h-4 w-4" />
		</Button>
		<div class="w-20 text-center font-mono text-xs">
			{simulationSpeed.toFixed(1)}x
		</div>
		<Button
			variant="ghost"
			size="icon"
			class="h-8 w-8"
			onclick={advanceSimulationSpeed}
			disabled={simulationSpeed >= maxSimSpeed}
		>
			<FastForward class="h-4 w-4" />
		</Button>
	</div>
{/snippet}

{#snippet debugToggle()}
	<div class="flex items-center gap-2">
		<Label for="debug-mode" class="cursor-pointer text-sm font-medium">Debug</Label>
		<Switch id="debug-mode" checked={debugMode} onCheckedChange={toggleDebugMode} ></Switch>
	</div>
{/snippet}

{#snippet populationInput(
	id: string,
	label: string,
	value: number,
	updateFn: (event: Event) => void
)}
	<div class="space-y-2">
		<Label for={id} class="text-sm font-medium">{label}</Label>
		<Input
			{id}
			type="number"
			min="0"
			max={id === 'obstacle-count' ? '20' : id === 'predator-count' ? '100' : '500'}
			{value}
			onchange={updateFn}
		/>
	</div>
{/snippet}
