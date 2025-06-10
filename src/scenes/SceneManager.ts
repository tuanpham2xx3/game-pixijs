import * as PIXI from 'pixi.js';
import { BaseScene } from './BaseScenes';

export class SceneManager {
    private app: PIXI.Application;
    private currentScene?: BaseScene;
    private sceneContainer: PIXI.Container;

    constructor(app: PIXI.Application) {
        this.app = app;
        this.sceneContainer = new PIXI.Container();
        
        this.sceneContainer.x = 0;
        this.sceneContainer.y = 0;

        this.app.stage.addChild(this.sceneContainer);
        
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    private handleResize(): void {
        this.app.renderer.resize(window.innerWidth, window.innerHeight);
        
        this.sceneContainer.x = 0;
        this.sceneContainer.y = 0;
    }

    async gotoScene(newScene: BaseScene): Promise<void> {
        if (this.currentScene) {
            await this.currentScene.onFinish();
            this.sceneContainer.removeChildren();
        }

        this.currentScene = newScene;
        await this.currentScene.onStart(this.sceneContainer);
    }

    update(deltaTime: number): void {
        if (this.currentScene) {
            this.currentScene.onUpdate(deltaTime);
        }
    }

    getApp(): PIXI.Application {
        return this.app;
    }
}
