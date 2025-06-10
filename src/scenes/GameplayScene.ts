import * as PIXI from 'pixi.js';
import {BaseScene} from './BaseScenes';
import { Game } from '../handles/HandleGame';

export class GameplayScene extends BaseScene {
    private game?: Game;
    private container?: PIXI.Container;

    async onStart(container: PIXI.Container): Promise<void> {
        this.container = container;
        
        const app = this.coordinator.getApp();
        
        this.game = new Game(app);
        await this.game.init();
        
        this.container.addChild(this.game.getContainer());
    }

    onUpdate(_deltaTime: number): void {
        // Game has its own ticker, no update needed here
    }

    async onFinish(): Promise<void> {
        if (this.game) {
            this.game = undefined;
        }
    }
}

