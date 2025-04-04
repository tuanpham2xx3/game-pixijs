import { Application, Assets, Container, Sprite } from "pixi.js";
import { Player} from '../entities/Player';
import { HandleControls } from './HandleControls';
import * as PIXI from 'pixi.js';
const { BASE_URL } = import.meta.env;

export class Game {
    private app: Application;
    private player?: Player;
    private controls!: HandleControls;
    private background?: Sprite;
    private backgroundDuplicate?: Sprite;
    private scrollSpeed = 2;
    private backgroundContainer: Container;  // Add this to contain backgrounds

    constructor() {
      console.log('Game constructor called');
      this.app = new Application();
      this.backgroundContainer = new Container();
    }

    private async loadBackground() {
      try {
        const backgroundTexture = await Assets.load(`${BASE_URL}assets/background/background.png`);
        
        // Create container and add it to stage
        this.app.stage.addChild(this.backgroundContainer);
        
        // Create background sprites
        this.background = new Sprite(backgroundTexture);
        this.backgroundDuplicate = new Sprite(backgroundTexture);

        // Calculate scaling to fit width and add a small overlap
        const scaleX = window.innerWidth / backgroundTexture.width;
        const scaleY = (window.innerHeight + 2) / backgroundTexture.height; // Add 2px overlap
        const scale = Math.max(scaleX, scaleY);
        
        this.background.scale.set(scale);
        this.backgroundDuplicate.scale.set(scale);

        // Position backgrounds with slight overlap
        this.background.y = 0;
        this.backgroundDuplicate.y = (this.background.height - 10); // 1px overlap
        
        // Add backgrounds to container
        this.backgroundContainer.addChild(this.background);
        this.backgroundContainer.addChild(this.backgroundDuplicate);

        // Set up scrolling animation with precise positioning
        this.app.ticker.add(() => {
            if (this.background && this.backgroundDuplicate) {
                // Move both backgrounds down
                this.background.y += this.scrollSpeed;
                this.backgroundDuplicate.y += this.scrollSpeed;

                // Reset positions with precise calculations
                const resetPosition = (sprite: Sprite, otherSprite: Sprite) => {
                    if (sprite.y >= window.innerHeight) {
                        sprite.y = otherSprite.y - sprite.height;
                    }
                };

                resetPosition(this.background, this.backgroundDuplicate);
                resetPosition(this.backgroundDuplicate, this.background);
            }
        });

        return true;
      } catch (error) {
        console.error('Cannot load background:', error);
        return false;
      }
    }

    // Update resize handler
    async init() {
      console.log('Game init started');
      
      try {
        await this.app.init({
          width: window.innerWidth,
          height: window.innerHeight,
          resizeTo: window
        });

        // Load background
        await this.loadBackground();
        
        // Load player assets
        console.log('Loading player assets...');
        const playerSheet = await Assets.load(`${BASE_URL}assets/player/player.png`);
        const playerData = await fetch(`${BASE_URL}assets/player/player.json`).then(res => res.json());
        const playerSpritesheet = new PIXI.Spritesheet(playerSheet, playerData);
        await playerSpritesheet.parse();
        
        console.log('Spritesheet loaded:', playerSpritesheet);
        
        // Tạo player với spritesheet
        this.player = new Player({
            x: this.app.screen.width / 2,
            y: this.app.screen.height / 2,
            scale: 1,
            spritesheet: playerSpritesheet
        });

        // Thêm player vào stage
        this.app.stage.addChild(this.player);
        console.log('Player added to stage');

        // Thiết lập controls
        this.controls = new HandleControls(this.app, this.player);
        this.controls.setupControls();
        console.log('Controls setup complete');

        // Xử lý resize window
        window.addEventListener('resize', () => {
            if (this.background && this.backgroundDuplicate) {
                const texture = this.background.texture;
                const scaleX = window.innerWidth / texture.width;
                
                this.background.scale.set(scaleX);
                this.backgroundDuplicate.scale.set(scaleX);
                
                this.backgroundDuplicate.y = this.background.y - this.background.height;
            }
        });

        console.log('Game initialization complete');
      } catch (error) {
        console.error('Lỗi khởi tạo game:', error);
        throw error; // Ném lỗi để GameplayScene có thể bắt được
      }
    }

    getStage() {
      return this.app.stage;
    }
}