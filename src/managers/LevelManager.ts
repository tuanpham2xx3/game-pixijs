import { Container } from "pixi.js";
import { Crep } from "../entities/Crep";
import { Boss } from "../entities/Boss";
import { Enemy } from "../entities/Enemy";
import { Item } from "../entities/Item";

interface SkillData {
    type: string;
    damage: number;
    range: number;
}

interface BossDamageData {
    currentHp: number;
    maxHp: number;
}

interface LevelData {
    level: number;
    creps: CrepData[];
    boss?: BossData;
}

interface CrepData {
    x: number;
    y: number;
    hp?: number;
    speed?: number;
    dropRate?: number;
    targetX?: number;
    targetY?: number;
}

interface BossData {
    x: number;
    y: number;
    hp?: number;
    speed?: number;
    attackCooldown?: number;
}

export class LevelManager {
    private container: Container;
    private levels: LevelData[] = [];
    private currentLevel: number = 1;
    private enemies: Enemy[] = [];
    private boss: Boss | null = null;
    private isLevelComplete: boolean = false;
    private readonly BASE_URL = import.meta.env.BASE_URL || '';
    
    constructor(container: Container) {
        this.container = container;
    }
    
    // Tải dữ liệu các cấp độ từ file JSON
    async loadLevels(): Promise<void> {
        try {
            const response = await fetch(`${this.BASE_URL}assets/levels/levels.json`);
            this.levels = await response.json();
            console.log('Levels loaded successfully:', this.levels);
        } catch (error) {
            console.error('Failed to load levels:', error);
            // Tạo dữ liệu mẫu nếu không tải được
            this.createDefaultLevels();
        }
    }
    
    // Tạo dữ liệu mẫu cho các cấp độ
    private createDefaultLevels(): void {
        this.levels = [
            // Level 1
            {
                level: 1,
                creps: [
                    { x: 100, y: 100, targetX: 100, targetY: 300 },
                    { x: 200, y: 100, targetX: 200, targetY: 300 },
                    { x: 300, y: 100, targetX: 300, targetY: 300 },
                    { x: 400, y: 100, targetX: 400, targetY: 300 },
                    { x: 500, y: 100, targetX: 500, targetY: 300 }
                ]
            },
            // Level 2
            {
                level: 2,
                creps: [
                    { x: 100, y: 100, targetX: 100, targetY: 300, hp: 2 },
                    { x: 200, y: 100, targetX: 200, targetY: 300, hp: 2 },
                    { x: 300, y: 100, targetX: 300, targetY: 300, hp: 2 },
                    { x: 400, y: 100, targetX: 400, targetY: 300, hp: 2 },
                    { x: 500, y: 100, targetX: 500, targetY: 300, hp: 2 },
                    { x: 150, y: 150, targetX: 150, targetY: 350, hp: 2 },
                    { x: 250, y: 150, targetX: 250, targetY: 350, hp: 2 },
                    { x: 350, y: 150, targetX: 350, targetY: 350, hp: 2 },
                    { x: 450, y: 150, targetX: 450, targetY: 350, hp: 2 }
                ]
            },
            // Level 3 (với Boss)
            {
                level: 3,
                creps: [
                    { x: 100, y: 100, targetX: 100, targetY: 300, hp: 3 },
                    { x: 200, y: 100, targetX: 200, targetY: 300, hp: 3 },
                    { x: 300, y: 100, targetX: 300, targetY: 300, hp: 3 },
                    { x: 400, y: 100, targetX: 400, targetY: 300, hp: 3 },
                    { x: 500, y: 100, targetX: 500, targetY: 300, hp: 3 }
                ],
                boss: {
                    x: 300,
                    y: 150,
                    hp: 10,
                    speed: 1.5
                }
            }
        ];
    }
    
    // Tải cấp độ hiện tại
    loadCurrentLevel(): void {
        // Xóa tất cả kẻ địch hiện tại
        this.clearEnemies();
        
        // Tìm dữ liệu cấp độ hiện tại
        const levelData = this.levels.find(level => level.level === this.currentLevel);
        if (!levelData) {
            console.error(`Level ${this.currentLevel} not found`);
            return;
        }
        
        // Tạo các crep
        for (const crepData of levelData.creps) {
            const crep = new Crep({
                x: crepData.x,
                y: crepData.y,
                hp: crepData.hp,
                speed: crepData.speed,
                dropRate: crepData.dropRate,
                targetX: crepData.targetX,
                targetY: crepData.targetY
            });
            
            // Thêm crep vào container và mảng quản lý
            this.container.addChild(crep);
            this.enemies.push(crep);
            
            // Bắt đầu di chuyển
            crep.moveToTarget();
            
            // Xử lý sự kiện khi crep bị tiêu diệt
            crep.on('destroyed', (event) => {
                if (event instanceof Enemy) {
                    this.removeEnemy(event);
                    this.checkLevelComplete();
                }
            });
            
            // Xử lý sự kiện khi crep rơi item
            crep.on('dropItem', (item: Item) => {
                this.emit('itemDropped', item);
            });
        }
        
        // Tạo boss nếu có
        if (levelData.boss) {
            const bossData = levelData.boss;
            this.boss = new Boss({
                x: bossData.x,
                y: bossData.y,
                hp: bossData.hp,
                speed: bossData.speed,
                attackCooldown: bossData.attackCooldown
            });
            
            // Thêm boss vào container và mảng quản lý
            this.container.addChild(this.boss);
            this.enemies.push(this.boss);
            
            // Xử lý sự kiện khi boss bị tiêu diệt
            this.boss.on('destroyed', () => {
                if (this.boss) {
                    this.removeEnemy(this.boss);
                    this.boss = null;
                    this.checkLevelComplete();
                }
            });
            
            // Xử lý sự kiện khi boss sử dụng skill
            this.boss.on('bossSkill', (skillData: SkillData) => {
                this.emit('bossSkill', skillData);
            });
            
            // Xử lý sự kiện khi boss bị tấn công
            this.boss.on('bossDamaged', (data: BossDamageData) => {
                this.emit('bossDamaged', data);
            });
        }
        
        // Reset trạng thái cấp độ
        this.isLevelComplete = false;
        
        // Thông báo cấp độ đã được tải
        this.emit('levelLoaded', this.currentLevel);
    }
    
    // Kiểm tra xem cấp độ đã hoàn thành chưa
    private checkLevelComplete(): void {
        if (this.enemies.length === 0 && !this.isLevelComplete) {
            this.isLevelComplete = true;
            this.emit('levelComplete', this.currentLevel);
        }
    }
    
    // Chuyển đến cấp độ tiếp theo
    nextLevel(): void {
        this.currentLevel++;
        
        // Kiểm tra xem đã hết tất cả các cấp độ chưa
        if (this.currentLevel > this.levels.length) {
            this.emit('gameComplete');
            return;
        }
        
        this.loadCurrentLevel();
    }
    
    // Xóa tất cả kẻ địch
    private clearEnemies(): void {
        for (const enemy of [...this.enemies]) {
            this.removeEnemy(enemy);
        }
        this.boss = null;
    }
    
    // Xóa một kẻ địch
    private removeEnemy(enemy: Enemy): void {
        const index = this.enemies.indexOf(enemy);
        if (index !== -1) {
            this.enemies.splice(index, 1);
            this.container.removeChild(enemy);
            enemy.destroy();
        }
    }
    
    // Cập nhật tất cả kẻ địch
    update(deltaTime: number, playerX: number, playerY: number): void {
        for (const enemy of this.enemies) {
            if (enemy instanceof Crep) {
                enemy.update();
            } else if (enemy instanceof Boss) {
                enemy.update(deltaTime, playerX, playerY);
            }
        }
    }
    
    // Lấy tất cả kẻ địch đang hoạt động
    getEnemies(): Enemy[] {
        return this.enemies;
    }
    
    // Lấy boss hiện tại
    getBoss(): Boss | null {
        return this.boss;
    }
    
    // Lấy cấp độ hiện tại
    getCurrentLevel(): number {
        return this.currentLevel;
    }
    
    // Kiểm tra xem đã hoàn thành cấp độ chưa
    isLevelCompleted(): boolean {
        return this.isLevelComplete;
    }
    
    // Phương thức emit sự kiện
    private emit(event: string, data?: unknown): void {
        // Sử dụng custom event để gửi sự kiện
        const customEvent = new CustomEvent(event, { detail: data });
        document.dispatchEvent(customEvent);
    }
}