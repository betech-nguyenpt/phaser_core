import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { SNAKE_ARENA_STATS_EVENT } from '../utils/SnakeArena';

type SnakeId = 'player' | `bot-${number}`;

interface FoodParticle
{
    sprite: Phaser.GameObjects.Arc;
    value: number;
}

interface SnakeEntity
{
    id: SnakeId;
    color: number;
    isPlayer: boolean;
    alive: boolean;
    speed: number;
    growthBuffer: number;
    desiredLength: number;
    turnRate: number;
    heading: number;
    targetHeading: number;
    directionTimer: number;
    head: Phaser.Math.Vector2;
    body: Phaser.Math.Vector2[];
    segments: Phaser.GameObjects.Arc[];
    currentLength: number;
    label?: Phaser.GameObjects.Text;
}

const WORLD_SIZE = 5000;
const HALF_WORLD_SIZE = WORLD_SIZE * 0.5;
const FOOD_GRID_SIZE = 1000;
const INITIAL_FOOD_COUNT = Math.floor((WORLD_SIZE / FOOD_GRID_SIZE) * (WORLD_SIZE / FOOD_GRID_SIZE) * 0.02);
const BOT_COUNT = 10;
const PLAYER_INITIAL_LENGTH = 30;
const FOOD_RADIUS = 4;
const SEGMENT_SPACING = 10;

export class Game extends Scene
{
    isPaused: boolean = false;
    camera: Phaser.Cameras.Scene2D.Camera;
    worldBackground: Phaser.GameObjects.TileSprite;
    foods: FoodParticle[];
    snakes: SnakeEntity[];
    playerSnake: SnakeEntity;
    minimapFrame: Phaser.GameObjects.Graphics;
    worldLabel: Phaser.GameObjects.Text;
    statsLabel: Phaser.GameObjects.Text;
    cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
    wasdKeys?: {
        W: Phaser.Input.Keyboard.Key;
        A: Phaser.Input.Keyboard.Key;
        S: Phaser.Input.Keyboard.Key;
        D: Phaser.Input.Keyboard.Key;
    };
    playerLength: number;
    totalFoodEaten: number;
    lastStatsEventAt: number;
    isPaused: boolean = false;

    constructor ()
    {
        super('Game');
    }

    create ()
    {
        this.foods = [];
        this.snakes = [];
        this.playerLength = PLAYER_INITIAL_LENGTH;
        this.totalFoodEaten = 0;
        this.lastStatsEventAt = 0;

        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x06141f);
        this.camera.setBounds(-HALF_WORLD_SIZE, -HALF_WORLD_SIZE, WORLD_SIZE, WORLD_SIZE);
        this.camera.roundPixels = false;

        this.physics.world.setBounds(-HALF_WORLD_SIZE, -HALF_WORLD_SIZE, WORLD_SIZE, WORLD_SIZE);

        this.worldBackground = this.add.tileSprite(0, 0, WORLD_SIZE, WORLD_SIZE, 'background')
            .setAlpha(0.16)
            .setTint(0x3b5f83);

        this.add.rectangle(0, 0, WORLD_SIZE, WORLD_SIZE)
            .setStrokeStyle(32, 0x96b9d8, 0.35)
            .setDepth(-1);

        this.createWorldGrid();
        this.createFoods(INITIAL_FOOD_COUNT);

        this.playerSnake = this.createSnake('player', true, PLAYER_INITIAL_LENGTH, 0x58f08a);
        this.snakes.push(this.playerSnake);

        for (let index = 0; index < BOT_COUNT; index++)
        {
            this.snakes.push(this.createSnake(`bot-${index}`, false, Phaser.Math.Between(28, 90), Phaser.Display.Color.RandomRGB().color));
        }

        this.camera.startFollow(this.playerSnake.segments[0], true, 0.12, 0.12);
        this.camera.setZoom(1.05);

        this.cursors = this.input.keyboard?.createCursorKeys();
        this.wasdKeys = this.input.keyboard?.addKeys('W,A,S,D') as Game['wasdKeys'];

        this.worldLabel = this.add.text(24, 24, '', {
            fontFamily: 'Arial Black',
            fontSize: 20,
            color: '#e9f7ff',
            stroke: '#06141f',
            strokeThickness: 5
        }).setScrollFactor(0).setDepth(20);

        this.statsLabel = this.add.text(24, 58, '', {
            fontFamily: 'Arial',
            fontSize: 16,
            color: '#d3e9f6',
            stroke: '#06141f',
            strokeThickness: 4,
            lineSpacing: 4
        }).setScrollFactor(0).setDepth(20);

        this.input.keyboard?.on('keydown-SPACE', () => {
            this.isPaused = !this.isPaused;
            if (this.isPaused) {
                this.scene.pause();
            } else {
                this.scene.resume();
            }
        });

        this.minimapFrame = this.add.graphics().setScrollFactor(0).setDepth(20);

        this.events.on('shutdown', this.handleSceneShutdown, this);
        this.events.on('destroy', this.handleSceneShutdown, this);

        this.emitOverlayStats(true);
        EventBus.emit('current-scene-ready', this);

        // Toggle pause with Space key
        this.input.keyboard?.on('keydown-SPACE', () => {
            this.isPaused = !this.isPaused;
            // Optionally, show a pause overlay/message here
        });
    }

    update (_time: number, delta: number)
    {
        if (this.isPaused) {
            return;
        }
        const deltaSeconds = delta / 1000;

        for (const snake of this.snakes)
        {
            if (!snake.alive)
            {
                continue;
            }

            if (snake.isPlayer)
            {
                this.updatePlayerHeading(snake, deltaSeconds);
            }
            else
            {
                this.updateBotHeading(snake, deltaSeconds);
            }

            this.moveSnake(snake, deltaSeconds);
        }

        this.handleFoodCollection();
        this.handleSnakeCollisions();
        this.refreshHud();
    }

    changeScene ()
    {
        this.scene.start('GameOver', {
            reason: 'manual-exit',
            length: Math.round(this.playerLength),
            foodEaten: this.totalFoodEaten
        });
    }

    private createWorldGrid ()
    {
        const graphics = this.add.graphics();
        graphics.lineStyle(4, 0xffffff, 0.04);

        const step = 5000;
        for (let value = -HALF_WORLD_SIZE; value <= HALF_WORLD_SIZE; value += step)
        {
            graphics.lineBetween(-HALF_WORLD_SIZE, value, HALF_WORLD_SIZE, value);
            graphics.lineBetween(value, -HALF_WORLD_SIZE, value, HALF_WORLD_SIZE);
        }

        graphics.lineStyle(12, 0x89afcf, 0.18);
        graphics.strokeRect(-HALF_WORLD_SIZE, -HALF_WORLD_SIZE, WORLD_SIZE, WORLD_SIZE);
    }

    private createFoods (count: number)
    {
        for (let index = 0; index < count; index++)
        {
            this.spawnFoodAt(this.getRandomWorldPoint(), Phaser.Math.Between(1, 3));
        }
    }

    private spawnFoodAt (position: Phaser.Math.Vector2, value: number = 1)
    {
        const radius = FOOD_RADIUS + value;
        const color = value > 2 ? 0xffc857 : 0x7fffd4;
        const sprite = this.add.circle(position.x, position.y, radius, color, 0.95).setDepth(1);
        this.foods.push({ sprite, value });
    }

    private createSnake (id: SnakeId, isPlayer: boolean, initialLength: number, color: number): SnakeEntity
    {
        const start = this.getRandomWorldPoint(4000);
        const heading = Phaser.Math.FloatBetween(0, Math.PI * 2);
        const body: Phaser.Math.Vector2[] = [];
        const segments: Phaser.GameObjects.Arc[] = [];
        const head = start.clone();

        for (let index = 0; index < initialLength; index++)
        {
            const offset = index * SEGMENT_SPACING;
            const point = new Phaser.Math.Vector2(
                start.x - Math.cos(heading) * offset,
                start.y - Math.sin(heading) * offset
            );

            body.push(point);

            const radius = Math.max(4, 11 - (index * 0.08));
            const alpha = index === 0 ? 1 : Math.max(0.35, 0.95 - (index * 0.008));
            const segment = this.add.circle(point.x, point.y, radius, color, alpha).setDepth(5 - Math.min(index, 4));
            segments.push(segment);
        }

        const label = !isPlayer
            ? this.add.text(start.x, start.y - 22, id, {
                fontFamily: 'Arial',
                fontSize: 14,
                color: '#ffffff',
                stroke: '#06141f',
                strokeThickness: 3
            }).setOrigin(0.5).setDepth(10)
            : undefined;

        return {
            id,
            color,
            isPlayer,
            alive: true,
            speed: isPlayer ? 140 : Phaser.Math.Between(92, 134),
            growthBuffer: 0,
            desiredLength: initialLength,
            turnRate: isPlayer ? 3.2 : Phaser.Math.FloatBetween(0.8, 1.7),
            heading,
            targetHeading: heading,
            directionTimer: Phaser.Math.FloatBetween(0.4, 2.4),
            head,
            body,
            segments,
            currentLength: initialLength,
            label
        };
    }

    private updatePlayerHeading (snake: SnakeEntity, deltaSeconds: number)
    {
        let turn = 0;
        const pointer = this.input.activePointer;

        if (pointer.isDown)
        {
            const worldPoint = pointer.positionToCamera(this.camera) as Phaser.Math.Vector2;
            snake.targetHeading = Phaser.Math.Angle.Between(snake.head.x, snake.head.y, worldPoint.x, worldPoint.y);
        }

        if (this.cursors?.left.isDown || this.wasdKeys?.A.isDown)
        {
            turn -= snake.turnRate * deltaSeconds;
        }
        if (this.cursors?.right.isDown || this.wasdKeys?.D.isDown)
        {
            turn += snake.turnRate * deltaSeconds;
        }
        if (turn !== 0)
        {
            snake.targetHeading += turn;
        }

        snake.heading = Phaser.Math.Angle.RotateTo(snake.heading, snake.targetHeading, snake.turnRate * deltaSeconds);
    }

    private updateBotHeading (snake: SnakeEntity, deltaSeconds: number)
    {
        snake.directionTimer -= deltaSeconds;

        const avoidanceVector = this.getBotAvoidanceVector(snake);
        const nearingThreat = avoidanceVector.lengthSq() > 0.35;

        if (snake.directionTimer <= 0 || nearingThreat)
        {
            const nearestFood = this.getNearestFood(snake.head);
            const steeringVector = new Phaser.Math.Vector2(Math.cos(snake.heading), Math.sin(snake.heading)).scale(0.4);

            if (nearestFood)
            {
                const foodVector = new Phaser.Math.Vector2(nearestFood.sprite.x - snake.head.x, nearestFood.sprite.y - snake.head.y);
                if (foodVector.lengthSq() > 0)
                {
                    steeringVector.add(foodVector.normalize().scale(nearingThreat ? 0.45 : 0.95));
                }
            }

            steeringVector.add(avoidanceVector.scale(nearingThreat ? 2.8 : 1.9));
            steeringVector.add(new Phaser.Math.Vector2(Phaser.Math.FloatBetween(-0.18, 0.18), Phaser.Math.FloatBetween(-0.18, 0.18)));

            if (steeringVector.lengthSq() > 0)
            {
                snake.targetHeading = steeringVector.angle();
            }

            snake.directionTimer = nearingThreat
                ? Phaser.Math.FloatBetween(0.08, 0.22)
                : Phaser.Math.FloatBetween(0.4, 1.15);
        }

        snake.heading = Phaser.Math.Angle.RotateTo(snake.heading, snake.targetHeading, snake.turnRate * deltaSeconds);
    }

    private getBotAvoidanceVector (snake: SnakeEntity): Phaser.Math.Vector2
    {
        const avoidanceVector = new Phaser.Math.Vector2(0, 0);
        const edgeMargin = 2400;
        const boundaryThreatRange = 3200;
        const localDangerRadius = 950;
        const localDangerRadiusSq = localDangerRadius * localDangerRadius;
        const snakeAwarenessRadiusSq = 3200 * 3200;

        const leftDistance = snake.head.x + HALF_WORLD_SIZE;
        const rightDistance = HALF_WORLD_SIZE - snake.head.x;
        const topDistance = snake.head.y + HALF_WORLD_SIZE;
        const bottomDistance = HALF_WORLD_SIZE - snake.head.y;

        if (leftDistance < edgeMargin)
        {
            avoidanceVector.x += Phaser.Math.Clamp((boundaryThreatRange - leftDistance) / boundaryThreatRange, 0, 1) * 2.4;
        }
        if (rightDistance < edgeMargin)
        {
            avoidanceVector.x -= Phaser.Math.Clamp((boundaryThreatRange - rightDistance) / boundaryThreatRange, 0, 1) * 2.4;
        }
        if (topDistance < edgeMargin)
        {
            avoidanceVector.y += Phaser.Math.Clamp((boundaryThreatRange - topDistance) / boundaryThreatRange, 0, 1) * 2.4;
        }
        if (bottomDistance < edgeMargin)
        {
            avoidanceVector.y -= Phaser.Math.Clamp((boundaryThreatRange - bottomDistance) / boundaryThreatRange, 0, 1) * 2.4;
        }

        for (const otherSnake of this.snakes)
        {
            if (!otherSnake.alive || otherSnake.id === snake.id)
            {
                continue;
            }

            const headDistanceSq = Phaser.Math.Distance.Squared(snake.head.x, snake.head.y, otherSnake.head.x, otherSnake.head.y);
            if (headDistanceSq > snakeAwarenessRadiusSq)
            {
                continue;
            }

            this.applyRepulsionFromPoint(avoidanceVector, snake.head.x, snake.head.y, otherSnake.head.x, otherSnake.head.y, 1500, otherSnake.isPlayer ? 1.6 : 1.05);

            const step = otherSnake.isPlayer ? 4 : 7;
            for (let index = 6; index < otherSnake.segments.length; index += step)
            {
                const segment = otherSnake.segments[index];
                if (!segment.active)
                {
                    continue;
                }

                const distanceSq = Phaser.Math.Distance.Squared(snake.head.x, snake.head.y, segment.x, segment.y);
                if (distanceSq > localDangerRadiusSq)
                {
                    continue;
                }

                this.applyRepulsionFromPoint(avoidanceVector, snake.head.x, snake.head.y, segment.x, segment.y, localDangerRadius, 2.2);
            }
        }

        return avoidanceVector;
    }

    private applyRepulsionFromPoint (
        accumulator: Phaser.Math.Vector2,
        fromX: number,
        fromY: number,
        pointX: number,
        pointY: number,
        radius: number,
        weight: number
    )
    {
        const deltaX = fromX - pointX;
        const deltaY = fromY - pointY;
        const distanceSq = (deltaX * deltaX) + (deltaY * deltaY);
        const radiusSq = radius * radius;

        if (distanceSq <= 0 || distanceSq > radiusSq)
        {
            return;
        }

        const distance = Math.sqrt(distanceSq);
        const strength = Phaser.Math.Clamp(1 - (distance / radius), 0, 1) * weight;
        accumulator.x += (deltaX / distance) * strength;
        accumulator.y += (deltaY / distance) * strength;
    }

    private moveSnake (snake: SnakeEntity, deltaSeconds: number)
    {
        const distance = snake.speed * deltaSeconds;
        snake.head = new Phaser.Math.Vector2(
            snake.head.x + Math.cos(snake.heading) * distance,
            snake.head.y + Math.sin(snake.heading) * distance
        );

        snake.body.unshift(snake.head.clone());

        const maxSamples = Math.max(2, Math.ceil(snake.desiredLength * SEGMENT_SPACING / Math.max(distance, 2)) + 4);
        while (snake.body.length > maxSamples)
        {
            snake.body.pop();
        }

        while (snake.segments.length < snake.desiredLength)
        {
            const radius = Math.max(4, 11 - (snake.segments.length * 0.08));
            const segment = this.add.circle(snake.head.x, snake.head.y, radius, snake.color, 0.95).setDepth(2);
            snake.segments.push(segment);
        }

        while (snake.segments.length > snake.desiredLength)
        {
            const segment = snake.segments.pop();
            segment?.destroy();
        }

        for (let index = 0; index < snake.segments.length; index++)
        {
            const targetDistance = index * SEGMENT_SPACING;
            const point = this.getPointAlongTrail(snake.body, targetDistance);
            snake.segments[index].setPosition(point.x, point.y);
        }

        snake.currentLength = snake.segments.length;

        if (snake.label)
        {
            snake.label.setPosition(snake.head.x, snake.head.y - 24);
        }
    }

    private getPointAlongTrail (points: Phaser.Math.Vector2[], distance: number): Phaser.Math.Vector2
    {
        if (points.length === 0)
        {
            return new Phaser.Math.Vector2(0, 0);
        }

        if (distance <= 0)
        {
            return points[0].clone();
        }

        let traveled = 0;

        for (let index = 1; index < points.length; index++)
        {
            const from = points[index - 1];
            const to = points[index];
            const segmentDistance = Phaser.Math.Distance.Between(from.x, from.y, to.x, to.y);

            if (traveled + segmentDistance >= distance)
            {
                const progress = (distance - traveled) / Math.max(segmentDistance, 0.0001);
                return new Phaser.Math.Vector2(
                    Phaser.Math.Linear(from.x, to.x, progress),
                    Phaser.Math.Linear(from.y, to.y, progress)
                );
            }

            traveled += segmentDistance;
        }

        return points[points.length - 1].clone();
    }

    private handleFoodCollection ()
    {
        const collectionRadius = 18;

        for (const snake of this.snakes)
        {
            if (!snake.alive)
            {
                continue;
            }

            for (let index = this.foods.length - 1; index >= 0; index--)
            {
                const food = this.foods[index];
                if (Phaser.Math.Distance.Between(snake.head.x, snake.head.y, food.sprite.x, food.sprite.y) > collectionRadius + food.sprite.radius)
                {
                    continue;
                }

                food.sprite.destroy();
                this.foods.splice(index, 1);
                snake.growthBuffer += food.value;
                snake.desiredLength += food.value;
                snake.speed = Math.min(snake.speed + (food.value * 0.15), snake.isPlayer ? 170 : 145);

                if (snake.isPlayer)
                {
                    this.playerLength = snake.desiredLength;
                    this.totalFoodEaten += food.value;
                }

                this.spawnFoodAt(this.getRandomWorldPoint(), Phaser.Math.Between(1, 2));
            }
        }
    }

    private handleSnakeCollisions ()
    {
        for (const snake of this.snakes)
        {
            if (!snake.alive)
            {
                continue;
            }

            if (this.isOutOfBounds(snake.head))
            {
                this.killSnake(snake, snake.isPlayer ? 'Hit the world boundary' : 'Bot hit boundary');
                continue;
            }

            for (const otherSnake of this.snakes)
            {
                if (!otherSnake.alive || otherSnake.id === snake.id)
                {
                    continue;
                }

                if (this.hitSnakeBody(snake.head, otherSnake))
                {
                    this.killSnake(snake, snake.isPlayer ? `Crashed into ${otherSnake.id}` : `${snake.id} crashed`);
                    break;
                }
            }
        }
    }

    private hitSnakeBody (head: Phaser.Math.Vector2, snake: SnakeEntity): boolean
    {
        for (let index = 6; index < snake.segments.length; index++)
        {
            const segment = snake.segments[index];
            if (!segment.active)
            {
                continue;
            }

            if (Phaser.Math.Distance.Between(head.x, head.y, segment.x, segment.y) <= segment.radius + 8)
            {
                return true;
            }
        }

        return false;
    }

    private killSnake (snake: SnakeEntity, reason: string)
    {
        if (!snake.alive)
        {
            return;
        }

        snake.alive = false;

        for (const segment of snake.segments)
        {
            this.spawnFoodAt(
                new Phaser.Math.Vector2(
                    segment.x + Phaser.Math.Between(-12, 12),
                    segment.y + Phaser.Math.Between(-12, 12)
                ),
                Phaser.Math.Between(1, 2)
            );
            segment.destroy();
        }

        snake.label?.destroy();

        if (snake.isPlayer)
        {
            this.cameras.main.shake(280, 0.01);
            this.time.delayedCall(420, () => {
                this.scene.start('GameOver', {
                    reason,
                    length: Math.round(this.playerLength),
                    foodEaten: this.totalFoodEaten
                });
            });
        }
        else
        {
            this.time.delayedCall(1000, () => {
                const replacementIndex = this.snakes.findIndex((entry) => entry.id === snake.id);
                if (replacementIndex === -1)
                {
                    return;
                }

                this.snakes[replacementIndex] = this.createSnake(snake.id, false, Phaser.Math.Between(28, 90), Phaser.Display.Color.RandomRGB().color);
            });
        }
    }

    private isOutOfBounds (point: Phaser.Math.Vector2): boolean
    {
        return point.x <= -HALF_WORLD_SIZE || point.x >= HALF_WORLD_SIZE || point.y <= -HALF_WORLD_SIZE || point.y >= HALF_WORLD_SIZE;
    }

    private getNearestFood (origin: Phaser.Math.Vector2): FoodParticle | undefined
    {
        let nearest: FoodParticle | undefined;
        let nearestDistance = Number.MAX_SAFE_INTEGER;

        for (const food of this.foods)
        {
            const distance = Phaser.Math.Distance.Squared(origin.x, origin.y, food.sprite.x, food.sprite.y);
            if (distance < nearestDistance)
            {
                nearest = food;
                nearestDistance = distance;
            }
        }

        return nearest;
    }

    private refreshHud ()
    {
        const aliveBots = this.getAliveBotCount();
        const positionX = Math.round(this.playerSnake.head.x);
        const positionY = Math.round(this.playerSnake.head.y);

        this.worldLabel.setText('Snake Arena');
        this.statsLabel.setText([
            `Scene: ${this.scene.key}`,
            `World: ${WORLD_SIZE.toLocaleString()} x ${WORLD_SIZE.toLocaleString()} px`,
            `Player length: ${Math.round(this.playerLength)}`,
            `Food eaten: ${this.totalFoodEaten}`,
            `Foods on map: ${this.foods.length}`,
            `Alive bots: ${aliveBots}/${BOT_COUNT}`,
            `Position: (${positionX}, ${positionY})`
        ]);

        this.drawMinimap(positionX, positionY);
        this.emitOverlayStats();
    }

    private emitOverlayStats (force: boolean = false)
    {
        const now = this.time.now;
        if (!force && now - this.lastStatsEventAt < 120)
        {
            return;
        }

        this.lastStatsEventAt = now;

        EventBus.emit(SNAKE_ARENA_STATS_EVENT, {
            sceneName: this.scene.key,
            length: Math.round(this.playerLength),
            foodEaten: this.totalFoodEaten,
            aliveBots: this.getAliveBotCount(),
            foodsOnMap: this.foods.length
        });
    }

    private getAliveBotCount (): number
    {
        return this.snakes.filter((snake) => !snake.isPlayer && snake.alive).length;
    }

    private drawMinimap (positionX: number, positionY: number)
    {
        const size = 150;
        const offsetX = this.scale.width - size - 24;
        const offsetY = 24;

        this.minimapFrame.clear();
        this.minimapFrame.fillStyle(0x06141f, 0.78);
        this.minimapFrame.fillRoundedRect(offsetX, offsetY, size, size, 12);
        this.minimapFrame.lineStyle(2, 0x94bed8, 0.8);
        this.minimapFrame.strokeRoundedRect(offsetX, offsetY, size, size, 12);

        for (const snake of this.snakes)
        {
            if (!snake.alive)
            {
                continue;
            }

            const mapX = offsetX + Phaser.Math.Clamp((snake.head.x + HALF_WORLD_SIZE) / WORLD_SIZE, 0, 1) * size;
            const mapY = offsetY + Phaser.Math.Clamp((snake.head.y + HALF_WORLD_SIZE) / WORLD_SIZE, 0, 1) * size;
            this.minimapFrame.fillStyle(snake.isPlayer ? 0x7dffad : 0xff8d8d, 0.9);
            this.minimapFrame.fillCircle(mapX, mapY, snake.isPlayer ? 4 : 2);
        }

        const playerMapX = offsetX + Phaser.Math.Clamp((positionX + HALF_WORLD_SIZE) / WORLD_SIZE, 0, 1) * size;
        const playerMapY = offsetY + Phaser.Math.Clamp((positionY + HALF_WORLD_SIZE) / WORLD_SIZE, 0, 1) * size;
        this.minimapFrame.lineStyle(1, 0xffffff, 0.9);
        this.minimapFrame.strokeCircle(playerMapX, playerMapY, 6);
    }

    private getRandomWorldPoint (margin: number = 800): Phaser.Math.Vector2
    {
        return new Phaser.Math.Vector2(
            Phaser.Math.Between(-HALF_WORLD_SIZE + margin, HALF_WORLD_SIZE - margin),
            Phaser.Math.Between(-HALF_WORLD_SIZE + margin, HALF_WORLD_SIZE - margin)
        );
    }

    private handleSceneShutdown ()
    {
        EventBus.emit(SNAKE_ARENA_STATS_EVENT, {
            sceneName: this.scene.key,
            length: 0,
            foodEaten: 0,
            aliveBots: 0,
            foodsOnMap: 0
        });
        this.minimapFrame?.destroy();
        this.worldLabel?.destroy();
        this.statsLabel?.destroy();
        this.foods = [];
        this.snakes = [];
    }
}
