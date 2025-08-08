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
	import CreditsPanel from '$components/CreditsPanel.svelte';
	import TabInfoPopover from '$components/shared/TabInfoPopover.svelte';
	import { Separator } from '$components/ui/separator';

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
			{#each tabs as { value, icon: Icon, label } (value)}
				<TabsTrigger {value}>
					<Icon class="mr-2 h-4 w-4" />
					<span class="hidden sm:inline">{label}</span>
				</TabsTrigger>
			{/each}
		</TabsList>
	</div>

	<div class="flex-1 overflow-y-auto p-4">
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
	</div>

	<footer
		class="fixed bottom-0 start-0 w-full border-t bg-background px-4 py-2 text-xs text-muted-foreground"
	>
		<div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-4">
			<!-- Interactive Controls Group -->
			<div class="flex items-center gap-4 p-2">
				<ThemeSwitcher variant="outline" size="icon" />
				<TabInfoPopover {activeTab} />
			</div>

			<!-- Metadata Group -->
			<div
				class="flex flex-row justify-between gap-2 px-2 md:items-center md:justify-normal md:px-0"
			>
				<p class="font-mono text-muted-foreground">&copy; 2025 Anand Desai</p>
				<Separator class="h-4" orientation="vertical" />
				<div class="flex items-center gap-2 text-secondary">
					{formatVersion()}
					{#if import.meta.env.DEV}
						<Badge variant="outline" class="py-0 text-xs">dev</Badge>
					{/if}
				</div>
			</div>
		</div>
	</footer>
</Tabs>
