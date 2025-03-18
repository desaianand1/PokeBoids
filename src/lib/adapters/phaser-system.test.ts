import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PhaserPhysics, PhaserDebugRenderer, PhaserTimeProvider } from '$adapters/phaser-system';
import type { Scene } from 'phaser';
import type { IVector2 } from '$interfaces/vector';

// Mock types for Phaser graphics
interface MockGraphics {
  lineStyle: (width: number, color: number, alpha?: number) => MockGraphics;
  strokeCircle: (x: number, y: number, radius: number) => MockGraphics;
  lineBetween: (x1: number, y1: number, x2: number, y2: number) => MockGraphics;
  clear: () => MockGraphics;
  destroy: () => void;
}

describe('PhaserPhysics', () => {
  let mockScene: Scene;
  let physics: PhaserPhysics;

  beforeEach(() => {
    // Create mock scene with physics system
    mockScene = {
      physics: {
        world: {
          wrap: vi.fn(),
          bounds: {
            width: 800,
            height: 600
          }
        }
      }
    } as unknown as Scene;

    physics = new PhaserPhysics(mockScene);
  });

  describe('World Bounds', () => {
    it('wraps position within world bounds', () => {
      // Given: A mock vector
      const position = {
        x: 850,
        y: 650
      } as IVector2;

      // When: Wrapping position
      physics.wrapPosition(position);

      // Then: Should call Phaser's wrap function
      expect(mockScene.physics.world.wrap).toHaveBeenCalledWith(position);
    });

    it('provides world dimensions', () => {
      // When: Getting world bounds
      const bounds = physics.getWorldBounds();

      // Then: Should return correct dimensions
      expect(bounds).toEqual({
        width: 800,
        height: 600
      });
    });
  });

  describe('Collision Detection', () => {
    it('detects circle overlap', () => {
      // Test circles that overlap
      expect(physics.circleOverlap(0, 0, 10, 15, 0, 10)).toBe(true);
      // Test circles that don't overlap
      expect(physics.circleOverlap(0, 0, 10, 25, 0, 10)).toBe(false);
    });

    it('detects point in circle', () => {
      // Test point inside circle
      expect(physics.pointInCircle(5, 5, 0, 0, 10)).toBe(true);
      // Test point outside circle
      expect(physics.pointInCircle(15, 15, 0, 0, 10)).toBe(false);
    });
  });

  describe('Angle Calculations', () => {
    it('calculates angle between points', () => {
      const angle = physics.angleBetweenPoints(0, 0, 10, 10);
      expect(angle).toBeCloseTo(Math.PI / 4);
    });

    it('calculates shortest angle between angles', () => {
      const angle = physics.shortestAngleBetween(0, Math.PI);
      expect(angle).toBeCloseTo(180);
    });
  });
});

describe('PhaserDebugRenderer', () => {
  let mockScene: Scene;
  let debugRenderer: PhaserDebugRenderer;
  let mockGraphics: MockGraphics;

  beforeEach(() => {
    // Create mock graphics object
    mockGraphics = {
      lineStyle: vi.fn().mockReturnThis(),
      strokeCircle: vi.fn().mockReturnThis(),
      lineBetween: vi.fn().mockReturnThis(),
      clear: vi.fn().mockReturnThis(),
      destroy: vi.fn()
    };

    // Create mock scene
    mockScene = {
      add: {
        graphics: vi.fn().mockReturnValue(mockGraphics)
      }
    } as unknown as Scene;

    debugRenderer = new PhaserDebugRenderer(mockScene);
  });

  describe('Drawing Operations', () => {
    it('sets line style correctly', () => {
      debugRenderer.setLineStyle(2, 0xff0000, 0.5);
      expect(mockGraphics.lineStyle).toHaveBeenCalledWith(2, 0xff0000, 0.5);
    });

    it('draws circle correctly', () => {
      debugRenderer.drawCircle(100, 100, 50, 0xff0000);
      expect(mockGraphics.strokeCircle).toHaveBeenCalledWith(100, 100, 50);
    });

    it('draws line correctly', () => {
      debugRenderer.drawLine(0, 0, 100, 100, 0xff0000, 1);
      expect(mockGraphics.lineBetween).toHaveBeenCalledWith(0, 0, 100, 100);
    });

    it('draws vector correctly', () => {
      const vector = { x: 100, y: 0 };
      debugRenderer.drawVector(0, 0, vector, 0xff0000);
      // Should draw main line and two arrowhead lines
      expect(mockGraphics.lineBetween).toHaveBeenCalledTimes(3);
    });
  });

  describe('Cleanup', () => {
    it('clears graphics', () => {
      debugRenderer.clear();
      expect(mockGraphics.clear).toHaveBeenCalled();
    });

    it('destroys graphics', () => {
      debugRenderer.destroy();
      expect(mockGraphics.destroy).toHaveBeenCalled();
    });
  });
});

describe('PhaserTimeProvider', () => {
  let mockScene: Scene;
  let timeProvider: PhaserTimeProvider;

  beforeEach(() => {
    // Create mock scene with time system
    mockScene = {
      time: {
        now: 1000,
        addEvent: vi.fn()
      }
    } as unknown as Scene;

    timeProvider = new PhaserTimeProvider(mockScene);
  });

  describe('Time Management', () => {
    it('provides current time', () => {
      expect(timeProvider.now()).toBe(1000);
    });

    it('calculates delta time', () => {
      const mockTime = vi.spyOn(timeProvider, 'now');
      mockTime.mockReturnValueOnce(1000).mockReturnValueOnce(1016);
      
      const delta = timeProvider.getDelta();
      expect(delta).toBe(16);
    });

    it('tracks frame count', () => {
      const frame1 = timeProvider.getFrame();
      const frame2 = timeProvider.getFrame();
      expect(frame2).toBe(frame1 + 1);
    });

    it('calculates FPS', () => {
      const mockTime = vi.spyOn(timeProvider, 'now');
      mockTime.mockReturnValue(2000);
      
      const fps = timeProvider.getFPS();
      expect(fps).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Timer Management', () => {
    it('schedules delayed events', () => {
      const callback = vi.fn();
      timeProvider.delay(1000, callback);

      expect(mockScene.time.addEvent).toHaveBeenCalledWith({
        delay: 1000,
        callback,
        callbackScope: undefined
      });
    });

    it('manages timeouts', () => {
      const callback = vi.fn();
      const id = timeProvider.setTimeout(callback, 1000);

      expect(id).toBeGreaterThan(0);
      expect(mockScene.time.addEvent).toHaveBeenCalled();

      timeProvider.clearTimeout(id);
      // Timeout should be removed from internal map
      expect(timeProvider['timeouts'].has(id)).toBe(false);
    });
  });
});
