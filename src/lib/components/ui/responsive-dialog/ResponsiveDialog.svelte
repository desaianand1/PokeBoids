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
		snapPoints?: (number | string)[];
		shouldScaleBackground?: boolean;
		scrollAreaClassNames?: string | undefined;
		containerClassNames?: string | undefined;
	}

	let {
		open = $bindable(false),
		title,
		description,
		content,
		footer,
		children,
		snapPoints = [0.7, 0.95],
		shouldScaleBackground = true,
		scrollAreaClassNames,
		containerClassNames
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
	<Drawer bind:open {shouldScaleBackground} {snapPoints} closeThreshold={0.3}>
		<DrawerContent>
			<DrawerHeader class="text-center">
				{#if title}<DrawerTitle>{@render title()}</DrawerTitle>{/if}
				{#if description}<DrawerDescription>{@render description()}</DrawerDescription>{/if}
			</DrawerHeader>

			<ScrollArea class="h-2/3 bg-orange-200">
				{#if content}
					{@render content()}
				{/if}
			</ScrollArea>

			{#if footer}
				<DrawerFooter class="bg-red-100">
					{@render footer(isDesktop.current)}
				</DrawerFooter>
			{/if}
		</DrawerContent>
	</Drawer>
{/if}
