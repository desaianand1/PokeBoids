<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$ui/card';
	import { Label } from '$ui/label';
	import { Switch } from '$ui/switch';
	import { Input } from '$ui/input';
	import { Button } from '$ui/button';
	import { Badge } from '$ui/badge';
	import * as Select from '$ui/select';
	import * as Tabs from '$ui/tabs';
	import * as ScrollArea from '$ui/scroll-area';
	import { Bug, Search, X, Copy, Filter, Pause, Play, Clock, Rows3 } from '@lucide/svelte';
	import { EventBus } from '$events/event-bus';
	import { cn } from '$lib/utils';
	import { onDestroy, onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	// ============= TYPE DEFINITIONS =============
	type EventCategory = 'boid' | 'simulation' | 'debug' | 'scene' | 'other';
	type EventName = string;

	// Core event data structure (lightweight)
	interface EventSummary {
		id: string; // Unique ID (type-based)
		type: EventName; // Event type name
		category: EventCategory; // Category
		count: number; // Number of occurrences
		firstSeen: number; // Timestamp of first occurrence
		lastSeen: number; // Timestamp of last occurrence
	}

	// Stream event - represents a single occurrence of an event
	interface StreamEvent {
		id: string; // Unique ID (timestamp-based)
		type: EventName; // Event type name
		category: EventCategory; // Category
		timestamp: number; // When the event occurred
		detailsId: string; // ID to lookup details (usually same as type)
	}

	// Detailed event data (stored separately)
	interface EventDetails {
		data: unknown;
		formattedData: string;
	}

	// Pending event type
	interface PendingEvent {
		type: string;
		data: unknown;
	}

	// Event categories
	const EVENT_CATEGORIES: Record<Exclude<EventCategory, 'other'>, readonly EventName[]> = {
		boid: [
			'boid-added',
			'boid-removed',
			'boid-damaged',
			'boid-leveled-up',
			'boid-stamina-depleted',
			'boid-stamina-recovered',
			'alignment-updated',
			'coherence-updated',
			'separation-updated'
		],
		simulation: [
			'simulation-resumed',
			'simulation-paused',
			'simulation-reset',
			'simulation-speed-changed',
			'boundary-collision'
		],
		debug: ['debug-toggle'],
		scene: ['scene-ready', 'game-started', 'game-reset']
	};

	// Category styling
	const categoryStyles = {
		boid: {
			variant: 'outline',
			indicator: 'bg-emerald-500 w-4 h-4 rounded-full',
			class: 'border-emerald-500 text-emerald-500'
		},
		simulation: {
			variant: 'outline',
			indicator: 'bg-blue-500 w-4 h-4 rounded-full',
			class: 'border-blue-500 text-blue-500'
		},
		debug: {
			variant: 'outline',
			indicator: 'bg-amber-500 w-4 h-4 rounded-full',
			class: 'border-amber-500 text-amber-500'
		},
		scene: {
			variant: 'outline',
			indicator: 'bg-purple-500 w-4 h-4 rounded-full',
			class: 'border-purple-500 text-purple-500'
		},
		other: {
			variant: 'outline',
			indicator: 'bg-gray-500 w-4 h-4 rounded-full',
			class: 'border-gray-500 text-gray-500'
		}
	} as const;

	// ============= CONFIGURATION =============
	// How many distinct event types to retain
	const MAX_EVENT_TYPES = 50;

	// How often to sample events of the same type (1 = every event)
	// Setting to 1 to ensure events are captured initially, can increase if needed
	const SAMPLING_RATE = 5;

	// Time interval (ms) for throttling events
	const THROTTLE_INTERVAL = 1000; // Reduced to ensure events are captured

	// Batch processing - only update UI after collecting this many events
	const BATCH_SIZE = 20;

	// Max events to show in the stream view
	const MAX_STREAM_EVENTS = 50;

	// ============= STATE VARIABLES =============
	let isDebugEnabled = $state(false);
	let isPaused = $state(false);
	let searchQuery = $state('');
	let selectedCategory = $state<'all' | EventCategory>('all');
	let activeTab = $state<'aggregate' | 'stream'>('aggregate'); // 'aggregate' or 'stream'
	let selectedEventId = $state<string | null>(null);

	// Event storage
	let eventMap = $state<Map<string, EventSummary>>(new Map());
	let eventDetails = $state<Map<string, EventDetails>>(new Map());
	let streamEvents = $state<StreamEvent[]>([]); // Chronological event occurrences

	// Sampling counters for each event type
	let samplingCounters = new Map<string, number>();

	// Event throttling state
	let lastEventTimes = new Map<string, number>();

	// Selected event details
	let currentEventDetails = $state<EventDetails | null>(null);

	// Batch processing state
	let pendingEvents: PendingEvent[] = [];
	let processingBatch = false;
	let batchProcessTimeout: number | null = null;

	// ============= UTILITY FUNCTIONS =============

	// Determine event category
	function getEventCategory(eventName: EventName): EventCategory {
		for (const [category, events] of Object.entries(EVENT_CATEGORIES)) {
			if (events.includes(eventName)) {
				return category as EventCategory;
			}
		}
		return 'other';
	}

	// Create a safe, serializable version of event data
	function safeStringify(obj: unknown): string {
		const seen = new WeakSet();
		try {
			return JSON.stringify(
				obj,
				(key, value) => {
					// Handle circular references
					if (typeof value === 'object' && value !== null) {
						if (seen.has(value)) {
							return '[Circular Reference]';
						}
						seen.add(value);

						// Special handling for Phaser objects
						if (value.type === 'Sprite' || value.constructor?.name === 'Sprite' || value.anims) {
							// Return a simplified representation of Phaser sprites
							return {
								__type: 'PhaserSprite',
								name: value.name || '[Unnamed Sprite]',
								position:
									value.x !== undefined && value.y !== undefined
										? { x: value.x, y: value.y }
										: '[Unknown Position]',
								visible: value.visible,
								...(value.texture ? { texture: value.texture.key || '[Unknown Texture]' } : {})
								// Add other safe properties as needed
							};
						}
					}

					// Handle functions
					if (typeof value === 'function') {
						return '[Function]';
					}

					// Handle other problematic types
					if (value instanceof Error) {
						return `[Error: ${value.message}]`;
					}

					return value;
				},
				2
			);
		} catch (err) {
			// If JSON.stringify fails, try a more aggressive approach
			try {
				// Create a sanitized copy of the object
				const sanitize = (input: any): any => {
					if (input === null || input === undefined) return input;

					if (typeof input !== 'object') return input;

					// Handle arrays
					if (Array.isArray(input)) {
						return input.map((item) => {
							try {
								return sanitize(item);
							} catch (e) {
								return '[Error: Unable to sanitize array item]';
							}
						});
					}

					// Handle objects
					const result: any = {};

					// Only include safe properties
					for (const key in input) {
						try {
							if (Object.prototype.hasOwnProperty.call(input, key)) {
								// Skip functions, symbols, etc.
								const value = input[key];
								if (value === null || value === undefined) {
									result[key] = value;
								} else if (
									typeof value !== 'object' &&
									typeof value !== 'function' &&
									typeof value !== 'symbol'
								) {
									result[key] = value;
								} else if (typeof value === 'object') {
									// Only try to sanitize if it's actually an object and not a complex type like WebGLTexture
									const constructorName = value.constructor?.name || '';
									if (['Object', 'Array'].includes(constructorName)) {
										result[key] = sanitize(value);
									} else {
										result[key] = `[${constructorName}]`;
									}
								}
							}
						} catch (e) {
							result[key] = '[Error: Unable to access property]';
						}
					}

					return result;
				};

				return JSON.stringify(sanitize(obj), null, 2);
			} catch (fallbackErr) {
				return `[Error formatting data: ${err}. Additional error during fallback: ${fallbackErr}]`;
			}
		}
	}

	// Format timestamp for display in local timezone
	function formatTime(timestamp: number): string {
		const date = new Date(timestamp);
		return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
	}

	// Update event map reactively
	function updateEventMap(key: string, value: EventSummary): void {
		const newMap = new Map(eventMap);
		newMap.set(key, value);
		eventMap = newMap;
	}

	// Add a stream event
	function addStreamEvent(type: string, category: EventCategory, timestamp: number): void {
		const streamEvent: StreamEvent = {
			id: `${type}-${timestamp}`,
			type,
			category,
			timestamp,
			detailsId: type // Use type as the lookup key for details
		};

		// Add to stream events with reactive update
		streamEvents = [streamEvent, ...streamEvents.slice(0, MAX_STREAM_EVENTS - 1)];
	}

	// ============= EVENT HANDLING =============

	// Process a batch of events on next animation frame
	function processBatch() {
		if (processingBatch || pendingEvents.length === 0) return;

		processingBatch = true;

		// Process in next animation frame to avoid blocking the main thread
		setTimeout(() => {
			const eventsToProcess = [...pendingEvents];
			pendingEvents = [];

			eventsToProcess.forEach((event) => {
				const { type, data } = event;
				processEventImmediately(type, data);
			});

			processingBatch = false;

			// Check if we have more events to process
			if (pendingEvents.length >= BATCH_SIZE) {
				processBatch();
			} else if (pendingEvents.length > 0 && batchProcessTimeout === null) {
				// Schedule processing of remaining events
				batchProcessTimeout = setTimeout(() => {
					batchProcessTimeout = null;
					processBatch();
				}, 100) as unknown as number;
			}
		}, 0);
	}

	// Add event to batch for processing
	function processEvent(type: string, data: unknown): void {
		if (!isDebugEnabled || isPaused) return;

		// Add to pending events
		pendingEvents.push({ type, data });

		// Process immediately if it's a new event type
		if (!eventMap.has(type)) {
			const event = pendingEvents.find((e) => e.type === type);
			if (event) {
				processEventImmediately(event.type, event.data);
				// Remove from pending
				pendingEvents = pendingEvents.filter((e) => e.type !== type);
			}
		}

		if (pendingEvents.length >= BATCH_SIZE) {
			// Process batch if we've collected enough events
			processBatch();
		} else if (batchProcessTimeout === null) {
			// Schedule batch processing
			batchProcessTimeout = setTimeout(() => {
				batchProcessTimeout = null;
				processBatch();
			}, 100) as unknown as number;
		}
	}

	// Process an event immediately
	function processEventImmediately(type: string, data: unknown): void {
		if (!isDebugEnabled || isPaused) return;

		const now = Date.now();
		const category = getEventCategory(type);

		// Process sampling and throttling
		const counter = (samplingCounters.get(type) || 0) + 1;
		samplingCounters.set(type, counter);

		// Always add to stream events (for exact chronology)
		// But only if we're not throttling too aggressively
		if (counter % Math.max(1, Math.floor(SAMPLING_RATE / 5)) === 0) {
			addStreamEvent(type, category, now);
		}

		// Apply sampling rate for aggregation
		if (counter % SAMPLING_RATE !== 0) {
			return;
		}

		// Apply throttling for aggregation
		const lastTime = lastEventTimes.get(type) || 0;
		if (now - lastTime < THROTTLE_INTERVAL) {
			return;
		}
		lastEventTimes.set(type, now);

		// Aggregate event processing
		const eventId = type;
		const existingEvent = eventMap.get(eventId);

		if (existingEvent) {
			// Update the existing event
			existingEvent.count++;
			existingEvent.lastSeen = now;
			updateEventMap(eventId, existingEvent);
		} else {
			// Create a new event summary
			const newEvent: EventSummary = {
				id: eventId,
				type,
				category,
				count: 1,
				firstSeen: now,
				lastSeen: now
			};

			// Capture event details for both views
			captureEventDetails(eventId, data);

			// Add to the event map for aggregated view
			updateEventMap(eventId, newEvent);

			// Enforce limits on number of event types
			if (eventMap.size > MAX_EVENT_TYPES) {
				// Remove oldest event based on lastSeen time
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
		}
	}

	// Simplified for always capturing details
	function captureEventDetails(eventId: string, data: unknown): void {
		try {
			eventDetails.set(eventId, {
				data,
				formattedData: safeStringify(data)
			});
		} catch (err) {
			console.error('Error capturing event details:', err);
		}
	}

	// ============= UI INTERACTION =============

	// Toggle debug mode
	function toggleDebug(enabled: boolean): void {
		isDebugEnabled = enabled;
		EventBus.setDebug(enabled);

		// Ensure we get initial events
		if (enabled) {
			console.debug('Debug mode enabled, ready to capture events');
		} else {
			clearEvents();
		}
	}

	// Toggle pause state
	function togglePause(): void {
		isPaused = !isPaused;
		if (isPaused) {
			toast.warning('Event monitoring paused', {
				description: 'Events will not be captured until resumed'
			});
		} else {
			toast.success('Event monitoring resumed', {
				description: 'Now capturing new events'
			});
		}
	}

	// Clear all events
	function clearEvents(): void {
		if (eventMap.size === 0 && streamEvents.length === 0) {
			toast.info('No events to clear');
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

	// Select an event to view details
	function selectEvent(eventId: string): void {
		if (selectedEventId === eventId) {
			// Deselect if already selected
			selectedEventId = null;
			currentEventDetails = null;
			return;
		}

		selectedEventId = eventId;

		// Get event details
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

	// ============= FILTERING =============

	// Get filtered events for aggregated view
	let filteredEvents = $derived(
		Array.from(eventMap.values())
			// Filter by category
			.filter((e) => selectedCategory === 'all' || e.category === selectedCategory)
			// Filter by search query
			.filter((e) => !searchQuery || e.type.toLowerCase().includes(searchQuery.toLowerCase()))
			// Sort by most recent
			.sort((a, b) => b.lastSeen - a.lastSeen)
	);

	// Get filtered events for stream view (chronological)
	let filteredStreamEvents = $derived(
		streamEvents
			// Filter by category
			.filter((e) => selectedCategory === 'all' || e.category === selectedCategory)
			// Filter by search query
			.filter((e) => !searchQuery || e.type.toLowerCase().includes(searchQuery.toLowerCase()))
		// Already sorted chronologically (newest first)
	);

	// Categories list for select component
	let categoryOptions = $derived([
		{ value: 'all', label: 'All Categories' },
		...Object.keys(categoryStyles).map((category) => ({
			value: category,
			label: category.charAt(0).toUpperCase() + category.slice(1)
		}))
	]);

	// Trigger content for the select component
	let categoryTriggerContent = $derived(
		categoryOptions.find((opt) => opt.value === selectedCategory)?.label ?? 'Select category'
	);

	// ============= LIFECYCLE =============

	// Set up event listener on mount
	$effect(() => {
		if (!isDebugEnabled) return;

		// Event handler
		const handler = (type: string, data: unknown) => {
			processEvent(type, data);
		};

		// Register handler
		EventBus.onAny(handler);

		// Clean up
		return () => {
			EventBus.offAny(handler);
		};
	});

	// Clean up on destroy
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
			<!-- Controls area -->
			<div class="mb-4 flex flex-col gap-2 md:flex-row md:items-center">
				<!-- Search input -->
				<div class="relative order-2 flex-1 md:order-1">
					<Search class="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input type="text" placeholder="Search events..." class="pl-8" bind:value={searchQuery} />
					{#if searchQuery}
						<button
							class="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
							onclick={() => (searchQuery = '')}
						>
							<X class="h-4 w-4" />
						</button>
					{/if}
				</div>

				<!-- Action buttons -->
				<div class="order-1 flex flex-wrap items-center gap-2 md:order-2">
					<!-- Category filter using Select -->
					<Select.Root type="single" bind:value={selectedCategory}>
						<Select.Trigger class="w-[180px]">
							<Filter class="me-1 h-4 w-4" />
							{categoryTriggerContent}
						</Select.Trigger>
						<Select.Content>
							<Select.Group>
								<Select.GroupHeading>Categories</Select.GroupHeading>
								{#each categoryOptions as option (option.value)}
									<Select.Item value={option.value} label={option.label}>
										{#if option.value !== 'all'}
											<span
												class={cn(categoryStyles[option.value as EventCategory].indicator, ' me-2')}
											></span>
										{/if}
										{option.label}
									</Select.Item>
								{/each}
							</Select.Group>
						</Select.Content>
					</Select.Root>

					<!-- Pause/Resume -->
					<Button variant="outline" size="sm" onclick={togglePause} class="gap-2">
						{#if isPaused}
							<Play class="h-4 w-4" />
							<span>Resume</span>
						{:else}
							<Pause class="h-4 w-4" />
							<span>Pause</span>
						{/if}
					</Button>

					<!-- Clear -->
					<Button
						variant="destructive"
						size="sm"
						onclick={clearEvents}
						disabled={eventMap.size === 0}
					>
						Clear
					</Button>
				</div>
			</div>

			<!-- Tab navigation -->
			<Tabs.Root
				value={activeTab}
				onValueChange={(val) => (activeTab = val as 'stream' | 'aggregate')}
				class="mt-4"
			>
				<Tabs.List>
					<Tabs.Trigger value="aggregate" class="gap-2">
						<Rows3 class="h-4 w-4" />
						Aggregated
						<Badge variant="outline" class="ml-1">{eventMap.size}</Badge>
					</Tabs.Trigger>
					<Tabs.Trigger value="stream" class="gap-2">
						<Clock class="h-4 w-4" />
						Stream
						<Badge variant="outline" class="ml-1">{streamEvents.length}</Badge>
					</Tabs.Trigger>
				</Tabs.List>

				<!-- Help text for each tab -->
				<div class="mt-2 text-xs text-muted-foreground">
					{#if activeTab === 'aggregate'}
						<p>Aggregated view shows unique event types with counts of occurrences.</p>
					{:else}
						<p>Stream view shows individual events in chronological order (newest first).</p>
					{/if}
				</div>

				<!-- Tabs content -->
				<div class="mt-2">
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<!-- Events list (Aggregated or Stream) -->
						<div class="rounded-md border">
							<ScrollArea.Root class="h-64">
								{#if activeTab === 'aggregate'}
									<!-- Aggregated view -->
									{#if filteredEvents.length > 0}
										<div class="space-y-1 p-1">
											{#each filteredEvents as event}
												{@const isSelected = selectedEventId === event.id}
												<Button
													variant="ghost"
													size="sm"
													class={cn(
														'flex w-full items-center justify-between rounded p-2 text-left',
														isSelected ? 'bg-muted' : ''
													)}
													onclick={() => selectEvent(event.id)}
												>
													<div class="flex items-center gap-2 overflow-hidden">
														<Badge
															variant={categoryStyles[event.category].variant}
															class={cn('shrink-0', categoryStyles[event.category].class)}
														>
															{event.category}
														</Badge>
														<span class="truncate font-medium">{event.type}</span>
														{#if event.count > 1}
															<Badge variant="secondary" class="font-mono text-xs font-bold">
																×{event.count}
															</Badge>
														{/if}
													</div>
													<span class="shrink-0 text-xs text-muted-foreground"
														>{formatTime(event.lastSeen)}</span
													>
												</Button>
											{/each}
										</div>
									{:else}
										<div class="flex h-full items-center justify-center text-muted-foreground">
											{searchQuery || selectedCategory !== 'all'
												? 'No matching events found...'
												: 'No events captured yet...'}
										</div>
									{/if}
								{:else}
									<!-- Stream view -->
									{#if filteredStreamEvents.length > 0}
										<div class="space-y-1 p-1">
											{#each filteredStreamEvents as event}
												{@const isSelected = selectedEventId === event.detailsId}
												<Button
													variant="ghost"
													size="sm"
													class={cn(
														'flex w-full items-center justify-between rounded p-2 text-left',
														isSelected ? 'bg-muted' : ''
													)}
													onclick={() => selectEvent(event.detailsId)}
												>
													<div class="flex items-center gap-2 overflow-hidden">
														<Badge
															variant={categoryStyles[event.category].variant}
															class={cn('shrink-0', categoryStyles[event.category].class)}
														>
															{event.category}
														</Badge>
														<span class="truncate font-medium">{event.type}</span>
													</div>
													<span class="shrink-0 text-xs text-muted-foreground"
														>{formatTime(event.timestamp)}</span
													>
												</Button>
											{/each}
										</div>
									{:else}
										<div class="flex h-full items-center justify-center text-muted-foreground">
											{searchQuery || selectedCategory !== 'all'
												? 'No matching events found...'
												: 'No events captured yet...'}
										</div>
									{/if}
								{/if}
							</ScrollArea.Root>
						</div>

						<!-- Event details -->
						<div class="rounded-md border p-4">
							<ScrollArea.Root class="h-64">
								{#if selectedEventId !== null && currentEventDetails}
									<div class="mb-2 flex items-center justify-between">
										<h3 class="font-semibold">
											Event Details
											<Badge variant="outline" class="ml-2">
												{selectedEventId}
											</Badge>
										</h3>
										<Button
											variant="ghost"
											size="icon"
											class="h-8 w-8"
											onclick={() => {
												if (currentEventDetails) {
													navigator.clipboard.writeText(currentEventDetails.formattedData);
												}
												toast.success(`Copied Event Details`, {
													description: `'${selectedEventId}' event details copied to clipboard`
												});
											}}
											title="Copy data"
										>
											<Copy class="h-4 w-4" />
										</Button>
									</div>
									<pre
										class="overflow-x-auto whitespace-pre-wrap rounded-md bg-muted/50 p-3 font-mono text-xs">{currentEventDetails.formattedData}</pre>
								{:else}
									<div class="flex h-full items-center justify-center text-muted-foreground">
										Select an event to view details
									</div>
								{/if}
							</ScrollArea.Root>
						</div>
					</div>
				</div>
			</Tabs.Root>
		{:else}
			<div class="text-center text-muted-foreground">Enable event debugging to see event flow</div>
		{/if}
	</CardContent>
</Card>
