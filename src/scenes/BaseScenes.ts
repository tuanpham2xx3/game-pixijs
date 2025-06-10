import * as PIXI from 'pixi.js';
import { SceneManager } from './SceneManager';

export abstract class BaseScene {
    protected coordinator: SceneManager;

    constructor(coordinator: SceneManager) {
        this.coordinator = coordinator;
    }

    /**
     * Initialize scene (must be implemented by child classes)
     */
    abstract onStart(container: PIXI.Container): Promise<void>;

    /**
     * Update logic called every frame
     */
    abstract onUpdate(delta: number): void;

    /**
     * Cleanup when scene ends
     */
    abstract onFinish(): Promise<void>;
}
