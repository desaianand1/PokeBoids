<script lang="ts">
  import { cn } from '$lib/utils';

  interface StatItemProps {
    label: string;
    value: number | string;
    textClass?: string;
    class?: string;
  }

  const {
    label,
    value,
    textClass = '',
    class: className = ''
  }: StatItemProps = $props();
</script>

<div class={cn('space-y-1', className)}>
  <p class="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
  <p class={cn('text-2xl font-semibold', textClass)}>{value}</p>
</div>
