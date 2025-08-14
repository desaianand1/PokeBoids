<script lang="ts">
	import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$ui/card';
	import { Label } from '$ui/label';
	import { Separator } from '$ui/separator';
	import { Switch } from '$ui/switch';
	import { MediaQuery } from 'svelte/reactivity';
	import { ResponsiveDialog } from '$ui/responsive-dialog';
	import { AlertDialogAction, AlertDialogCancel } from '$ui/alert-dialog';

	import {
		isSimulationPlaying,
		getCurrentSimulationSpeed,
		getDebugMode,
		togglePlayPause,
		toggleDebugMode,
		restartSimulation,
		updateSimulationConfig,
		getSimulationConfig,
		slowSimulationSpeed,
		advanceSimulationSpeed,
		getSimulationSpeedRange,
		resetToDefaults
	} from '$config/simulation-signals.svelte';

	// Import subcomponents
	import PlaybackControls from '$sidebar/sim-panel/PlaybackControls.svelte';
	import SpeedControls from '$sidebar/sim-panel/SpeedControls.svelte';
	import PopulationControls from '$sidebar/sim-panel/PopulationControls.svelte';
	import BoundaryModeControls from '$sidebar/sim-panel/BoundaryModeControls.svelte';
	import FlavorControls from '$sidebar/sim-panel/FlavorControls.svelte';
	import type { SimulationFlavor } from '$boid/animation/types';
	import { Button, buttonVariants } from '$ui/button';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$ui/tabs';
	import { OctagonAlert, Cpu, History, Replace } from 'lucide-svelte';
	import { DrawerClose } from '$ui/drawer';

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
	let restartDialogOpen = $state(false);
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

	function handleRestartClick(): void {
		restartDialogOpen = true;
	}

	function confirmRestart(): void {
		restartSimulation();
		restartDialogOpen = false;
	}

	function handleDefaultsClick(): void {
		defaultsDialogOpen = true;
	}

	async function confirmDefaultsAndRestartAsync(): Promise<void> {
		const defaultThenRestartPromise = new Promise<void>((resolve) => {
			resetToDefaults();

			setTimeout(() => {
				restartSimulation();
				resolve();
			}, 1000);
		});
		defaultsDialogOpen = false;
		await defaultThenRestartPromise;
	}
</script>

<Card class="w-full shadow-md">
	<CardHeader class="pb-4">
		<CardTitle class="flex items-center text-lg">
			<Cpu class="mr-2 size-5" />
			Simulation Controls
		</CardTitle>
	</CardHeader>
	<CardContent class="space-y-8">
		<!-- Playback Controls -->
		<div class="flex flex-col items-center gap-4 lg:flex-row lg:overflow-x-auto">
			<!-- Playback Group -->
			<PlaybackControls
				{isPlaying}
				onTogglePlayPause={togglePlayPause}
				onReset={handleRestartClick}
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
			Changes to population counts, obstacles, and environment will apply on <span
				class="font-medium underline">Restart</span
			>
		</div>
	</CardFooter>
</Card>

<!-- Confirmation Dialogs -->
<ResponsiveDialog bind:open={flavorDialogOpen}>
	{#snippet title()}
		<span class="inline-flex items-center justify-center gap-2 text-lg font-bold text-primary"
			><Replace class="stroke-2 text-primary" />Change Environment Flavor?</span
		>
	{/snippet}
	{#snippet description()}
		<p>
			This will
			<span class="text-destructive">restart the simulation</span>
			and switch to
			<span class="capitalize text-primary">{pendingFlavor}</span>
			themed background and sprites.
		</p>
		<p>All current boids will be recreated. Continue?</p>
	{/snippet}
	{#snippet footer(isDesktop: boolean)}
		{#if isDesktop}
			<AlertDialogCancel
				onclick={() => {
					if (pendingFlavorCancelCallback) {
						pendingFlavorCancelCallback();
					}
					pendingFlavor = null;
					pendingFlavorCancelCallback = undefined;
					flavorDialogOpen = false;
				}}>Cancel</AlertDialogCancel
			>
			<AlertDialogAction
				class={buttonVariants({ variant: 'default' })}
				onclick={confirmFlavorChange}
				>Change to <span class="m-0 p-0 capitalize">{pendingFlavor}</span></AlertDialogAction
			>
		{:else}
			<DrawerClose
				onclick={() => {
					if (pendingFlavorCancelCallback) {
						pendingFlavorCancelCallback();
					}
					pendingFlavor = null;
					pendingFlavorCancelCallback = undefined;
					flavorDialogOpen = false;
				}}
				class={buttonVariants({ variant: 'outline' })}
				>Cancel
			</DrawerClose>

			<Button variant="default" onclick={confirmFlavorChange}
				>Change to <span class="m-0 p-0 capitalize">{pendingFlavor}</span></Button
			>
		{/if}
	{/snippet}
</ResponsiveDialog>

<ResponsiveDialog bind:open={restartDialogOpen}>
	{#snippet title()}
		<span class="inline-flex items-center justify-center gap-2 text-lg font-bold text-destructive"
			><OctagonAlert class="stroke-2 text-destructive" />Restart Simulation?</span
		>
	{/snippet}
	{#snippet description()}
		<p>
			This will
			<span class="text-destructive">restart the simulation</span>
			with current settings.
		</p>
		<p>All boids will be recreated and positioned randomly.</p>
	{/snippet}
	{#snippet footer(isDesktop: boolean)}
		{#if isDesktop}
			<AlertDialogCancel onclick={() => (restartDialogOpen = false)}>Cancel</AlertDialogCancel>
			<AlertDialogAction class={buttonVariants({ variant: 'destructive' })} onclick={confirmRestart}
				>Restart Simulation</AlertDialogAction
			>
		{:else}
			<DrawerClose
				onclick={() => (restartDialogOpen = false)}
				class={buttonVariants({ variant: 'outline' })}
				>Cancel
			</DrawerClose>
			<Button variant="destructive" onclick={confirmRestart}>Restart Simulation</Button>
		{/if}
	{/snippet}
</ResponsiveDialog>

<ResponsiveDialog bind:open={defaultsDialogOpen}>
	{#snippet title()}
		<span class="inline-flex items-center justify-center gap-2 text-lg font-bold text-destructive"
			><OctagonAlert class="stroke-2 text-destructive" />Reset to Defaults?</span
		>
	{/snippet}
	{#snippet description()}
		<p>
			This will
			<span class="text-destructive">reset</span>
			ALL simulation & boid settings to their
			<span class="text-destructive">default values</span>
			AND
			<span class="text-destructive">restart</span>
			the simulation.
		</p>
	{/snippet}
	{#snippet footer(isDesktop: boolean)}
		{#if isDesktop}
			<AlertDialogCancel onclick={() => (defaultsDialogOpen = false)}>Cancel</AlertDialogCancel>
			<AlertDialogAction
				class={buttonVariants({ variant: 'destructive' })}
				onclick={confirmDefaultsAndRestartAsync}>Reset & Restart</AlertDialogAction
			>
		{:else}
			<DrawerClose
				onclick={() => (defaultsDialogOpen = false)}
				class={buttonVariants({ variant: 'outline' })}
				>Cancel
			</DrawerClose>
			<Button variant="destructive" onclick={confirmDefaultsAndRestartAsync}>Reset & Restart</Button
			>
		{/if}
	{/snippet}
</ResponsiveDialog>
