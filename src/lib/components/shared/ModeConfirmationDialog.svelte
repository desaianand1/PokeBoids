<script lang="ts">
	import { ResponsiveDialog } from '$ui/responsive-dialog';
	import { Button, buttonVariants } from '$ui/button';
	import { AlertDialogAction, AlertDialogCancel } from '$ui/alert-dialog';
	import { DrawerClose } from '$ui/drawer';
	import { ArrowLeftRight, AlertTriangle } from 'lucide-svelte';
	import type { SimulationMode } from '$config/types';
	import { UIDisplayStrategyFactory } from '$strategies/ui-display';

	interface ModeConfirmationDialogProps {
		open: boolean;
		newMode: SimulationMode;
		onConfirm: () => void;
		onCancel: () => void;
	}

	const { open, newMode, onConfirm, onCancel }: ModeConfirmationDialogProps = $props();

	// Get confirmation configuration from UI strategy
	const uiStrategy = $derived(UIDisplayStrategyFactory.createUIStrategy(newMode));
	const confirmationConfig = $derived(uiStrategy.getConfirmationConfig());
	const labels = $derived(uiStrategy.getLabels());

	function handleConfirm() {
		onConfirm();
	}

	function handleCancel() {
		onCancel();
	}
</script>

<ResponsiveDialog {open}>
	{#snippet title()}
		<span class="text-warning inline-flex items-center justify-center gap-2 text-lg font-bold">
			<ArrowLeftRight class="size-5 stroke-2" />
			{confirmationConfig.confirmationTitle}
		</span>
	{/snippet}

	{#snippet description()}
		<div class="space-y-3">
			<div class="flex items-center gap-2 text-amber-600">
				<AlertTriangle class="size-4" />
				<span class="font-medium">This action will restart the simulation</span>
			</div>
			<p class="text-muted-foreground">
				{confirmationConfig.confirmationMessage}
			</p>
			<div class="rounded-md bg-muted/50 p-3 text-sm">
				<p class="mb-1 font-medium">Switching to: {labels.modeTitle}</p>
				<p class="text-xs text-muted-foreground">{labels.modeDescription}</p>
			</div>
		</div>
	{/snippet}

	{#snippet footer(isDesktop: boolean)}
		{#if isDesktop}
			<AlertDialogCancel onclick={handleCancel}>Cancel</AlertDialogCancel>
			<AlertDialogAction class={buttonVariants({ variant: 'default' })} onclick={handleConfirm}>
				Switch Mode & Restart
			</AlertDialogAction>
		{:else}
			<DrawerClose onclick={handleCancel} class={buttonVariants({ variant: 'outline' })}>
				Cancel
			</DrawerClose>
			<Button variant="default" onclick={handleConfirm}>Switch Mode & Restart</Button>
		{/if}
	{/snippet}
</ResponsiveDialog>
