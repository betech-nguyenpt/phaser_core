import { GameObjects, Scene } from 'phaser';

import { EventBus } from '../EventBus';
import { SNAKE_ARENA_LEADERBOARD_EVENT, SNAKE_ARENA_STATS_EVENT, loadSnakeArenaLeaderboard } from '../utils/SnakeArena';

export class MainMenu extends Scene
{
    background: GameObjects.TileSprite;
    logo: GameObjects.Image;
    title: GameObjects.Text;
    subtitle: GameObjects.Text;
    leaderboardTitle: GameObjects.Text;
    leaderboardText: GameObjects.Text;
    startButton: GameObjects.Container;
    startButtonLabel: GameObjects.Text;
    logoTween: Phaser.Tweens.Tween | null;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        const { width, height } = this.scale;

        this.background = this.add.tileSprite(width * 0.5, height * 0.5, width, height, 'background')
            .setAlpha(0.35)
            .setTint(0x17324d);

        this.add.rectangle(width * 0.5, height * 0.5, width, height, 0x06131d, 0.72);

        this.logo = this.add.image(width * 0.5, height * 0.28, 'logo')
            .setScale(0.8)
            .setDepth(2);

        this.title = this.add.text(width * 0.5, height * 0.48, 'Snake Arena', {
            fontFamily: 'Arial Black',
            fontSize: 52,
            color: '#f8fbff',
            stroke: '#06131d',
            strokeThickness: 10,
            align: 'center'
        }).setOrigin(0.5).setDepth(2);

        this.subtitle = this.add.text(width * 0.5, height * 0.58, 'Eat, grow, and survive a giant world full of rival snakes.', {
            fontFamily: 'Arial',
            fontSize: 20,
            color: '#d2e8ff',
            align: 'center',
            wordWrap: { width: Math.min(width - 80, 720) }
        }).setOrigin(0.5).setDepth(2);

        this.leaderboardTitle = this.add.text(width * 0.5, height * 0.12, 'Top Lengths', {
            fontFamily: 'Arial Black',
            fontSize: 24,
            color: '#f7ffcb',
            stroke: '#06131d',
            strokeThickness: 6
        }).setOrigin(0.5).setDepth(2);

        this.leaderboardText = this.add.text(width * 0.5, height * 0.18, '', {
            fontFamily: 'Arial',
            fontSize: 18,
            color: '#dcefff',
            align: 'center',
            lineSpacing: 6
        }).setOrigin(0.5, 0).setDepth(2);

        this.refreshLeaderboard();

        const buttonWidth = 220;
        const buttonHeight = 72;
        const buttonY = height * 0.72;
        const buttonBackground = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x47c96d)
            .setStrokeStyle(3, 0xf3ffe7);
        const buttonGlow = this.add.rectangle(0, 0, buttonWidth + 18, buttonHeight + 18, 0x93f5ad, 0.14);

        this.startButtonLabel = this.add.text(0, 0, 'Start', {
            fontFamily: 'Arial Black',
            fontSize: 28,
            color: '#0f2416'
        }).setOrigin(0.5);

        this.startButton = this.add.container(width * 0.5, buttonY, [buttonGlow, buttonBackground, this.startButtonLabel])
            .setSize(buttonWidth, buttonHeight)
            .setDepth(3)
            .setInteractive(new Phaser.Geom.Rectangle(-buttonWidth * 0.5, -buttonHeight * 0.5, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);

        this.startButton.on('pointerover', () => {
            buttonBackground.setFillStyle(0x6ae48d);
        });

        this.startButton.on('pointerout', () => {
            buttonBackground.setFillStyle(0x47c96d);
        });

        this.startButton.on('pointerdown', () => {
            this.changeScene();
        });

        this.input.keyboard?.on('keydown-ENTER', this.changeScene, this);
        this.input.keyboard?.on('keydown-SPACE', this.changeScene, this);

        this.logoTween = this.tweens.add({
            targets: this.logo,
            y: this.logo.y - 16,
            duration: 1800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        EventBus.emit(SNAKE_ARENA_STATS_EVENT, {
            sceneName: this.scene.key,
            length: 0,
            foodEaten: 0,
            aliveBots: 0,
            foodsOnMap: 0
        });
        EventBus.emit(SNAKE_ARENA_LEADERBOARD_EVENT, loadSnakeArenaLeaderboard());
        EventBus.emit('current-scene-ready', this);
    }

    private refreshLeaderboard ()
    {
        const leaderboard = loadSnakeArenaLeaderboard();

        if (leaderboard.length === 0)
        {
            this.leaderboardText.setText('No runs recorded yet.\nPress Start to set the first record.');
            return;
        }

        this.leaderboardText.setText(leaderboard.map((entry, index) => `${index + 1}. Length ${entry.length}  |  Food ${entry.foodEaten}`).join('\n'));
    }

    changeScene ()
    {
        if (this.logoTween)
        {
            this.logoTween.stop();
            this.logoTween = null;
        }

        this.scene.start('Game');
        // Emit event to notify React overlay/App
        setTimeout(() => {
            // Wait a tick for scene to actually switch
            const gameScene = this.scene.get('Game');
            if (gameScene) {
                EventBus.emit('current-scene-ready', gameScene);
            }
        }, 50);
    }

    moveLogo (vueCallback: ({ x, y }: { x: number, y: number }) => void)
    {
        if (this.logoTween)
        {
            if (this.logoTween.isPaused())
            {
                this.logoTween.resume();
            }
            else
            {
                this.logoTween.pause();
            }
        }

        if (vueCallback)
        {
            vueCallback({
                x: Math.floor(this.logo.x),
                y: Math.floor(this.logo.y)
            });
        }
    }
}
