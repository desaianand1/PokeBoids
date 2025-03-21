<script lang="ts">
  import { Button } from '$ui/button';
  import { Badge } from '$ui/badge';
  import * as ScrollArea from '$ui/scroll-area';
  import { cn } from '$lib/utils';
  import type { EventSummary, StreamEvent, EventCategory } from '$utils/event-debug';
  import type { GameEvents } from '$events/types';
  import { categoryStyles, formatTime } from '$utils/event-debug';

  interface EventListProps {
    events: EventSummary[] | StreamEvent[];
    selectedEventId: (keyof GameEvents & string) | null;
    viewType: 'aggregate' | 'stream';
    onSelectEvent: (id: keyof GameEvents & string) => void;
    searchQuery?: string;
    selectedCategory?: 'all' | EventCategory;
  }

  const {
    events,
    selectedEventId,
    viewType,
    onSelectEvent,
    searchQuery = '',
    selectedCategory = 'all'
  }: EventListProps = $props();

  const noEventsMessage = $derived(
    searchQuery || selectedCategory !== 'all'
      ? 'No matching events found...'
      : 'No events captured yet...'
  );

  function getEventId(event: EventSummary | StreamEvent): string {
    return viewType === 'aggregate' ? event.id : (event as StreamEvent).detailsId;
  }

  function getEventTimestamp(event: EventSummary | StreamEvent): number {
    return viewType === 'aggregate' 
      ? (event as EventSummary).lastSeen 
      : (event as StreamEvent).timestamp;
  }
</script>

<ScrollArea.Root class="h-60 max-h-80">
  {#if events.length > 0}
    <div class="space-y-1 p-1">
      {#each events as event}
        {@const isSelected = selectedEventId === getEventId(event)}
        <Button
          variant="ghost"
          size="sm"
          class={cn(
            'flex w-full items-center justify-between rounded p-2 text-left',
            isSelected ? 'bg-muted' : ''
          )}
          onclick={() => onSelectEvent(getEventId(event))}
        >
          <div class="flex items-center gap-2 overflow-hidden">
            <Badge
              variant={categoryStyles[event.category].variant}
              class={cn('shrink-0', categoryStyles[event.category].class)}
            >
              {event.category}
            </Badge>
            <span class="truncate font-medium">{event.type}</span>
            {#if viewType === 'aggregate' && (event as EventSummary).count > 1}
              <Badge variant="secondary" class="font-mono text-xs font-bold">
                ×{(event as EventSummary).count}
              </Badge>
            {/if}
          </div>
          <span class="shrink-0 text-xs text-muted-foreground">
            {formatTime(getEventTimestamp(event))}
          </span>
        </Button>
      {/each}
    </div>
  {:else}
    <div class="flex h-full items-center justify-center text-muted-foreground">
      {noEventsMessage}
    </div>
  {/if}
</ScrollArea.Root>
