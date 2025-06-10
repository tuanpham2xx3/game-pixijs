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

    constructor(app: Application) {
      this.app = app;
      this.gameContainer = new Container();
    }

    /**
     * Initialize game components and assets
     */
    async init() {
      try {
        this.app.stage.addChild(this.gameContainer);
        
        // Load background assets
        await Promise.all([
          Assets.load(`${BASE_URL}assets/background/Nebula1.png`),
          Assets.load(`${BASE_URL}assets/background/Nebula2.png`),
          Assets.load(`${BASE_URL}assets/background/Nebula3.png`),
          Assets.load(`${BASE_URL}assets/background/Stars.png`)
        ]);
        
        // Load player assets
        const playerSheet = await Assets.load(`${BASE_URL}assets/player/player.png`);
        const playerData = await fetch(`${BASE_URL}assets/player/player.json`).then(res => res.json());
        const playerSpritesheet = new PIXI.Spritesheet(playerSheet, playerData);
        await playerSpritesheet.parse();
        
        // Create player with spritesheet
        this.player = new Player({
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            scale: 1,
            spritesheet: playerSpritesheet
        });

        // Initialize background manager
        this.backgroundManager = new BackgroundManager(this.app, this.player);
        this.gameContainer.addChildAt(this.backgroundManager, 0);

        // Add player to game container
        this.gameContainer.addChild(this.player);

        // Ensure player is immediately visible in IDLE state
        this.player.idle();

        // Setup controls
        this.controls = new HandleControls(this.app, this.player);
        this.controls.setupControls();

        // Handle window resize
        window.addEventListener('resize', () => {
            // BackgroundManager handles resize automatically
        });

      } catch (error) {
        console.error('Game initialization failed:', error);
        throw error;
      }
    }

    getContainer() {
      return this.gameContainer;
    }
}