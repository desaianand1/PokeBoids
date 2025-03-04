import { Scene } from 'phaser';
import { EventBus } from '$game/event-bus';
import { BoidManager } from '$boid/manager';
import type { BoidConfig } from '$boid/config';

export class Game extends Scene {
	private boidManager: BoidManager | null = null;

    constructor() {
        super({ key: 'Game' });
    }

    create() {
        this.initializeEventListeners();
        EventBus.emit('current-scene-ready', this);

        // Clean up when scene is destroyed
        this.events.on('shutdown', this.cleanup, this);
        this.events.on('destroy', this.cleanup, this);
    }

    update() {
        this.boidManager?.update();
    }

    private initializeEventListeners(): void {
        EventBus.on('init-boid-simulation', this.initBoidSimulation, this);
        EventBus.on('update-boid-config', this.updateBoidConfig, this);
    }

    private cleanup(): void {
        // Remove event listeners
        EventBus.off('init-boid-simulation', this.initBoidSimulation, this);
        EventBus.off('update-boid-config', this.updateBoidConfig, this);

        // Clean up boid manager
        if (this.boidManager) {
            this.boidManager.destroy();
            this.boidManager = null;
        }
    }

    private initBoidSimulation = (scene: Scene, config: BoidConfig): void => {
        // Clean up existing manager if any
        if (this.boidManager) {
            this.boidManager.destroy();
        }
        
        this.boidManager = new BoidManager(scene, config);
        console.debug('Boid simulation initialized with', this.boidManager.getBoidsCount(), 'boids');
    };

    private updateBoidConfig = (newConfig: Partial<BoidConfig>): void => {
        this.boidManager?.updateConfig(newConfig);
        
        if (newConfig.boidCount !== undefined) {
            console.debug('Updated boid count to', this.boidManager?.getBoidsCount());
        }
    };
}
