import { Container, Graphics, Sprite, Texture, Assets, Application } from "pixi.js";
import { Player } from "../entities/Player";
import { Enemy } from "../entities/Enemy";
import { Boss } from "../entities/Boss";

export class SkillManager {
    private container: Container;
    private player: Player;
    private app: Application;
    private skillTexture: Texture | null = null;
    private skillGraphics: Graphics | null = null;
    private skillSprite: Sprite | null = null;
    private skillCooldown: number = 5000; // 5 giây
    private skillTimer: number = 0;
    private isSkillReady: boolean = true;
    private skillRadius: number = 100; // Phạm vi ảnh hưởng của kỹ năng
    private readonly BASE_URL = import.meta.env.BASE_URL || '';
    
    constructor(app: Application, container: Container, player: Player) {
        this.app = app;
        this.container = container;
        this.player = player;
    }
    
    // Tải texture cho kỹ năng
    async loadTextures(): Promise<void> {
        try {
            this.skillTexture = await Assets.load(`${this.BASE_URL}assets/skills/player_skill.png`);
            console.log('Skill textures loaded successfully');
        } catch (error) {
            console.error('Failed to load skill textures:', error);
            // Tạo graphics mặc định nếu không tải được texture
            this.createDefaultSkillGraphics();
        }
    }
    
    // Tạo graphics mặc định cho kỹ năng
    private createDefaultSkillGraphics(): void {
        this.skillGraphics = new Graphics();
        this.skillGraphics.beginFill(0x00FFFF, 0.5);
        this.skillGraphics.drawCircle(0, 0, this.skillRadius);
        this.skillGraphics.endFill();
    }
    
    // Sử dụng kỹ năng của người chơi
    usePlayerSkill(enemies: Enemy[]): boolean {
        // Kiểm tra xem kỹ năng đã sẵn sàng chưa
        if (!this.isSkillReady) return false;
        
        // Lấy vị trí người chơi
        const playerX = this.player.x;
        const playerY = this.player.y;
        
        // Tạo hiệu ứng kỹ năng
        this.createSkillEffect(playerX, playerY);
        
        // Gây sát thương cho kẻ địch trong phạm vi
        const affectedEnemies = this.getEnemiesInRange(enemies, playerX, playerY, this.skillRadius);
        for (const enemy of affectedEnemies) {
            // Gây sát thương lớn hơn cho kẻ địch
            enemy.takeDamage(enemy instanceof Boss ? 2 : 3);
        }
        
        // Đặt cooldown
        this.isSkillReady = false;
        this.skillTimer = this.skillCooldown;
        
        // Emit sự kiện kỹ năng đã được sử dụng
        this.emit('playerSkillUsed', this.skillCooldown);
        
        return true;
    }
    
    // Tạo hiệu ứng kỹ năng
    private createSkillEffect(x: number, y: number): void {
        // Xóa hiệu ứng cũ nếu có
        if (this.skillSprite && this.skillSprite.parent) {
            this.skillSprite.parent.removeChild(this.skillSprite);
        }
        
        // Tạo sprite hiệu ứng
        if (this.skillTexture) {
            this.skillSprite = new Sprite(this.skillTexture);
        } else if (this.skillGraphics) {
            this.skillSprite = new Sprite(this.app.renderer.generateTexture(this.skillGraphics));
        } else {
            return;
        }
        
        // Thiết lập vị trí và thuộc tính
        this.skillSprite.anchor.set(0.5);
        this.skillSprite.x = x;
        this.skillSprite.y = y;
        this.skillSprite.alpha = 0.8;
        
        // Thêm vào container
        this.container.addChild(this.skillSprite);
        
        // Animation hiệu ứng
        const duration = 500; // 0.5 giây
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            if (this.skillSprite) {
                // Scale từ 0 đến 1
                this.skillSprite.scale.set(progress * 2);
                
                // Giảm độ trong suốt
                this.skillSprite.alpha = 0.8 * (1 - progress);
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    // Kết thúc animation
                    if (this.skillSprite.parent) {
                        this.skillSprite.parent.removeChild(this.skillSprite);
                    }
                }
            }
        };
        
        animate();
    }
    
    // Tạo hiệu ứng kỹ năng của boss
    createBossSkillEffect(x: number, y: number, radius: number): void {
        // Tạo graphics cho hiệu ứng
        const graphics = new Graphics();
        graphics.beginFill(0xFF00FF, 0.5);
        graphics.drawCircle(0, 0, radius);
        graphics.endFill();
        
        // Tạo sprite từ graphics
        const sprite = new Sprite(this.app.renderer.generateTexture(graphics));
        sprite.anchor.set(0.5);
        sprite.x = x;
        sprite.y = y;
        sprite.alpha = 0.8;
        
        // Thêm vào container
        this.container.addChild(sprite);
        
        // Animation hiệu ứng
        const duration = 1000; // 1 giây
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Scale từ 0 đến 1
            sprite.scale.set(progress * 1.5);
            
            // Giảm độ trong suốt
            sprite.alpha = 0.8 * (1 - progress);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Kết thúc animation
                if (sprite.parent) {
                    sprite.parent.removeChild(sprite);
                }
            }
        };
        
        animate();
    }
    
    // Lấy danh sách kẻ địch trong phạm vi
    private getEnemiesInRange(enemies: Enemy[], x: number, y: number, radius: number): Enemy[] {
        return enemies.filter(enemy => {
            if (enemy.isDestroyed()) return false;
            
            const dx = enemy.x - x;
            const dy = enemy.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            return distance < radius;
        });
    }
    
    // Cập nhật cooldown kỹ năng
    update(deltaTime: number): void {
        if (!this.isSkillReady) {
            this.skillTimer -= deltaTime;
            
            if (this.skillTimer <= 0) {
                this.isSkillReady = true;
                this.emit('skillReady');
            } else {
                // Emit sự kiện cập nhật cooldown
                this.emit('skillCooldownUpdate', this.skillTimer);
            }
        }
    }
    
    // Kiểm tra xem kỹ năng đã sẵn sàng chưa
    isReady(): boolean {
        return this.isSkillReady;
    }
    
    // Lấy thời gian cooldown còn lại
    getCooldownRemaining(): number {
        return this.isSkillReady ? 0 : this.skillTimer;
    }
    
    // Lấy thời gian cooldown tối đa
    getMaxCooldown(): number {
        return this.skillCooldown;
    }
    
    // Phương thức emit sự kiện
    private emit(event: string, data?: any): void {
        // Sử dụng custom event để gửi sự kiện
        const customEvent = new CustomEvent(event, { detail: data });
        document.dispatchEvent(customEvent);
    }
}