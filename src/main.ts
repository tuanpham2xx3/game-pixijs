import { Application } from "pixi.js";
import { SceneManager } from "./scenes/SceneManager";
import { MenuScene } from "./scenes/MenuScene";

(async () => {
  try {
    console.log("Starting PIXI application...");
    
    // Create a new application
    const app = new Application();
    
    // Initialize the application FIRST
    await app.init({ 
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x000000,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true
    });
    
    console.log("PIXI app initialized successfully");
    
    // Append the application canvas to the document body
    const container = document.getElementById("pixi-container");
    if (!container) {
      throw new Error("pixi-container element not found");
    }
    container.appendChild(app.canvas);
    
    console.log("Canvas added to DOM");
    
    // NOW create SceneManager and MenuScene after app is initialized
    const sceneManager = new SceneManager(app);
    const menuScene = new MenuScene(sceneManager);
    
    console.log("SceneManager and MenuScene created");
    
    window.addEventListener('resize', () => {
        // Handle resize
    });
    
    // Start the game loop
    app.ticker.add((_time) => {
      // Scene manager handles updates
    });
    
    console.log("Going to menu scene...");
    await sceneManager.gotoScene(menuScene);
    console.log("Menu scene loaded successfully");
    
  } catch (error) {
    console.error("Error initializing game:", error);
  }
})();
