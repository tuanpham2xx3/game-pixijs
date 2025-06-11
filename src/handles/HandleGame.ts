import { Application, Assets, Container } from "pixi.js";
import { Player} from '../entities/Player';
import { HandleControls } from './HandleControls';
import { BackgroundManager } from '../managers/BackgroundManager';
import { BulletManager } from '../managers/BulletManager';
import { LevelManager } from '../managers/LevelManager';
import { CollisionManager } from '../managers/CollisionManager';
import { UIManager } from '../managers/UIManager';
import { SkillManager } from '../managers/SkillManager';
import { Item, ItemType } from '../entities/Item';
import { PlayerBulletColor } from '../managers/BulletManager';
import * as PIXI from 'pixi.js';
const { BASE_URL } = import.meta.env;

export class Game {
    private app: Application;
    private player?: Player;
    private controls!: HandleControls;
    private backgroundManager?: BackgroundManager;
    private bulletManager?: BulletManager;
    private levelManager?: LevelManager;
    private collisionManager?: CollisionManager;
    private uiManager?: UIManager;
    private skillManager?: SkillManager;
    private gameContainer: Container;
    private uiContainer: Container;
    private items: Item[] = [];
    
    // Game state
    private gameRunning: boolean = false;
    private score: number = 0;
    private autoShootTimer: number = 0;
    private readonly AUTO_SHOOT_INTERVAL: number = 200; // 200ms between shots
    private keys: Set<string> = new Set();

    constructor(app: Application) {
      this.app = app;
      this.gameContainer = new Container();
      this.uiContainer = new Container();
    }

    /**
     * Initialize game components and assets
     */
    async init() {
      try {
        // Add containers to stage
        this.app.stage.addChild(this.gameContainer);
        this.app.stage.addChild(this.uiContainer);
        
        // Load background assets
        await Promise.all([
          Assets.load(`${BASE_URL}assets/background/Nebula1.png`),
          Assets.load(`${BASE_URL}assets/background/Nebula2.png`),
          Assets.load(`${BASE_URL}assets/background/Nebula3.png`),
          Assets.load(`${BASE_URL}assets/background/Stars.png`)
        ]);
        
        // Load player assets
        const playerSheet = await Assets.load(`${BASE_URL}assets/player/player.png`);
        const playerData = await fetch(`${BASE_URL}assets/player/player.json`).then(res => res.json());
        const playerSpritesheet = new PIXI.Spritesheet(playerSheet, playerData);
        await playerSpritesheet.parse();
        
        // Create player with spritesheet
        this.player = new Player({
            x: window.innerWidth / 2,
            y: window.innerHeight - 100, // Near bottom of screen
            scale: 1,
            spritesheet: playerSpritesheet
        });

        // Initialize all managers
        await this.initializeManagers();

        // Setup controls and keyboard handlers
        this.setupControls();
        
        // Start game loop
        this.startGameLoop();

        // Load first level
        this.levelManager?.loadCurrentLevel();
        
        this.gameRunning = true;
        console.log('Game initialized successfully');

      } catch (error) {
        console.error('Game initialization failed:', error);
        throw error;
      }
    }

    /**
     * Initialize all game managers
     */
    private async initializeManagers(): Promise<void> {
        if (!this.player) throw new Error('Player not initialized');

        // Initialize background manager
        this.backgroundManager = new BackgroundManager(this.app, this.player);
        this.gameContainer.addChildAt(this.backgroundManager, 0);

        // Initialize bullet manager
        this.bulletManager = new BulletManager(this.gameContainer);
        await this.bulletManager.loadTextures();

        // Initialize level manager
        this.levelManager = new LevelManager(this.gameContainer);
        await this.levelManager.loadLevels();

        // Initialize collision manager
        this.collisionManager = new CollisionManager(this.player);
        this.gameContainer.addChild(this.collisionManager);

        // Initialize UI manager
        this.uiManager = new UIManager(this.uiContainer, this.player);
        await this.uiManager.loadTextures();

        // Initialize skill manager
        this.skillManager = new SkillManager(this.app, this.gameContainer, this.player);
        await this.skillManager.loadTextures();

        // Add player to game container (should be on top of background)
        this.gameContainer.addChild(this.player);

        // Ensure player is immediately visible in IDLE state
        this.player.idle();

        // Setup event listeners between managers
        this.setupManagerEvents();
    }

    /**
     * Setup event listeners between managers
     */
    private setupManagerEvents(): void {
        if (!this.levelManager || !this.collisionManager || !this.uiManager) return;

        // Level Manager Events
        this.levelManager.on('itemDropped', (item: Item) => {
            this.items.push(item);
            this.gameContainer.addChild(item);
        });

        this.levelManager.on('bossSkill', (skillData: { x: number; y: number; radius: number; targetX: number; targetY: number }) => {
            this.skillManager?.createBossSkillEffect(skillData.x, skillData.y, skillData.radius);
            // Check if player is in skill range
            if (this.collisionManager?.checkBossSkillCollision(skillData, this.player!.x, this.player!.y)) {
                this.player?.takeDamage();
            }
        });

        this.levelManager.on('bossDamaged', (data: { currentHp: number; maxHp: number }) => {
            this.uiManager?.updateBossHealth(data.currentHp, data.maxHp);
        });

        // Collision Manager Events
        this.collisionManager.on('bulletHit', (_data: { bullet: object; target: object }) => {
            this.score += 10;
            // this.uiManager?.updateScore(this.score);
        });

        this.collisionManager.on('playerHit', (_data: { bullet: object; damage: number }) => {
            console.log('Player hit by bullet!');
        });

        this.collisionManager.on('playerCollision', (_data: { enemy: object }) => {
            console.log('Player collided with enemy!');
        });
    }

    /**
     * Setup controls and keyboard handlers
     */
    private setupControls(): void {
        if (!this.player) return;

        // Setup basic movement controls
        this.controls = new HandleControls(this.app, this.player);
        this.controls.setupControls();

        // Setup keyboard handlers for skills and other actions
        window.addEventListener('keydown', (e) => {
            this.keys.add(e.key.toLowerCase());
            this.handleKeyPress(e.key.toLowerCase());
        });

        window.addEventListener('keyup', (e) => {
            this.keys.delete(e.key.toLowerCase());
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            // Managers handle resize automatically
        });
    }

    /**
     * Handle key press events
     */
    private handleKeyPress(key: string): void {
        switch (key) {
            case 'q':
                // Use player skill
                if (this.skillManager && this.levelManager) {
                    const enemies = this.levelManager.getEnemies();
                    const skillUsed = this.skillManager.usePlayerSkill(enemies);
                    if (skillUsed) {
                        console.log('Player skill used!');
                        this.uiManager?.updateSkillCooldown(0, this.skillManager.getMaxCooldown());
                    }
                }
                break;
            case 'escape':
                // Pause game (to be implemented)
                this.togglePause();
                break;
        }
    }

    /**
     * Toggle game pause
     */
    private togglePause(): void {
        this.gameRunning = !this.gameRunning;
        if (this.gameRunning) {
            console.log('Game resumed');
        } else {
            console.log('Game paused');
        }
    }

    /**
     * Start the main game loop
     */
    private startGameLoop(): void {
        this.app.ticker.add((ticker) => {
            if (!this.gameRunning) return;
            
            const deltaTime = ticker.deltaMS;
            this.update(deltaTime);
        });
    }

    /**
     * Main update loop
     */
    private update(deltaTime: number): void {
        if (!this.gameRunning || !this.player) return;

        // Update auto-shooting
        this.updateAutoShooting(deltaTime);

        // Update all managers
        this.bulletManager?.update();
        this.levelManager?.update(deltaTime, this.player.x, this.player.y);
        
        // Update skill manager and UI
        if (this.skillManager) {
            this.skillManager.update(deltaTime);
            // Update skill cooldown UI
            const remaining = this.skillManager.getCooldownRemaining();
            const max = this.skillManager.getMaxCooldown();
            this.uiManager?.updateSkillCooldown(remaining, max);
        }

        // Update items
        this.updateItems();

        // Check collisions
        this.checkCollisions();

        // Check game over conditions
        this.checkGameOver();

        // Check level completion
        this.checkLevelCompletion();
    }

    /**
     * Handle auto-shooting system
     */
    private updateAutoShooting(deltaTime: number): void {
        if (!this.player || !this.bulletManager) return;

        this.autoShootTimer += deltaTime;
        
        if (this.autoShootTimer >= this.AUTO_SHOOT_INTERVAL) {
            this.bulletManager.createPlayerBullets(this.player);
            this.autoShootTimer = 0;
        }
    }

    /**
     * Update items (movement, collection)
     */
    private updateItems(): void {
        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            item.update();

            // Remove items that are off-screen or collected
            if (item.y > window.innerHeight + 50 || item.isCollected()) {
                this.gameContainer.removeChild(item);
                this.items.splice(i, 1);
                item.destroy();
            }
        }
    }

    /**
     * Check all collision types
     */
    private checkCollisions(): void {
        if (!this.collisionManager || !this.bulletManager || !this.levelManager) return;

        const bullets = this.bulletManager.getBullets();
        const enemies = this.levelManager.getEnemies();

        // Check bullet-enemy collisions
        this.collisionManager.checkBulletCollisions(bullets, enemies);

        // Check player-enemy collisions
        this.collisionManager.checkPlayerEnemyCollisions(enemies);

        // Check item collisions
        const collectedItems = this.collisionManager.checkItemCollisions(this.items);
        
        // Handle collected items
        collectedItems.forEach(item => {
            // Change bullet color based on item type
            if (item.getType() === ItemType.BLUE_ITEM && this.bulletManager) {
                this.bulletManager.changePlayerBulletColor(PlayerBulletColor.BLUE);
                console.log('Bullet color changed to BLUE');
            } else if (item.getType() === ItemType.VIOLET_ITEM && this.bulletManager) {
                this.bulletManager.changePlayerBulletColor(PlayerBulletColor.VIOLET);
                console.log('Bullet color changed to VIOLET');
            }
        });
    }

    /**
     * Check game over conditions
     */
    private checkGameOver(): void {
        if (!this.player) return;

        if (this.player.isDestroyed()) {
            this.gameRunning = false;
            console.log('Game Over!');
            // TODO: Show game over screen
        }
    }

    /**
     * Check level completion
     */
    private checkLevelCompletion(): void {
        if (!this.levelManager) return;

        if (this.levelManager.isLevelCompleted()) {
            console.log('Level completed!');
            this.levelManager.nextLevel();
            this.uiManager?.updateGameLevel(this.levelManager.getCurrentLevel());
        }
    }

    /**
     * Get the game container
     */
    getContainer() {
      return this.gameContainer;
    }

    /**
     * Get current score
     */
    getScore(): number {
        return this.score;
    }

    /**
     * Cleanup when game ends
     */
    destroy(): void {
        this.gameRunning = false;
        
        // Remove all ticker listeners
        this.app.ticker.stop();
        
        // Cleanup managers
        this.backgroundManager?.destroy();
        this.bulletManager?.clearAllBullets();
        this.collisionManager?.destroy();
        
        // Cleanup containers
        this.gameContainer.destroy({ children: true });
        this.uiContainer.destroy({ children: true });
    }
}