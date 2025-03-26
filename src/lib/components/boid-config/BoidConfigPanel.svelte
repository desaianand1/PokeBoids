<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$ui/card';
	import { Button } from '$ui/button';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$ui/tabs';
	import { RotateCcw, SlidersVertical } from '@lucide/svelte';
	import {
		getBoidConfig,
		updateBoidConfig,
		resetToDefaults
	} from '$config/simulation-signals.svelte';
	import type { BoidConfig } from '$config/types';

	// Import tab components
	import FlockingTab from '$components/boid-config/FlockingTab.svelte';
	import AvoidanceTab from '$components/boid-config/AvoidanceTab.svelte';
	import MovementTab from '$components/boid-config/MovementTab.svelte';

	// State
	let activeTab = $state('flocking');
	const boidConfig = $derived(getBoidConfig());

	// Helper function to create parameter update handler
	function handleUpdate<K extends keyof BoidConfig>(key: K, value: BoidConfig[K]): void {
		updateBoidConfig(key, value);
	}

	function handleTabChange(value: string): void {
		activeTab = value as 'flocking' | 'avoidance' | 'movement';
	}
</script>

<Card class="w-full shadow-md">
	<CardHeader class="pb-4">
		<div class="flex items-center justify-between">
			<CardTitle class="flex items-center text-lg">
				<SlidersVertical class="mr-2 h-5 w-5" />
				Boid Parameters
			</CardTitle>
			<Button
				variant="destructive"
				size="sm"
				class="h-8 px-2 text-xs"
				onclick={resetToDefaults}
				title="Reset to defaults"
			>
				<RotateCcw class="mr-1 h-3.5 w-3.5" />
				Reset
			</Button>
		</div>
	</CardHeader>
	<CardContent>
		<Tabs value={activeTab} onValueChange={handleTabChange} class="min-h-72">
			<TabsList class="mb-4 grid grid-cols-3">
				<TabsTrigger value="flocking">Flocking</TabsTrigger>
				<TabsTrigger value="avoidance">Avoidance</TabsTrigger>
				<TabsTrigger value="movement">Movement</TabsTrigger>
			</TabsList>

			<!-- Flocking Behavior Tab -->
			<TabsContent value="flocking" class="space-y-4">
				<FlockingTab
					alignmentWeight={boidConfig.alignmentWeight}
					cohesionWeight={boidConfig.cohesionWeight}
					separationWeight={boidConfig.separationWeight}
					perceptionRadius={boidConfig.perceptionRadius}
					separationRadius={boidConfig.separationRadius}
					fieldOfViewAngle={boidConfig.fieldOfViewAngle}
					onUpdate={handleUpdate}
				/>
			</TabsContent>

			<!-- Avoidance Tab -->
			<TabsContent value="avoidance" class="space-y-4">
				<AvoidanceTab
					boundaryMargin={boidConfig.boundaryMargin}
					boundaryForceMultiplier={boidConfig.boundaryForceMultiplier}
					boundaryForceRamp={boidConfig.boundaryForceRamp}
					obstaclePerceptionRadius={boidConfig.obstaclePerceptionRadius}
					obstacleForceMultiplier={boidConfig.obstacleForceMultiplier}
					onUpdate={handleUpdate}
				/>
			</TabsContent>

			<!-- Movement Tab -->
			<TabsContent value="movement" class="space-y-4">
				<MovementTab
					maxSpeed={boidConfig.maxSpeed}
					maxForce={boidConfig.maxForce}
					onUpdate={handleUpdate}
				/>
			</TabsContent>
		</Tabs>
	</CardContent>
</Card>
