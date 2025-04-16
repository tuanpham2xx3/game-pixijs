import { Spritesheet } from "pixi.js";
import { Enemy, EnemyType } from "./Enemy";
import { EnemyState } from "./Enemy";

interface BossOptions {
    x?: number;
    y?: number;
    scale?: number;
    spritesheet?: Spritesheet;
    hp?: number;
    speed?: number;
    attackCooldown?: number; // Thời gian hồi chiêu (ms)
}

export class Boss extends Enemy {
    private attackTimer: number = 0;
    private attackCooldown: number; // Thời gian hồi chiêu (ms)
    private isAttacking: boolean = false;
    private skillRadius: number = 150; // Phạm vi ảnh hưởng của skill
    
    constructor(options: BossOptions = {}) {
        super({
            ...options,
            type: EnemyType.BOSS,
            hp: options.hp || 10 // Boss có nhiều máu hơn
        });
        
        this.attackCooldown = options.attackCooldown || 5000; // Mặc định 5 giây
    }
    
    // Cập nhật trạng thái Boss mỗi frame
    update(deltaTime: number, playerX: number, playerY: number): void {
        // Cập nhật timer tấn công
        if (this.attackTimer > 0) {
            this.attackTimer -= deltaTime;
        }
        
        // Nếu đã hết cooldown và không đang tấn công, thực hiện tấn công
        if (this.attackTimer <= 0 && !this.isAttacking && !this.isDestroyed()) {
            this.useSkill(playerX, playerY);
        }
        
        // Nếu không đang tấn công và không bị tiêu diệt, di chuyển về phía người chơi
        if (!this.isAttacking && !this.isDestroyed()) {
            this.moveTowardsPlayer(playerX, playerY);
        }
    }
    
    // Di chuyển về phía người chơi
    private moveTowardsPlayer(playerX: number, playerY: number): void {
        // Tính toán hướng di chuyển
        const dx = playerX - this.x;
        const dy = playerY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Nếu đã đủ gần, không cần di chuyển
        if (distance < this.skillRadius) {
            this.setState(EnemyState.IDLE);
            return;
        }
        
        // Di chuyển theo hướng người chơi
        const vx = (dx / distance) * this.speed;
        const vy = (dy / distance) * this.speed;
        
        this.x += vx;
        this.y += vy;
        this.setState(EnemyState.MOVE);
    }
    
    // Sử dụng kỹ năng
    useSkill(playerX: number, playerY: number): void {
        this.isAttacking = true;
        
        // Emit sự kiện để game xử lý hiệu ứng và sát thương
        this.emit('bossSkill', {
            x: this.x,
            y: this.y,
            radius: this.skillRadius,
            targetX: playerX,
            targetY: playerY
        });
        
        // Sau khi tấn công xong, reset timer và trạng thái
        setTimeout(() => {
            this.isAttacking = false;
            this.attackTimer = this.attackCooldown;
        }, 1000); // Thời gian thực hiện skill là 1 giây
    }
    
    // Override phương thức takeDamage để xử lý sự kiện khi Boss bị tấn công
    takeDamage(damage: number = 1): void {
        super.takeDamage(damage);
        
        // Emit sự kiện khi Boss bị tấn công
        this.emit('bossDamaged', {
            hp: this.hp,
            maxHp: this.getMaxHp()
        });
    }
    
    // Lấy máu tối đa của Boss
    getMaxHp(): number {
        return 10; // Giá trị mặc định, có thể thay đổi tùy theo thiết kế
    }
    
    // Lấy phần trăm máu còn lại
    getHpPercent(): number {
        return this.hp / this.getMaxHp();
    }
}