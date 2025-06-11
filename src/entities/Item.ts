import { Container, Sprite, Texture } from "pixi.js";

export enum ItemType {
    HEART = 'heart',
    LEVEL_UP = 'level_up',
    BLUE_ITEM = 'blue_item',
    VIOLET_ITEM = 'violet_item'
}

interface ItemOptions {
    x?: number;
    y?: number;
    scale?: number;
    type?: ItemType;
    texture?: Texture;
}

export class Item extends Container {
    private type: ItemType;
    private sprite: Sprite;
    private speed: number = 1; // Tốc độ rơi xuống
    private collected: boolean = false;
    
    constructor(options: ItemOptions = {}) {
        super();
        this.x = options.x || 0;
        this.y = options.y || 0;
        this.scale.set(options.scale || 1);
        this.type = options.type || ItemType.HEART;
        
        // Tạo sprite cho item
        if (options.texture) {
            this.sprite = new Sprite(options.texture);
        } else {
            // Mặc định tạo sprite trống, sẽ được cập nhật sau
            this.sprite = new Sprite(Texture.WHITE);
            this.sprite.width = 20;
            this.sprite.height = 20;
            this.sprite.tint = this.type === ItemType.HEART ? 0xFF0000 : 0x00FF00; // Đỏ cho tim, xanh cho level up
        }
        
        this.sprite.anchor.set(0.5);
        this.addChild(this.sprite);
    }
    
    // Cập nhật texture cho item
    setTexture(texture: Texture): void {
        this.sprite.texture = texture;
    }
    
    // Lấy loại item
    getType(): ItemType {
        return this.type;
    }
    
    // Kiểm tra xem item đã được thu thập chưa
    isCollected(): boolean {
        return this.collected;
    }
    
    // Đánh dấu item đã được thu thập
    collect(): void {
        this.collected = true;
        this.emit('collected', this);
    }
    
    // Cập nhật vị trí item mỗi frame (rơi xuống)
    update(): void {
        if (this.collected) return;
        
        // Item rơi xuống
        this.y += this.speed;
        
        // Hiệu ứng nhấp nhô
        this.sprite.scale.x = 1 + Math.sin(Date.now() * 0.005) * 0.1;
        this.sprite.scale.y = 1 + Math.sin(Date.now() * 0.005) * 0.1;
    }
    
    // Kiểm tra va chạm với player
    checkCollision(playerX: number, playerY: number, radius: number): boolean {
        if (this.collected) return false;
        
        const dx = this.x - playerX;
        const dy = this.y - playerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance < radius;
    }
}