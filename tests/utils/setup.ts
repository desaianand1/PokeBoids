import { vi } from 'vitest';
import { defaultTestDependencies, resetTestDependencies } from '../implementations';
import type { AllDependencies } from '$lib/interfaces';

/**
 * Reset all test dependencies and mocks before each test
 */
export function setupTest(): void {
  vi.clearAllMocks();
  resetTestDependencies();
}

/**
 * Create a test context with dependencies
 * @param customDeps Optional partial dependencies to override defaults
 * @returns Test context with dependencies
 */
export function createTestContext(customDeps?: Partial<AllDependencies>) {
  return {
    deps: {
      ...defaultTestDependencies,
      ...customDeps
    }
  };
}

/**
 * Mock window dimensions
 * @param width Window width
 * @param height Window height
 */
export function mockWindowDimensions(width = 800, height = 600): void {
  vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(width);
  vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(height);
}

/**
 * Mock requestAnimationFrame
 */
export function mockRequestAnimationFrame(): void {
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation(
    callback => Number(setTimeout(() => callback(performance.now()), 16))
  );
}

/**
 * Mock performance.now()
 */
export function mockPerformanceNow(): void {
  let time = 0;
  vi.spyOn(performance, 'now').mockImplementation(() => {
    time += 16; // Simulate 60fps
    return time;
  });
}

/**
 * Create a mock canvas context
 */
export function createMockCanvasContext(): CanvasRenderingContext2D {
  return {
    canvas: document.createElement('canvas'),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    scale: vi.fn(),
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    fillText: vi.fn(),
    strokeText: vi.fn(),
    measureText: vi.fn().mockReturnValue({ width: 10 }),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    bezierCurveTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    arc: vi.fn(),
    rect: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    clip: vi.fn(),
    isPointInPath: vi.fn(),
    isPointInStroke: vi.fn(),
    drawImage: vi.fn(),
    createLinearGradient: vi.fn(),
    createRadialGradient: vi.fn(),
    createPattern: vi.fn(),
    getImageData: vi.fn(),
    putImageData: vi.fn(),
    setTransform: vi.fn(),
    resetTransform: vi.fn(),
    transform: vi.fn(),
    getTransform: vi.fn(),
    fillStyle: '',
    strokeStyle: '',
    shadowColor: '',
    shadowBlur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    lineCap: 'butt' as CanvasLineCap,
    lineJoin: 'miter' as CanvasLineJoin,
    lineWidth: 1,
    miterLimit: 10,
    font: '',
    textAlign: 'start' as CanvasTextAlign,
    textBaseline: 'alphabetic' as CanvasTextBaseline,
    direction: 'ltr' as CanvasDirection,
    globalAlpha: 1,
    globalCompositeOperation: 'source-over' as GlobalCompositeOperation
  } as unknown as CanvasRenderingContext2D;
}

/**
 * Wait for a specified number of animation frames
 * @param frames Number of frames to wait
 */
export async function waitForFrames(frames: number): Promise<void> {
  for (let i = 0; i < frames; i++) {
    await new Promise(resolve => requestAnimationFrame(resolve));
  }
}

/**
 * Wait for a specified amount of time
 * @param ms Time to wait in milliseconds
 */
export async function waitForTime(ms: number): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, ms));
}
