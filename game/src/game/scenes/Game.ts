import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { GameLogic } from '../utils/GameLogic';

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    gameLogic: GameLogic;
    cursors: any = null;
    worldWidth: number = 500000;
    worldHeight: number = 500000;
    statsText: Phaser.GameObjects.Text;

    constructor ()
    {
        super('Game');
        this.gameLogic = new GameLogic();
    }

    create ()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x1a1a2e);
        this.camera.setBounds(0, 0, this.worldWidth, this.worldHeight);
        this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);

        // Initialize game logic
        this.gameLogic.initializeGame(this);
        
        // Create player snake at random position
        const playerX = Math.random() * (this.worldWidth - 10000) + 5000;
        const playerY = Math.random() * (this.worldHeight - 10000) + 5000;
        this.gameLogic.createPlayerSnake(this, playerX, playerY);

        // Create bot snakes
        this.gameLogic.createBotSnakes(this, 100);

        // Initialize food
        this.gameLogic.initializeFood(this);

        // Setup keyboard input
        this.cursors = this.input.keyboard?.createCursorKeys() || null;
        this.input.keyboard?.addKeys({
            w: Phaser.Input.Keyboard.KeyCodes.W,
            a: Phaser.Input.Keyboard.KeyCodes.A,
            s: Phaser.Input.Keyboard.KeyCodes.S,
            d: Phaser.Input.Keyboard.KeyCodes.D
        });

        // Stats display
        this.statsText = this.add.text(10, 10, '', {
            fontFamily: 'Arial', fontSize: 16, color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 5, y: 5 }
        }).setScrollFactor(0).setDepth(1000);

        // Follow player snake
        const head = this.gameLogic.getPlayerSnakeHead();
        if (head) {
            this.camera.startFollow(head as any, true);
        }

        EventBus.emit('current-scene-ready', this);
    }

    update(time: number)
    {
        // Update game logic
        this.gameLogic.update(time, this.cursors, this.input.activePointer);

        // Draw game state
        this.gameLogic.draw();

        // Update stats
        this.updateStats();

        // Check game over
        if (this.gameLogic.isGameOver()) {
            this.time.delayedCall(500, () => {
                this.scene.start('GameOver', {
                    playerLength: this.gameLogic.getPlayerSnakeLength(),
                    reason: this.gameLogic.getPlayerDeadReason()
                });
            });
        }

        // Follow player snake
        const head = this.gameLogic.getPlayerSnakeHead();
        const isAlive = this.gameLogic.getPlayerSnakeIsAlive();
        if (head && isAlive) {
            this.camera.scrollX = head.x - this.camera.width / 2;
            this.camera.scrollY = head.y - this.camera.height / 2;
        }
    }

    private updateStats()
    {
        const head = this.gameLogic.getPlayerSnakeHead();
        const playerX = head ? head.x : 0;
        const playerY = head ? head.y : 0;

        this.statsText.text = `
Length: ${this.gameLogic.getPlayerSnakeLength()}
Bots Alive: ${this.gameLogic.getAliveBotsCount()}
Food: ${this.gameLogic.getFoodCount()}
Pos: (${Math.floor(playerX)}, ${Math.floor(playerY)})
Controls: Arrow Keys / WASD`;
    }

    shutdown()
    {
        this.gameLogic.destroy();
    }
}
