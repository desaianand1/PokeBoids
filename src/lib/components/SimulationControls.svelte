<script lang="ts">
	import { Button } from '$ui/button';
	import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$ui/card';
	import { Input } from '$ui/input';
	import { Label } from '$ui/label';
	import { Separator } from '$ui/separator';
	import { Switch } from '$ui/switch';
	import {
		PlayCircle,
		PauseCircle,
		RotateCcw,
		Settings,
		FastForward,
		Rewind
	} from '@lucide/svelte';
	import { EventBus } from '$game/event-bus';
	import { getSimulationConfig, updateSimulationConfig } from '$config/index.svelte';

	let isPlaying = $state<boolean>(true);
	let simulationSpeed = $state<number>(1);
	let debugMode = $state<boolean>(false);

	// Track config
	const config = $derived(getSimulationConfig());

	// Event handlers
	function togglePlayPause() {
		isPlaying = !isPlaying;
		if (isPlaying) {
			EventBus.emit('simulation-started', undefined);
		} else {
			EventBus.emit('simulation-paused', undefined);
		}
	}

	function resetSimulation() {
		EventBus.emit('simulation-reset', undefined);
	}

	function toggleDebugMode() {
		debugMode = !debugMode;
		EventBus.emit('debug-toggle', { enabled: debugMode });
	}

	function changeSimulationSpeed(speed: number) {
		simulationSpeed = speed;
		EventBus.emit('simulation-speed-changed', { value: speed });
	}

	function updatePreyCount(event: Event) {
		const target = event.target as HTMLInputElement;
		const value = parseInt(target.value);
		if (!isNaN(value) && value >= 0) {
			updateSimulationConfig('initialPreyCount', value);
		}
	}

	function updatePredatorCount(event: Event) {
		const target = event.target as HTMLInputElement;
		const value = parseInt(target.value);
		if (!isNaN(value) && value >= 0) {
			updateSimulationConfig('initialPredatorCount', value);
		}
	}

	function updateObstacleCount(event: Event) {
		const target = event.target as HTMLInputElement;
		const value = parseInt(target.value);
		if (!isNaN(value) && value >= 0) {
			updateSimulationConfig('obstacleCount', value);
		}
	}
</script>

<Card class="w-full shadow-md">
	<CardHeader>
		<CardTitle class="flex items-center">
			<Settings class="mr-2 h-5 w-5" />
			Simulation Controls
		</CardTitle>
	</CardHeader>
	<CardContent class="space-y-4">
		<!-- Playback Controls -->
		<div class="mb-4 flex items-center gap-2">
			<Button
				variant="outline"
				size="icon"
				onclick={togglePlayPause}
				aria-label={isPlaying ? 'Pause' : 'Play'}
			>
				{#if isPlaying}
					<PauseCircle class="h-6 w-6" />
				{:else}
					<PlayCircle class="h-6 w-6" />
				{/if}
			</Button>
			<Button variant="outline" size="icon" onclick={resetSimulation} aria-label="Reset">
				<RotateCcw class="h-6 w-6" />
			</Button>
			<Separator orientation="vertical" class="mx-2 h-8" />
			<div class="flex items-center gap-2">
				<Button
					variant="ghost"
					size="icon"
					class="h-8 w-8"
					onclick={() => changeSimulationSpeed(Math.max(0.5, simulationSpeed - 0.5))}
					disabled={simulationSpeed <= 0.5}
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
					onclick={() => changeSimulationSpeed(Math.min(3, simulationSpeed + 0.5))}
					disabled={simulationSpeed >= 3}
				>
					<FastForward class="h-4 w-4" />
				</Button>
			</div>
			<Separator orientation="vertical" class="mx-2 h-8" />
			<div class="flex items-center gap-2">
				<Label for="debug-mode" class="cursor-pointer text-sm font-medium">Debug</Label>
				<Switch id="debug-mode" checked={debugMode} onchange={toggleDebugMode}></Switch>
			</div>
		</div>

		<!-- Population Controls -->
		<div class="grid grid-cols-3 gap-4">
			<div class="space-y-2">
				<Label for="prey-count" class="text-sm font-medium">Prey Count</Label>
				<Input
					id="prey-count"
					type="number"
					min="0"
					max="500"
					value={config.initialPreyCount}
					onchange={updatePreyCount}
				/>
			</div>
			<div class="space-y-2">
				<Label for="predator-count" class="text-sm font-medium">Predator Count</Label>
				<Input
					id="predator-count"
					type="number"
					min="0"
					max="100"
					value={config.initialPredatorCount}
					onchange={updatePredatorCount}
				/>
			</div>
			<div class="space-y-2">
				<Label for="obstacle-count" class="text-sm font-medium">Obstacles</Label>
				<Input
					id="obstacle-count"
					type="number"
					min="0"
					max="20"
					value={config.obstacleCount}
					onchange={updateObstacleCount}
				/>
			</div>
		</div>
	</CardContent>
	<CardFooter>
		<div class="text-muted-foreground text-xs">
			Changes to population counts and obstacles will apply on Reset
		</div>
	</CardFooter>
</Card>
