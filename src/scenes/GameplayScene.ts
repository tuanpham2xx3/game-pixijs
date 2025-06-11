import * as PIXI from 'pixi.js';
import {BaseScene} from './BaseScenes';
import { Game } from '../handles/HandleGame';

export class GameplayScene extends BaseScene {
    private game?: Game;
    private container?: PIXI.Container;

    async onStart(container: PIXI.Container): Promise<void> {
        console.log('GameplayScene: Starting gameplay scene');
        this.container = container;
        
        const app = this.coordinator.getApp();
        
        try {
            this.game = new Game(app);
            await this.game.init();
            
            this.container.addChild(this.game.getContainer());
            console.log('GameplayScene: Game initialized and added to scene');
        } catch (error) {
            console.error('GameplayScene: Failed to initialize game:', error);
        }
    }

    onUpdate(_deltaTime: number): void {
        // Game handles its own update loop through app.ticker
        // No additional update needed here since the Game class
        // manages all updates internally via its ticker
    }

    async onFinish(): Promise<void> {
        console.log('GameplayScene: Finishing gameplay scene');
        if (this.game) {
            this.game.destroy();
            this.game = undefined;
        }
        
        if (this.container) {
            this.container.removeChildren();
        }
    }
}

