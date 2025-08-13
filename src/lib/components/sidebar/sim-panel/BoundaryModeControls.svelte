<script lang="ts">
	import { Label } from '$ui/label';
	import { Switch } from '$ui/switch';
	import { Badge } from '$ui/badge';
	import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '$ui/tooltip';
	import { Box, SquareDashed, Earth } from '@lucide/svelte';
	import type { Parameter, BoundaryMode } from '$config/types';
	import ParameterSlider from '$shared/ParameterSlider.svelte';
	import { cn } from '$utils';

	interface BoundaryModeControlsProps {
		boundaryMode: Parameter<BoundaryMode>;
		boundaryStuckThreshold: Parameter<number>;
		onUpdate: (
			key: 'boundaryMode' | 'boundaryStuckThreshold',
			value: Parameter<BoundaryMode> | Parameter<number>
		) => void;
	}

	const { boundaryMode, boundaryStuckThreshold, onUpdate }: BoundaryModeControlsProps = $props();

	const isWrappable = $derived(boundaryMode.default === 'wrappable');

	function handleModeToggle(checked: boolean) {
		const newMode: BoundaryMode = checked ? 'wrappable' : 'collidable';
		if (newMode !== boundaryMode.default) {
			onUpdate('boundaryMode', { default: newMode });
		}
	}

	function handleStuckThresholdChange(value: number) {
		if (value !== boundaryStuckThreshold.default) {
			onUpdate('boundaryStuckThreshold', {
				...boundaryStuckThreshold,
				default: value
			});
		}
	}

	function formatSeconds(val: number) {
		return `${(val / 1000).toFixed(1)}`;
	}
</script>

<TooltipProvider>
	<div class="space-y-6">
		<Tooltip>
			<TooltipTrigger>
				<!-- Boundary Mode Toggle -->
				<div
					class="flex flex-col items-start justify-center gap-3 sm:flex-row sm:items-center sm:justify-start sm:gap-12"
				>
					<span class="flex items-center gap-2">
						<SquareDashed class="size-4" />
						<Label for="boundary-mode-toggle" class="text-sm font-medium">Boundary Mode:</Label>
					</span>

					<div class="flex items-center justify-center gap-2 text-sm font-medium">
						<Badge
							variant="outline"
							class={cn(
								isWrappable
									? 'cursor-default border-sky-600 bg-sky-100/80 text-sky-600 dark:border-sky-400 dark:bg-sky-600/20 dark:text-sky-400'
									: 'cursor-default border-amber-600 bg-amber-100/80 text-amber-600 dark:border-amber-400 dark:bg-amber-600/20 dark:text-amber-400'
							)}
						>
							{#if isWrappable}
								<Earth class="me-2 size-5" />
								Wrappable
							{:else}
								<Box class="me-2 size-5" />
								Collidable
							{/if}
						</Badge>

						<Switch
							id="boundary-mode-toggle"
							checked={isWrappable}
							onCheckedChange={handleModeToggle}
						/>
					</div>
				</div>
			</TooltipTrigger>
			<TooltipContent class="max-w-xs border border-muted bg-background p-3 text-foreground">
				<div class="space-y-2">
					<div class="flex items-center gap-2">
						<Box class="size-4 text-amber-600" />
						<span class="text-xs font-semibold">OFF = Collidable:</span>
					</div>
					<p class="text-xs">Boids bounce off boundaries and are enclosed</p>

					<div class="mt-2 flex items-center gap-2">
						<Earth class="size-4 text-sky-600" />
						<span class="text-xs font-semibold">ON = Wrappable:</span>
					</div>
					<p class="text-xs">Boids wrap around to the opposite side as if the screen is a sphere</p>
				</div>
			</TooltipContent>
		</Tooltip>

		<!-- Stuck Threshold (only visible for collidable boundaries) -->
		{#if !isWrappable}
			<ParameterSlider
				id="boundary-stuck-threshold"
				label="Unstuck After"
				min={boundaryStuckThreshold.min}
				max={boundaryStuckThreshold.max}
				step={boundaryStuckThreshold.step || 500}
				value={boundaryStuckThreshold.default}
				unit="s"
				formatValue={formatSeconds}
				onChange={handleStuckThresholdChange}
			/>

			<div class="text-xs text-muted-foreground">
				After this duration, boids stuck against a boundary will be helped to escape.
			</div>
		{/if}
	</div>
</TooltipProvider>
