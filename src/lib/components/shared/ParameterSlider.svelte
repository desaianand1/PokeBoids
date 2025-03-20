<script lang="ts">
  import { Label } from '$ui/label';
  import { Slider } from '$ui/slider';
  import { cn } from '$lib/utils';

  interface ParameterSliderProps {
    id: string;
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    unit?: string;
    formatValue?: (val: number) => string;
    onChange: (value: number) => void;
    class?: string;
  }

  const {
    id,
    label,
    value,
    min,
    max,
    step = 0.1,
    unit = '',
    formatValue = (val: number) => val.toFixed(1),
    onChange,
    class: className = ''
  }: ParameterSliderProps = $props();
</script>

<div class={cn('space-y-2', className)}>
  <div class="flex justify-between">
    <Label for={id}>{label}</Label>
    <span class="font-mono text-xs text-muted-foreground">
      {formatValue(value)}{unit}
    </span>
  </div>
  <Slider
    type="single"
    {id}
    {min}
    {max}
    {step}
    {value}
    onValueChange={onChange}
  />
</div>
