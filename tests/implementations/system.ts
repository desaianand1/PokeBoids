import type { IRandomGenerator, ITimeProvider, IPhysics, IDebugRenderer } from '$interfaces';
import type { IVector2 } from '$interfaces';

/**
 * Deterministic random number generator for testing
 */
export class TestRandomGenerator implements IRandomGenerator {
  private seed: number;

  constructor(seed = 1) {
    this.seed = seed;
  }

  // Simple pseudo-random number generator
  private random(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }

  float(min: number, max: number): number {
    return min + this.random() * (max - min);
  }

  integer(min: number, max: number): number {
    return Math.floor(this.float(min, max + 1));
  }

  boolean(probability = 0.5): boolean {
    return this.random() < probability;
  }

  angle(): number {
    return this.float(0, Math.PI * 2);
  }

  pick<T>(array: T[]): T {
    return array[this.integer(0, array.length - 1)];
  }

  value(): number {
    return this.random();
  }

  // Helper method to reset the seed
  reset(seed = 1): void {
    this.seed = seed;
  }
}

/**
 * Controllable time provider for testing
 */
export class TestTimeProvider implements ITimeProvider {
  private currentTime = 0;
  private deltaTime = 16; // Default to 60fps
  private frame = 0;
  private fps = 60;
  private timers: Map<number, { callback: () => void; triggerTime: number }> = new Map();
  private nextTimerId = 1;

  now(): number {
    return this.currentTime;
  }

  getDelta(): number {
    return this.deltaTime;
  }

  getFrame(): number {
    return this.frame;
  }

  getFPS(): number {
    return this.fps;
  }

  setTimeout(callback: () => void, delay: number): number {
    const id = this.nextTimerId++;
    this.timers.set(id, {
      callback,
      triggerTime: this.currentTime + delay
    });
    return id;
  }

  clearTimeout(handle: number): void {
    this.timers.delete(handle);
  }

  // Helper methods for testing
  advance(amount: number): void {
    const targetTime = this.currentTime + amount;
    while (this.currentTime < targetTime) {
      this.step();
    }
  }

  step(delta = this.deltaTime): void {
    this.currentTime += delta;
    this.frame++;

    // Check timers
    for (const [id, timer] of this.timers) {
      if (timer.triggerTime <= this.currentTime) {
        timer.callback();
        this.timers.delete(id);
      }
    }
  }

  setFPS(fps: number): void {
    this.fps = fps;
    this.deltaTime = 1000 / fps;
  }

  reset(): void {
    this.currentTime = 0;
    this.frame = 0;
    this.timers.clear();
    this.nextTimerId = 1;
    this.setFPS(60);
  }
}

/**
 * Simple physics implementation for testing
 */
export class TestPhysics implements IPhysics {
  circleOverlap(
    x1: number,
    y1: number,
    radius1: number,
    x2: number,
    y2: number,
    radius2: number
  ): boolean {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < radius1 + radius2;
  }

  pointInCircle(
    pointX: number,
    pointY: number,
    circleX: number,
    circleY: number,
    radius: number
  ): boolean {
    const dx = pointX - circleX;
    const dy = pointY - circleY;
    return Math.sqrt(dx * dx + dy * dy) <= radius;
  }

  angleBetweenPoints(x1: number, y1: number, x2: number, y2: number): number {
    return Math.atan2(y2 - y1, x2 - x1);
  }

  shortestAngleBetween(angle1: number, angle2: number): number {
    const diff = (angle2 - angle1 + Math.PI) % (Math.PI * 2) - Math.PI;
    return diff < -Math.PI ? diff + Math.PI * 2 : diff;
  }
}

/**
 * Debug renderer that records draw calls for testing
 */
export class TestDebugRenderer implements IDebugRenderer {
  drawCalls: Array<{
    type: 'circle' | 'line' | 'vector';
    params: Record<string, unknown>;
  }> = [];

  clear(): void {
    this.drawCalls = [];
  }

  drawCircle(x: number, y: number, radius: number, color: number, alpha = 1): void {
    this.drawCalls.push({
      type: 'circle',
      params: { x, y, radius, color, alpha }
    });
  }

  drawLine(x1: number, y1: number, x2: number, y2: number, color: number, alpha = 1): void {
    this.drawCalls.push({
      type: 'line',
      params: { x1, y1, x2, y2, color, alpha }
    });
  }

  drawVector(x: number, y: number, vector: IVector2, color: number, alpha = 1): void {
    this.drawCalls.push({
      type: 'vector',
      params: { x, y, vector: { x: vector.x, y: vector.y }, color, alpha }
    });
  }

  setLineStyle(width: number, color: number, alpha = 1): void {
    this.drawCalls.push({
      type: 'line',
      params: { width, color, alpha }
    });
  }

  // Helper methods for testing
  getDrawCalls(): typeof this.drawCalls {
    return this.drawCalls;
  }

  getLastDrawCall(): (typeof this.drawCalls)[0] | undefined {
    return this.drawCalls[this.drawCalls.length - 1];
  }

  reset(): void {
    this.clear();
  }
}

// Export singleton instances
export const testRandom = new TestRandomGenerator();
export const testTime = new TestTimeProvider();
export const testPhysics = new TestPhysics();
export const testDebug = new TestDebugRenderer();
