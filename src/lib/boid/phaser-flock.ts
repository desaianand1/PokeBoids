import type { Scene } from 'phaser';
import type { IFlockingConfig } from '$interfaces/flocking';
import { FlockLogic } from '$boid/flock-logic';
import { PhaserVectorFactory } from '$adapters/phaser-vector';
import { PhaserBoid } from '$boid/phaser-boid';
import { BoidVariant } from '$boid/types';
import type { IGameEventBus } from '$adapters/phaser-events';

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
    // Update each boid with delta time
    for (const boid of this.boids) {
      boid.update(deltaTime);
    }

    // Use core logic to update boids
    this.logic.update(this.boids);
    
    // Update Phaser-specific properties
    for (const boid of this.boids) {
      // Update position and rotation from boid state
      const position = boid.getBoidPosition();
      const velocity = boid.getBoidVelocity();
      
      boid.setPosition(position.x, position.y);
      boid.rotation = Math.atan2(velocity.y, velocity.x) + Math.PI / 2;
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
  
  clear(): void {
    // Remove all boids
    while (this.boids.length > 0) {
      const boid = this.boids[0];
      this.removeBoid(boid);
      boid.destroy();
    }
  }
  
  destroy(): void {
    this.clear();
  }
}
