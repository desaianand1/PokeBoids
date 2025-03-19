import type { Game, Scene } from 'phaser';
import { createGame } from '$game';
import { EventBus } from '$events/event-bus';

export interface PhaserGameRef {
	game: Game | null;
	scene: Scene | null;
	isReady: boolean;
	error: Error | null;
}

export interface GameStatistics {
	totalBoids: number;
	preyCount: number;
	predatorCount: number;
	reproductionEvents: number;
	deathEvents: number;
}

const initialGameRef = {
	game: null,
	scene: null,
	isReady: false,
	error: null
};

const initialGameStats = {
	totalBoids: 0,
	predatorCount: 0,
	preyCount: 0,
	reproductionEvents: 0,
	deathEvents: 0
};

// Create state variables at the module level
const phaserGameRef = $state<PhaserGameRef>(initialGameRef);
const gameStats = $state<GameStatistics>(initialGameStats);
let runtimeInterval = $state<NodeJS.Timeout>();
let gameRuntimeDuration = $state<number>(0);

// Initialize the game
function initialize(containerId: string) {
	if (phaserGameRef.game) return; // Already initialized

	try {
		phaserGameRef.game = createGame(containerId);

		// Set up event listeners with proper type safety
		EventBus.subscribe('scene-ready', (data) => {
			phaserGameRef.scene = data.scene;
			phaserGameRef.isReady = true;
			startGameRuntimeTimer();
		});

		// Set up statistics event listeners with proper type safety
		EventBus.subscribe('flock-updated', ({ count }) => {
			gameStats.totalBoids = count;
		});

		EventBus.subscribe('prey-count-updated', ({ count }) => {
			gameStats.preyCount = count;
		});

		EventBus.subscribe('predator-count-updated', ({ count }) => {
			gameStats.predatorCount = count;
		});

		EventBus.subscribe('boid-reproduced', () => {
			gameStats.reproductionEvents++;
		});

		EventBus.subscribe('boid-removed', () => {
			gameStats.deathEvents++;
		});

		EventBus.subscribe('game-reset', () => {
			gameStats.reproductionEvents = 0;
			gameStats.deathEvents = 0;
		});
	} catch (err) {
		phaserGameRef.error = err instanceof Error ? err : new Error('Unknown error');
		console.error('Failed to initialize Phaser game:', phaserGameRef.error);
	}
}

// Clean up resources
function destroy() {
	resetGameRuntimeTimer();
	if (phaserGameRef.game) {
		phaserGameRef.game.destroy(true);
		phaserGameRef.game = null;
	}

	phaserGameRef.scene = null;
	phaserGameRef.isReady = false;
	phaserGameRef.error = null;

	// Clean up event listeners using unsubscribe
	EventBus.unsubscribe('scene-ready');
	EventBus.unsubscribe('flock-updated');
	EventBus.unsubscribe('prey-count-updated');
	EventBus.unsubscribe('predator-count-updated');
	EventBus.unsubscribe('boid-reproduced');
	EventBus.unsubscribe('boid-removed');
	EventBus.unsubscribe('game-reset');
}

function resetStats() {
	gameStats.reproductionEvents = 0;
	gameStats.deathEvents = 0;
}

function startGameRuntimeTimer() {
	if (runtimeInterval) clearInterval(runtimeInterval);
	// Start tracking runtime
	const startTime = Date.now();
	runtimeInterval = setInterval(() => {
		gameRuntimeDuration = Math.floor((Date.now() - startTime) / 1000);
	}, 1000);
}

function resetGameRuntimeTimer() {
	clearInterval(runtimeInterval);
	gameRuntimeDuration = 0;
}

function getRuntimeDuration(): number {
	return gameRuntimeDuration;
}

export { phaserGameRef, gameStats, initialize, destroy, resetStats, getRuntimeDuration };
