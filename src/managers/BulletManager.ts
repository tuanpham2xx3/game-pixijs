import { Container, Texture, Assets, Spritesheet } from "pixi.js";
import { Bullet, BulletType, BulletLevel } from "../entities/Bullet";
import { Player } from "../entities/Player";
import { Enemy } from "../entities/Enemy";
import { Boss } from "../entities/Boss";

export enum PlayerBulletColor {
    RED = 'red',
    BLUE = 'blue', 
    VIOLET = 'violet'
}

export class BulletManager {
    private container: Container;
    private bullets: Bullet[] = [];
    private bulletTextures: Map<string, Texture> = new Map();
    private playerBulletSpritesheet?: Spritesheet;
    private currentPlayerBulletColor: PlayerBulletColor = PlayerBulletColor.RED;
    private readonly BASE_URL = import.meta.env.BASE_URL || '';
    
    constructor(container: Container) {
        this.container = container;
    }
    
    // Tải texture cho đạn từ spritesheet
    async loadTextures(): Promise<void> {
        try {
            console.log('Loading bullet textures...');
            
            // Tải player bullet spritesheet
            const playerBulletSheet = await Assets.load(`${this.BASE_URL}assets/bullets/bullet1.png`);
            const playerBulletData = await fetch(`${this.BASE_URL}assets/bullets/bullets_player.json`).then(res => res.json());
            
            this.playerBulletSpritesheet = new Spritesheet(playerBulletSheet, playerBulletData);
            await this.playerBulletSpritesheet.parse();
            
            console.log('Player bullet spritesheet loaded:', Object.keys(this.playerBulletSpritesheet.textures));
            
            // Lưu textures của red bullets (mặc định)
            this.loadPlayerBulletTextures(PlayerBulletColor.RED);
            
            // Tải texture cho enemy và boss bullets (fallback)
            try {
                const enemyBulletTexture = await Assets.load(`${this.BASE_URL}assets/bullets/enemy_bullet.png`);
                const bossBulletTexture = await Assets.load(`${this.BASE_URL}assets/bullets/boss_bullet.png`);
                
                this.bulletTextures.set('enemy', enemyBulletTexture);
                this.bulletTextures.set('boss', bossBulletTexture);
            } catch {
                console.warn('Enemy/Boss bullet textures not found, using defaults');
            }
            
            console.log('Bullet textures loaded successfully');
        } catch (error) {
            console.error('Failed to load bullet textures:', error);
            // Sử dụng texture mặc định nếu không tải được
        }
    }
    
    // Load textures cho player bullets theo màu
    private loadPlayerBulletTextures(color: PlayerBulletColor): void {
        if (!this.playerBulletSpritesheet) return;
        
        // Lưu texture cho từng loại đạn của player từ animations
        const animations = this.playerBulletSpritesheet.data?.animations;
        const textures = this.playerBulletSpritesheet.textures;
        
        if (!animations || !textures) {
            console.error('No animations or textures found in spritesheet');
            return;
        }
        
        // Tìm animation tương ứng với màu (red_player, blue_player, violet_player)
        const animationKey = `${color}_player`;
        const animationFrames = animations[animationKey];
        
        if (animationFrames && animationFrames.length > 0) {
            // Sử dụng frame đầu tiên làm texture chính
            const firstFrameName = animationFrames[0];
            const firstTexture = textures[firstFrameName];
            
            if (firstTexture) {
                // Lưu texture chính cho player
                this.bulletTextures.set('player', firstTexture);
                this.bulletTextures.set('player_level1', firstTexture);
                
                // Lưu tất cả frames cho các level khác nhau
                animationFrames.forEach((frameName: string, index: number) => {
                    const texture = textures[frameName];
                    if (texture) {
                        this.bulletTextures.set(`${color}_level${index + 1}`, texture);
                        this.bulletTextures.set(`player_level${index + 1}`, texture);
                    }
                });
                
                console.log(`Loaded ${color} bullet textures:`, animationFrames);
            } else {
                console.error(`Texture not found for frame: ${firstFrameName}`);
            }
        } else {
            console.error(`Animation not found for: ${animationKey}`);
            
            // Fallback: tìm texture với prefix
            const fallbackTexture = Object.entries(textures).find(([name]) => 
                name.toLowerCase().includes(color)
            );
            
            if (fallbackTexture) {
                this.bulletTextures.set('player', fallbackTexture[1]);
                this.bulletTextures.set('player_level1', fallbackTexture[1]);
                console.log(`Using fallback texture for ${color}: ${fallbackTexture[0]}`);
            }
        }
    }
    
    // Thay đổi màu đạn của player
    changePlayerBulletColor(color: PlayerBulletColor): void {
        if (color !== this.currentPlayerBulletColor) {
            this.currentPlayerBulletColor = color;
            this.loadPlayerBulletTextures(color);
            console.log(`Player bullet color changed to: ${color}`);
        }
    }
    
    // Lấy màu đạn hiện tại của player
    getCurrentPlayerBulletColor(): PlayerBulletColor {
        return this.currentPlayerBulletColor;
    }
    
    // Tạo đạn cho người chơi dựa trên cấp độ
    createPlayerBullets(player: Player): void {
        const playerLevel = player.getCurrentLevel();
        const playerX = player.x;
        const playerY = player.y;
        
        // Lấy texture tương ứng với màu và cấp độ đạn hiện tại  
        let texture = this.bulletTextures.get(`player_level${playerLevel}`);
        
        // Fallback: nếu không có texture cho level cụ thể, dùng texture cơ bản
        if (!texture) {
            texture = this.bulletTextures.get('player');
        }
        
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
                
            default:
                // Fallback cho level > 6
                this.createBullet({
                    x: playerX,
                    y: playerY - 20,
                    angle: -90,
                    type: BulletType.PLAYER,
                    level: BulletLevel.LEVEL1,
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
    createBossBullet(boss: Boss): void {
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
        bullet.on('destroyed', (container: Container) => {
            if (container instanceof Bullet) {
                this.removeBullet(container);
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