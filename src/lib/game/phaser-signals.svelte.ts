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
let runtimeStartTime = $state<number>(0);
let runtimePausedTime = $state<number>(0);
let isRuntimePaused = $state<boolean>(false);

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

		// Listen for simulation pause/resume events to control runtime timer
		EventBus.subscribe('simulation-paused', () => {
			pauseRuntimeTimer();
		});

		EventBus.subscribe('simulation-resumed', () => {
			resumeRuntimeTimer();
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
	EventBus.unsubscribe('simulation-paused');
	EventBus.unsubscribe('simulation-resumed');
}

function resetStats() {
	gameStats.reproductionEvents = 0;
	gameStats.deathEvents = 0;
}

function startGameRuntimeTimer() {
	if (runtimeInterval) clearInterval(runtimeInterval);
	// Start tracking runtime
	runtimeStartTime = Date.now();
	runtimePausedTime = 0;
	isRuntimePaused = false;
	runtimeInterval = setInterval(() => {
		if (!isRuntimePaused) {
			const currentTime = Date.now();
			gameRuntimeDuration = Math.floor((currentTime - runtimeStartTime - runtimePausedTime) / 1000);
		}
	}, 1000);
}

function pauseRuntimeTimer() {
	if (!isRuntimePaused) {
		isRuntimePaused = true;
		// Remember when we paused to subtract this time later
		runtimePausedTime += Date.now() - (runtimeStartTime + runtimePausedTime);
	}
}

function resumeRuntimeTimer() {
	if (isRuntimePaused) {
		isRuntimePaused = false;
		// Adjust the start time to account for paused duration
		runtimeStartTime = Date.now() - gameRuntimeDuration * 1000;
		runtimePausedTime = 0;
	}
}

function resetGameRuntimeTimer() {
	clearInterval(runtimeInterval);
	gameRuntimeDuration = 0;
	runtimeStartTime = 0;
	runtimePausedTime = 0;
	isRuntimePaused = false;
}

function getRuntimeDuration(): number {
	return gameRuntimeDuration;
}

export { phaserGameRef, gameStats, initialize, destroy, resetStats, getRuntimeDuration };
