import { Container, Sprite, Texture } from "pixi.js";

export enum BulletType {
    PLAYER = 'player',
    ENEMY = 'enemy',
    BOSS = 'boss'
}

export enum BulletLevel {
    LEVEL1 = 1, // 1 line
    LEVEL2 = 2, // 2 line
    LEVEL3 = 3, // 3 line
    LEVEL4 = 4, // 3 line góc nhọn
    LEVEL5 = 5, // 4 line góc nhọn
    LEVEL6 = 6  // 5 line góc nhọn
}

interface BulletOptions {
    x?: number;
    y?: number;
    scale?: number;
    speed?: number;
    damage?: number;
    angle?: number; // Góc bắn (độ)
    type?: BulletType;
    level?: BulletLevel;
    texture?: Texture;
}

export class Bullet extends Container {
    private sprite: Sprite;
    private speed: number;
    private damage: number;
    private bulletAngle: number; // Renamed from 'angle' to 'bulletAngle'
    private type: BulletType;
    private level: BulletLevel;
    private isDestroyed: boolean = false;
    private hitbox: { width: number; height: number; };
    private readonly HITBOX_PADDING: number = 2; // Padding cho hitbox
    private readonly MULTI_BULLET_ANGLE: number = 15; // Góc giữa các đạn (độ)
    
    constructor(options: BulletOptions = {}) {
        super();
        this.x = options.x || 0;
        this.y = options.y || 0;
        this.scale.set(options.scale || 1);
        
        this.speed = options.speed || 5;
        this.damage = options.damage || 1;
        this.bulletAngle = (options.angle || 0) * Math.PI / 180; // Updated to use bulletAngle
        this.type = options.type || BulletType.PLAYER;
        this.level = options.level || BulletLevel.LEVEL1;
        
        // Tăng sát thương theo cấp độ
        this.damage *= Math.ceil(this.level / 2);
        
        // Tạo sprite cho đạn
        if (options.texture) {
            this.sprite = new Sprite(options.texture);
        } else {
            // Mặc định tạo sprite trống, sẽ được cập nhật sau
            this.sprite = new Sprite(Texture.WHITE);
            this.sprite.width = 10;
            this.sprite.height = 20;
            
            // Màu sắc dựa vào loại đạn
            switch (this.type) {
                case BulletType.PLAYER:
                    this.sprite.tint = 0x00FFFF; // Cyan cho đạn người chơi
                    break;
                case BulletType.ENEMY:
                    this.sprite.tint = 0xFF0000; // Đỏ cho đạn kẻ địch
                    break;
                case BulletType.BOSS:
                    this.sprite.tint = 0xFF00FF; // Tím cho đạn boss
                    break;
            }
        }
        
        this.sprite.anchor.set(0.5);
        this.addChild(this.sprite);
        
        // Xoay sprite theo góc bắn
        this.sprite.rotation = this.bulletAngle;
        // Initialize hitbox with default values
        this.hitbox = {
            width: this.sprite.width + this.HITBOX_PADDING,
            height: this.sprite.height + this.HITBOX_PADDING
        };
    }
    
    // Cập nhật vị trí đạn mỗi frame
    update(): void {
        if (this.isDestroyed) return;
        
        // Di chuyển theo góc bắn
        this.x += Math.cos(this.bulletAngle) * this.speed;
        this.y += Math.sin(this.bulletAngle) * this.speed;
        
        // Cập nhật hitbox
        this.hitbox = {
            width: this.sprite.width + this.HITBOX_PADDING,
            height: this.sprite.height + this.HITBOX_PADDING
        };
    }
    
    // Kiểm tra va chạm với đối tượng khác
    checkCollision(targetX: number, targetY: number, radius: number): boolean {
        if (this.isDestroyed) return false;
        
        // Sử dụng AABB collision detection
        const halfWidth = this.hitbox.width / 2;
        const halfHeight = this.hitbox.height / 2;
        
        const bulletLeft = this.x - halfWidth;
        const bulletRight = this.x + halfWidth;
        const bulletTop = this.y - halfHeight;
        const bulletBottom = this.y + halfHeight;
        
        const targetLeft = targetX - radius;
        const targetRight = targetX + radius;
        const targetTop = targetY - radius;
        const targetBottom = targetY + radius;
        
        return !(bulletLeft > targetRight || 
                 bulletRight < targetLeft || 
                 bulletTop > targetBottom ||
                 bulletBottom < targetTop);
    }
    
    // Đánh dấu đạn đã bị hủy
    destroyBullet(): void {
        if (this.isDestroyed) return;
        
        this.isDestroyed = true;
        
        // Thêm hiệu ứng nổ
        const explosion = new Sprite(Texture.WHITE);
        explosion.width = explosion.height = 20;
        explosion.anchor.set(0.5);
        explosion.tint = this.sprite.tint;
        explosion.alpha = 0.8;
        this.addChild(explosion);
        
        // Animation cho hiệu ứng nổ
        const duration = 300; // 300ms
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            explosion.alpha = 0.8 * (1 - progress);
            explosion.scale.set(1 + progress);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.removeChild(explosion);
                this.emit('destroyed', this);
            }
        };
        
        animate();
    }
    
    // Lấy loại đạn
    getType(): BulletType {
        return this.type;
    }
    
    // Lấy cấp độ đạn
    getLevel(): BulletLevel {
        return this.level;
    }
    
    // Lấy sát thương đạn
    getDamage(): number {
        return this.damage;
    }
    
    // Kiểm tra đạn đã bị hủy chưa
    getIsDestroyed(): boolean {
        return this.isDestroyed;
    }
    
    // Cập nhật texture cho đạn
    setTexture(texture: Texture): void {
        this.sprite.texture = texture;
    }
    
    // Tạo nhiều đạn theo cấp độ
    static createBullets(options: BulletOptions = {}): Bullet[] {
        const bullets: Bullet[] = [];
        const level = options.level || BulletLevel.LEVEL1;
        const baseAngle = options.angle || 0;
        
        switch (level) {
            case BulletLevel.LEVEL1:
                bullets.push(new Bullet(options));
                break;
                
            case BulletLevel.LEVEL2: // 2 line
                bullets.push(
                    new Bullet({ ...options, angle: baseAngle - 10 }),
                    new Bullet({ ...options, angle: baseAngle + 10 })
                );
                break;
                
            case BulletLevel.LEVEL3: // 3 line
                bullets.push(
                    new Bullet({ ...options, angle: baseAngle - 15 }),
                    new Bullet({ ...options, angle: baseAngle }),
                    new Bullet({ ...options, angle: baseAngle + 15 })
                );
                break;
                
            case BulletLevel.LEVEL4: // 3 line góc nhọn
                bullets.push(
                    new Bullet({ ...options, angle: baseAngle - 20 }),
                    new Bullet({ ...options, angle: baseAngle }),
                    new Bullet({ ...options, angle: baseAngle + 20 })
                );
                break;
                
            case BulletLevel.LEVEL5: // 4 line góc nhọn
                bullets.push(
                    new Bullet({ ...options, angle: baseAngle - 30 }),
                    new Bullet({ ...options, angle: baseAngle - 10 }),
                    new Bullet({ ...options, angle: baseAngle + 10 }),
                    new Bullet({ ...options, angle: baseAngle + 30 })
                );
                break;
                
            case BulletLevel.LEVEL6: // 5 line góc nhọn
                bullets.push(
                    new Bullet({ ...options, angle: baseAngle - 40 }),
                    new Bullet({ ...options, angle: baseAngle - 20 }),
                    new Bullet({ ...options, angle: baseAngle }),
                    new Bullet({ ...options, angle: baseAngle + 20 }),
                    new Bullet({ ...options, angle: baseAngle + 40 })
                );
                break;
        }
        
        return bullets;
    }
}