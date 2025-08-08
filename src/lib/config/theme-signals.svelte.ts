import { mode } from 'mode-watcher';
import { EventBus } from '$events/event-bus';

/**
 * Theme state management using mode-watcher integration
 * Follows the established pattern from simulation-signals.svelte.ts
 * Automatically detects and propagates theme changes to the game
 */

// Create root effect context to enable module-level reactivity
$effect.root(() => {
	// Watch mode changes and emit theme-changed events
	$effect(() => {
		const isDark = mode.current === 'dark';
		EventBus.emit('theme-changed', { isDark });
	});
});

// Export function returning current theme state for other components if needed
export function getIsDarkMode(): boolean {
	return mode.current === 'dark';
}