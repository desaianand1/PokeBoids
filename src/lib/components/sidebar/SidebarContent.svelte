<script lang="ts">
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$ui/tabs';
	import { Cpu, SlidersVertical, ChartColumn, BookText } from '@lucide/svelte';

	// Import components
	import SimulationPanel from '$sidebar/sim-panel/SimulationPanel.svelte';
	import BoidConfigPanel from '$sidebar/boid-config-panel/BoidConfigPanel.svelte';
	import StatsPanel from '$sidebar/stats-panel/StatisticsPanel.svelte';
	import EventDebugPanel from '$sidebar/stats-panel/event-debug/EventDebugPanel.svelte';
	import CreditsPanel from '$sidebar/credits-panel/CreditsPanel.svelte';
	import ScrollArea from '$ui/scroll-area/scroll-area.svelte';

	interface Props {
		activeTab?: string;
	}

	let { activeTab = $bindable('controls') }: Props = $props();

	const tabs = [
		{ value: 'controls', icon: Cpu, label: 'Sim' },
		{ value: 'config', icon: SlidersVertical, label: 'Config' },
		{ value: 'stats', icon: ChartColumn, label: 'Stats' },
		{ value: 'credits', icon: BookText, label: 'Credits' }
	] as const;
</script>

<Tabs bind:value={activeTab} class="flex h-full flex-col">
	<div class="border-b px-4 py-2">
		<TabsList class="grid w-full grid-cols-4">
			{#each tabs as { value, icon: Icon, label } (value)}
				<TabsTrigger {value}>
					<Icon class="mr-2 size-4" />
					<span class="hidden sm:inline">{label}</span>
				</TabsTrigger>
			{/each}
		</TabsList>
	</div>

	<ScrollArea class="mb-0 flex flex-col p-4 md:mb-16">
		<TabsContent value="controls" class="m-0 h-full">
			<div class="space-y-4">
				<SimulationPanel />
			</div>
		</TabsContent>

		<TabsContent value="config" class="m-0 h-full">
			<div class="space-y-4">
				<BoidConfigPanel />
			</div>
		</TabsContent>

		<TabsContent value="stats" class="m-0 h-full">
			<div class="space-y-4">
				<StatsPanel />
				<EventDebugPanel />
			</div>
		</TabsContent>

		<TabsContent value="credits" class="m-0 h-full">
			<div class="space-y-4">
				<CreditsPanel />
			</div>
		</TabsContent>
	</ScrollArea>
</Tabs>
