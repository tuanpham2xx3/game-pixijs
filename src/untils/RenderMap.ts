import { Container, Graphics } from "pixi.js";

/**
 * RenderMap utility for managing game world rendering
 */
export class RenderMap {
    private container: Container;
    private worldWidth: number;
    private worldHeight: number;
    private tileSize: number;

    constructor(container: Container, worldWidth: number = 2000, worldHeight: number = 1500, tileSize: number = 64) {
        this.container = container;
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;
        this.tileSize = tileSize;
    }

    /**
     * Create a simple grid background for the game world
     */
    createGridBackground(): Graphics {
        const grid = new Graphics();
        
        // Draw background
        grid.beginFill(0x001122, 0.3);
        grid.drawRect(0, 0, this.worldWidth, this.worldHeight);
        grid.endFill();

        // Draw grid lines
        grid.lineStyle(1, 0x334455, 0.5);
        
        // Vertical lines
        for (let x = 0; x <= this.worldWidth; x += this.tileSize) {
            grid.moveTo(x, 0);
            grid.lineTo(x, this.worldHeight);
        }
        
        // Horizontal lines
        for (let y = 0; y <= this.worldHeight; y += this.tileSize) {
            grid.moveTo(0, y);
            grid.lineTo(this.worldWidth, y);
        }

        this.container.addChildAt(grid, 0);
        return grid;
    }

    /**
     * Create boundary walls for the game world
     */
    createBoundaries(): Graphics {
        const boundaries = new Graphics();
        
        // Draw thick boundary walls
        boundaries.lineStyle(4, 0xFF0000, 0.8);
        boundaries.drawRect(2, 2, this.worldWidth - 4, this.worldHeight - 4);

        this.container.addChild(boundaries);
        return boundaries;
    }

    /**
     * Convert world coordinates to screen coordinates
     */
    worldToScreen(worldX: number, worldY: number, cameraX: number, cameraY: number): { x: number; y: number } {
        return {
            x: worldX - cameraX + window.innerWidth / 2,
            y: worldY - cameraY + window.innerHeight / 2
        };
    }

    /**
     * Convert screen coordinates to world coordinates
     */
    screenToWorld(screenX: number, screenY: number, cameraX: number, cameraY: number): { x: number; y: number } {
        return {
            x: screenX + cameraX - window.innerWidth / 2,
            y: screenY + cameraY - window.innerHeight / 2
        };
    }

    /**
     * Check if a point is within world boundaries
     */
    isInBounds(x: number, y: number): boolean {
        return x >= 0 && x <= this.worldWidth && y >= 0 && y <= this.worldHeight;
    }

    /**
     * Clamp coordinates to world boundaries
     */
    clampToBounds(x: number, y: number): { x: number; y: number } {
        return {
            x: Math.max(0, Math.min(this.worldWidth, x)),
            y: Math.max(0, Math.min(this.worldHeight, y))
        };
    }

    /**
     * Create spawn zones for enemies
     */
    getSpawnZones(): Array<{ x: number; y: number; width: number; height: number }> {
        return [
            // Top spawn zone
            { x: 0, y: 0, width: this.worldWidth, height: 100 },
            // Left spawn zone
            { x: 0, y: 0, width: 100, height: this.worldHeight },
            // Right spawn zone
            { x: this.worldWidth - 100, y: 0, width: 100, height: this.worldHeight },
            // Bottom spawn zone (less common)
            { x: 0, y: this.worldHeight - 100, width: this.worldWidth, height: 100 }
        ];
    }

    /**
     * Get a random spawn position from spawn zones
     */
    getRandomSpawnPosition(): { x: number; y: number } {
        const zones = this.getSpawnZones();
        const zone = zones[Math.floor(Math.random() * zones.length)];
        
        return {
            x: zone.x + Math.random() * zone.width,
            y: zone.y + Math.random() * zone.height
        };
    }

    /**
     * Get world dimensions
     */
    getWorldSize(): { width: number; height: number } {
        return {
            width: this.worldWidth,
            height: this.worldHeight
        };
    }

    /**
     * Create safe zone in center for player spawning
     */
    getSafeZone(): { x: number; y: number; width: number; height: number } {
        return {
            x: this.worldWidth * 0.4,
            y: this.worldHeight * 0.4,
            width: this.worldWidth * 0.2,
            height: this.worldHeight * 0.2
        };
    }
}
