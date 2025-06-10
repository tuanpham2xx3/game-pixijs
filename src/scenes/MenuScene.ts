import * as PIXI from 'pixi.js';
import {BaseScene} from './BaseScenes';
import {GameplayScene} from './GameplayScene';

export class MenuScene extends BaseScene {
    private titleText?: PIXI.Text;
    private startButton?: PIXI.Text;

    async onStart(container: PIXI.Container): Promise<void> {
        const appWidth = window.innerWidth;
        const appHeight = window.innerHeight;

        this.titleText = new PIXI.Text('Menu', {
            fontSize: 50,
            fill: 0xffffff
        });
        this.titleText.anchor.set(0.5);
        this.titleText.x = appWidth / 2;
        this.titleText.y = appHeight / 3;

        this.startButton = new PIXI.Text('Start Game', {
            fontSize: 50,
            fill: 0xffffff
        });
        this.startButton.anchor.set(0.5);
        this.startButton.x = appWidth / 2;
        this.startButton.y = appHeight / 2;
        this.startButton.interactive = true;
        this.startButton.cursor = 'pointer';

        this.startButton.on('pointerup', () => {
            this.coordinator.gotoScene(new GameplayScene(this.coordinator));
        });

        container.addChild(this.titleText);
        container.addChild(this.startButton);

        // Handle resize
        window.addEventListener('resize', this.handleResize);
    }

    private handleResize = () => {
        if (this.titleText && this.startButton) {
            const appWidth = window.innerWidth;
            const appHeight = window.innerHeight;
            
            this.titleText.x = appWidth / 2;
            this.titleText.y = appHeight / 3;
            
            this.startButton.x = appWidth / 2;
            this.startButton.y = appHeight / 2;
        }
    }

    onUpdate(_delta: number): void {
        // No update needed for menu
    }

    async onFinish(): Promise<void> {
        // Remove resize listener
        window.removeEventListener('resize', this.handleResize);
    }
}
