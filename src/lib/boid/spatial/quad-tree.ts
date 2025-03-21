import type { IBoid } from '$interfaces/boid';
import type { IVector2 } from '$interfaces/vector';
import type { ISpatialPartitioning } from '$interfaces/spatial-partitioning';

/**
 * Rectangle class for quad tree boundary representation
 */
class Rectangle {
  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number
  ) {}

  contains(point: IVector2): boolean {
    return (
      point.x >= this.x &&
      point.x < this.x + this.width &&
      point.y >= this.y &&
      point.y < this.y + this.height
    );
  }

  intersects(range: Circle): boolean {
    // Find the closest point to the circle within the rectangle
    const closestX = Math.max(this.x, Math.min(range.x, this.x + this.width));
    const closestY = Math.max(this.y, Math.min(range.y, this.y + this.height));

    // Calculate the distance between the circle's center and this closest point
    const distanceX = range.x - closestX;
    const distanceY = range.y - closestY;

    // If the distance is less than the circle's radius, an intersection occurs
    const distanceSquared = distanceX * distanceX + distanceY * distanceY;
    return distanceSquared <= range.radius * range.radius;
  }
}

/**
 * Circle class for range queries
 */
class Circle {
  constructor(
    public x: number,
    public y: number,
    public radius: number
  ) {}

  contains(point: IVector2): boolean {
    const dx = point.x - this.x;
    const dy = point.y - this.y;
    return dx * dx + dy * dy <= this.radius * this.radius;
  }
}

/**
 * QuadTree implementation for efficient spatial queries
 */
class QuadTree {
  private points: IBoid[] = [];
  private divided = false;
  private northwest?: QuadTree;
  private northeast?: QuadTree;
  private southwest?: QuadTree;
  private southeast?: QuadTree;

  constructor(
    private boundary: Rectangle,
    private capacity: number,
    private maxDepth: number,
    private currentDepth: number = 0
  ) {}

  /**
   * Insert a boid into the quad tree
   */
  insert(boid: IBoid): boolean {
    const pos = boid.getBoidPosition();
    
    // Ignore objects that don't belong in this quad tree
    if (!this.boundary.contains(pos)) {
      return false;
    }

    // If there's space in this quad tree and we're at max depth, add the object here
    if (this.points.length < this.capacity || this.currentDepth >= this.maxDepth) {
      this.points.push(boid);
      return true;
    }

    // Otherwise, subdivide and add the point to whichever node will accept it
    if (!this.divided) {
      this.subdivide();
    }

    return (
      this.northwest!.insert(boid) ||
      this.northeast!.insert(boid) ||
      this.southwest!.insert(boid) ||
      this.southeast!.insert(boid)
    );
  }

  /**
   * Find all boids within a circular range
   */
  query(range: Circle): IBoid[] {
    // Array to hold found boids
    const found: IBoid[] = [];

    // If the range doesn't intersect this quad, return empty array
    if (!this.boundary.intersects(range)) {
      return found;
    }

    // Check objects at this level
    for (const boid of this.points) {
      const pos = boid.getBoidPosition();
      if (range.contains(pos)) {
        found.push(boid);
      }
    }

    // If this quad is divided, check children
    if (this.divided) {
      found.push(...this.northwest!.query(range));
      found.push(...this.northeast!.query(range));
      found.push(...this.southwest!.query(range));
      found.push(...this.southeast!.query(range));
    }

    return found;
  }

  /**
   * Clear the quad tree
   */
  clear(): void {
    this.points = [];
    
    if (this.divided) {
      this.northwest!.clear();
      this.northeast!.clear();
      this.southwest!.clear();
      this.southeast!.clear();
      
      this.divided = false;
      this.northwest = undefined;
      this.northeast = undefined;
      this.southwest = undefined;
      this.southeast = undefined;
    }
  }

  /**
   * Subdivide this node into four quadrants
   */
  private subdivide(): void {
    const x = this.boundary.x;
    const y = this.boundary.y;
    const w = this.boundary.width / 2;
    const h = this.boundary.height / 2;
    const nextDepth = this.currentDepth + 1;

    const nw = new Rectangle(x, y, w, h);
    const ne = new Rectangle(x + w, y, w, h);
    const sw = new Rectangle(x, y + h, w, h);
    const se = new Rectangle(x + w, y + h, w, h);

    this.northwest = new QuadTree(nw, this.capacity, this.maxDepth, nextDepth);
    this.northeast = new QuadTree(ne, this.capacity, this.maxDepth, nextDepth);
    this.southwest = new QuadTree(sw, this.capacity, this.maxDepth, nextDepth);
    this.southeast = new QuadTree(se, this.capacity, this.maxDepth, nextDepth);

    this.divided = true;

    // Move existing points to children
    for (const boid of this.points) {
      const inserted = 
        this.northwest.insert(boid) ||
        this.northeast.insert(boid) ||
        this.southwest.insert(boid) ||
        this.southeast.insert(boid);
      
      if (!inserted) {
        console.warn('Failed to insert boid during subdivision');
      }
    }
    
    // Clear points at this level since they've been moved to children
    this.points = [];
  }
}

/**
 * QuadTree-based spatial partitioning implementation
 */
export class QuadTreePartitioning implements ISpatialPartitioning {
  private quadTree!: QuadTree;
  
  constructor(
    width: number, 
    height: number, 
    options: { capacity?: number; maxDepth?: number } = {}
  ) {
    this.createQuadTree(width, height, options);
  }
  
  private createQuadTree(
    width: number, 
    height: number, 
    options: { capacity?: number; maxDepth?: number } = {}
  ): void {
    const boundary = new Rectangle(0, 0, width, height);
    this.quadTree = new QuadTree(
      boundary,
      options.capacity ?? 4,
      options.maxDepth ?? 8
    );
  }
  
  insert(boid: IBoid): void {
    this.quadTree.insert(boid);
  }
  
  findNearby(position: IVector2, radius: number): IBoid[] {
    const range = new Circle(position.x, position.y, radius);
    return this.quadTree.query(range);
  }
  
  update(boids: IBoid[]): void {
    this.clear();
    for (const boid of boids) {
      this.insert(boid);
    }
  }
  
  clear(): void {
    this.quadTree.clear();
  }
  
  // Method to recreate the quad tree with new bounds
  updateBounds(width: number, height: number): void {
    this.createQuadTree(width, height);
  }
}
