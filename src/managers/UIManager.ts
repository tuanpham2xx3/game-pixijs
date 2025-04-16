import { Container, Text, Graphics, Sprite, Texture, Assets } from "pixi.js";
import { Player } from "../entities/Player";
// import { Boss } from "../entities/Boss";

export class UIManager {
    private container: Container;
    private player: Player;
    private scoreText: Text;
    private levelText: Text;
    private playerLevelText: Text;
    private skillCooldownBar: Graphics;
    private skillCooldownText: Text;
    private bossHealthBar: Graphics | null = null;
    private heartSprites: Sprite[] = [];
    private heartTexture: Texture | null = null;
    // private score: number = 0;
    private readonly BASE_URL = import.meta.env.BASE_URL || '';
    
    constructor(container: Container, player: Player) {
        this.container = container;
        this.player = player;
        
        // Tạo UI container riêng để UI luôn hiển thị trên cùng
        const uiContainer = new Container();
        this.container.addChild(uiContainer);
        
        // Tạo text hiển thị điểm số
        this.scoreText = new Text({
            text: 'Score: 0',
            style: {
                fontSize: 24,
                fill: 0xFFFFFF
            }
        });
        this.scoreText.x = 20;
        this.scoreText.y = 20;
        uiContainer.addChild(this.scoreText);
        
        // Tạo text hiển thị cấp độ game
        this.levelText = new Text({
            text: 'Level: 1',
            style: {
                fontSize: 24,
                fill: 0xFFFFFF
            }
        });
        this.levelText.x = 20;
        this.levelText.y = 50;
        uiContainer.addChild(this.levelText);
        
        // Tạo text hiển thị cấp độ người chơi
        this.playerLevelText = new Text({
            text: 'Player LV: 1',
            style: {
                fontSize: 24,
                fill: 0xFFFFFF
            }
        });
        this.playerLevelText.x = 20;
        this.playerLevelText.y = 80;
        uiContainer.addChild(this.playerLevelText);
        
        // Tạo thanh cooldown kỹ năng
        this.skillCooldownBar = new Graphics();
        this.skillCooldownBar.x = 20;
        this.skillCooldownBar.y = 110;
        uiContainer.addChild(this.skillCooldownBar);
        
        // Tạo text hiển thị thời gian hồi chiêu
        this.skillCooldownText = new Text({
            text: 'Skill: Ready',
            style: {
                fontSize: 18,
                fill: 0xFFFFFF
            }
        });
        this.skillCooldownText.x = 20;
        this.skillCooldownText.y = 140;
        uiContainer.addChild(this.skillCooldownText);
        
        // Đăng ký lắng nghe các sự kiện
        this.registerEventListeners();
    }
    
    // Tải texture cho UI
    async loadTextures(): Promise<void> {
        try {
            // Tải texture cho sprite tim
            this.heartTexture = await Assets.load(`${this.BASE_URL}assets/player/heart.png`);
            
            // Tạo các sprite tim
            if (this.heartTexture) {
                for (let i = 0; i < this.player.getHealth(); i++) {
                    const heartSprite = new Sprite(this.heartTexture);
                    heartSprite.x = window.innerWidth - 50 - (i * 40); // Căn phải màn hình
                    heartSprite.y = 20;
                    heartSprite.scale.set(0.5);
                    this.container.addChild(heartSprite);
                    this.heartSprites.push(heartSprite);
                }
            }
        } catch (error) {
            console.error('Error loading UI textures:', error);
        }
    }

    // Đăng ký các sự kiện
    private registerEventListeners(): void {
        // Lắng nghe sự kiện từ player
        this.player.on('healthChanged', this.updateHearts.bind(this));
        this.player.on('levelChanged', this.updatePlayerLevel.bind(this));
        
        // Lắng nghe sự kiện từ game
        // this.container.on('scoreChanged', this.updateScore.bind(this));
        this.container.on('levelChanged', this.updateGameLevel.bind(this));
        this.container.on('skillCooldown', this.updateSkillCooldown.bind(this));
    }

    // Cập nhật hiển thị tim
    private updateHearts(health: number): void {
        // Xóa tất cả sprite tim hiện tại
        this.heartSprites.forEach(sprite => {
            sprite.destroy();
        });
        this.heartSprites = [];

        // Tạo lại sprite tim theo số máu hiện tại
        if (this.heartTexture) {
            for (let i = 0; i < health; i++) {
                const heartSprite = new Sprite(this.heartTexture);
                heartSprite.x = window.innerWidth - 50 - (i * 40);
                heartSprite.y = 20;
                heartSprite.scale.set(0.5);
                this.container.addChild(heartSprite);
                this.heartSprites.push(heartSprite);
            }
        }
    }

    // Cập nhật điểm số
    // updateScore(score: number): void {
    //     this.score = score;
    //     this.scoreText.text = `Score: ${score}`;
    // }

    // Cập nhật level game
    updateGameLevel(level: number): void {
        this.levelText.text = `Level: ${level}`;
    }

    // Cập nhật level người chơi
    updatePlayerLevel(level: number): void {
        this.playerLevelText.text = `Player LV: ${level}`;
    }

    // Cập nhật thanh máu của boss
    updateBossHealth(currentHp: number, maxHp: number): void {
        if (!this.bossHealthBar) {
            // Tạo thanh máu boss nếu chưa có
            this.bossHealthBar = new Graphics();
            this.bossHealthBar.x = window.innerWidth / 2 - 100;
            this.bossHealthBar.y = 20;
            this.container.addChild(this.bossHealthBar);
        }

        // Vẽ thanh máu
        this.bossHealthBar.clear();
        // Vẽ background
        this.bossHealthBar.beginFill(0x666666);
        this.bossHealthBar.drawRect(0, 0, 200, 20);
        this.bossHealthBar.endFill();
        // Vẽ máu hiện tại
        this.bossHealthBar.beginFill(0xFF0000);
        this.bossHealthBar.drawRect(0, 0, (currentHp / maxHp) * 200, 20);
        this.bossHealthBar.endFill();
    }

    // Cập nhật thanh cooldown kỹ năng
    updateSkillCooldown(currentCooldown: number, maxCooldown: number): void {
        // Vẽ thanh cooldown
        this.skillCooldownBar.clear();
        // Vẽ background
        this.skillCooldownBar.beginFill(0x666666);
        this.skillCooldownBar.drawRect(0, 0, 100, 10);
        this.skillCooldownBar.endFill();
        // Vẽ cooldown hiện tại
        this.skillCooldownBar.beginFill(0x00FF00);
        this.skillCooldownBar.drawRect(0, 0, (currentCooldown / maxCooldown) * 100, 10);
        this.skillCooldownBar.endFill();

        // Cập nhật text
        if (currentCooldown >= maxCooldown) {
            this.skillCooldownText.text = 'Skill: Ready';
            this.skillCooldownText.style.fill = 0x00FF00;
        } else {
            this.skillCooldownText.text = `Skill: ${Math.ceil(currentCooldown / 1000)}s`;
            this.skillCooldownText.style.fill = 0xFFFFFF;
        }
    }
}