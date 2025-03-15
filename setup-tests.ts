import { vi } from 'vitest';
import { type BoidVariant } from 'src/lib/boid';
import type { BoidConfig, SimulationConfig } from 'src/lib/config/simulation-signals.svelte';


export const DEFAULT_BOID_CONFIG: BoidConfig = {
  alignmentWeight: 1.0,
  cohesionWeight: 1.0,
  separationWeight: 1.5,
  perceptionRadius: 50,
  separationRadius: 30,
  boundaryMargin: 100,
  boundaryForceMultiplier: 3.0,
  boundaryForceRamp: 2.5,
  obstaclePerceptionRadius: 150,
  obstacleForceMultiplier: 4.0,
  maxSpeed: 100,
  maxForce: 1.0
};

export const DEFAULT_SIMULATION_CONFIG: SimulationConfig = {
  initialPreyCount: 100,
  initialPredatorCount: 0,
  obstacleCount: 0,
  trackStats: true
};

// Mock canvas element required by Phaser
global.HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(() => ({
    data: new Array(4)
  })),
  putImageData: vi.fn(),
  createImageData: vi.fn(() => []),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  translate: vi.fn(),
  transform: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  fill: vi.fn()
}));

// Mock request animation frame
global.requestAnimationFrame = vi.fn().mockImplementation(callback => {
  return setTimeout(() => callback(Date.now()), 16);
});

// Mock local storage
global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0
};

// Mock browser APIs
class ResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

global.ResizeObserver = ResizeObserver;

// Mock Phaser Game namespace - using a factory approach for consistent mocks
export const createPhaserMocks = () => {
  const mockVector2 = {
    x: 0,
    y: 0,
    add: vi.fn().mockReturnThis(),
    subtract: vi.fn().mockReturnThis(),
    scale: vi.fn().mockReturnThis(),
    normalize: vi.fn().mockReturnThis(),
    length: vi.fn().mockReturnValue(1),
    limit: vi.fn().mockReturnThis(),
    clone: vi.fn(function() {
      return { ...this };
    }),
    copy: vi.fn().mockReturnThis(),
    setLength: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
  };

  return {
    mockScene: {
      physics: {
        add: {
          existing: vi.fn()
        }
      },
      add: {
        image: vi.fn().mockReturnValue({
          setOrigin: vi.fn().mockReturnThis(),
          setScale: vi.fn().mockReturnThis(),
          setPosition: vi.fn().mockReturnThis()
        }),
        existing: vi.fn(),
        group: vi.fn().mockReturnValue({
          add: vi.fn(),
          clear: vi.fn(),
          getLength: vi.fn().mockReturnValue(0)
        }),
        circle: vi.fn().mockReturnValue({
          setInteractive: vi.fn().mockReturnThis()
        }),
        graphics: vi.fn().mockReturnValue({
          clear: vi.fn(),
          lineStyle: vi.fn().mockReturnThis(),
          strokeCircle: vi.fn().mockReturnThis(),
          lineBetween: vi.fn().mockReturnThis()
        })
      },
      scale: {
        width: 800,
        height: 600,
        on: vi.fn(),
        off: vi.fn()
      },
      input: {
        setDraggable: vi.fn(),
        on: vi.fn(),
        off: vi.fn()
      },
      scene: {
        key: 'test-scene',
        start: vi.fn()
      },
    },
    mockVector2,
    // Helper for mocking distances with consistent behavior
    mockDistances: (distances: Record<string, number>) => {
      vi.spyOn(Phaser.Math.Distance, 'Between').mockImplementation((x1, y1, x2, y2) => {
        const key = `${x1},${y1}-${x2},${y2}`;
        const reverseKey = `${x2},${y2}-${x1},${y1}`;
        
        if (distances[key]) return distances[key];
        if (distances[reverseKey]) return distances[reverseKey];
        
        // Default to a large distance if not specified
        return 1000;
      });
    }
  };
};

// Helper for creating mock boids
export const createMockBoid = (
  scene: any, 
  x = 100, 
  y = 100, 
  variant = BoidVariant.PREY,
  overrides = {}
) => {
  return {
    x,
    y,
    getId: vi.fn().mockReturnValue('test-uuid'),
    getVariant: vi.fn().mockReturnValue(variant),
    getVelocity: vi.fn().mockReturnValue({ 
      x: 1, 
      y: 0, 
      length: () => 1,
      clone: () => ({ x: 1, y: 0, length: () => 1 })
    }),
    getMaxSpeed: vi.fn().mockReturnValue(DEFAULT_BOID_CONFIG.maxSpeed),
    getMaxForce: vi.fn().mockReturnValue(DEFAULT_BOID_CONFIG.maxForce),
    getPerceptionRadius: vi.fn().mockReturnValue(DEFAULT_BOID_CONFIG.perceptionRadius),
    getStats: vi.fn().mockReturnValue({
      health: 100,
      stamina: 100,
      speed: DEFAULT_BOID_CONFIG.maxSpeed,
      reproduction: 0,
      level: 1,
      sex: 'male',
      ...(variant === BoidVariant.PREDATOR ? { attack: 10 } : {})
    }),
    applyForce: vi.fn(),
    takeDamage: vi.fn().mockReturnValue(false),
    increaseReproduction: vi.fn().mockReturnValue(false),
    levelUp: vi.fn(),
    destroy: vi.fn(),
    preUpdate: vi.fn(),
    ...overrides
  };
};

// Mock UUID for deterministic IDs in tests
vi.mock('uuid', () => ({
  v4: vi.fn().mockReturnValue('test-uuid')
}));

// Mock Phaser
vi.mock('phaser', async () => {
  const createMockGame = () => ({
    destroy: vi.fn(),
    scale: {
      width: 800,
      height: 600,
      parent: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
    },
    scene: {
      add: vi.fn(),
      start: vi.fn(),
      getScene: vi.fn()
    },
    physics: {
      add: {
        existing: vi.fn()
      }
    },
    destroy: vi.fn(),
    loop: {
      actualFps: 60
    }
  });

  return {
    Game: vi.fn().mockImplementation(createMockGame),
    AUTO: 'auto',
    Scale: {
      RESIZE: 'resize',
      FIT: 'fit',
      CENTER_BOTH: 'center-both'
    },
    Physics: {
      ARCADE: 'arcade',
      Arcade: {
        Sprite: vi.fn().mockImplementation(() => ({
          body: {
            position: { x: 0, y: 0 },
            velocity: { x: 0, y: 0 },
            setSize: vi.fn()
          },
          scene: {},
          x: 0,
          y: 0,
          rotation: 0,
          setScale: vi.fn().mockReturnThis(),
          setOrigin: vi.fn().mockReturnThis(),
          setTint: vi.fn().mockReturnThis(),
          destroy: vi.fn()
        }))
      }
    },
    Scene: vi.fn().mockImplementation(() => createPhaserMocks().mockScene),
    Events: {
      EventEmitter: vi.fn().mockImplementation(() => ({
        on: vi.fn().mockReturnThis(),
        once: vi.fn().mockReturnThis(),
        off: vi.fn().mockReturnThis(),
        emit: vi.fn().mockReturnValue(true),
        removeAllListeners: vi.fn().mockReturnThis()
      }))
    },
    Math: {
      Vector2: vi.fn().mockImplementation((x = 0, y = 0) => ({
        ...createPhaserMocks().mockVector2,
        x,
        y
      })),
      Distance: {
        Between: vi.fn().mockReturnValue(1000),
        BetweenPoints: vi.fn().mockReturnValue(1000)
      },
      FloatBetween: vi.fn().mockReturnValue(0.5),
      Between: vi.fn().mockReturnValue(5)
    },
    GameObjects: {
      Sprite: vi.fn().mockImplementation(() => ({
        setScale: vi.fn().mockReturnThis(),
        setOrigin: vi.fn().mockReturnThis(),
        setTint: vi.fn().mockReturnThis(),
        destroy: vi.fn()
      })),
      GameObject: vi.fn().mockImplementation(() => ({
        body: {
          position: { x: 0, y: 0 }
        }
      }))
    }
  };
});