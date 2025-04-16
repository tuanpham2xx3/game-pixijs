import { Container, Texture, Assets } from "pixi.js";
import { Bullet, BulletType, BulletLevel } from "../entities/Bullet";
import { Player } from "../entities/Player";
import { Enemy } from "../entities/Enemy";
import { Boss } from "../entities/Boss";

export class BulletManager {
    private container: Container;
    private bullets: Bullet[] = [];
    private bulletTextures: Map<string, Texture> = new Map();
    private readonly BASE_URL = import.meta.env.BASE_URL || '';
    
    constructor(container: Container) {
        this.container = container;
    }
    
    // Tải texture cho đạn
    async loadTextures(): Promise<void> {
        try {
            // Tải texture cho các loại đạn
            const playerBulletTexture = await Assets.load(`${this.BASE_URL}assets/bullets/player_bullet.png`);
            const enemyBulletTexture = await Assets.load(`${this.BASE_URL}assets/bullets/enemy_bullet.png`);
            const bossBulletTexture = await Assets.load(`${this.BASE_URL}assets/bullets/boss_bullet.png`);
            
            // Lưu texture vào map
            this.bulletTextures.set('player', playerBulletTexture);
            this.bulletTextures.set('enemy', enemyBulletTexture);
            this.bulletTextures.set('boss', bossBulletTexture);
            
            // Tải texture cho các cấp độ đạn của người chơi
            for (let i = 1; i <= 6; i++) {
                const levelTexture = await Assets.load(`${this.BASE_URL}assets/bullets/player_level${i}.png`);
                this.bulletTextures.set(`player_level${i}`, levelTexture);
            }
            
            console.log('Bullet textures loaded successfully');
        } catch (error) {
            console.error('Failed to load bullet textures:', error);
            // Sử dụng texture mặc định nếu không tải được
        }
    }
    
    // Tạo đạn cho người chơi dựa trên cấp độ
    createPlayerBullets(player: Player): void {
        const playerLevel = player.getCurrentLevel();
        const playerX = player.x;
        const playerY = player.y;
        
        // Lấy texture tương ứng với cấp độ đạn
        const textureKey = `player_level${playerLevel}`;
        const texture = this.bulletTextures.get(textureKey) || this.bulletTextures.get('player');
        
        // Tạo đạn dựa trên cấp độ
        switch (playerLevel) {
            case 1: // 1 line
                this.createBullet({
                    x: playerX,
                    y: playerY - 20, // Phía trên người chơi
                    angle: -90, // Bắn lên trên
                    type: BulletType.PLAYER,
                    level: BulletLevel.LEVEL1,
                    texture
                });
                break;
                
            case 2: // 2 line
                this.createBullet({
                    x: playerX - 10,
                    y: playerY - 20,
                    angle: -90,
                    type: BulletType.PLAYER,
                    level: BulletLevel.LEVEL2,
                    texture
                });
                this.createBullet({
                    x: playerX + 10,
                    y: playerY - 20,
                    angle: -90,
                    type: BulletType.PLAYER,
                    level: BulletLevel.LEVEL2,
                    texture
                });
                break;
                
            case 3: // 3 line
                this.createBullet({
                    x: playerX - 20,
                    y: playerY - 20,
                    angle: -90,
                    type: BulletType.PLAYER,
                    level: BulletLevel.LEVEL3,
                    texture
                });
                this.createBullet({
                    x: playerX,
                    y: playerY - 20,
                    angle: -90,
                    type: BulletType.PLAYER,
                    level: BulletLevel.LEVEL3,
                    texture
                });
                this.createBullet({
                    x: playerX + 20,
                    y: playerY - 20,
                    angle: -90,
                    type: BulletType.PLAYER,
                    level: BulletLevel.LEVEL3,
                    texture
                });
                break;
                
            case 4: // 3 line góc nhọn
                this.createBullet({
                    x: playerX,
                    y: playerY - 20,
                    angle: -90, // Thẳng
                    type: BulletType.PLAYER,
                    level: BulletLevel.LEVEL4,
                    texture
                });
                this.createBullet({
                    x: playerX - 10,
                    y: playerY - 20,
                    angle: -110, // Góc trái
                    type: BulletType.PLAYER,
                    level: BulletLevel.LEVEL4,
                    texture
                });
                this.createBullet({
                    x: playerX + 10,
                    y: playerY - 20,
                    angle: -70, // Góc phải
                    type: BulletType.PLAYER,
                    level: BulletLevel.LEVEL4,
                    texture
                });
                break;
                
            case 5: // 4 line góc nhọn
                this.createBullet({
                    x: playerX - 5,
                    y: playerY - 20,
                    angle: -90, // Thẳng trái
                    type: BulletType.PLAYER,
                    level: BulletLevel.LEVEL5,
                    texture
                });
                this.createBullet({
                    x: playerX + 5,
                    y: playerY - 20,
                    angle: -90, // Thẳng phải
                    type: BulletType.PLAYER,
                    level: BulletLevel.LEVEL5,
                    texture
                });
                this.createBullet({
                    x: playerX - 15,
                    y: playerY - 15,
                    angle: -120, // Góc trái
                    type: BulletType.PLAYER,
                    level: BulletLevel.LEVEL5,
                    texture
                });
                this.createBullet({
                    x: playerX + 15,
                    y: playerY - 15,
                    angle: -60, // Góc phải
                    type: BulletType.PLAYER,
                    level: BulletLevel.LEVEL5,
                    texture
                });
                break;
                
            case 6: // 5 line góc nhọn
                this.createBullet({
                    x: playerX,
                    y: playerY - 20,
                    angle: -90, // Thẳng giữa
                    type: BulletType.PLAYER,
                    level: BulletLevel.LEVEL6,
                    texture
                });
                this.createBullet({
                    x: playerX - 10,
                    y: playerY - 20,
                    angle: -100, // Góc trái nhẹ
                    type: BulletType.PLAYER,
                    level: BulletLevel.LEVEL6,
                    texture
                });
                this.createBullet({
                    x: playerX + 10,
                    y: playerY - 20,
                    angle: -80, // Góc phải nhẹ
                    type: BulletType.PLAYER,
                    level: BulletLevel.LEVEL6,
                    texture
                });
                this.createBullet({
                    x: playerX - 20,
                    y: playerY - 15,
                    angle: -120, // Góc trái mạnh
                    type: BulletType.PLAYER,
                    level: BulletLevel.LEVEL6,
                    texture
                });
                this.createBullet({
                    x: playerX + 20,
                    y: playerY - 15,
                    angle: -60, // Góc phải mạnh
                    type: BulletType.PLAYER,
                    level: BulletLevel.LEVEL6,
                    texture
                });
                break;
        }
    }
    
    // Tạo đạn cho kẻ địch
    createEnemyBullet(enemy: Enemy, targetX: number, targetY: number): void {
        const enemyX = enemy.x;
        const enemyY = enemy.y;
        
        // Tính góc bắn hướng về người chơi
        const dx = targetX - enemyX;
        const dy = targetY - enemyY;
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        
        // Lấy texture
        const texture = this.bulletTextures.get('enemy');
        
        // Tạo đạn
        this.createBullet({
            x: enemyX,
            y: enemyY,
            angle,
            type: BulletType.ENEMY,
            texture
        });
    }
    
    // Tạo đạn cho boss
    createBossBullet(boss: Boss, targetX: number, targetY: number): void {
        const bossX = boss.x;
        const bossY = boss.y;
        
        // Lấy texture
        const texture = this.bulletTextures.get('boss');
        
        // Tạo nhiều đạn theo hình tỏa tròn
        const bulletCount = 8; // Số lượng đạn
        for (let i = 0; i < bulletCount; i++) {
            const angle = (i * 360 / bulletCount);
            
            this.createBullet({
                x: bossX,
                y: bossY,
                angle,
                speed: 3,
                damage: 2, // Đạn boss gây nhiều sát thương hơn
                type: BulletType.BOSS,
                texture
            });
        }
    }
    
    // Tạo đạn với các tùy chọn
    private createBullet(options: {
        x: number,
        y: number,
        angle: number,
        speed?: number,
        damage?: number,
        type: BulletType,
        level?: BulletLevel,
        texture?: Texture
    }): void {
        const bullet = new Bullet({
            x: options.x,
            y: options.y,
            angle: options.angle,
            speed: options.speed,
            damage: options.damage,
            type: options.type,
            level: options.level,
            texture: options.texture
        });
        
        // Thêm đạn vào container và mảng quản lý
        this.container.addChild(bullet);
        this.bullets.push(bullet);
        
        // Xử lý sự kiện khi đạn bị hủy
        bullet.on('destroyed', (b: any) => {
            if (b instanceof Bullet) {
                this.removeBullet(b);
            }
        });
    }
    
    // Cập nhật tất cả đạn
    update(): void {
        for (const bullet of this.bullets) {
            bullet.update();
            
            // Kiểm tra đạn ra khỏi màn hình
            if (this.isOutOfBounds(bullet)) {
                bullet.destroyBullet();
            }
        }
    }
    
    // Kiểm tra đạn ra khỏi màn hình
    private isOutOfBounds(bullet: Bullet): boolean {
        const margin = 50; // Biên dự phòng
        return (
            bullet.x < -margin ||
            bullet.x > window.innerWidth + margin ||
            bullet.y < -margin ||
            bullet.y > window.innerHeight + margin
        );
    }
    
    // Xóa đạn khỏi container và mảng quản lý
    private removeBullet(bullet: Bullet): void {
        const index = this.bullets.indexOf(bullet);
        if (index !== -1) {
            this.bullets.splice(index, 1);
            this.container.removeChild(bullet);
            bullet.destroy();
        }
    }
    
    // Lấy tất cả đạn đang hoạt động
    getBullets(): Bullet[] {
        return this.bullets;
    }
    
    // Xóa tất cả đạn
    clearAllBullets(): void {
        for (const bullet of [...this.bullets]) {
            this.removeBullet(bullet);
        }
    }
}