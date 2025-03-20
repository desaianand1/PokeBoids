<script lang="ts">
	import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '$ui/collapsible';
	import { Button } from '$ui/button';
	import { Info, ChevronDown } from '@lucide/svelte';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	interface InfoCollapsibleProps {
		title: string;
		class?: string;
		children: Snippet;
	}

	const { title, class: className = '', children }: InfoCollapsibleProps = $props();
</script>

<Collapsible class={cn('group', className)}>
	<CollapsibleTrigger>
		<Button variant="ghost" size="sm" class="flex w-full justify-between">
			<div class="flex items-center">
				<Info class="mr-2 h-4 w-4" />
				<span>{title}</span>
			</div>
			<ChevronDown
				class="h-4 w-4 transition-transform duration-200 ease-in-out group-data-[state=open]:rotate-180"
			/>
		</Button>
	</CollapsibleTrigger>
	<CollapsibleContent class="mt-2 rounded-md bg-muted/40 p-2 text-sm">
		{@render children()}
	</CollapsibleContent>
</Collapsible>
