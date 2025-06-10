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

        this.player = new Player({
            x: window.innerWidth / 2,
            y: window.innerHeight * 0.8,
            scale: 1
        });

        this.backgroundManager = new BackgroundManager(this.app, this.player);

        this.addChild(this.backgroundManager);
        this.addChild(this.player);

        this.app.ticker.add(this.update, this);
    }

    private update = (_ticker: Ticker): void => {
        // Update game logic here
    }

    public destroy(): void {
        this.app.ticker.remove(this.update, this);
        this.backgroundManager.destroy();
        this.player.destroy();
        super.destroy({ children: true });
    }
}