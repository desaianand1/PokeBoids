<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$ui/card';
	import { Label } from '$ui/label';
	import { Switch } from '$ui/switch';
	import { Badge } from '$ui/badge';
	import * as Tabs from '$ui/tabs';
	import { Bug, Clock, Rows3 } from '@lucide/svelte';
	import { EventBus } from '$events/event-bus';
	import type { GameEvents } from '$events/types';
	import { onDestroy } from 'svelte';
	import { toast } from 'svelte-sonner';

	// Import subcomponents
	import EventSearchBar from '$components/event-debug/EventSearchBar.svelte';
	import EventFilterControls from '$components/event-debug/EventFilterControls.svelte';
	import EventList from '$components/event-debug/EventList.svelte';
	import EventDetails from '$components/event-debug/EventDetails.svelte';

	// Import types and constants
	import type {
		EventSummary,
		StreamEvent,
		EventCategory,
		EventDetails as EventDetailsType,
		PendingEvent
	} from '$utils/event-debug';
	import {
		EVENT_CONFIG,
		getEventCategory,
		safeStringify,
		captureEventDetails
	} from '$utils/event-debug';

	// State variables
	let isDebugEnabled = $state(false);
	let isPaused = $state(false);
	let searchQuery = $state('');
	let selectedCategory = $state<'all' | EventCategory>('all');
	let activeTab = $state<'aggregate' | 'stream'>('aggregate');
	let selectedEventId = $state<string | null>(null);

	// Event storage
	let eventMap = $state<Map<string, EventSummary>>(new Map());
	let eventDetails = $state<Map<string, EventDetailsType>>(new Map());
	let streamEvents = $state<StreamEvent[]>([]);

	// Sampling and throttling state
	let samplingCounters = new Map<string, number>();
	let lastEventTimes = new Map<string, number>();
	let currentEventDetails = $state<EventDetailsType | null>(null);

	// Batch processing state
	let pendingEvents: PendingEvent[] = [];
	let processingBatch = false;
	let batchProcessTimeout: number | null = null;

	// Derived state
	const filteredEvents = $derived(
		Array.from(eventMap.values())
			.filter((e) => selectedCategory === 'all' || e.category === selectedCategory)
			.filter((e) => !searchQuery || e.type.toLowerCase().includes(searchQuery.toLowerCase()))
			.sort((a, b) => b.lastSeen - a.lastSeen)
	);

	const filteredStreamEvents = $derived(
		streamEvents
			.filter((e) => selectedCategory === 'all' || e.category === selectedCategory)
			.filter((e) => !searchQuery || e.type.toLowerCase().includes(searchQuery.toLowerCase()))
	);

	// Event handling
	function processEvent(type: keyof GameEvents & string, data: GameEvents[keyof GameEvents]): void {
		if (!isDebugEnabled || isPaused) return;

		pendingEvents.push({ type, data });

		if (!eventMap.has(type)) {
			const event = pendingEvents.find((e) => e.type === type);
			if (event) {
				processEventImmediately(event.type, event.data);
				pendingEvents = pendingEvents.filter((e) => e.type !== type);
			}
		}

		if (pendingEvents.length >= EVENT_CONFIG.BATCH_SIZE) {
			processBatch();
		} else if (batchProcessTimeout === null) {
			batchProcessTimeout = setTimeout(() => {
				batchProcessTimeout = null;
				processBatch();
			}, 100) as unknown as number;
		}
	}

	function processBatch() {
		if (processingBatch || pendingEvents.length === 0) return;

		processingBatch = true;

		setTimeout(() => {
			const eventsToProcess = [...pendingEvents];
			pendingEvents = [];

			eventsToProcess.forEach((event) => {
				processEventImmediately(event.type, event.data);
			});

			processingBatch = false;

			if (pendingEvents.length >= EVENT_CONFIG.BATCH_SIZE) {
				processBatch();
			} else if (pendingEvents.length > 0 && batchProcessTimeout === null) {
				batchProcessTimeout = setTimeout(() => {
					batchProcessTimeout = null;
					processBatch();
				}, 100) as unknown as number;
			}
		}, 0);
	}

	function processEventImmediately(type: keyof GameEvents & string, data: GameEvents[keyof GameEvents]): void {
		if (!isDebugEnabled || isPaused) return;

		const now = Date.now();
		const category = getEventCategory(type);

		const counter = (samplingCounters.get(type) || 0) + 1;
		samplingCounters.set(type, counter);

		if (counter % Math.max(1, Math.floor(EVENT_CONFIG.SAMPLING_RATE / 5)) === 0) {
			addStreamEvent(type, category, now);
		}

		if (counter % EVENT_CONFIG.SAMPLING_RATE !== 0) return;

		const lastTime = lastEventTimes.get(type) || 0;
		if (now - lastTime < EVENT_CONFIG.THROTTLE_INTERVAL) return;
		lastEventTimes.set(type, now);

		const eventId = type;
		const existingEvent = eventMap.get(eventId);

		if (existingEvent) {
			existingEvent.count++;
			existingEvent.lastSeen = now;
			updateEventMap(eventId, existingEvent);
		} else {
			const newEvent: EventSummary = {
				id: eventId,
				type,
				category,
				count: 1,
				firstSeen: now,
				lastSeen: now
			};

			const details = captureEventDetails(eventId, data);
			eventDetails.set(eventId, details);
			updateEventMap(eventId, newEvent);

			if (eventMap.size > EVENT_CONFIG.MAX_EVENT_TYPES) {
				removeOldestEvent();
			}
		}
	}

	// Helper functions
	function updateEventMap(key: string, value: EventSummary): void {
		const newMap = new Map(eventMap);
		newMap.set(key, value);
		eventMap = newMap;
	}

	function addStreamEvent(type: keyof GameEvents & string, category: EventCategory, timestamp: number): void {
		const streamEvent: StreamEvent = {
			id: `${type}-${timestamp}`,
			type,
			category,
			timestamp,
			detailsId: type
		};

		streamEvents = [streamEvent, ...streamEvents.slice(0, EVENT_CONFIG.MAX_STREAM_EVENTS - 1)];
	}

	function removeOldestEvent(): void {
		let oldestId = '';
		let oldestTime = Infinity;

		eventMap.forEach((event, id) => {
			if (event.lastSeen < oldestTime) {
				oldestTime = event.lastSeen;
				oldestId = id;
			}
		});

		if (oldestId) {
			const newMap = new Map(eventMap);
			newMap.delete(oldestId);
			eventMap = newMap;

			const newDetails = new Map(eventDetails);
			newDetails.delete(oldestId);
			eventDetails = newDetails;
		}
	}

	// UI Event handlers
	function handleSearchChange(value: string): void {
		searchQuery = value;
	}

	function handleCategoryChange(category: 'all' | EventCategory): void {
		selectedCategory = category;
	}

	function toggleDebug(enabled: boolean): void {
		isDebugEnabled = enabled;
		EventBus.setDebug(enabled);

		if (enabled) {
			console.debug('Event Debug mode enabled, ready to capture events');
		} else {
			clearEvents();
		}
	}

	function togglePause(): void {
		isPaused = !isPaused;
		if (isPaused) {
			toast.warning('Event monitoring Paused', {
				description: 'Events will not be captured until resumed'
			});
		} else {
			toast.success('Event monitoring Resumed', {
				description: 'Now capturing new events'
			});
		}
	}

	function clearEvents(): void {
		if (eventMap.size === 0 && streamEvents.length === 0) {
			return;
		}

		const totalEvents = streamEvents.length;
		const uniqueTypes = eventMap.size;

		eventMap = new Map();
		eventDetails = new Map();
		streamEvents = [];
		selectedEventId = null;
		currentEventDetails = null;
		samplingCounters.clear();
		lastEventTimes.clear();
		pendingEvents = [];

		if (batchProcessTimeout !== null) {
			clearTimeout(batchProcessTimeout);
			batchProcessTimeout = null;
		}

		toast.error('Events Cleared', {
			description: `Removed ${uniqueTypes} event types and ${totalEvents} event instances`
		});
	}

	function selectEvent(eventId: string): void {
		if (selectedEventId === eventId) {
			selectedEventId = null;
			currentEventDetails = null;
			return;
		}

		selectedEventId = eventId;
		const details = eventDetails.get(eventId);

		if (details) {
			currentEventDetails = details;
		} else {
			currentEventDetails = {
				data: null,
				formattedData:
					'Details not available for this event. Change the category filter to capture details for this event type.'
			};
			toast.warning('No details available', {
				description: 'Event details could not be found'
			});
		}
	}

	// Event listener setup
	$effect(() => {
		if (!isDebugEnabled) return;

		const handler = (type: keyof GameEvents & string, data: GameEvents[keyof GameEvents]) => {
			processEvent(type, data);
		};

		EventBus.onAny(handler as (type: string, data: unknown) => void);
		return () => EventBus.offAny(handler as (type: string, data: unknown) => void);
	});

	// Cleanup
	onDestroy(() => {
		if (batchProcessTimeout !== null) {
			clearTimeout(batchProcessTimeout);
			batchProcessTimeout = null;
		}
	});
</script>

<Card class="w-full shadow-md">
	<CardHeader class="pb-2">
		<div class="flex items-center justify-between">
			<div>
				<CardTitle class="flex items-center text-lg">
					<Bug class="mr-2 h-5 w-5" />
					Event Debug
				</CardTitle>
				<CardDescription>Aggregate and inspect game events for debugging</CardDescription>
			</div>
			<div class="flex items-center gap-2">
				<Switch id="event-debug" checked={isDebugEnabled} onCheckedChange={toggleDebug} />
				<Label for="event-debug" class="cursor-pointer text-sm font-medium">Debug</Label>
			</div>
		</div>
	</CardHeader>

	<CardContent>
		{#if isDebugEnabled}
			<div class="mb-4 flex flex-col gap-2 md:flex-row md:items-center">
				<EventSearchBar {searchQuery} onSearchChange={handleSearchChange} />
				<EventFilterControls
					{selectedCategory}
					{isPaused}
					hasEvents={eventMap.size > 0}
					onCategoryChange={handleCategoryChange}
					onTogglePause={togglePause}
					onClearEvents={clearEvents}
				/>
			</div>

			<Tabs.Root
				value={activeTab}
				onValueChange={(val) => (activeTab = val as 'stream' | 'aggregate')}
				class="mt-4"
			>
				<Tabs.List>
					<Tabs.Trigger value="aggregate" class="gap-2">
						<Rows3 class="h-4 w-4" />
						Aggregated
						<Badge variant="outline" class="ml-1">{filteredEvents.length}</Badge>
					</Tabs.Trigger>
					<Tabs.Trigger value="stream" class="gap-2">
						<Clock class="h-4 w-4" />
						Stream
						<Badge variant="outline" class="ml-1">{filteredStreamEvents.length}</Badge>
					</Tabs.Trigger>
				</Tabs.List>

				<div class="mt-2 text-xs text-muted-foreground">
					{#if activeTab === 'aggregate'}
						<p>Aggregated view shows unique event types with counts of occurrences.</p>
					{:else}
						<p>Stream view shows individual events in chronological order (newest first).</p>
					{/if}
				</div>

				<div class="mt-2">
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div class="rounded-md border">
							<EventList
								events={activeTab === 'aggregate' ? filteredEvents : filteredStreamEvents}
								{selectedEventId}
								viewType={activeTab}
								onSelectEvent={selectEvent}
								{searchQuery}
								{selectedCategory}
							/>
						</div>

						<div class="rounded-md border p-4">
							<EventDetails {selectedEventId} details={currentEventDetails} />
						</div>
					</div>
				</div>
			</Tabs.Root>
		{:else}
			<div class="text-center text-muted-foreground">Enable event debugging to see event flow</div>
		{/if}
	</CardContent>
</Card>
