<!-- src/lib/components/BoidConfigPanel.svelte -->
<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$ui/card';
	import { Button } from '$ui/button';
	import { Label } from '$ui/label';
	import { Slider } from '$ui/slider';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$ui/tabs';
	import { RotateCcw, SlidersVertical } from '@lucide/svelte';
	import { getBoidConfig, updateBoidConfig, resetToDefaults } from '$config/index.svelte';

	// Track config
	const config = $derived(getBoidConfig());

	// Update handlers
	function updateAlignmentWeight(value: number) {
		updateBoidConfig('alignmentWeight', value);
	}

	function updateCohesionWeight(value: number) {
		updateBoidConfig('cohesionWeight', value);
	}

	function updateSeparationWeight(value: number) {
		updateBoidConfig('separationWeight', value);
	}

	function updatePerceptionRadius(value: number) {
		updateBoidConfig('perceptionRadius', value);
	}

	function updateSeparationRadius(value: number) {
		updateBoidConfig('separationRadius', value);
	}

	function updateBoundaryMargin(value: number) {
		updateBoidConfig('boundaryMargin', value);
	}

	function updateBoundaryForce(value: number) {
		updateBoidConfig('boundaryForceMultiplier', value);
	}

	function updateBoundaryRamp(value: number) {
		updateBoidConfig('boundaryForceRamp', value);
	}

	function updateObstaclePerceptionRadius(value: number) {
		updateBoidConfig('obstaclePerceptionRadius', value);
	}

	function updateObstacleForce(value: number) {
		updateBoidConfig('obstacleForceMultiplier', value);
	}

	function updateMaxSpeed(value: number) {
		updateBoidConfig('maxSpeed', value);
	}

	function updateMaxForce(value: number) {
		updateBoidConfig('maxForce', value);
	}

	function handleReset() {
		resetToDefaults();
	}
</script>

<Card class="w-full shadow-md">
	<CardHeader class="pb-2">
		<div class="flex items-center justify-between">
			<CardTitle class="flex items-center text-lg">
				<SlidersVertical class="mr-2 h-5 w-5" />
				Boid Parameters
			</CardTitle>
			<Button
				variant="ghost"
				size="sm"
				class="h-8 px-2 text-xs"
				onclick={handleReset}
				title="Reset to defaults"
			>
				<RotateCcw class="mr-1 h-3.5 w-3.5" />
				Reset
			</Button>
		</div>
	</CardHeader>
	<CardContent>
		<Tabs value="flocking">
			<TabsList class="mb-4 grid grid-cols-3">
				<TabsTrigger value="flocking">Flocking</TabsTrigger>
				<TabsTrigger value="avoidance">Avoidance</TabsTrigger>
				<TabsTrigger value="movement">Movement</TabsTrigger>
			</TabsList>

			<!-- Flocking Behavior Tab -->
			<TabsContent value="flocking" class="space-y-4">
				<div class="space-y-4">
					<div class="space-y-2">
						<div class="flex justify-between">
							<Label for="alignment-weight">Alignment</Label>
							<span class="text-muted-foreground font-mono text-xs">
								{config.alignmentWeight.toFixed(1)}
							</span>
						</div>
						<Slider
							type="single"
							id="alignment-weight"
							min={0}
							max={2}
							step={0.1}
							value={config.alignmentWeight}
							onValueChange={updateAlignmentWeight}
						/>
					</div>

					<div class="space-y-2">
						<div class="flex justify-between">
							<Label for="cohesion-weight">Cohesion</Label>
							<span class="text-muted-foreground font-mono text-xs">
								{config.cohesionWeight.toFixed(1)}
							</span>
						</div>
						<Slider
							type="single"
							id="cohesion-weight"
							min={0}
							max={2}
							step={0.1}
							value={config.cohesionWeight}
							onValueChange={updateCohesionWeight}
						/>
					</div>

					<div class="space-y-2">
						<div class="flex justify-between">
							<Label for="separation-weight">Separation</Label>
							<span class="text-muted-foreground font-mono text-xs">
								{config.separationWeight.toFixed(1)}
							</span>
						</div>
						<Slider
							type="single"
							id="separation-weight"
							min={0}
							max={3}
							step={0.1}
							value={config.separationWeight}
							onValueChange={updateSeparationWeight}
						/>
					</div>

					<div class="space-y-2">
						<div class="flex justify-between">
							<Label for="perception-radius">Perception Radius</Label>
							<span class="text-muted-foreground font-mono text-xs">
								{config.perceptionRadius.toFixed(0)}px
							</span>
						</div>
						<Slider
							type="single"
							id="perception-radius"
							min={20}
							max={200}
							step={5}
							value={config.perceptionRadius}
							onValueChange={updatePerceptionRadius}
						/>
					</div>

					<div class="space-y-2">
						<div class="flex justify-between">
							<Label for="separation-radius">Separation Radius</Label>
							<span class="text-muted-foreground font-mono text-xs">
								{config.separationRadius.toFixed(0)}px
							</span>
						</div>
						<Slider
							type="single"
							id="separation-radius"
							min={10}
							max={100}
							step={5}
							value={config.separationRadius}
							onValueChange={updateSeparationRadius}
						/>
					</div>
				</div>
			</TabsContent>

			<!-- Avoidance Tab -->
			<TabsContent value="avoidance" class="space-y-4">
				<div class="space-y-4">
					<div class="space-y-2">
						<div class="flex justify-between">
							<Label for="boundary-margin">Boundary Margin</Label>
							<span class="text-muted-foreground font-mono text-xs">
								{config.boundaryMargin.toFixed(0)}px
							</span>
						</div>
						<Slider
							type="single"
							id="boundary-margin"
							min={50}
							max={200}
							step={10}
							value={config.boundaryMargin}
							onValueChange={updateBoundaryMargin}
						/>
					</div>

					<div class="space-y-2">
						<div class="flex justify-between">
							<Label for="boundary-force">Boundary Force</Label>
							<span class="text-muted-foreground font-mono text-xs">
								{config.boundaryForceMultiplier.toFixed(1)}x
							</span>
						</div>
						<Slider
							type="single"
							id="boundary-force"
							min={1}
							max={5}
							step={0.1}
							value={config.boundaryForceMultiplier}
							onValueChange={updateBoundaryForce}
						/>
					</div>

					<div class="space-y-2">
						<div class="flex justify-between">
							<Label for="boundary-ramp">Boundary Ramp</Label>
							<span class="text-muted-foreground font-mono text-xs">
								{config.boundaryForceRamp.toFixed(1)}
							</span>
						</div>
						<Slider
							type="single"
							id="boundary-ramp"
							min={1}
							max={4}
							step={0.1}
							value={config.boundaryForceRamp}
							onValueChange={updateBoundaryRamp}
						/>
					</div>

					<div class="space-y-2">
						<div class="flex justify-between">
							<Label for="obstacle-perception">Obstacle Perception</Label>
							<span class="text-muted-foreground font-mono text-xs">
								{config.obstaclePerceptionRadius.toFixed(0)}px
							</span>
						</div>
						<Slider
							type="single"
							id="obstacle-perception"
							min={50}
							max={250}
							step={10}
							value={config.obstaclePerceptionRadius}
							onValueChange={updateObstaclePerceptionRadius}
						/>
					</div>

					<div class="space-y-2">
						<div class="flex justify-between">
							<Label for="obstacle-force">Obstacle Force</Label>
							<span class="text-muted-foreground font-mono text-xs">
								{config.obstacleForceMultiplier.toFixed(1)}x
							</span>
						</div>
						<Slider
							type="single"
							id="obstacle-force"
							min={1}
							max={6}
							step={0.2}
							value={config.obstacleForceMultiplier}
							onValueChange={updateObstacleForce}
						/>
					</div>
				</div>
			</TabsContent>

			<!-- Movement Tab -->
			<TabsContent value="movement" class="space-y-4">
				<div class="space-y-4">
					<div class="space-y-2">
						<div class="flex justify-between">
							<Label for="max-speed">Max Speed</Label>
							<span class="text-muted-foreground font-mono text-xs">
								{config.maxSpeed.toFixed(0)}
							</span>
						</div>
						<Slider
							type="single"
							id="max-speed"
							min={50}
							max={300}
							step={10}
							value={config.maxSpeed}
							onValueChange={updateMaxSpeed}
						/>
					</div>

					<div class="space-y-2">
						<div class="flex justify-between">
							<Label for="max-force">Max Force</Label>
							<span class="text-muted-foreground font-mono text-xs">
								{config.maxForce.toFixed(1)}
							</span>
						</div>
						<Slider
							type="single"
							id="max-force"
							min={0.2}
							max={3}
							step={0.1}
							value={config.maxForce}
							onValueChange={updateMaxForce}
						/>
					</div>
				</div>
			</TabsContent>
		</Tabs>
	</CardContent>
</Card>
