import { Container } from "pixi.js";
import { Player } from "../entities/Player";
import { Enemy } from "../entities/Enemy";
import { Boss } from "../entities/Boss";
import { Bullet, BulletType } from "../entities/Bullet";
import { Item, ItemType } from "../entities/Item";

export class CollisionManager extends Container {
    private player: Player;
    private PLAYER_RADIUS = 20; // Bán kính va chạm của người chơi
    private readonly ENEMY_RADIUS = 20; // Bán kính va chạm của kẻ địch
    private readonly BOSS_RADIUS = 40; // Bán kính va chạm của boss
    private readonly BULLET_RADIUS = 5; // Bán kính va chạm của đạn
    //private readonly ITEM_RADIUS = 15; // Bán kính va chạm của item
    
    constructor(player: Player) {
        super();
        this.player = player;
    }
    
    // Kiểm tra va chạm giữa đạn và các đối tượng
    checkBulletCollisions(bullets: Bullet[], enemies: Enemy[]): void {
        const activeBullets = bullets.filter(bullet => !bullet.getIsDestroyed());
        const activeEnemies = enemies.filter(enemy => !enemy.isDestroyed());
        
        for (const bullet of activeBullets) {
            const bulletType = bullet.getType();
            const bulletDamage = bullet.getDamage();
            
            // Đạn của người chơi va chạm với kẻ địch
            if (bulletType === BulletType.PLAYER) {
                for (const enemy of activeEnemies) {
                    const radius = enemy instanceof Boss ? this.BOSS_RADIUS : this.ENEMY_RADIUS;
                    if (this.checkCircleCollision(bullet.x, bullet.y, this.BULLET_RADIUS, enemy.x, enemy.y, radius)) {
                        enemy.takeDamage(bulletDamage);
                        bullet.destroyBullet();
                        this.emit('bulletHit', { bullet, target: enemy });
                        break;
                    }
                }
            }
            // Đạn của kẻ địch va chạm với người chơi
            else if ((bulletType === BulletType.ENEMY || bulletType === BulletType.BOSS) && !this.player.isDestroyed()) {
                if (this.checkCircleCollision(bullet.x, bullet.y, this.BULLET_RADIUS, this.player.x, this.player.y, this.PLAYER_RADIUS)) {
                    this.player.takeDamage();
                    bullet.destroyBullet();
                    this.emit('playerHit', { bullet, damage: bulletDamage });
                }
            }
        }
    }
    
    // Kiểm tra va chạm giữa người chơi và item
    checkItemCollisions(items: Item[]): void {
        for (const item of items) {
            // Bỏ qua item đã được thu thập
            if (item.isCollected()) continue;
            
            // Kiểm tra va chạm
            if (item.checkCollision(this.player.x, this.player.y, this.PLAYER_RADIUS)) {
                // Xử lý thu thập item
                const itemType = item.getType();
                
                if (itemType === ItemType.HEART) {
                    // Hồi máu cho người chơi
                    this.player.heal();
                } else if (itemType === ItemType.LEVEL_UP) {
                    // Tăng cấp cho người chơi
                    this.player.levelUp();
                }
                
                // Đánh dấu item đã được thu thập
                item.collect();
            }
        }
    }
    
    // Kiểm tra va chạm giữa người chơi và kỹ năng của boss
    checkBossSkillCollision(skillData: { x: number, y: number, radius: number }, playerX: number, playerY: number): boolean {
        const dx = skillData.x - playerX;
        const dy = skillData.y - playerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance < skillData.radius + this.PLAYER_RADIUS;
    }
    
    // Cập nhật bán kính va chạm của người chơi
    setPlayerRadius(radius: number): void {
        if (radius > 0) {
            this.PLAYER_RADIUS = radius;
        }
    }

    // Kiểm tra va chạm giữa hai hình tròn
    private checkCircleCollision(x1: number, y1: number, r1: number, x2: number, y2: number, r2: number): boolean {
        const dx = x1 - x2;
        const dy = y1 - y2;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (r1 + r2);
    }

    // Kiểm tra và xử lý va chạm giữa người chơi và kẻ địch
    checkPlayerEnemyCollisions(enemies: Enemy[]): void {
        if (this.player.isDestroyed() || this.player.isInvincible()) return;

        for (const enemy of enemies) {
            if (enemy.isDestroyed()) continue;

            const radius = enemy instanceof Boss ? this.BOSS_RADIUS : this.ENEMY_RADIUS;
            if (this.checkCircleCollision(this.player.x, this.player.y, this.PLAYER_RADIUS, enemy.x, enemy.y, radius)) {
                this.player.takeDamage();
                this.emit('playerCollision', { enemy });
                break;
            }
        }
    }
}