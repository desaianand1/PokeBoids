import type { Scene } from 'phaser';
import type { IFlockingConfig } from '$interfaces/flocking';
import { FlockLogic } from '$boid/flock-logic';
import { PhaserVectorFactory } from '$adapters/phaser-vector';
import { PhaserBoid } from '$boid/phaser-boid';
import { BoidVariant } from '$boid/types';
import type { IGameEventBus } from '$events/types';

/**
 * Phaser-specific flock implementation that uses pure FlockLogic
 */
export class PhaserFlock {
	private logic: FlockLogic;
	private boids: PhaserBoid[] = [];
	private preyCount = 0;
	private predatorCount = 0;

	constructor(
		private scene: Scene,
		private eventBus: IGameEventBus,
		config: IFlockingConfig
	) {
		// Create vector factory for Phaser
		const vectorFactory = new PhaserVectorFactory();

		// Create core flock logic
		this.logic = new FlockLogic(vectorFactory, eventBus, config);
	}

	addBoid(boid: PhaserBoid): void {
		this.boids.push(boid);

		// Update type counts
		if (boid.getVariant() === BoidVariant.PREDATOR) {
			this.predatorCount++;
			this.eventBus.emit('predator-count-updated', { count: this.predatorCount });
		} else {
			this.preyCount++;
			this.eventBus.emit('prey-count-updated', { count: this.preyCount });
		}

		// Emit events
		this.eventBus.emit('boid-added', { boid });
		this.eventBus.emit('flock-updated', { count: this.boids.length });
	}

	removeBoid(boid: PhaserBoid): void {
		const index = this.boids.indexOf(boid);
		if (index !== -1) {
			this.boids.splice(index, 1);

			// Update type counts
			if (boid.getVariant() === BoidVariant.PREDATOR) {
				this.predatorCount--;
				this.eventBus.emit('predator-count-updated', { count: this.predatorCount });
			} else {
				this.preyCount--;
				this.eventBus.emit('prey-count-updated', { count: this.preyCount });
			}

			// Emit events
			this.eventBus.emit('boid-removed', { boid });
			this.eventBus.emit('flock-updated', { count: this.boids.length });
		}
	}

	update(deltaTime: number): void {
		// Update each boid's behavior
		for (const boid of this.boids) {
			boid.update(deltaTime);
		}

		// Use core logic to update boids
		this.logic.update(this.boids);

		// Check for predator-prey collisions and attacks
		this.checkPredatorPreyInteractions();

		// Sync Phaser-specific properties
		for (const boid of this.boids) {
			boid.syncWithPhaser();
		}
	}

	getBoids(): PhaserBoid[] {
		return this.boids;
	}

	getPreyCount(): number {
		return this.preyCount;
	}

	getPredatorCount(): number {
		return this.predatorCount;
	}

	/**
	 * Check for predator-prey interactions and trigger attacks/hurt animations
	 */
	private checkPredatorPreyInteractions(): void {
		// Get predators and prey
		const predators = this.boids.filter(b => b.getVariant() === BoidVariant.PREDATOR);
		const prey = this.boids.filter(b => b.getVariant() === BoidVariant.PREY);

		for (const predator of predators) {
			const predatorPos = predator.getBoidPosition();
			const attackRadius = predator.getAttackRadius();
			
			// Check if predator can attack (not already attacking and has cooldown)
			if (!predator.canAttack()) continue;

			for (const preyBoid of prey) {
				const preyPos = preyBoid.getBoidPosition();
				const distance = Math.sqrt(
					Math.pow(predatorPos.x - preyPos.x, 2) + 
					Math.pow(predatorPos.y - preyPos.y, 2)
				);

				// If prey is within attack range, trigger attack
				if (distance <= attackRadius) {
					this.triggerPredatorAttack(predator, preyBoid);
					break; // Attack only one prey per frame
				}
			}
		}
	}

	/**
	 * Trigger predator attack on prey
	 */
	private triggerPredatorAttack(predator: PhaserBoid, prey: PhaserBoid): void {
		// Trigger predator attack animation
		predator.playAttack(() => {
			// Check if hit frame was reached and prey is still in range
			if (predator.isAtHitFrame()) {
				const predatorPos = predator.getBoidPosition();
				const preyPos = prey.getBoidPosition();
				const distance = Math.sqrt(
					Math.pow(predatorPos.x - preyPos.x, 2) + 
					Math.pow(predatorPos.y - preyPos.y, 2)
				);

				// If still in range, deal damage and trigger hurt animation
				if (distance <= predator.getAttackRadius()) {
					const wasKilled = prey.takeDamage(1); // Deal 1 damage
					
					// Trigger prey hurt animation
					prey.playHurt();
					
					// If prey was killed, remove it (will be handled by existing death system)
					if (wasKilled) {
						console.log('Prey killed by predator attack!');
					}
				}
			}
		});
	}

	clear(): void {
		// Remove all boids
		while (this.boids.length > 0) {
			const boid = this.boids[0];
			this.removeBoid(boid);
			boid.destroy();
		}
	}

	destroy(): void {
		// Remove resize listener
		this.scene.scale.off('resize');

		// Clean up logic
		if (this.logic && 'destroy' in this.logic) {
			this.logic.destroy();
		}

		this.clear();
	}
}
