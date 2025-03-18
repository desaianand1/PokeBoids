import type { IBoid } from '$interfaces/boid';
import type { IVector2 } from '$interfaces/vector';

/**
 * Interface for flocking behavior calculations
 */
export interface IFlockingBehavior {
  /**
   * Calculate steering force based on boid and its neighbors
   */
  calculate(boid: IBoid, neighbors: IBoid[]): IVector2;
}

/**
 * Configuration for flocking behavior
 */
export interface IFlockingConfig {
  alignmentWeight: number;
  cohesionWeight: number;
  separationWeight: number;
  perceptionRadius: number;
  separationRadius: number;
}

/**
 * Interface for flock logic operations
 */
export interface IFlockLogic {
  /**
   * Calculate combined forces for a boid based on its neighbors
   */
  calculateForces(boid: IBoid, neighbors: IBoid[]): IVector2;

  /**
   * Update all boids in the flock
   */
  update(boids: IBoid[], deltaTime: number): void;
}
