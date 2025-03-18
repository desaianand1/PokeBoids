/**
 * Base stats shared by all boids
 */
export interface BaseBoidStats {
  health: number;
  stamina: number;
  speed: number;
  reproduction: number;
  level: number;
  sex: 'male' | 'female';
}

/**
 * Stats specific to prey boids
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PreyStats extends BaseBoidStats {
  // Future prey-specific stats can be added here
  // For example:
  // evasionSkill?: number;
  // camouflage?: number;
}

/**
 * Stats specific to predator boids
 */
export interface PredatorStats extends BaseBoidStats {
  attack: number;
  // Future predator-specific stats can be added here
  // For example:
  // huntingSkill?: number;
  // stealthLevel?: number;
}

/**
 * Represents the type of boid in the simulation
 */
export enum BoidVariant {
  PREY = 'prey',
  PREDATOR = 'predator'
}

/**
 * Type guard to check if a boid is a predator
 */
export function isPredator(variant: BoidVariant): variant is BoidVariant.PREDATOR {
  return variant === BoidVariant.PREDATOR;
}

/**
 * Type guard to check if stats are predator stats
 */
export function isPredatorStats(stats: BaseBoidStats): stats is PredatorStats {
  return 'attack' in stats;
}

/**
 * Union type for all possible boid stats
 */
export type BoidStats = PreyStats | PredatorStats;