<script lang="ts">
	import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$ui/card';
	import { Label } from '$ui/label';
	import { Separator } from '$ui/separator';
	import { Switch } from '$ui/switch';
	import { Cpu, History } from '@lucide/svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import {
		AlertDialog,
		AlertDialogAction,
		AlertDialogCancel,
		AlertDialogContent,
		AlertDialogDescription,
		AlertDialogFooter,
		AlertDialogHeader,
		AlertDialogTitle
	} from '$ui/alert-dialog';

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
	import FlavorControls from '$components/simulation/FlavorControls.svelte';
	import type { SimulationFlavor } from '$boid/animation/types';
	import { Button } from '$ui/button';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$ui/tabs';

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

	// Dialog state
	let flavorDialogOpen = $state(false);
	let resetDialogOpen = $state(false);
	let defaultsDialogOpen = $state(false);
	let pendingFlavor: SimulationFlavor | null = $state(null);
	let pendingFlavorCancelCallback: (() => void) | undefined = $state(undefined);

	function handleFlavorChange(flavor: SimulationFlavor, onCancel?: () => void): void {
		if (flavor !== simulationConfig.simulationFlavor.default) {
			pendingFlavor = flavor;
			pendingFlavorCancelCallback = onCancel;
			flavorDialogOpen = true;
		}
	}

	function confirmFlavorChange(): void {
		if (pendingFlavor) {
			updateSimulationConfig('simulationFlavor', { default: pendingFlavor });
			pendingFlavor = null;
		}
		pendingFlavorCancelCallback = undefined;
		flavorDialogOpen = false;
	}

	function handleResetClick(): void {
		resetDialogOpen = true;
	}

	function confirmReset(): void {
		resetSimulation();
		resetDialogOpen = false;
	}

	function handleDefaultsClick(): void {
		defaultsDialogOpen = true;
	}

	function confirmDefaults(): void {
		resetToDefaults();
		defaultsDialogOpen = false;
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
			<PlaybackControls
				{isPlaying}
				onTogglePlayPause={togglePlayPause}
				onReset={handleResetClick}
			/>

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
					onclick={handleDefaultsClick}
					title="Reset to defaults"
				>
					<History class="mr-1 h-3.5 w-3.5" />
					Defaults
				</Button>
			</div>
		</div>

		<!-- Tabbed Settings Interface -->
		<Tabs value="general" class="w-full">
			<TabsList class="grid w-full grid-cols-2">
				<TabsTrigger value="general">General</TabsTrigger>
				<TabsTrigger value="fun">Fun</TabsTrigger>
			</TabsList>

			<TabsContent value="general" class="mt-4 space-y-4">
				<!-- Population Settings -->
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
			</TabsContent>

			<TabsContent value="fun" class="mt-4 space-y-4">
				<!-- Environment Flavor Section -->
				<div class="space-y-2">
					<h3 class="mb-2 text-sm font-medium text-muted-foreground">Environment Flavor</h3>
					<div class="p-2">
						<FlavorControls
							currentFlavor={simulationConfig.simulationFlavor.default as SimulationFlavor}
							onFlavorChange={handleFlavorChange}
						/>
					</div>
				</div>
			</TabsContent>
		</Tabs>
	</CardContent>
	<CardFooter class="border-t border-border py-4">
		<div class="text-xs text-muted-foreground">
			Changes to population counts, obstacles, and environment will apply on Reset
		</div>
	</CardFooter>
</Card>

<!-- Confirmation Dialogs -->
<AlertDialog bind:open={flavorDialogOpen}>
	<AlertDialogContent>
		<AlertDialogHeader>
			<AlertDialogTitle>Change Environment?</AlertDialogTitle>
			<AlertDialogDescription>
				This will <span class="font-semibold text-destructive">restart the simulation</span> and
				switch to <span class="font-semibold uppercase text-primary">{pendingFlavor}</span> themed sprites
				and background. All current boids will be recreated. Continue?
			</AlertDialogDescription>
		</AlertDialogHeader>
		<AlertDialogFooter>
			<AlertDialogCancel onclick={() => {
				if (pendingFlavorCancelCallback) {
					pendingFlavorCancelCallback();
				}
				pendingFlavor = null;
				pendingFlavorCancelCallback = undefined;
				flavorDialogOpen = false;
			}}>Cancel</AlertDialogCancel>
			<AlertDialogAction
				class="bg-destructive transition-colors duration-300 ease-in-out hover:bg-red-400 dark:hover:bg-red-700"
				onclick={confirmFlavorChange}
				>Change to<span class="capitalize">{pendingFlavor}</span></AlertDialogAction
			>
		</AlertDialogFooter>
	</AlertDialogContent>
</AlertDialog>

<AlertDialog bind:open={resetDialogOpen}>
	<AlertDialogContent>
		<AlertDialogHeader>
			<AlertDialogTitle>Restart Simulation?</AlertDialogTitle>
			<AlertDialogDescription>
				This will <span class="font-semibold text-destructive">restart the simulation</span> with current
				settings. All boids will be recreated and positioned randomly.
			</AlertDialogDescription>
		</AlertDialogHeader>
		<AlertDialogFooter>
			<AlertDialogCancel onclick={() => (resetDialogOpen = false)}>Cancel</AlertDialogCancel>
			<AlertDialogAction
				class="bg-destructive transition-colors duration-300 ease-in-out hover:bg-red-400 dark:hover:bg-red-700"
				onclick={confirmReset}>Reset</AlertDialogAction
			>
		</AlertDialogFooter>
	</AlertDialogContent>
</AlertDialog>

<AlertDialog bind:open={defaultsDialogOpen}>
	<AlertDialogContent>
		<AlertDialogHeader>
			<AlertDialogTitle>Reset to Defaults?</AlertDialogTitle>
			<AlertDialogDescription>
				This will <span class="font-semibold text-destructive">reset ALL simulation settings</span> to
				their default values AND restart the simulation.
			</AlertDialogDescription>
		</AlertDialogHeader>
		<AlertDialogFooter>
			<AlertDialogCancel onclick={() => (defaultsDialogOpen = false)}>Cancel</AlertDialogCancel>
			<AlertDialogAction
				class="bg-destructive transition-colors duration-300 ease-in-out hover:bg-red-400 dark:hover:bg-red-700"
				onclick={confirmDefaults}>Reset to Defaults</AlertDialogAction
			>
		</AlertDialogFooter>
	</AlertDialogContent>
</AlertDialog>
