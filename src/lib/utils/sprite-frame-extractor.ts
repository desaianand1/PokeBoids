/**
 * Utility for extracting sprite frames from Phaser spritesheets
 * and converting them to data URLs for use in UI components
 */

export interface ExtractedSpriteFrame {
	dataUrl: string;
	width: number;
	height: number;
}

/**
 * Extracts a specific frame from a Phaser spritesheet and converts it to a data URL
 * @param scene - The Phaser scene containing the loaded spritesheet
 * @param spriteKey - The key of the loaded spritesheet
 * @param frameIndex - The frame index to extract (0-based)
 * @returns Promise that resolves to the extracted frame data
 */
export async function extractSpriteFrame(
	scene: Phaser.Scene,
	spriteKey: string,
	frameIndex: number = 0
): Promise<ExtractedSpriteFrame> {
	return new Promise((resolve, reject) => {
		try {
			// Check if the sprite exists in the texture cache
			if (!scene.textures.exists(spriteKey)) {
				throw new Error(`Sprite '${spriteKey}' not found in texture cache`);
			}

			const texture = scene.textures.get(spriteKey);
			const frame = texture.get(frameIndex);

			if (!frame) {
				throw new Error(`Frame ${frameIndex} not found in sprite '${spriteKey}'`);
			}

			// Create a temporary canvas to extract the frame
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');

			if (!ctx) {
				throw new Error('Failed to get canvas 2D context');
			}

			// Set canvas size to frame dimensions
			canvas.width = frame.width;
			canvas.height = frame.height;

			// Get the source image
			const sourceImage = texture.source[0].image as HTMLImageElement;

			// Draw the specific frame onto the canvas
			ctx.drawImage(
				sourceImage,
				frame.x, // source x
				frame.y, // source y
				frame.width, // source width
				frame.height, // source height
				0, // destination x
				0, // destination y
				frame.width, // destination width
				frame.height // destination height
			);

			// Convert canvas to data URL
			const dataUrl = canvas.toDataURL('image/png');

			resolve({
				dataUrl,
				width: frame.width,
				height: frame.height
			});
		} catch (error) {
			console.error('Error extracting sprite frame:', error);
			reject(error);
		}
	});
}

/**
 * Extracts the "down-facing walk" frame from a PMD-style spritesheet
 * PMD sprites are organized with 8 directions (down=0) and multiple frames per direction
 * @param scene - The Phaser scene containing the loaded spritesheet
 * @param spriteKey - The key of the loaded spritesheet (should be a walk animation)
 * @param framesPerDirection - Number of frames per direction (default: 2 for PMD sprites)
 * @returns Promise that resolves to the extracted frame data
 */
export async function extractDownWalkFrame(
	scene: Phaser.Scene,
	spriteKey: string,
	framesPerDirection: number = 2
): Promise<ExtractedSpriteFrame> {
	// For PMD sprites, direction 0 is down-facing
	// We want the first frame of the down-facing walk animation
	const downDirection = 0;
	const frameIndex = downDirection * framesPerDirection; // First frame of down direction

	return extractSpriteFrame(scene, spriteKey, frameIndex);
}

/**
 * Safely extracts a sprite frame with fallback handling
 * @param scene - The Phaser scene containing the loaded spritesheet
 * @param spriteKey - The key of the loaded spritesheet
 * @param frameIndex - The frame index to extract
 * @param fallbackSpriteKey - Optional fallback sprite key if primary fails
 * @returns Promise that resolves to the extracted frame data or null if all fail
 */
export async function safeExtractSpriteFrame(
	scene: Phaser.Scene,
	spriteKey: string,
	frameIndex: number = 0,
	fallbackSpriteKey?: string
): Promise<ExtractedSpriteFrame | null> {
	try {
		return await extractSpriteFrame(scene, spriteKey, frameIndex);
	} catch (error) {
		console.warn(`Failed to extract frame from '${spriteKey}':`, error);

		// Try fallback if provided
		if (fallbackSpriteKey) {
			try {
				console.log(`Attempting fallback to '${fallbackSpriteKey}'`);
				return await extractSpriteFrame(scene, fallbackSpriteKey, frameIndex);
			} catch (fallbackError) {
				console.warn(`Fallback sprite '${fallbackSpriteKey}' also failed:`, fallbackError);
			}
		}

		return null;
	}
}
