<script lang="ts">
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$ui/tabs';
	import { Badge } from '$ui/badge';
	import { Cpu, SlidersVertical, ChartColumn, BookText } from '@lucide/svelte';
	import ThemeSwitcher from '$components/ThemeSwitcher.svelte';
	import { formatVersion } from '$utils/version';

	// Import components
	import SimulationPanel from '$components/simulation/SimulationPanel.svelte';
	import BoidConfigPanel from '$components/boid-config/BoidConfigPanel.svelte';
	import StatsPanel from '$components/StatisticsPanel.svelte';
	import EventDebugPanel from '$components/event-debug/EventDebugPanel.svelte';
	import InfoCollapsible from '$components/shared/InfoCollapsible.svelte';
	import CreditsPanel from '$components/CreditsPanel.svelte';

	let activeTab = $state('controls');

	function handleTabChange(value: string) {
		activeTab = value;
	}

	const tabs = [
		{ value: 'controls', icon: Cpu, label: 'Sim' },
		{ value: 'config', icon: SlidersVertical, label: 'Config' },
		{ value: 'stats', icon: ChartColumn, label: 'Stats' },
		{ value: 'credits', icon: BookText, label: 'Credits' }
	] as const;
</script>

<Tabs value={activeTab} class="flex flex-1 flex-col" onValueChange={handleTabChange}>
	<div class="border-b px-4 py-2">
		<TabsList class="grid w-full grid-cols-4">
			{#each tabs as { value, icon: Icon, label }}
				<TabsTrigger {value}>
					<Icon class="mr-2 h-4 w-4" />
					<span class="hidden sm:inline">{label}</span>
				</TabsTrigger>
			{/each}
		</TabsList>
	</div>

	<div class="flex-1 overflow-y-auto p-4">
		<TabsContent value="controls" class="m-0 h-full">
			<div class="flex h-full flex-col space-y-4">
				<SimulationPanel />
				<InfoCollapsible title="Simulation Info" class="mt-auto">
					<p>
						The Boids simulation demonstrates emergent flocking behaviors with three simple rules:
					</p>
					<ul class="ml-4 mt-2 list-disc space-y-1">
						<li>Separation: Avoid crowding neighbors</li>
						<li>Alignment: Steer towards average heading</li>
						<li>Cohesion: Steer towards average position</li>
					</ul>
				</InfoCollapsible>
			</div>
		</TabsContent>

		<TabsContent value="config" class="m-0 h-full">
			<div class="space-y-4">
				<BoidConfigPanel />
				<InfoCollapsible title="Performance Tips">
					<p>For better performance:</p>
					<ul class="ml-4 mt-2 list-disc space-y-1">
						<li>Reduce boid count if FPS drops below 30</li>
						<li>Lower perception radius for large flocks</li>
						<li>Disable debug mode when not needed</li>
					</ul>
				</InfoCollapsible>
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
	</div>

	<footer
		class="fixed bottom-0 start-0 flex w-full items-center justify-between border-t bg-background px-4 py-2 text-xs text-muted-foreground"
	>
		<span class="flex items-center justify-center gap-4 p-2">
			<ThemeSwitcher variant="outline" size="icon" />
			<Badge variant="outline" class="py-2 font-mono text-xs">Boids Simulation</Badge>
		</span>
		<span class="flex items-center gap-1 text-secondary">
			{formatVersion()}
			{#if import.meta.env.DEV}
				<Badge variant="outline" class="py-0 text-xs">dev</Badge>
			{/if}
		</span>
	</footer>
</Tabs>
