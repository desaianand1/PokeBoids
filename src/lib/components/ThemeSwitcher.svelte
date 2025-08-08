<script lang="ts">
	import { Sun, Moon, MonitorCog } from '@lucide/svelte';
	import { mode, resetMode, setMode } from 'mode-watcher';
	import { buttonVariants } from '$ui/button';
	import * as DropdownMenu from '$ui/dropdown-menu';
	import { cn } from '$lib/utils';

	interface ThemeSwitcherProps {
		variant?: 'link' | 'secondary' | 'default' | 'destructive' | 'outline' | 'ghost' | undefined;
		size?: 'default' | 'sm' | 'lg' | 'icon' | undefined;
	}

	let { variant = 'ghost', size = 'icon' }: ThemeSwitcherProps = $props();
	const isDarkMode = $derived(mode.current === 'dark');
	const themes = [
		{ name: 'Light', icon: Sun, action: () => setMode('light') },
		{ name: 'Dark', icon: Moon, action: () => setMode('dark') },
		{ name: 'Auto', icon: MonitorCog, action: resetMode }
	];
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger class={cn(buttonVariants({ variant, size }), 'rounded-lg')}>
		<div class="relative">
			{#each [Sun, Moon] as Icon, index (Icon.name || index)}
				<Icon
					class={cn(
						'h-12 w-12 transition-all duration-300 ease-in-out',
						isDarkMode === (index === 1)
							? 'absolute left-0 top-0 rotate-0 scale-100 opacity-100'
							: `${index === 0 ? '' : '-'}rotate-90 scale-0 opacity-0`
					)}
				/>
				<div class="w-min"></div>
			{/each}
		</div>
		<span class="sr-only">Toggle theme</span>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="center">
		{#each themes as { name, icon: Icon, action } (name)}
			<DropdownMenu.Item onclick={action}>
				<span
					class="flex w-full items-center justify-center gap-3 rounded-lg py-2 transition-colors duration-300 ease-in-out"
				>
					<Icon class="h-5 w-5" />{name}
				</span>
			</DropdownMenu.Item>
		{/each}
	</DropdownMenu.Content>
</DropdownMenu.Root>
