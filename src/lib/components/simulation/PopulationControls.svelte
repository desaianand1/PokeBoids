<script lang="ts">
	import { Slider } from '$ui/slider';
	import { Input } from '$ui/input';
	import { Label } from '$ui/label';
	import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '$ui/tooltip';
	import type { Parameter } from '$config/types';

	interface PopulationControlsProps {
		initialPreyCount: Parameter<number>;
		initialPredatorCount: Parameter<number>;
		obstacleCount: Parameter<number>;
		onUpdate: (
			key: 'initialPreyCount' | 'initialPredatorCount' | 'obstacleCount',
			value: Parameter<number>
		) => void;
	}

	const {
		initialPreyCount,
		initialPredatorCount,
		obstacleCount,
		onUpdate
	}: PopulationControlsProps = $props();

	// Create a generic update handler that works for both slider and input
	function handleUpdate(
		key: 'initialPreyCount' | 'initialPredatorCount' | 'obstacleCount',
		value: number
	) {
		const param = {
			initialPreyCount,
			initialPredatorCount,
			obstacleCount
		}[key];

		// Ensure value is within bounds
		const boundedValue = Math.max(param.min, Math.min(param.max, value));

		// Only update if the value is valid and different
		if (boundedValue !== param.default) {
			onUpdate(key, { ...param, default: boundedValue });
		}

		// Return the bounded value for the input field to use
		return boundedValue;
	}
</script>

<TooltipProvider>
	<div class="grid grid-rows-3 gap-12 md:grid-cols-3 md:grid-rows-none">
		<!-- Prey Count -->
		<div class="space-y-4">
			<div class="flex items-center justify-between">
				<Label for="prey-slider" class="text-sm font-medium">Prey Count</Label>
				<div class="flex items-center gap-1">
					<Tooltip>
						<TooltipTrigger>
							<div class="flex items-center gap-1">
								<Input
									type="number"
									id="prey-input"
									class="ml-2 w-20 text-center"
									min={initialPreyCount.min}
									max={initialPreyCount.max}
									value={initialPreyCount.default}
									onchange={(e) =>
										handleUpdate(
											'initialPreyCount',
											parseInt(e.currentTarget.value, 10) || initialPreyCount.default
										)}
									onblur={(e) => {
										const value = handleUpdate(
											'initialPreyCount',
											parseInt(e.currentTarget.value, 10) || initialPreyCount.default
										);
										e.currentTarget.value = value.toString();
									}}
								/>
								<span class="text-xs text-muted-foreground">/ {initialPreyCount.max}</span>
							</div>
						</TooltipTrigger>
						<TooltipContent>Range: {initialPreyCount.min}-{initialPreyCount.max}</TooltipContent>
					</Tooltip>
				</div>
			</div>
			<Slider
				type="single"
				id="prey-slider"
				min={initialPreyCount.min}
				max={initialPreyCount.max}
				step={1}
				value={initialPreyCount.default}
				onValueChange={(value) => handleUpdate('initialPreyCount', value)}
			/>
		</div>

		<!-- Predator Count -->
		<div class="space-y-4">
			<div class="flex items-center justify-between">
				<Label for="predator-slider" class="text-sm font-medium">Predator Count</Label>
				<div class="flex items-center gap-1">
					<Tooltip>
						<TooltipTrigger>
							<div class="flex items-center gap-1">
								<Input
									type="number"
									id="predator-input"
									class="ml-2 w-20 text-center"
									min={initialPredatorCount.min}
									max={initialPredatorCount.max}
									value={initialPredatorCount.default}
									onchange={(e) =>
										handleUpdate(
											'initialPredatorCount',
											parseInt(e.currentTarget.value, 10) || initialPredatorCount.default
										)}
									onblur={(e) => {
										const value = handleUpdate(
											'initialPredatorCount',
											parseInt(e.currentTarget.value, 10) || initialPredatorCount.default
										);
										e.currentTarget.value = value.toString();
									}}
								/>
								<span class="text-xs text-muted-foreground">/ {initialPredatorCount.max}</span>
							</div>
						</TooltipTrigger>
						<TooltipContent
							>Range: {initialPredatorCount.min}-{initialPredatorCount.max}</TooltipContent
						>
					</Tooltip>
				</div>
			</div>
			<Slider
				type="single"
				id="predator-slider"
				min={initialPredatorCount.min}
				max={initialPredatorCount.max}
				step={1}
				value={initialPredatorCount.default}
				onValueChange={(value) => handleUpdate('initialPredatorCount', value)}
			/>
		</div>

		<!-- Obstacle Count -->
		<div class="space-y-4">
			<div class="flex items-center justify-between">
				<Label for="obstacle-slider" class="text-sm font-medium">Obstacles</Label>
				<div class="flex items-center gap-1">
					<Tooltip>
						<TooltipTrigger>
							<div class="flex items-center gap-1">
								<Input
									type="number"
									id="obstacle-input"
									class="ml-2 w-20 text-center"
									min={obstacleCount.min}
									max={obstacleCount.max}
									value={obstacleCount.default}
									onchange={(e) =>
										handleUpdate(
											'obstacleCount',
											parseInt(e.currentTarget.value, 10) || obstacleCount.default
										)}
									onblur={(e) => {
										const value = handleUpdate(
											'obstacleCount',
											parseInt(e.currentTarget.value, 10) || obstacleCount.default
										);
										e.currentTarget.value = value.toString();
									}}
								/>
								<span class="text-xs text-muted-foreground">/ {obstacleCount.max}</span>
							</div>
						</TooltipTrigger>
						<TooltipContent>Range: {obstacleCount.min}-{obstacleCount.max}</TooltipContent>
					</Tooltip>
				</div>
			</div>
			<Slider
				type="single"
				id="obstacle-slider"
				min={obstacleCount.min}
				max={obstacleCount.max}
				step={1}
				value={obstacleCount.default}
				onValueChange={(value) => handleUpdate('obstacleCount', value)}
			/>
		</div>
	</div>
</TooltipProvider>
