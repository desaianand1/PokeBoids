<!-- src/lib/components/BoidConfigPanel.svelte -->
<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$ui/card';
	import { Button } from '$ui/button';
	import { Label } from '$ui/label';
	import { Slider } from '$ui/slider';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$ui/tabs';
	import { RotateCcw, SlidersVertical } from '@lucide/svelte';
	import {
		getBoidConfig,
		updateBoidConfig,
		resetToDefaults
	} from '$config/simulation-signals.svelte';

	const boidConfig = $derived(getBoidConfig());
</script>

<Card class="w-full shadow-md">
	<CardHeader class="pb-2">
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
							<span class="font-mono text-xs text-muted-foreground">
								{boidConfig.alignmentWeight.toFixed(1)}
							</span>
						</div>
						<Slider
							type="single"
							id="alignment-weight"
							min={0}
							max={2}
							step={0.1}
							value={boidConfig.alignmentWeight}
							onValueChange={(value) => updateBoidConfig('alignmentWeight', value)}
						/>
					</div>

					<div class="space-y-2">
						<div class="flex justify-between">
							<Label for="cohesion-weight">Cohesion</Label>
							<span class="font-mono text-xs text-muted-foreground">
								{boidConfig.cohesionWeight.toFixed(1)}
							</span>
						</div>
						<Slider
							type="single"
							id="cohesion-weight"
							min={0}
							max={2}
							step={0.1}
							value={boidConfig.cohesionWeight}
							onValueChange={(value) => updateBoidConfig('cohesionWeight', value)}
						/>
					</div>

					<div class="space-y-2">
						<div class="flex justify-between">
							<Label for="separation-weight">Separation</Label>
							<span class="font-mono text-xs text-muted-foreground">
								{boidConfig.separationWeight.toFixed(1)}
							</span>
						</div>
						<Slider
							type="single"
							id="separation-weight"
							min={0}
							max={3}
							step={0.1}
							value={boidConfig.separationWeight}
							onValueChange={(value) => updateBoidConfig('separationWeight', value)}
						/>
					</div>

					<div class="space-y-2">
						<div class="flex justify-between">
							<Label for="perception-radius">Perception Radius</Label>
							<span class="font-mono text-xs text-muted-foreground">
								{boidConfig.perceptionRadius.toFixed(0)}px
							</span>
						</div>
						<Slider
							type="single"
							id="perception-radius"
							min={20}
							max={200}
							step={5}
							value={boidConfig.perceptionRadius}
							onValueChange={(value) => updateBoidConfig('perceptionRadius', value)}
						/>
					</div>

					<div class="space-y-2">
						<div class="flex justify-between">
							<Label for="separation-radius">Separation Radius</Label>
							<span class="font-mono text-xs text-muted-foreground">
								{boidConfig.separationRadius.toFixed(0)}px
							</span>
						</div>
						<Slider
							type="single"
							id="separation-radius"
							min={10}
							max={100}
							step={5}
							value={boidConfig.separationRadius}
							onValueChange={(value) => updateBoidConfig('separationRadius', value)}
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
							<span class="font-mono text-xs text-muted-foreground">
								{boidConfig.boundaryMargin.toFixed(0)}px
							</span>
						</div>
						<Slider
							type="single"
							id="boundary-margin"
							min={50}
							max={200}
							step={10}
							value={boidConfig.boundaryMargin}
							onValueChange={(value) => updateBoidConfig('boundaryMargin', value)}
						/>
					</div>

					<div class="space-y-2">
						<div class="flex justify-between">
							<Label for="boundary-force">Boundary Force</Label>
							<span class="font-mono text-xs text-muted-foreground">
								{boidConfig.boundaryForceMultiplier.toFixed(1)}x
							</span>
						</div>
						<Slider
							type="single"
							id="boundary-force"
							min={1}
							max={5}
							step={0.1}
							value={boidConfig.boundaryForceMultiplier}
							onValueChange={(value) => updateBoidConfig('boundaryForceMultiplier', value)}
						/>
					</div>

					<div class="space-y-2">
						<div class="flex justify-between">
							<Label for="boundary-ramp">Boundary Ramp</Label>
							<span class="font-mono text-xs text-muted-foreground">
								{boidConfig.boundaryForceRamp.toFixed(1)}
							</span>
						</div>
						<Slider
							type="single"
							id="boundary-ramp"
							min={1}
							max={4}
							step={0.1}
							value={boidConfig.boundaryForceRamp}
							onValueChange={(value) => updateBoidConfig('boundaryForceRamp', value)}
						/>
					</div>

					<div class="space-y-2">
						<div class="flex justify-between">
							<Label for="obstacle-perception">Obstacle Perception</Label>
							<span class="font-mono text-xs text-muted-foreground">
								{boidConfig.obstaclePerceptionRadius.toFixed(0)}px
							</span>
						</div>
						<Slider
							type="single"
							id="obstacle-perception"
							min={50}
							max={250}
							step={10}
							value={boidConfig.obstaclePerceptionRadius}
							onValueChange={(value) => updateBoidConfig('obstaclePerceptionRadius', value)}
						/>
					</div>

					<div class="space-y-2">
						<div class="flex justify-between">
							<Label for="obstacle-force">Obstacle Force</Label>
							<span class="font-mono text-xs text-muted-foreground">
								{boidConfig.obstacleForceMultiplier.toFixed(1)}x
							</span>
						</div>
						<Slider
							type="single"
							id="obstacle-force"
							min={1}
							max={6}
							step={0.2}
							value={boidConfig.obstacleForceMultiplier}
							onValueChange={(value) => updateBoidConfig('obstacleForceMultiplier', value)}
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
							<span class="font-mono text-xs text-muted-foreground">
								{boidConfig.maxSpeed.toFixed(0)}
							</span>
						</div>
						<Slider
							type="single"
							id="max-speed"
							min={50}
							max={300}
							step={10}
							value={boidConfig.maxSpeed}
							onValueChange={(value) => updateBoidConfig('maxSpeed', value)}
						/>
					</div>

					<div class="space-y-2">
						<div class="flex justify-between">
							<Label for="max-force">Max Force</Label>
							<span class="font-mono text-xs text-muted-foreground">
								{boidConfig.maxForce.toFixed(1)}
							</span>
						</div>
						<Slider
							type="single"
							id="max-force"
							min={0.2}
							max={3}
							step={0.1}
							value={boidConfig.maxForce}
							onValueChange={(value) => updateBoidConfig('maxForce', value)}
						/>
					</div>
				</div>
			</TabsContent>
		</Tabs>
	</CardContent>
</Card>
