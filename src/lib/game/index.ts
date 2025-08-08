import Phaser from 'phaser';
import { Boot } from '$scenes/boot';
import { Splash } from '$scenes/splash';
import { Game as MainGame } from '$scenes/game';
import { EventBus } from '$events/event-bus';

export class BoidsGame extends Phaser.Game {
	constructor(config: Phaser.Types.Core.GameConfig) {
		super(config);
	}

	destroy(removeCanvas: boolean): void {
		super.destroy(removeCanvas);
	}
}

export interface GameOptions {
	debug?: boolean;
}

export function createGame(containerId: string, options: GameOptions = {}): BoidsGame {
	// Set debug mode on EventBus
	EventBus.setDebug(options.debug ?? false);

	const config: Phaser.Types.Core.GameConfig = {
		type: Phaser.AUTO,
		parent: containerId,
		width: window.innerWidth,
		height: window.innerHeight,
		backgroundColor: '#000',
		physics: {
			default: 'arcade',
			arcade: {
				debug: options.debug ?? false,
				gravity: { x: 0, y: 0 }
			}
		},
		scene: [Boot, Splash, MainGame]
	};

	return new BoidsGame(config);
}
