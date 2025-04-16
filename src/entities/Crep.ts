import { Spritesheet } from "pixi.js";
import { Enemy, EnemyType } from "./Enemy";
import { Item, ItemType } from "./Item";

interface CrepOptions {
    x?: number;
    y?: number;
    scale?: number;
    spritesheet?: Spritesheet;
    hp?: number;
    speed?: number;
    dropRate?: number; // Tỉ lệ rơi item (0-1)
    targetX?: number; // Vị trí đích đến X
    targetY?: number; // Vị trí đích đến Y
}

export class Crep extends Enemy {
    private targetX: number;
    private targetY: number;
    private dropRate: number; // Tỉ lệ rơi item (0-1)
    private isMovingToTarget: boolean = false;
    private readonly MIN_DISTANCE: number = 5; // Khoảng cách tối thiểu để dừng di chuyển
    
    constructor(options: CrepOptions = {}) {
        super({
            ...options,
            type: EnemyType.CREP
        });
        
        this.targetX = options.targetX || this.x;
        this.targetY = options.targetY || this.y;
        this.dropRate = options.dropRate || 0.3; // Mặc định 30% tỉ lệ rơi item
    }
    
    // Di chuyển đến vị trí đích
    moveToTarget(): void {
        this.isMovingToTarget = true;
        this.setState(EnemyState.MOVE);
    }
    
    // Cập nhật vị trí mới cho Crep
    setTarget(x: number, y: number): void {
        this.targetX = x;
        this.targetY = y;
    }
    
    // Cập nhật di chuyển mỗi frame
    update(deltaTime: number = 1/60): void {
        if (!this.isMovingToTarget || this.isDestroyed()) return;
        
        // Tính toán hướng di chuyển
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Nếu đã đến đích hoặc rất gần đích
        if (distance < this.MIN_DISTANCE) {
            this.x = this.targetX;
            this.y = this.targetY;
            this.isMovingToTarget = false;
            this.setState(EnemyState.IDLE);
            this.emit('targetReached', this);
            return;
        }
        
        // Di chuyển theo hướng đích với deltaTime
        const vx = (dx / distance) * this.speed * deltaTime;
        const vy = (dy / distance) * this.speed * deltaTime;
        
        this.x += vx;
        this.y += vy;
        
        // Cập nhật animation theo hướng di chuyển
        this.updateDirection(dx, dy);
    }
    
    // Override phương thức takeDamage để xử lý rơi item
    takeDamage(damage: number = 1): void {
        super.takeDamage(damage);
        
        // Nếu bị tiêu diệt, kiểm tra rơi item
        if (this.isDestroyed()) {
            this.dropItem();
        }
    }
    
    // Phương thức xử lý rơi item
    private dropItem(): void {
        // Kiểm tra tỉ lệ rơi
        if (Math.random() <= this.dropRate) {
            // Quyết định loại item với tỉ lệ khác nhau
            const rand = Math.random();
            let itemType = ItemType.HEART;
            
            if (rand < 0.3) {
                itemType = ItemType.HEART; // 30% heart
            } else if (rand < 0.5) {
                itemType = ItemType.LEVEL_UP; // 20% level up
            } // 50% không rơi gì cả
            
            // Tạo và emit sự kiện rơi item
            const item = new Item({
                x: this.x,
                y: this.y,
                type: itemType
            });
            
            // Emit sự kiện để game có thể thêm item vào stage
            this.emit('dropItem', item);
        }
    }
    
    // Cập nhật hướng nhìn của Crep
    private updateDirection(dx: number, dy: number): void {
        // Tính góc di chuyển
        const angle = Math.atan2(dy, dx);
        
        // Cập nhật scale.x để flip sprite theo hướng di chuyển
        this.scale.x = Math.abs(this.scale.x) * (dx > 0 ? 1 : -1);
    }
}

// Re-export EnemyState để sử dụng trong file này
import { EnemyState } from "./Enemy";