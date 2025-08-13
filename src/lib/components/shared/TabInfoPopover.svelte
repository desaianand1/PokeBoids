<script lang="ts">
	import { Popover, PopoverContent, PopoverTrigger } from '$ui/popover';
	import { Button } from '$ui/button';
	import { Info } from '@lucide/svelte';

	interface TabInfoPopoverProps {
		activeTab: string;
	}

	const { activeTab }: TabInfoPopoverProps = $props();

	// Define user-focused, practical content for each tab
	const tabContent = {
		controls: {
			title: 'How it Works',
			content:
				'The Boids algorithm demonstrates how complex flocking emerges from three simple rules applied to individuals:',
			items: [
				'Separation: Each boid avoids crowding its local neighbors',
				'Alignment: Each boid steers toward the average heading of neighbors',
				'Cohesion: Each boid moves toward the average position of neighbors',
				'Field of View: Predators see narrowly but far, prey see widely but close'
			]
		},
		config: {
			title: 'Performance Tips',
			content: 'Optimize your simulation performance with these settings:',
			items: [
				'Reduce boid population if FPS drops below 30',
				'Keep boid counts under 500 for optimal framerates',
				'Lower perception radius to reduce neighbor calculations',
				'Disable debug visualizations when not needed',
				'Enable "Hardware Acceleration" in your browser settings (Settings > System) to use the GPU to amplify performance significantly',
				'Close other browser tabs to free up memory when there are many boids simulated'
			]
		},
		stats: {
			title: 'Statistics & Analytics',
			content: 'Use these tools to analyze your simulation:',
			items: [
				'FPS: Aim for 60+ frames per second for smooth motion',
				'Event Debug: Monitor boid interactions, births, deaths, and attacks',
				'Stream mode shows real-time events, Aggregated shows summaries',
				'Filter events by category to focus on specific behaviors',
				'Population stats track predator-prey dynamics over time'
			]
		},
		credits: {
			title: 'About PokéBoids',
			content: 'Built with SvelteKit and Phaser 3, for fun!',
			items: [
				'Try to experiement with parameters in real-time to see widely different behaviors emerge!',
				'Fun fact: Boids were first used in Tim Burton\'s "Batman Returns" (1992) for penguin scenes!',
				'The algorithm is now used in films, games, and robotics worldwide'
			]
		}
	};

	// Get current tab content, fallback to null if tab not found
	const currentContent = $derived(tabContent[activeTab as keyof typeof tabContent] || null);
</script>

{#if currentContent}
	<Popover>
		<PopoverTrigger>
			<Button
				variant="outline"
				size="sm"
				class="flex items-center justify-center gap-1 text-center"
				title={currentContent.title}
			>
				<Info class="size-4" />
				{currentContent.title}
			</Button>
		</PopoverTrigger>
		<PopoverContent class="w-80 rounded-lg border border-secondary/30 p-8" side="top">
			<h4 class="mb-4 font-medium leading-none">{currentContent.title}</h4>
			<p class="mb-4 text-sm text-muted-foreground">
				{currentContent.content}
			</p>
			<ul class="ml-4 list-disc space-y-1.5 text-sm text-muted-foreground">
				{#each currentContent.items as item (item)}
					<li>{item}</li>
				{/each}
			</ul>
		</PopoverContent>
	</Popover>
{/if}
