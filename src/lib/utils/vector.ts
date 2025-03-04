export const VectorUtils = {
	limitMagnitude(vector: Phaser.Math.Vector2, max: number): Phaser.Math.Vector2 {
		const lengthSq = vector.lengthSq();
		if (lengthSq > max * max) {
			return vector.normalize().scale(max);
		}
		return vector;
	},

	setMinMagnitude(vector: Phaser.Math.Vector2, min: number): Phaser.Math.Vector2 {
		const length = vector.length();
		if (length < min && length > 0) {
			return vector.normalize().scale(min);
		}
		return vector;
	},

    calculateBoundaryForce(
		position: Phaser.Math.Vector2,
		velocity: Phaser.Math.Vector2,
		bounds: { width: number; height: number },
		margin: number,
		maxForce: number
	): Phaser.Math.Vector2 {
		const force = Phaser.Math.Vector2.ZERO;
		const desiredSpeed = velocity.length();

		// Left boundary
		if (position.x < margin) {
			force.x = desiredSpeed;
		}
		// Right boundary
		else if (position.x > bounds.width - margin) {
			force.x = -desiredSpeed;
		}

		// Top boundary
		if (position.y < margin) {
			force.y = desiredSpeed;
		}
		// Bottom boundary
		else if (position.y > bounds.height - margin) {
			force.y = -desiredSpeed;
		}

		// If we're applying a boundary force
		if (force.lengthSq() > 0) {
			force.normalize().scale(desiredSpeed).subtract(velocity).limit(maxForce);
		}

		return force;
	}
} as const;
