<script lang="ts">
	import { Badge } from '$ui/badge';
	import ThemeSwitcher from '$shared/ThemeSwitcher.svelte';
	import TabInfoPopover from '$shared/TabInfoPopover.svelte';
	import { Separator } from '$ui/separator';
	import { formatVersion } from '$utils/version';

	interface Props {
		activeTab: string;
	}

	let { activeTab }: Props = $props();
</script>

<footer
	class="relative w-full border-t bg-background px-4 py-2 text-xs text-muted-foreground md:absolute md:bottom-0"
>
	<div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-4">
		<!-- Interactive Controls Group -->
		<div class="flex items-center gap-4 p-2">
			<ThemeSwitcher variant="outline" size="icon" />
			<TabInfoPopover {activeTab} />
		</div>

		<!-- Metadata Group -->
		<div class="flex flex-row justify-between gap-2 px-2 md:items-center md:justify-normal md:px-0">
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
