/**
 * Interface for random number generation
 */
export interface IRandomGenerator {
  /**
   * Generate a random float between min and max (inclusive)
   */
  float(min: number, max: number): number;
  
  /**
   * Generate a random integer between min and max (inclusive)
   */
  integer(min: number, max: number): number;
  
  /**
   * Generate a random boolean with given probability
   * @param probability Probability of returning true (0 to 1)
   */
  boolean(probability?: number): boolean;
  
  /**
   * Generate a random angle in radians
   */
  angle(): number;
  
  /**
   * Pick a random item from an array
   */
  pick<T>(array: T[]): T;
  
  /**
   * Get a random value between 0 and 1
   */
  value(): number;
}

/**
 * Interface for time management
 */
export interface ITimeProvider {
  /**
   * Get the current time in milliseconds
   */
  now(): number;
  
  /**
   * Get the time elapsed since the last update in milliseconds
   */
  getDelta(): number;
  
  /**
   * Get the current frame number
   */
  getFrame(): number;
  
  /**
   * Get the current frames per second
   */
  getFPS(): number;
  
  /**
   * Schedule a callback to run after a delay
   * @returns A handle that can be used to cancel the callback
   */
  setTimeout(callback: () => void, delay: number): number;
  
  /**
   * Cancel a scheduled callback
   */
  clearTimeout(handle: number): void;
}

/**
 * Interface for physics calculations
 */
export interface IPhysics {
  /**
   * Check if two circles overlap
   */
  circleOverlap(
    x1: number,
    y1: number,
    radius1: number,
    x2: number,
    y2: number,
    radius2: number
  ): boolean;
  
  /**
   * Check if a point is inside a circle
   */
  pointInCircle(
    pointX: number,
    pointY: number,
    circleX: number,
    circleY: number,
    radius: number
  ): boolean;
  
  /**
   * Get the angle between two points in radians
   */
  angleBetweenPoints(
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): number;
  
  /**
   * Get the shortest angle between two angles in radians
   */
  shortestAngleBetween(angle1: number, angle2: number): number;
}

/**
 * Interface for debug visualization
 */
export interface IDebugRenderer {
  /**
   * Clear all debug graphics
   */
  clear(): void;
  
  /**
   * Draw a circle
   */
  drawCircle(x: number, y: number, radius: number, color: number, alpha?: number): void;
  
  /**
   * Draw a line
   */
  drawLine(x1: number, y1: number, x2: number, y2: number, color: number, alpha?: number): void;
  
  /**
   * Draw a vector from a point
   */
  drawVector(x: number, y: number, vector: { x: number; y: number }, color: number, alpha?: number): void;
  
  /**
   * Set line style for subsequent draw operations
   */
  setLineStyle(width: number, color: number, alpha?: number): void;
}
