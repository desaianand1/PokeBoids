<script lang="ts">
	import { Button } from '$ui/button';
	import { Badge } from '$ui/badge';
	import * as ScrollArea from '$ui/scroll-area';
	import { Copy } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import type { EventDetails } from '$utils/event-debug';
	import type { GameEvents } from '$events/types';

	interface EventDetailsProps {
		selectedEventId: (keyof GameEvents & string) | null;
		details: EventDetails | null;
	}

	const { selectedEventId, details }: EventDetailsProps = $props();

	async function copyToClipboard() {
		if (!details) return;

		try {
			await navigator.clipboard.writeText(details.formattedData);
			toast.success('Copied Event Details', {
				description: `'${selectedEventId}' event details copied to clipboard`
			});
		} catch {
			toast.error('Failed to copy', {
				description: 'Could not copy event details to clipboard'
			});
		}
	}
</script>

<ScrollArea.Root class="h-60 max-h-80">
	{#if selectedEventId !== null && details}
		<div class="mb-2 flex items-center justify-between">
			<h3 class="font-semibold">
				Event Details
				<Badge variant="outline" class="ml-2">
					{selectedEventId}
				</Badge>
			</h3>
			<Button
				variant="ghost"
				size="icon"
				class="h-8 w-8"
				onclick={copyToClipboard}
				title="Copy data"
			>
				<Copy class="h-4 w-4" />
			</Button>
		</div>
		<pre
			class="overflow-x-auto whitespace-pre-wrap rounded-md bg-muted/50 p-3 font-mono text-xs">{details.formattedData}</pre>
	{:else}
		<div class="flex h-full items-center justify-center text-muted-foreground">
			Select an event to view details
		</div>
	{/if}
</ScrollArea.Root>
