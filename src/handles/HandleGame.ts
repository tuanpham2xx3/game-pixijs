import { Application, Assets, Container } from "pixi.js";
import { Player} from '../entities/Player';
import { HandleControls } from './HandleControls';
import { BackgroundManager } from '../managers/BackgroundManager';
import * as PIXI from 'pixi.js';
const { BASE_URL } = import.meta.env;

export class Game {
    private app: Application;
    private player?: Player;
    private controls!: HandleControls;
    private backgroundManager?: BackgroundManager;
    private gameContainer: Container;

    constructor() {
      console.log('Game constructor called');
      this.app = new Application();
      this.gameContainer = new Container();
    }



    // Update resize handler
    async init() {
      console.log('Game init started');
      
      try {
        // Khởi tạo Application trước
        await this.app.init({
          width: window.innerWidth,
          height: window.innerHeight,
          backgroundColor: 0x000000,
          antialias: true,
          resizeTo: window,
          backgroundAlpha: 0
        });
        
        // Thêm canvas vào DOM
        document.body.appendChild(this.app.canvas);

        // Thêm gameContainer vào stage
        this.app.stage.addChild(this.gameContainer);
        
        // Đảm bảo canvas đã được khởi tạo trước khi tải assets
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Load all assets
        console.log('Loading game assets...');
        
        // Load background assets
        await Promise.all([
          Assets.load(`${BASE_URL}assets/background/Nebula1.png`),
          Assets.load(`${BASE_URL}assets/background/Nebula2.png`),
          Assets.load(`${BASE_URL}assets/background/Nebula3.png`),
          Assets.load(`${BASE_URL}assets/background/Stars.png`)
        ]);
        console.log('Background assets loaded');
        
        // Load player assets
        const playerSheet = await Assets.load(`${BASE_URL}assets/player/player.png`);
        const playerData = await fetch(`${BASE_URL}assets/player/player.json`).then(res => res.json());
        const playerSpritesheet = new PIXI.Spritesheet(playerSheet, playerData);
        await playerSpritesheet.parse();
        
        console.log('Player assets loaded');
        
        // Tạo player với spritesheet
        this.player = new Player({
            x: this.app.screen.width / 2,
            y: this.app.screen.height / 2,
            scale: 1,
            spritesheet: playerSpritesheet
        });

        // Khởi tạo background
        this.backgroundManager = new BackgroundManager(this.app, this.player);
        this.gameContainer.addChildAt(this.backgroundManager, 0); // Add at index 0 to ensure it's behind other elements
        console.log('Background initialized');

        // Thêm player vào gameContainer
        this.gameContainer.addChild(this.player);
        console.log('Player added to gameContainer');

        // Thiết lập controls
        this.controls = new HandleControls(this.app, this.player);
        this.controls.setupControls();
        console.log('Controls setup complete');

        // Xử lý resize window
        window.addEventListener('resize', () => {
            // BackgroundManager tự động xử lý resize
        });

        console.log('Game initialization complete');
      } catch (error) {
        console.error('Lỗi khởi tạo game:', error);
        throw error; // Ném lỗi để GameplayScene có thể bắt được
      }
    }

    getContainer() {
      return this.gameContainer;
    }
}