import { Application, Container, Ticker } from "pixi.js";
import { Player } from "../entities/Player";
import { BackgroundManager } from "../managers/BackgroundManager";

export class GameScene extends Container {
    private app: Application;
    private player: Player;
    private backgroundManager: BackgroundManager;

    constructor(app: Application) {
        super();
        this.app = app;

        // Khởi tạo player
        this.player = new Player({
            x: this.app.screen.width / 2,
            y: this.app.screen.height * 0.8,
            scale: 1
        });

        // Khởi tạo background manager
        this.backgroundManager = new BackgroundManager(this.app, this.player);

        // Thêm các layer theo thứ tự
        this.addChild(this.backgroundManager);
        this.addChild(this.player);

        // Bắt đầu game loop
        this.app.ticker.add(this.update, this);
    }

    private update = (_ticker: Ticker): void => {
        // Cập nhật logic game ở đây
    }

    public destroy(): void {
        this.app.ticker.remove(this.update, this);
        this.backgroundManager.destroy();
        this.player.destroy();
        super.destroy({ children: true });
    }
}