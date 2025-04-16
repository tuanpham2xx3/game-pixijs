import { Container, Sprite, Texture, Application, Ticker } from "pixi.js";
import { Player } from "../entities/Player";

const { BASE_URL } = import.meta.env;

export class BackgroundManager extends Container {
    private app: Application;
    private player: Player;
    private stars: Sprite[] = [];
    private nebulas: Sprite[] = [];
    private baseStarSpeed: number = 3;
    private currentStarSpeed: number = this.baseStarSpeed;
    private readonly MAX_STARS: number = 100; // Tăng số lượng sao
    private readonly MAX_NEBULAS: number = 8; // Tăng số lượng tinh vân

    constructor(app: Application, player: Player) {
        super();
        this.app = app;
        this.player = player;

        // Tạo nền đen
        const background = new Sprite(Texture.WHITE);
        background.tint = 0x000000;
        background.width = app.screen.width;
        background.height = app.screen.height;
        this.addChild(background);

        // Khởi tạo các sprite
        this.initializeNebulas();
        this.initializeStars();

        // Bắt đầu vòng lặp cập nhật
        this.app.ticker.add(this.update, this);
    }

    private initializeNebulas(): void {
        const nebulaTextures = [
            Texture.from(`${BASE_URL}assets/background/Nebula1.png`),
            Texture.from(`${BASE_URL}assets/background/Nebula2.png`),
            Texture.from(`${BASE_URL}assets/background/Nebula3.png`)
        ];

        for (let i = 0; i < this.MAX_NEBULAS; i++) {
            const texture = nebulaTextures[Math.floor(Math.random() * nebulaTextures.length)];
            const nebula = new Sprite(texture);
            nebula.alpha = 0.3;
            nebula.x = Math.random() * this.app.screen.width;
            nebula.y = Math.random() * this.app.screen.height;
            nebula.scale.set(Math.random() * 0.2 + 0.2); // Giảm kích thước để tạo hiệu ứng xa
            this.nebulas.push(nebula);
            this.addChild(nebula);
        }
    }

    private initializeStars(): void {
        const starTexture = Texture.from(`${BASE_URL}assets/background/Stars.png`);

        for (let i = 0; i < this.MAX_STARS; i++) {
            const star = new Sprite(starTexture);
            star.x = Math.random() * this.app.screen.width;
            star.y = Math.random() * this.app.screen.height;
            star.scale.set(Math.random() * 0.3 + 0.2);
            star.alpha = Math.random() * 0.5 + 0.5;
            this.stars.push(star);
            this.addChild(star);
        }
    }

    private update = (_ticker: Ticker): void => {
        // Cập nhật tốc độ sao dựa trên trạng thái player
        if (this.player.getCurrentState() === 'up') {
            this.currentStarSpeed = this.baseStarSpeed * 3; // Tăng tốc độ khi di chuyển lên
        } else if (this.player.getCurrentState() === 'down') {
            this.currentStarSpeed = this.baseStarSpeed * 0.5;
        } else {
            this.currentStarSpeed = this.baseStarSpeed;
        }

        // Di chuyển các ngôi sao
        for (const star of this.stars) {
            star.y += this.currentStarSpeed;

            // Reset vị trí khi sao đi ra khỏi màn hình
            if (star.y > this.app.screen.height) {
                star.y = -star.height;
                star.x = Math.random() * this.app.screen.width;
            }
        }

        // Di chuyển các tinh vân
        for (const nebula of this.nebulas) {
            nebula.y += this.currentStarSpeed * 0.1;

            // Reset vị trí khi tinh vân đi ra khỏi màn hình
            if (nebula.y > this.app.screen.height) {
                nebula.y = -nebula.height;
                nebula.x = Math.random() * this.app.screen.width;
                nebula.scale.set(Math.random() * 0.5 + 0.5);
            }
        }
    }

    public destroy(): void {
        this.app.ticker.remove(this.update, this);
        super.destroy({ children: true });
    }
}