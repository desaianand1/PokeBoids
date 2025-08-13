<script lang="ts">
	import { cn } from '$lib/utils';

	interface FpsIndicatorProps {
		fps: number;
		class?: string;
	}

	const { fps, class: className = '' }: FpsIndicatorProps = $props();

	// FPS indicator style helper
	function getFpsIndicator(fps: number) {
		if (fps > 55) {
			return {
				class:
					'bg-emerald-100 text-emerald-800 dark:bg-emerald-600/20 dark:border dark:border-emerald-400 dark:text-emerald-400',
				text: 'Good'
			};
		} else if (fps > 30) {
			return {
				class:
					'bg-yellow-100 text-yellow-800 dark:bg-yellow-600/20 dark:border dark:border-yellow-400 dark:text-yellow-400',
				text: 'OK'
			};
		} else {
			return {
				class:
					'bg-rose-100 text-rose-800 dark:bg-rose-600/20 dark:border dark:border-rose-400 dark:text-rose-400',
				text: 'Low'
			};
		}
	}
</script>

<div class={cn('space-y-1', className)}>
	<p class="text-xs uppercase tracking-wider text-muted-foreground">FPS</p>
	<p class="flex items-center text-2xl font-semibold">
		{fps}
		{#if fps > 0}
			{@const indicator = getFpsIndicator(fps)}
			<span class={cn('ml-2 rounded-full px-2 py-1 text-xs', indicator.class)}>
				{indicator.text}
			</span>
		{/if}
	</p>
</div>
