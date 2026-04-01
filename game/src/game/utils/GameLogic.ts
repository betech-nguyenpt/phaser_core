import { Snake } from './Snake';
import { Food } from './Food';

export class GameLogic {
    private playerSnake: Snake | null = null;
    private botSnakes: Snake[] = [];
    private food: Food | null = null;
    private gameOver: boolean = false;
    private playerDeadReason: string = '';

    constructor() {}

    initializeGame(scene: Phaser.Scene) {
        this.food = new Food(scene);
        this.gameOver = false;
        this.playerDeadReason = '';
    }

    createPlayerSnake(scene: Phaser.Scene, x: number, y: number): Snake {
        this.playerSnake = new Snake(scene, x, y, 50, false, 0x00ff00);
        return this.playerSnake;
    }

    createBotSnakes(scene: Phaser.Scene, count: number) {
        const worldWidth = 500000;
        const worldHeight = 500000;
        const colors = [0xff6666, 0x6666ff, 0xff66ff, 0x66ffff, 0xffff66, 0xff9900];

        for (let i = 0; i < count; i++) {
            const x = Math.random() * (worldWidth - 10000) + 5000;
            const y = Math.random() * (worldHeight - 10000) + 5000;
            const color = colors[i % colors.length];
            const bot = new Snake(scene, x, y, 50, true, color);
            this.botSnakes.push(bot);
        }
    }

    initializeFood(scene: Phaser.Scene) {
        if (!this.food) {
            this.food = new Food(scene);
        }

        const worldWidth = 500000;
        const worldHeight = 500000;
        const totalArea = worldWidth * worldHeight;
        const foodCount = Math.floor(totalArea * 0.02 / (100 * 100)); // Assuming food grid

        const positions: { x: number; y: number }[] = [];
        for (let i = 0; i < foodCount; i++) {
            positions.push({
                x: Math.random() * (worldWidth - 1000) + 500,
                y: Math.random() * (worldHeight - 1000) + 500
            });
        }

        this.food.addFoodBatch(positions);
    }

    update(time: number, cursors?: any, pointer?: Phaser.Input.Pointer | null) {
        if (this.gameOver || !this.playerSnake || !this.food) return;

        // Update player snake
        this.playerSnake.update(time, cursors, pointer);

        // Update bot snakes
        this.botSnakes.forEach(bot => {
            if (bot.isAlive) {
                bot.update(time, null, pointer);
            }
        });

        // Check collisions for player snake
        this.checkPlayerCollisions();

        // Check bot collisions
        this.checkBotCollisions();

        // Check food consumption
        this.checkFoodConsumption();

        // Cleanup dead snakes and convert to food
        this.cleanupDeadSnakes();
    }

    private checkPlayerCollisions() {
        if (!this.playerSnake) return;

        const worldWidth = 500000;
        const worldHeight = 500000;

        // Check boundary collision
        if (this.playerSnake.checkBoundaryCollision(worldWidth, worldHeight)) {
            this.playerDeadReason = 'Hit boundary';
            this.gameOver = true;
            return;
        }

        // Check self collision
        if (this.playerSnake.checkSelfCollision()) {
            this.playerDeadReason = 'Hit self';
            this.gameOver = true;
            return;
        }

        // Check collision with bot snakes
        for (const bot of this.botSnakes) {
            if (bot.isAlive && this.playerSnake.checkCollisionWithOtherSnake(bot)) {
                this.playerDeadReason = 'Hit enemy snake';
                this.gameOver = true;
                return;
            }
        }
    }

    private checkBotCollisions() {
        const worldWidth = 500000;
        const worldHeight = 500000;

        for (let i = 0; i < this.botSnakes.length; i++) {
            const bot = this.botSnakes[i];
            if (!bot.isAlive) continue;

            // Check boundary collision
            bot.checkBoundaryCollision(worldWidth, worldHeight);
            if (!bot.isAlive) continue;

            // Check self collision
            bot.checkSelfCollision();
            if (!bot.isAlive) continue;

            // Check collision with other bots
            for (let j = i + 1; j < this.botSnakes.length; j++) {
                const otherBot = this.botSnakes[j];
                if (otherBot.isAlive && bot.checkCollisionWithOtherSnake(otherBot)) {
                    break;
                }
            }
        }
    }

    private checkFoodConsumption() {
        if (!this.playerSnake || !this.food) return;

        const head = this.playerSnake.getHead();
        const foodId = this.food.checkCollision(head.x, head.y);

        if (foodId) {
            this.food.removeFood(foodId);
            this.playerSnake.grow(1);
        }

        // Bots eating food
        this.botSnakes.forEach(bot => {
            if (!bot.isAlive || !this.food) return;
            const botHead = bot.getHead();
            const botFoodId = this.food.checkCollision(botHead.x, botHead.y);
            if (botFoodId) {
                this.food.removeFood(botFoodId);
                bot.grow(1);
            }
        });
    }

    private cleanupDeadSnakes() {
        if (!this.food) return;

        this.botSnakes.forEach(bot => {
            if (!bot.isAlive) {
                const bodyParts = bot.getBodyAsFood();
                bodyParts.forEach(part => {
                    this.food?.addFood(
                        part.x + (Math.random() - 0.5) * 50,
                        part.y + (Math.random() - 0.5) * 50
                    );
                });
            }
        });

        // Remove dead bots from array
        this.botSnakes = this.botSnakes.filter(bot => bot.isAlive);
    }

    draw() {
        if (this.playerSnake) {
            this.playerSnake.draw();
        }

        this.botSnakes.forEach(bot => {
            bot.draw();
        });

        if (this.food) {
            this.food.draw();
        }
    }

    isGameOver(): boolean {
        return this.gameOver;
    }

    getPlayerDeadReason(): string {
        return this.playerDeadReason;
    }

    getPlayerSnakeLength(): number {
        return this.playerSnake?.getLength() || 0;
    }

    getAliveBotsCount(): number {
        return this.botSnakes.filter(bot => bot.isAlive).length;
    }

    getPlayerSnakeHead(): { x: number; y: number } | null {
        return this.playerSnake ? this.playerSnake.getHead() : null;
    }

    getPlayerSnakeIsAlive(): boolean {
        return this.playerSnake ? this.playerSnake.isAlive : false;
    }

    getFoodCount(): number {
        return this.food?.getFoodCount() || 0;
    }

    destroy() {
        if (this.playerSnake) {
            this.playerSnake.destroy();
        }

        this.botSnakes.forEach(bot => {
            bot.destroy();
        });

        if (this.food) {
            this.food.destroy();
        }
    }
}
