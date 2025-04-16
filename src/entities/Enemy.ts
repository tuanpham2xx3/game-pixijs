import { Container, AnimatedSprite, Spritesheet } from "pixi.js";

export enum EnemyState {
    // Movement states
    IDLE = 'idle',
    MOVE = 'move',
    // Game states
    DESTROY = 'destroy'
}

export enum EnemyType {
    CREP = 'crep',
    BOSS = 'boss'
}

interface EnemyOptions {
    x?: number;
    y?: number;
    scale?: number;
    spritesheet?: Spritesheet;
    hp?: number;
    type?: EnemyType;
    speed?: number;
}

export class Enemy extends Container {
    protected currentState: EnemyState = EnemyState.IDLE;
    protected animations: Map<string, AnimatedSprite> = new Map();
    protected hp: number;
    protected speed: number;
    protected type: EnemyType;
    protected readonly DESTROY_DURATION: number = 1000; // 1 second
    
    constructor(options: EnemyOptions = {}) {
        super();
        this.x = options.x || 0;
        this.y = options.y || 0;
        this.scale.set(options.scale || 1);
        
        this.hp = options.hp || 1;
        this.speed = options.speed || 1;
        this.type = options.type || EnemyType.CREP;

        if (options.spritesheet) {
            this.initialize(options.spritesheet);
        }
    }

    // Khởi tạo animations từ spritesheet
    protected initialize(spritesheet: Spritesheet): void {
        // Tạo animations cho các trạng thái
        for (const state of Object.values(EnemyState)) {
            // Sử dụng animations từ spritesheet
            const animationKey = `${this.type}_${state}`;
            if (spritesheet.animations[animationKey]) {
                const animatedSprite = new AnimatedSprite(spritesheet.animations[animationKey]);
                animatedSprite.anchor.set(0.5);
                animatedSprite.animationSpeed = 0.1;
                animatedSprite.visible = false;
                
                this.addChild(animatedSprite);
                this.animations.set(state, animatedSprite);
            } else {
                console.warn(`Animation not found for state: ${animationKey}`);
            }
        }

        // Thiết lập trạng thái ban đầu
        this.setState(EnemyState.IDLE);
    }

    // Thay đổi trạng thái
    setState(newState: EnemyState): void {
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
            newAnim.visible = true;
            newAnim.gotoAndPlay(0);
        }

        this.currentState = newState;
    }

    // Phương thức di chuyển cơ bản
    move(): void {
        this.setState(EnemyState.MOVE);
    }

    // Phương thức nhận sát thương
    takeDamage(damage: number = 1): void {
        this.hp -= damage;
        
        if (this.hp <= 0) {
            this.setState(EnemyState.DESTROY);
            setTimeout(() => {
                this.emit('destroyed', this);
            }, this.DESTROY_DURATION);
        }
    }

    // Kiểm tra xem enemy đã bị tiêu diệt chưa
    isDestroyed(): boolean {
        return this.hp <= 0;
    }

    // Lấy loại enemy
    getType(): EnemyType {
        return this.type;
    }

    // Lấy HP hiện tại
    getHP(): number {
        return this.hp;
    }

    // Dọn dẹp khi không dùng
    destroy(options?: { children?: boolean; texture?: boolean; baseTexture?: boolean; }): void {
        for (const anim of this.animations.values()) {
            anim.stop();
        }
        super.destroy(options);
    }
}