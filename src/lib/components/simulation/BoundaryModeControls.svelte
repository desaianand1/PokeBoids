<script lang="ts">
	import { Label } from '$ui/label';
	import { Switch } from '$ui/switch';
	import { Badge } from '$ui/badge';
	import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '$ui/tooltip';
	import { Box, SquareDashed, Earth } from '@lucide/svelte';
	import type { Parameter, BoundaryMode } from '$config/types';
	import ParameterSlider from '$components/shared/ParameterSlider.svelte';
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
		<!-- Boundary Mode Toggle -->
		<div class="flex items-center justify-start gap-12">
			<span class="flex items-center gap-2">
				<SquareDashed class="h-4 w-4" />
				<Label for="boundary-mode-toggle" class="text-sm font-medium">Boundary Mode:</Label>
			</span>

			<Tooltip>
				<TooltipTrigger>
					<div class="flex items-center gap-2 text-sm font-medium">
						<Badge
							variant="outline"
							class={cn(
								isWrappable
									? 'cursor-default bg-sky-100/80 text-sky-600 border-sky-600 dark:border-sky-400 dark:bg-sky-600/20 dark:text-sky-400'
									: 'cursor-default bg-amber-100/80 text-amber-600 border-amber-600 dark:border-amber-400 dark:bg-amber-600/20 dark:text-amber-400'
							)}
						>
							{#if isWrappable}
								<Earth class="me-2 h-5 w-5" />
								Wrappable
							{:else}
								<Box class="me-2 h-5 w-5" />
								Collidable
							{/if}
						</Badge>

						<Switch
							id="boundary-mode-toggle"
							checked={isWrappable}
							onCheckedChange={handleModeToggle}
						/>
					</div>
				</TooltipTrigger>
				<TooltipContent class="max-w-xs p-3 border border-muted bg-background text-foreground">
					<div class="space-y-2">
						<div class="flex items-center gap-2">
							<Box class="h-4 w-4 text-amber-600" />
							<span class="text-xs font-semibold">OFF = Collidable:</span>
						</div>
						<p class="text-xs">Boids bounce off boundaries and are enclosed</p>

						<div class="mt-2 flex items-center gap-2">
							<Earth class="h-4 w-4 text-sky-600" />
							<span class="text-xs font-semibold">ON = Wrappable:</span>
						</div>
						<p class="text-xs">
							Boids wrap around to the opposite side as if the screen is a sphere
						</p>
					</div>
				</TooltipContent>
			</Tooltip>
		</div>

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
