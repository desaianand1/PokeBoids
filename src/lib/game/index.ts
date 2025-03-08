import Phaser from 'phaser';
import { Boot } from '$scenes/boot';
import { Preloader } from '$scenes/preloader';
import { Game as MainGame } from '$scenes/game';

export class BoidsGame extends Phaser.Game {
	constructor(config: Phaser.Types.Core.GameConfig) {
		super(config);
	}

	destroy(removeCanvas: boolean): void {
		super.destroy(removeCanvas);
	}
}

export function createGame(containerId: string): BoidsGame {
	const config: Phaser.Types.Core.GameConfig = {
		type: Phaser.AUTO,
		parent: containerId,
		width: window.innerWidth,
		height: window.innerHeight,
		backgroundColor: '#80EF80',
		physics: {
			default: 'arcade',
			arcade: {
				debug: false,
				gravity: { x: 0, y: 0 }
			}
		},
		scene: [Boot, Preloader, MainGame]
	};

	return new BoidsGame(config);
}
