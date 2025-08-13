<script lang="ts">
	import { Button } from '$ui/button';
	import * as Select from '$ui/select';
	import { Filter, Pause, Play } from '@lucide/svelte';
	import { categoryStyles, type EventCategory } from '$utils/event-debug';
	import { cn } from '$lib/utils';

	interface EventFilterControlsProps {
		selectedCategory: 'all' | EventCategory;
		isPaused: boolean;
		hasEvents: boolean;
		onCategoryChange: (category: 'all' | EventCategory) => void;
		onTogglePause: () => void;
		onClearEvents: () => void;
	}

	const {
		selectedCategory,
		isPaused,
		hasEvents,
		onCategoryChange,
		onTogglePause,
		onClearEvents
	}: EventFilterControlsProps = $props();

	const categoryOptions = [
		{ value: 'all', label: 'All Categories' },
		...Object.keys(categoryStyles).map((category) => ({
			value: category,
			label: category.charAt(0).toUpperCase() + category.slice(1)
		}))
	];

	const categoryTriggerContent = $derived(
		categoryOptions.find((opt) => opt.value === selectedCategory)?.label ?? 'Filter Category'
	);

	function handleCategoryChange(value: string) {
		onCategoryChange(value as 'all' | EventCategory);
	}
</script>

<div class="order-1 flex flex-wrap items-center gap-2 md:order-2">
	<!-- Category filter -->
	<Select.Root type="single" value={selectedCategory} onValueChange={handleCategoryChange}>
		<Select.Trigger class="w-44">
			<Filter class="me-1 size-4" />

			{#if selectedCategory !== undefined && selectedCategory !== 'all'}
				<span
					class={cn(categoryStyles[selectedCategory as EventCategory].textColor, 'font-medium')}
				>
					{categoryTriggerContent}
				</span>
			{:else}
				{categoryTriggerContent}
			{/if}
		</Select.Trigger>
		<Select.Content>
			<Select.Group>
				<Select.GroupHeading>Categories</Select.GroupHeading>
				{#each categoryOptions as option (option.value)}
					<Select.Item value={option.value} label={option.label}>
						{#if option.value !== 'all'}
							<span class={cn(categoryStyles[option.value as EventCategory].indicator, 'me-2')}
							></span>
						{/if}
						{option.label}
					</Select.Item>
				{/each}
			</Select.Group>
		</Select.Content>
	</Select.Root>

	<!-- Pause/Resume -->
	<Button variant="outline" size="sm" onclick={onTogglePause} class="gap-2">
		{#if isPaused}
			<Play class="size-4" />
			<span>Resume</span>
		{:else}
			<Pause class="size-4" />
			<span>Pause</span>
		{/if}
	</Button>

	<!-- Clear -->
	<Button variant="destructive" size="sm" onclick={onClearEvents} disabled={!hasEvents}>
		Clear
	</Button>
</div>
