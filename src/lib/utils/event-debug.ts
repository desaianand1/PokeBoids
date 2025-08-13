import type {
	SceneEvents,
	BoidEvents,
	SimulationEvents,
	FlockingEvents,
	ConfigEvents,
	DebugEvents,
	GameEvents
} from '$events/types';

// Event category and name types
export type EventCategory =
	| 'boid'
	| 'flocking'
	| 'simulation'
	| 'config'
	| 'scene'
	| 'debug'
	| 'other';
export type EventName = keyof GameEvents & string;

// Core event data structure (lightweight)
export interface EventSummary {
	id: string; // Unique ID (type-based)
	type: EventName; // Event type name
	category: EventCategory; // Category
	count: number; // Number of occurrences
	firstSeen: number; // Timestamp of first occurrence
	lastSeen: number; // Timestamp of last occurrence
}

// Stream event - represents a single occurrence of an event
export interface StreamEvent {
	id: string; // Unique ID (timestamp-based)
	type: EventName; // Event type name
	category: EventCategory; // Category
	timestamp: number; // When the event occurred
	detailsId: string; // ID to lookup details (usually same as type)
}

// Detailed event data (stored separately)
export interface EventDetails {
	data: GameEvents[keyof GameEvents] | null;
	formattedData: string;
}

// Pending event type
export interface PendingEvent {
	type: keyof GameEvents & string;
	data: GameEvents[keyof GameEvents];
}

// Type-safe mapping of event categories to their event types
export const EVENT_CATEGORIES: {
	scene: readonly (keyof SceneEvents)[];
	boid: readonly (keyof BoidEvents)[];
	simulation: readonly (keyof SimulationEvents)[];
	flocking: readonly (keyof FlockingEvents)[];
	config: readonly (keyof ConfigEvents)[];
	debug: readonly (keyof DebugEvents)[];
} = {
	scene: [
		'scene-ready',
		'game-started',
		'game-reset',
		'world-bounds-initialized',
		'world-bounds-changed'
	] as const,
	boid: [
		'boid-added',
		'boid-removed',
		'boid-damaged',
		'boid-leveled-up',
		'boid-stamina-depleted',
		'boid-stamina-recovered',
		'boundary-collision'
	] as const,
	simulation: [
		'simulation-resumed',
		'simulation-paused',
		'simulation-restart',
		'simulation-speed-changed'
	] as const,
	flocking: [
		'alignment-updated',
		'coherence-updated',
		'separation-updated',
		'flock-updated',
		'predator-count-updated',
		'prey-count-updated'
	] as const,
	config: [
		'alignment-weight-changed',
		'cohesion-weight-changed',
		'separation-weight-changed',
		'perception-radius-changed',
		'separation-radius-changed',
		'boundary-margin-changed',
		'boundary-force-changed',
		'boundary-force-ramp-changed',
		'obstacle-perception-radius-changed',
		'obstacle-force-changed',
		'max-speed-changed',
		'max-force-changed',
		'boid-config-changed',
		'initial-prey-count-changed',
		'initial-predator-count-changed',
		'obstacle-count-changed',
		'track-stats-changed',
		'simulation-config-changed'
	] as const,
	debug: ['debug-toggle'] as const
} as const;

// Category styling with new categories
export const categoryStyles: Record<
	EventCategory,
	{
		variant: 'default' | 'destructive' | 'outline' | 'secondary';
		indicator: string;
		class: string;
		textColor: string;
	}
> = {
	boid: {
		variant: 'outline',
		indicator: 'bg-emerald-500 w-3 h-3 rounded-full',
		class: 'border-emerald-500 text-emerald-500',
		textColor: 'text-emerald-600 dark:text-emerald-300'
	},
	flocking: {
		variant: 'outline',
		indicator: 'bg-sky-500 w-3 h-3 rounded-full',
		class: 'border-sky-500 text-sky-500',
		textColor: 'text-sky-600 dark:text-sky-300'
	},
	simulation: {
		variant: 'outline',
		indicator: 'bg-amber-500 w-3 h-3 rounded-full',
		class: 'border-amber-500 text-amber-500',
		textColor: 'text-amber-600 dark:text-amber-300'
	},
	config: {
		variant: 'outline',
		indicator: 'bg-fuchsia-500 w-3 h-3 rounded-full',
		class: 'border-fuchsia-500 text-fuchsia-500',
		textColor: 'text-fuchsia-600 dark:text-fuchsia-300'
	},
	scene: {
		variant: 'outline',
		indicator: 'bg-rose-500 w-3 h-3 rounded-full',
		class: 'border-rose-500 text-rose-500',
		textColor: 'text-rose-600 dark:text-rose-300'
	},
	debug: {
		variant: 'outline',
		indicator: 'bg-orange-500 w-3 h-3 rounded-full',
		class: 'border-orange-500 text-orange-500',
		textColor: 'text-orange-600 dark:text-orange-300'
	},
	other: {
		variant: 'outline',
		indicator: 'bg-gray-500 w-3 h-3 rounded-full',
		class: 'border-gray-500 text-gray-500',
		textColor: 'text-gray-600 dark:text-gray-300'
	}
} as const;

// Configuration constants
export const EVENT_CONFIG = {
	MAX_EVENT_TYPES: 50, // How many distinct event types to retain
	SAMPLING_RATE: 5, // How often to sample events of the same type
	THROTTLE_INTERVAL: 1000, // Time interval (ms) for throttling events
	BATCH_SIZE: 20, // Batch processing - only update UI after collecting this many events
	MAX_STREAM_EVENTS: 50 // Max events to show in the stream view
} as const;

// Type guards for each event category
function isSceneEvent(event: string): event is keyof SceneEvents {
	return EVENT_CATEGORIES.scene.includes(event as keyof SceneEvents);
}

function isBoidEvent(event: string): event is keyof BoidEvents {
	return EVENT_CATEGORIES.boid.includes(event as keyof BoidEvents);
}

function isSimulationEvent(event: string): event is keyof SimulationEvents {
	return EVENT_CATEGORIES.simulation.includes(event as keyof SimulationEvents);
}

function isFlockingEvent(event: string): event is keyof FlockingEvents {
	return EVENT_CATEGORIES.flocking.includes(event as keyof FlockingEvents);
}

function isConfigEvent(event: string): event is keyof ConfigEvents {
	return EVENT_CATEGORIES.config.includes(event as keyof ConfigEvents);
}

function isDebugEvent(event: string): event is keyof DebugEvents {
	return EVENT_CATEGORIES.debug.includes(event as keyof DebugEvents);
}

/**
 * Determine the category of an event based on its name
 */
export function getEventCategory(eventName: EventName): EventCategory {
	if (isSceneEvent(eventName)) return 'scene';
	if (isBoidEvent(eventName)) return 'boid';
	if (isSimulationEvent(eventName)) return 'simulation';
	if (isFlockingEvent(eventName)) return 'flocking';
	if (isConfigEvent(eventName)) return 'config';
	if (isDebugEvent(eventName)) return 'debug';
	return 'other';
}

/**
 * Format timestamp for display in local timezone
 */
export function formatTime(timestamp: number): string {
	const date = new Date(timestamp);
	return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

interface PhaserSprite {
	type?: string;
	constructor?: { name: string };
	anims?: unknown;
	name?: string;
	x?: number;
	y?: number;
	visible?: boolean;
	texture?: { key?: string };
}

type SafeValue = string | number | boolean | null | undefined | SafeObject | SafeValue[];
interface SafeObject {
	[key: string]: SafeValue;
}

/**
 * Create a safe, serializable version of event data
 */
export function safeStringify(obj: unknown): string {
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
					const phaserObj = value as PhaserSprite;
					if (
						phaserObj.type === 'Sprite' ||
						phaserObj.constructor?.name === 'Sprite' ||
						phaserObj.anims
					) {
						// Return a simplified representation of Phaser sprites
						return {
							__type: 'PhaserSprite',
							name: phaserObj.name || '[Unnamed Sprite]',
							position:
								phaserObj.x !== undefined && phaserObj.y !== undefined
									? { x: phaserObj.x, y: phaserObj.y }
									: '[Unknown Position]',
							visible: phaserObj.visible,
							...(phaserObj.texture
								? { texture: phaserObj.texture.key || '[Unknown Texture]' }
								: {})
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
			const sanitize = (input: unknown): SafeValue => {
				if (input === null || input === undefined) return input;

				if (typeof input !== 'object') {
					// Return primitive values as-is
					if (['string', 'number', 'boolean'].includes(typeof input)) {
						return input as SafeValue;
					}
					return String(input);
				}

				// Handle arrays
				if (Array.isArray(input)) {
					return input.map((item) => {
						try {
							return sanitize(item);
						} catch {
							return '[Error: Unable to sanitize array item]';
						}
					});
				}

				// Handle objects
				const result: SafeObject = {};

				// Only include safe properties
				for (const key in input) {
					try {
						if (Object.prototype.hasOwnProperty.call(input, key)) {
							const value = (input as Record<string, unknown>)[key];
							if (value === null || value === undefined) {
								result[key] = value;
							} else if (
								typeof value !== 'object' &&
								typeof value !== 'function' &&
								typeof value !== 'symbol'
							) {
								result[key] = String(value);
							} else if (typeof value === 'object') {
								// Only try to sanitize if it's actually an object and not a complex type like WebGLTexture
								const constructorName =
									(value as { constructor?: { name: string } })?.constructor?.name || '';
								if (['Object', 'Array'].includes(constructorName)) {
									result[key] = sanitize(value);
								} else {
									result[key] = `[${constructorName}]`;
								}
							}
						}
					} catch {
						result[key] = '[Error: Unable to access property]';
					}
				}

				return result;
			};

			return JSON.stringify(sanitize(obj), null, 2);
		} catch (fallbackErr) {
			return `[Error formatting data: ${err instanceof Error ? err.message : 'Unknown error'}. Additional error during fallback: ${fallbackErr instanceof Error ? fallbackErr.message : 'Unknown error'}]`;
		}
	}
}

/**
 * Capture event details in a safe format
 */
export function captureEventDetails(
	eventId: keyof GameEvents & string,
	data: GameEvents[keyof GameEvents]
): EventDetails {
	try {
		return {
			data,
			formattedData: safeStringify(data)
		};
	} catch (err) {
		console.error('Error capturing event details:', err instanceof Error ? err.message : err);
		return {
			data: null,
			formattedData: `[Error: Failed to capture event details - ${err instanceof Error ? err.message : String(err)}]`
		};
	}
}
