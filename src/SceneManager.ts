import * as PIXI from 'pixi.js';

export class SceneManager {
    private app: PIXI.Application;
    private gameContainer: PIXI.Container;

    constructor(app: PIXI.Application) {
        this.app = app;
        
        // Tạo container chính để chứa game
        this.gameContainer = new PIXI.Container();
        app.stage.addChild(this.gameContainer);
        
        // Thiết lập căn giữa cho container - use window dimensions instead of app.screen
        this.gameContainer.position.set(window.innerWidth / 2, window.innerHeight / 2);
        
        // Thêm sự kiện resize
        window.addEventListener('resize', this.handleResize.bind(this));
        this.handleResize();
    }

    private handleResize() {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        
        // Cập nhật kích thước app
        this.app.renderer.resize(screenWidth, screenHeight);
        
        // Tính toán tỷ lệ scale
        
        // Căn giữa container
        this.gameContainer.position.set(screenWidth / 2, screenHeight / 2);
    }

    public getGameContainer(): PIXI.Container {
        return this.gameContainer;
    }

    // ... các phương thức khác
}