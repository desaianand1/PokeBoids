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
								{boidConfig.alignmentWeight.default.toFixed(1)}
							</span>
						</div>
						<Slider
							type="single"
							id="alignment-weight"
							min={boidConfig.alignmentWeight.min}
							max={boidConfig.alignmentWeight.max}
							step={boidConfig.alignmentWeight.step}
							value={boidConfig.alignmentWeight.default}
							onValueChange={(value) => updateBoidConfig('alignmentWeight', { ...boidConfig.alignmentWeight, default: value })}
						/>
					</div>

					<div class="space-y-2">
						<div class="flex justify-between">
							<Label for="cohesion-weight">Cohesion</Label>
							<span class="font-mono text-xs text-muted-foreground">
								{boidConfig.cohesionWeight.default.toFixed(1)}
							</span>
						</div>
						<Slider
							type="single"
							id="cohesion-weight"
							min={boidConfig.cohesionWeight.min}
							max={boidConfig.cohesionWeight.max}
							step={boidConfig.cohesionWeight.step}
							value={boidConfig.cohesionWeight.default}
							onValueChange={(value) => updateBoidConfig('cohesionWeight', { ...boidConfig.cohesionWeight, default: value })}
						/>
					</div>

					<div class="space-y-2">
						<div class="flex justify-between">
							<Label for="separation-weight">Separation</Label>
							<span class="font-mono text-xs text-muted-foreground">
								{boidConfig.separationWeight.default.toFixed(1)}
							</span>
						</div>
						<Slider
							type="single"
							id="separation-weight"
							min={boidConfig.separationWeight.min}
							max={boidConfig.separationWeight.max}
							step={boidConfig.separationWeight.step}
							value={boidConfig.separationWeight.default}
							onValueChange={(value) => updateBoidConfig('separationWeight', { ...boidConfig.separationWeight, default: value })}
						/>
					</div>

					<div class="space-y-2">
						<div class="flex justify-between">
							<Label for="perception-radius">Perception Radius</Label>
							<span class="font-mono text-xs text-muted-foreground">
								{boidConfig.perceptionRadius.default.toFixed(0)}px
							</span>
						</div>
						<Slider
							type="single"
							id="perception-radius"
							min={boidConfig.perceptionRadius.min}
							max={boidConfig.perceptionRadius.max}
							step={boidConfig.perceptionRadius.step}
							value={boidConfig.perceptionRadius.default}
							onValueChange={(value) => updateBoidConfig('perceptionRadius', { ...boidConfig.perceptionRadius, default: value })}
						/>
					</div>

					<div class="space-y-2">
						<div class="flex justify-between">
							<Label for="separation-radius">Separation Radius</Label>
							<span class="font-mono text-xs text-muted-foreground">
								{boidConfig.separationRadius.default.toFixed(0)}px
							</span>
						</div>
						<Slider
							type="single"
							id="separation-radius"
							min={boidConfig.separationRadius.min}
							max={boidConfig.separationRadius.max}
							step={boidConfig.separationRadius.step}
							value={boidConfig.separationRadius.default}
							onValueChange={(value) => updateBoidConfig('separationRadius', { ...boidConfig.separationRadius, default: value })}
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
								{boidConfig.boundaryMargin.default.toFixed(0)}px
							</span>
						</div>
						<Slider
							type="single"
							id="boundary-margin"
							min={boidConfig.boundaryMargin.min}
							max={boidConfig.boundaryMargin.max}
							step={boidConfig.boundaryMargin.step}
							value={boidConfig.boundaryMargin.default}
							onValueChange={(value) => updateBoidConfig('boundaryMargin', { ...boidConfig.boundaryMargin, default: value })}
						/>
					</div>

					<div class="space-y-2">
						<div class="flex justify-between">
							<Label for="boundary-force">Boundary Force</Label>
							<span class="font-mono text-xs text-muted-foreground">
								{boidConfig.boundaryForceMultiplier.default.toFixed(1)}x
							</span>
						</div>
						<Slider
							type="single"
							id="boundary-force"
							min={boidConfig.boundaryForceMultiplier.min}
							max={boidConfig.boundaryForceMultiplier.max}
							step={boidConfig.boundaryForceMultiplier.step}
							value={boidConfig.boundaryForceMultiplier.default}
							onValueChange={(value) => updateBoidConfig('boundaryForceMultiplier', { ...boidConfig.boundaryForceMultiplier, default: value })}
						/>
					</div>

					<div class="space-y-2">
						<div class="flex justify-between">
							<Label for="boundary-ramp">Boundary Ramp</Label>
							<span class="font-mono text-xs text-muted-foreground">
								{boidConfig.boundaryForceRamp.default.toFixed(1)}
							</span>
						</div>
						<Slider
							type="single"
							id="boundary-ramp"
							min={boidConfig.boundaryForceRamp.min}
							max={boidConfig.boundaryForceRamp.max}
							step={boidConfig.boundaryForceRamp.step}
							value={boidConfig.boundaryForceRamp.default}
							onValueChange={(value) => updateBoidConfig('boundaryForceRamp', { ...boidConfig.boundaryForceRamp, default: value })}
						/>
					</div>

					<div class="space-y-2">
						<div class="flex justify-between">
							<Label for="obstacle-perception">Obstacle Perception</Label>
							<span class="font-mono text-xs text-muted-foreground">
								{boidConfig.obstaclePerceptionRadius.default.toFixed(0)}px
							</span>
						</div>
						<Slider
							type="single"
							id="obstacle-perception"
							min={boidConfig.obstaclePerceptionRadius.min}
							max={boidConfig.obstaclePerceptionRadius.max}
							step={boidConfig.obstaclePerceptionRadius.step}
							value={boidConfig.obstaclePerceptionRadius.default}
							onValueChange={(value) => updateBoidConfig('obstaclePerceptionRadius', { ...boidConfig.obstaclePerceptionRadius, default: value })}
						/>
					</div>

					<div class="space-y-2">
						<div class="flex justify-between">
							<Label for="obstacle-force">Obstacle Force</Label>
							<span class="font-mono text-xs text-muted-foreground">
								{boidConfig.obstacleForceMultiplier.default.toFixed(1)}x
							</span>
						</div>
						<Slider
							type="single"
							id="obstacle-force"
							min={boidConfig.obstacleForceMultiplier.min}
							max={boidConfig.obstacleForceMultiplier.max}
							step={boidConfig.obstacleForceMultiplier.step}
							value={boidConfig.obstacleForceMultiplier.default}
							onValueChange={(value) => updateBoidConfig('obstacleForceMultiplier', { ...boidConfig.obstacleForceMultiplier, default: value })}
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
								{boidConfig.maxSpeed.default.toFixed(0)}
							</span>
						</div>
						<Slider
							type="single"
							id="max-speed"
							min={boidConfig.maxSpeed.min}
							max={boidConfig.maxSpeed.max}
							step={boidConfig.maxSpeed.step}
							value={boidConfig.maxSpeed.default}
							onValueChange={(value) => updateBoidConfig('maxSpeed', { ...boidConfig.maxSpeed, default: value })}
						/>
					</div>

					<div class="space-y-2">
						<div class="flex justify-between">
							<Label for="max-force">Max Force</Label>
							<span class="font-mono text-xs text-muted-foreground">
								{boidConfig.maxForce.default.toFixed(1)}
							</span>
						</div>
						<Slider
							type="single"
							id="max-force"
							min={boidConfig.maxForce.min}
							max={boidConfig.maxForce.max}
							step={boidConfig.maxForce.step}
							value={boidConfig.maxForce.default}
							onValueChange={(value) => updateBoidConfig('maxForce', { ...boidConfig.maxForce, default: value })}
						/>
					</div>
				</div>
			</TabsContent>
		</Tabs>
	</CardContent>
</Card>
