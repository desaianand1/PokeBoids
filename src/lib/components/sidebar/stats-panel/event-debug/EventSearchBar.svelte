<script lang="ts">
	import { Input } from '$ui/input';
	import { Search, X } from '@lucide/svelte';

	interface EventSearchBarProps {
		searchQuery: string;
		onSearchChange: (value: string) => void;
	}

	const { searchQuery, onSearchChange }: EventSearchBarProps = $props();

	function handleInputChanged({
		currentTarget
	}: Event & {
		currentTarget: EventTarget & HTMLInputElement;
	}) {
		onSearchChange(currentTarget.value);
	}
</script>

<div class="relative order-2 flex-1 md:order-1">
	<Search class="absolute left-2 top-2.5 size-4 text-muted-foreground" />
	<Input
		type="text"
		placeholder="Search events..."
		class="pl-8"
		value={searchQuery}
		oninput={handleInputChanged}
	/>
	{#if searchQuery}
		<button
			class="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
			onclick={() => onSearchChange('')}
		>
			<X class="size-4" />
		</button>
	{/if}
</div>
