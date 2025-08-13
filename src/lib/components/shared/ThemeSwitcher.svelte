<script lang="ts">
	import { Sun, Moon, MonitorCog } from '@lucide/svelte';
	import { resetMode, setMode } from 'mode-watcher';
	import { buttonVariants } from '$ui/button';
	import * as DropdownMenu from '$ui/dropdown-menu';
	import { cn } from '$lib/utils';

	interface ThemeSwitcherProps {
		variant?: 'link' | 'secondary' | 'default' | 'destructive' | 'outline' | 'ghost' | undefined;
		size?: 'default' | 'sm' | 'lg' | 'icon' | undefined;
		className?: string | undefined;
		animateScale?: boolean | undefined;
	}

	let { variant = 'ghost', size = 'icon', className, animateScale }: ThemeSwitcherProps = $props();
	const themes = [
		{ name: 'Light', icon: Sun, action: () => setMode('light') },
		{ name: 'Dark', icon: Moon, action: () => setMode('dark') },
		{ name: 'Auto', icon: MonitorCog, action: resetMode }
	];
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger
		class={cn(buttonVariants({ variant, size }), 'rounded-lg', animateScale && 'group', className)}
	>
		<Sun
			class={cn(
				'size-5 rotate-0 scale-100 !transition-all dark:-rotate-90 dark:scale-0',
				animateScale &&
					'transition-transform ease-in-out group-hover:scale-125 dark:group-hover:scale-0'
			)}
		/>
		<Moon
			class={cn(
				'absolute size-5 rotate-90 scale-0 !transition-all dark:rotate-0 dark:scale-100',
				animateScale &&
					'transition-transform ease-in-out group-hover:scale-0 dark:group-hover:scale-125'
			)}
		/>
		<span class="sr-only">Toggle theme</span>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="center">
		{#each themes as { name, icon: Icon, action } (name)}
			<DropdownMenu.Item onclick={action}>
				<span
					class="flex w-full items-center justify-center gap-3 rounded-lg py-2 transition-colors duration-300 ease-in-out"
				>
					<Icon class="size-5" />{name}
				</span>
			</DropdownMenu.Item>
		{/each}
	</DropdownMenu.Content>
</DropdownMenu.Root>
