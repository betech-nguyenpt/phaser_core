import Phaser from 'phaser';

export interface SnakeSegment {
    x: number;
    y: number;
}

export class Snake {
    private graphics: Phaser.GameObjects.Graphics;
    private segments: SnakeSegment[] = [];
    private velocity: { x: number; y: number };
    private nextDirection: { x: number; y: number };
    private isBot: boolean;
    private color: number;
    private lastMoveTime: number = 0;
    private moveInterval: number = 50; // milliseconds
    private radius: number = 15; // radius of each segment
    public isAlive: boolean = true;

    constructor(scene: Phaser.Scene, x: number, y: number, size: number, isBot: boolean = false, color?: number) {
        this.isBot = isBot;
        this.color = color || (isBot ? 0xff6666 : 0x00ff00);
        
        // Initialize segments
        for (let i = 0; i < size; i++) {
            this.segments.push({ x: x - i * this.radius * 2, y });
        }

        this.velocity = { x: 1, y: 0 };
        this.nextDirection = { ...this.velocity };
        
        this.graphics = scene.make.graphics({ x: 0, y: 0 });
    }

    update(time: number, cursors?: any, pointer?: Phaser.Input.Pointer | null) {
        if (!this.isAlive) return;

        // Update direction for player snake
        if (!this.isBot && cursors) {
            if (cursors.left.isDown || cursors.a.isDown) {
                if (this.velocity.x === 0) this.nextDirection = { x: -1, y: 0 };
            } else if (cursors.right.isDown || cursors.d.isDown) {
                if (this.velocity.x === 0) this.nextDirection = { x: 1, y: 0 };
            } else if (cursors.up.isDown || cursors.w.isDown) {
                if (this.velocity.y === 0) this.nextDirection = { x: 0, y: -1 };
            } else if (cursors.down.isDown || cursors.s.isDown) {
                if (this.velocity.y === 0) this.nextDirection = { x: 0, y: 1 };
            }
        } else if (this.isBot && pointer) {
            // Bot AI - chase nearest food or move randomly
            this.updateBotDirection();
        }

        // Move only after interval
        if (time - this.lastMoveTime > this.moveInterval) {
            this.lastMoveTime = time;
            this.velocity = { ...this.nextDirection };

            const head = this.segments[0];
            const newX = head.x + this.velocity.x * this.radius * 2;
            const newY = head.y + this.velocity.y * this.radius * 2;

            this.segments.unshift({ x: newX, y: newY });
            this.segments.pop();
        }

        this.draw();
    }

    private updateBotDirection() {
        // Simple bot AI - move in a pattern or towards center
        const head = this.segments[0];
        const worldWidth = 500000;
        const worldHeight = 500000;

        // Check boundaries and change direction if too close
        const margin = 2000;
        if (head.x < margin) {
            this.nextDirection = { x: 1, y: 0 };
        } else if (head.x > worldWidth - margin) {
            this.nextDirection = { x: -1, y: 0 };
        } else if (head.y < margin) {
            this.nextDirection = { x: 0, y: 1 };
        } else if (head.y > worldHeight - margin) {
            this.nextDirection = { x: 0, y: -1 };
        } else if (Math.random() < 0.02) {
            // Random direction change
            const directions = [
                { x: 1, y: 0 },
                { x: -1, y: 0 },
                { x: 0, y: 1 },
                { x: 0, y: -1 }
            ];
            const random = directions[Math.floor(Math.random() * directions.length)];
            if ((this.velocity.x === 0 && random.x === 0) || (this.velocity.y === 0 && random.y === 0)) {
                return;
            }
            this.nextDirection = random;
        }
    }

    draw() {
        this.graphics.clear();
        this.graphics.fillStyle(this.color, 1);

        for (let i = 0; i < this.segments.length; i++) {
            const segment = this.segments[i];
            this.graphics.fillCircle(segment.x, segment.y, this.radius);
        }

        this.graphics.setDepth(10);
    }

    getGraphics(): Phaser.GameObjects.Graphics {
        return this.graphics;
    }

    getHead(): SnakeSegment {
        return this.segments[0];
    }

    getSegments(): SnakeSegment[] {
        return this.segments;
    }

    getLength(): number {
        return this.segments.length;
    }

    grow(amount: number = 1) {
        for (let i = 0; i < amount; i++) {
            const tail = this.segments[this.segments.length - 1];
            this.segments.push({ ...tail });
        }
    }

    checkBoundaryCollision(worldWidth: number, worldHeight: number): boolean {
        const head = this.getHead();
        if (head.x <= 0 || head.x >= worldWidth || head.y <= 0 || head.y >= worldHeight) {
            this.isAlive = false;
            return true;
        }
        return false;
    }

    checkSelfCollision(): boolean {
        const head = this.getHead();
        for (let i = 4; i < this.segments.length; i++) {
            const segment = this.segments[i];
            if (Math.hypot(head.x - segment.x, head.y - segment.y) < this.radius * 2) {
                this.isAlive = false;
                return true;
            }
        }
        return false;
    }

    checkCollisionWithOtherSnake(otherSnake: Snake): boolean {
        const head = this.getHead();
        const otherSegments = otherSnake.getSegments();
        
        for (let i = 0; i < otherSegments.length; i++) {
            const segment = otherSegments[i];
            if (Math.hypot(head.x - segment.x, head.y - segment.y) < this.radius * 2) {
                this.isAlive = false;
                return true;
            }
        }
        return false;
    }

    getBodyAsFood(): { x: number; y: number }[] {
        return [...this.segments];
    }

    destroy() {
        if (this.graphics) {
            this.graphics.destroy();
        }
    }
}
