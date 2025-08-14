<script lang="ts">
	import {
		AlertDialog,
		AlertDialogContent,
		AlertDialogHeader,
		AlertDialogTitle,
		AlertDialogDescription,
		AlertDialogFooter
	} from '$ui/alert-dialog';
	import {
		Drawer,
		DrawerNestedRoot,
		DrawerContent,
		DrawerHeader,
		DrawerTitle,
		DrawerDescription,
		DrawerFooter
	} from '$ui/drawer';
	import { MediaQuery } from 'svelte/reactivity';
	import { ScrollArea } from '$ui/scroll-area';
	import { cn } from '$utils';
	import { type Snippet } from 'svelte';

	interface Props {
		open?: boolean;
		title?: Snippet;
		description?: Snippet;
		content?: Snippet;
		footer?: Snippet<[boolean]>;
		children?: Snippet;
		shouldScaleBackground?: boolean;
		scrollAreaClassNames?: string | undefined;
		containerClassNames?: string | undefined;
		nested?: boolean;
	}

	let {
		open = $bindable(false),
		title,
		description,
		content,
		footer,
		children,
		shouldScaleBackground = true,
		scrollAreaClassNames,
		containerClassNames,
		nested = false
	}: Props = $props();

	const isDesktop = new MediaQuery('(min-width: 768px)');
</script>

{#if isDesktop.current}
	<AlertDialog bind:open>
		<AlertDialogContent class={cn('max-h-[80vh] max-w-sm md:max-w-lg', containerClassNames)}>
			<AlertDialogHeader>
				{#if title}<AlertDialogTitle>{@render title()}</AlertDialogTitle>{/if}
				{#if description}<AlertDialogDescription>{@render description()}</AlertDialogDescription
					>{/if}
				<ScrollArea class={cn('h-full pt-4', scrollAreaClassNames)}>
					{#if content}
						{@render content()}
					{:else if children}
						{@render children()}
					{/if}
				</ScrollArea>
			</AlertDialogHeader>
			{#if footer}
				<AlertDialogFooter>
					{@render footer(isDesktop.current)}
				</AlertDialogFooter>
			{/if}
		</AlertDialogContent>
	</AlertDialog>
{:else}
	{#snippet drawerContent()}
		<DrawerContent>
			<DrawerHeader class="text-center">
				{#if title}<DrawerTitle>{@render title()}</DrawerTitle>{/if}
				{#if description}<DrawerDescription>{@render description()}</DrawerDescription>{/if}
			</DrawerHeader>

			<div
				class={cn('h-[50vh] max-h-[70vh] min-h-[30vh] overflow-y-auto', nested && 'h-fit min-h-16')}
			>
				{#if content}
					{@render content()}
				{/if}
			</div>

			{#if footer}
				<DrawerFooter>
					{@render footer(isDesktop.current)}
				</DrawerFooter>
			{/if}
		</DrawerContent>
	{/snippet}

	{#if nested}
		<DrawerNestedRoot bind:open {shouldScaleBackground}>
			{@render drawerContent()}
		</DrawerNestedRoot>
	{:else}
		<Drawer bind:open {shouldScaleBackground}>
			{@render drawerContent()}
		</Drawer>
	{/if}
{/if}
