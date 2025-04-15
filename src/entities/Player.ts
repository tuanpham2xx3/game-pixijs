import { Container, AnimatedSprite, Spritesheet} from "pixi.js";

enum PlayerState {
    // Movement states
    IDLE = 'idle',
    RIGHT = 'right',
    LEFT = 'left',
    UP = 'up',
    UP_RIGHT = 'up_right',
    UP_LEFT = 'up_left',
    DOWN = 'down',
    DOWN_RIGHT = 'down_right',
    DOWN_LEFT = 'down_left',
    // Game states
    DESTROY = 'destroy',
    IMMUNE = 'immune',
    LEVEL_UP = 'level_up'
}

interface PlayerOptions {
    x?: number;
    y?: number;
    scale?: number;
    spritesheet?: Spritesheet;
    maxHealth?: number;
    initialLevel?: number;
}

export class Player extends Container {
    private currentState: PlayerState = PlayerState.IDLE;
    private direction: number = 1;
    private animations: Map<PlayerState, AnimatedSprite> = new Map();
    
    // New properties
    private health: number;
    private maxHealth: number;
    private level: number;
    private isImmune: boolean = false;
    private immunityTimer: number = 0;
    private readonly IMMUNITY_DURATION: number = 2000; // 2 seconds
    private readonly DESTROY_DURATION: number = 1000; // 1 second

    constructor(options: PlayerOptions = {}) {
        super();
        this.x = options.x || 0;
        this.y = options.y || 0;
        this.scale.set(options.scale || 1);
        
        // Initialize health and level
        this.maxHealth = options.maxHealth || 3;
        this.health = this.maxHealth;
        this.level = options.initialLevel || 1;

        if (options.spritesheet) {
            this.initialize(options.spritesheet);
        }
    }

    // Add new methods for game logic
    takeDamage(): void {
        if (this.isImmune) return;
        
        this.health--;
        this.level = Math.max(1, this.level - 1); // Decrease level but not below 1
        
        if (this.health > 0) {
            this.setState(PlayerState.DESTROY);
            setTimeout(() => {
                this.setState(PlayerState.IMMUNE);
                this.isImmune = true;
                this.immunityTimer = setTimeout(() => {
                    this.isImmune = false;
                    this.setState(PlayerState.IDLE);
                }, this.IMMUNITY_DURATION);
            }, this.DESTROY_DURATION);
        }
    }

    heal(): void {
        this.health = Math.min(this.health + 1, this.maxHealth);
    }

    levelUp(): void {
        this.level++;
        this.setState(PlayerState.LEVEL_UP);
        setTimeout(() => this.setState(PlayerState.IDLE), 500);
    }

    getCurrentLevel(): number {
        return this.level;
    }

    getHealth(): number {
        return this.health;
    }

    isDestroyed(): boolean {
        return this.health <= 0;
    }

    // Override destroy method to clean up timers
    destroy(options?: { children?: boolean; texture?: boolean; baseTexture?: boolean; }): void {
        clearTimeout(this.immunityTimer);
        for (const anim of this.animations.values()) {
            anim.stop();
        }
        super.destroy(options);
    }

    // LOAD DATASHEET
    initialize(spritesheet: Spritesheet): void {
        // Create default texture array for each state
        for (const state of Object.values(PlayerState)) {
            // Use animations from spritesheet directly
            if (spritesheet.animations[state]) {
                const animatedSprite = new AnimatedSprite(spritesheet.animations[state]);
                animatedSprite.anchor.set(0.5);
                animatedSprite.animationSpeed = 0.1;
                animatedSprite.visible = false;
                
                this.addChild(animatedSprite);
                this.animations.set(state, animatedSprite);
            } else {
                console.warn(`Animation not found for state: ${state}`);
            }
        }

        // Set initial state
        this.setState(PlayerState.IDLE);
    }
    // Thay đổi trạng thái Player
    setState(newState: PlayerState): void {
        if (this.currentState === newState) return;
        
        // Dừng animation hiện tại
        const currentAnim = this.animations.get(this.currentState);
        if (currentAnim) {
            currentAnim.stop();
            currentAnim.visible = false;
        }

        // Kích hoạt animation mới
        const newAnim = this.animations.get(newState);
        if (newAnim) {
            newAnim.scale.x = Math.abs(newAnim.scale.x) * this.direction;
            newAnim.visible = true;
            newAnim.gotoAndPlay(0);
        }

        this.currentState = newState;
    }

    //dọn dẹp khi không dùng
    // destroy(options?: { children?: boolean; texture?: boolean; baseTexture?: boolean; }): void {
    //     for (const anim of this.animations.values()) {
    //         anim.stop();
    //     }
    //     super.destroy(options);
    // }

    // Thêm các phương thức di chuyển
    moveRight(): void {
        this.x += 2;
        this.setState(PlayerState.RIGHT);
    }

    moveLeft(): void {
        this.x -= 2;
        this.setState(PlayerState.LEFT);
    }

    moveUp(): void {
        this.y -= 2;
        this.setState(PlayerState.UP);
    }

    moveDown(): void {
        this.y += 2;
        this.setState(PlayerState.DOWN);
    }

    moveUpRight(): void {
        this.x += 2;
        this.y -= 2;
        this.setState(PlayerState.UP_RIGHT);
    }

    moveUpLeft(): void {
        this.x -= 2;
        this.y -= 2;
        this.setState(PlayerState.UP_LEFT);
    }

    moveDownRight(): void {
        this.x += 2;
        this.y += 2;
        this.setState(PlayerState.DOWN_RIGHT);
    }

    moveDownLeft(): void {
        this.x -= 2;
        this.y += 2;
        this.setState(PlayerState.DOWN_LEFT);
    }

    // Dừng di chuyển
    idle(): void {
        this.setState(PlayerState.IDLE);
    }
}
