import type { IBoid } from '$interfaces/boid';
import type { IVector2 } from '$interfaces/vector';

/**
 * Interface for spatial partitioning strategies
 * Encapsulates the logic for efficiently finding nearby objects in space
 */
export interface ISpatialPartitioning {
	/**
	 * Insert a boid into the spatial partitioning structure
	 */
	insert(boid: IBoid): void;

	/**
	 * Find all boids near a position within a radius
	 */
	findNearby(position: IVector2, radius: number): IBoid[];

	/**
	 * Update the spatial partitioning structure with a new set of boids
	 */
	update(boids: IBoid[]): void;

	/**
	 * Clear the spatial partitioning structure
	 */
	clear(): void;

}
