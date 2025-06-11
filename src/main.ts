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
      autoDensity: true,
      antialias: true
    });
    
    console.log("PIXI app initialized successfully");
    console.log("Screen size:", app.screen.width, "x", app.screen.height);
    
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
    
    // Handle window resize
    window.addEventListener('resize', () => {
        app.renderer.resize(window.innerWidth, window.innerHeight);
        console.log("Window resized to:", window.innerWidth, "x", window.innerHeight);
    });
    
    // Setup global error handler
    window.addEventListener('error', (e) => {
        console.error('Global error:', e.error);
    });
    
    window.addEventListener('unhandledrejection', (e) => {
        console.error('Unhandled promise rejection:', e.reason);
    });
    
    // Start the game loop (this is handled by individual scenes)
    app.ticker.add((ticker) => {
      // SceneManager handles scene updates
      sceneManager.update(ticker.deltaMS);
    });
    
    console.log("Going to menu scene...");
    await sceneManager.gotoScene(menuScene);
    console.log("Menu scene loaded successfully");
    
  } catch (error) {
    console.error("Error initializing game:", error);
    
    // Show error message to user
    document.body.innerHTML = `
      <div style="color: white; font-family: Arial; padding: 20px; text-align: center;">
        <h1>Game Failed to Load</h1>
        <p>Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>
        <p>Please refresh the page to try again.</p>
      </div>
    `;
  }
})();
