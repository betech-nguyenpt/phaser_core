import Phaser from 'phaser';

export class Food {
    private foods: Map<string, { x: number; y: number }> = new Map();
    private graphics: Phaser.GameObjects.Graphics;
    private foodRadius: number = 8;
    private nextFoodId: number = 0;

    constructor(scene: Phaser.Scene) {
        this.graphics = scene.make.graphics({ x: 0, y: 0 });
    }

    addFood(x: number, y: number): string {
        const id = `food_${this.nextFoodId++}`;
        this.foods.set(id, { x, y });
        return id;
    }

    removeFood(id: string): boolean {
        return this.foods.delete(id);
    }

    getFood(id: string): { x: number; y: number } | undefined {
        return this.foods.get(id);
    }

    getAllFoods(): Map<string, { x: number; y: number }> {
        return new Map(this.foods);
    }

    getFoodCount(): number {
        return this.foods.size;
    }

    addFoodBatch(positions: { x: number; y: number }[]) {
        positions.forEach(pos => {
            this.addFood(pos.x, pos.y);
        });
    }

    draw() {
        this.graphics.clear();
        this.graphics.fillStyle(0xffff00, 1);

        this.foods.forEach(food => {
            this.graphics.fillCircle(food.x, food.y, this.foodRadius);
        });

        this.graphics.setDepth(5);
    }

    getGraphics(): Phaser.GameObjects.Graphics {
        return this.graphics;
    }

    checkCollision(x: number, y: number, radius: number = 15): string | null {
        for (const [id, food] of this.foods) {
            const distance = Math.hypot(x - food.x, y - food.y);
            if (distance < radius + this.foodRadius) {
                return id;
            }
        }
        return null;
    }

    clear() {
        this.foods.clear();
    }

    destroy() {
        if (this.graphics) {
            this.graphics.destroy();
        }
        this.clear();
    }
}
