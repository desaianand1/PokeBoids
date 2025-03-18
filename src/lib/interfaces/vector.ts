/**
 * Interface for 2D vector operations
 */
export interface IVector2 {
  x: number;
  y: number;
  
  // Basic vector operations
  add(v: IVector2): IVector2;
  subtract(v: IVector2): IVector2;
  scale(s: number): IVector2;
  normalize(): IVector2;
  limit(max: number): IVector2;
  
  // Vector properties
  length(): number;
  lengthSquared(): number;
  
  // Vector manipulation
  set(x: number, y: number): IVector2;
  setLength(length: number): IVector2;
  
  // Utility methods
  clone(): IVector2;
  copy(v: IVector2): IVector2;
  
  // Optional angle methods
  angle?(): number;
  setAngle?(angle: number): IVector2;
  rotate?(angle: number): IVector2;
}

/**
 * Interface for creating vector instances
 */
export interface IVectorFactory {
  /**
   * Creates a new vector with the given x and y components
   */
  create(x: number, y: number): IVector2;
  
  /**
   * Creates a vector from an angle and magnitude
   */
  fromAngle(angle: number, magnitude?: number): IVector2;
  
  /**
   * Creates a random vector with the given magnitude
   */
  random(magnitude?: number): IVector2;
}

/**
 * Interface for distance calculations between points or vectors
 */
export interface IDistanceCalculator {
  /**
   * Calculate distance between two points
   */
  between(v1: IVector2, v2: IVector2): number;
  /**
   * Calculate squared distance between two points
   * (More efficient when exact distance isn't needed)
   */
  betweenSquared(v1: IVector2, v2: IVector2): number;

}
