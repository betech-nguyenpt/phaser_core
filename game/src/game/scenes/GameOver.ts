import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { SNAKE_ARENA_LEADERBOARD_EVENT, SNAKE_ARENA_STATS_EVENT, loadSnakeArenaLeaderboard, recordSnakeArenaLeaderboardEntry } from '../utils/SnakeArena';

export class GameOver extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.TileSprite;
    gameOverText: Phaser.GameObjects.Text;
    summaryText: Phaser.GameObjects.Text;
    leaderboardText: Phaser.GameObjects.Text;
    restartHint: Phaser.GameObjects.Text;

    constructor ()
    {
        super('GameOver');
    }

    create (data: { reason?: string; length?: number; foodEaten?: number } = {})
    {
        const { width, height } = this.scale;

        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x25080b);

        this.background = this.add.tileSprite(width * 0.5, height * 0.5, width, height, 'background')
            .setAlpha(0.22)
            .setTint(0x4e1017);

        this.add.rectangle(width * 0.5, height * 0.5, width, height, 0x140508, 0.72);

        this.gameOverText = this.add.text(width * 0.5, height * 0.36, 'Game Over', {
            fontFamily: 'Arial Black', fontSize: 68, color: '#fff3f3',
            stroke: '#140508', strokeThickness: 10,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        this.summaryText = this.add.text(width * 0.5, height * 0.52, [
            `Cause: ${data.reason ?? 'Unknown'}`,
            `Final length: ${data.length ?? 0}`,
            `Food eaten: ${data.foodEaten ?? 0}`
        ], {
            fontFamily: 'Arial',
            fontSize: 24,
            color: '#ffd8d8',
            align: 'center',
            lineSpacing: 10
        }).setOrigin(0.5).setDepth(100);

        const leaderboard = data.reason && data.reason !== 'manual-exit' && (data.length ?? 0) > 0
            ? recordSnakeArenaLeaderboardEntry({
                length: data.length ?? 0,
                foodEaten: data.foodEaten ?? 0,
                reason: data.reason
            })
            : loadSnakeArenaLeaderboard();

        this.leaderboardText = this.add.text(width * 0.5, height * 0.67, this.buildLeaderboardText(leaderboard), {
            fontFamily: 'Arial',
            fontSize: 20,
            color: '#ffe7c4',
            align: 'center',
            lineSpacing: 8
        }).setOrigin(0.5).setDepth(100);

        this.restartHint = this.add.text(width * 0.5, height * 0.86, 'Click anywhere or press Start button in overlay to return to menu.', {
            fontFamily: 'Arial Black',
            fontSize: 22,
            color: '#ffe2a8',
            align: 'center',
            wordWrap: { width: Math.min(width - 80, 720) }
        }).setOrigin(0.5).setDepth(100);

        this.input.once('pointerdown', this.changeScene, this);
        this.input.keyboard?.once('keydown-ENTER', this.changeScene, this);
        this.input.keyboard?.once('keydown-SPACE', this.changeScene, this);

        EventBus.emit(SNAKE_ARENA_STATS_EVENT, {
            sceneName: this.scene.key,
            length: data.length ?? 0,
            foodEaten: data.foodEaten ?? 0,
            aliveBots: 0,
            foodsOnMap: 0
        });
        EventBus.emit(SNAKE_ARENA_LEADERBOARD_EVENT, leaderboard);
        
        EventBus.emit('current-scene-ready', this);
    }

    private buildLeaderboardText (leaderboard: ReturnType<typeof loadSnakeArenaLeaderboard>): string
    {
        if (leaderboard.length === 0)
        {
            return 'No leaderboard entries yet.';
        }

        return ['Top Lengths', ...leaderboard.map((entry, index) => `${index + 1}. Length ${entry.length}  |  Food ${entry.foodEaten}`)].join('\n');
    }

    changeScene ()
    {
        this.scene.start('MainMenu');
    }
}
