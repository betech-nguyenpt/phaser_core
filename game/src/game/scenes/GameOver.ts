import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class GameOver extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    gameOverText: Phaser.GameObjects.Text;
    statsText: Phaser.GameObjects.Text;
    restartButton: Phaser.GameObjects.Text;

    constructor ()
    {
        super('GameOver');
    }

    create (data: any)
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0xff0000);

        this.gameOverText = this.add.text(512, 150, 'GAME OVER', {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        const playerLength = data.playerLength || 0;
        const reason = data.reason || 'Unknown';

        this.statsText = this.add.text(512, 280, `
Final Length: ${playerLength}
Death Reason: ${reason}
        `, {
            fontFamily: 'Arial', fontSize: 24, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        this.restartButton = this.add.text(512, 450, 'RESTART GAME', {
            fontFamily: 'Arial Black', fontSize: 32, color: '#ffffff',
            stroke: '#000000', strokeThickness: 6,
            align: 'center',
            backgroundColor: '#00ff00',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setDepth(100).setInteractive({ useHandCursor: true });

        this.restartButton.on('pointerdown', () => {
            this.changeScene();
        });

        this.restartButton.on('pointerover', () => {
            this.restartButton.setScale(1.1);
        });

        this.restartButton.on('pointerout', () => {
            this.restartButton.setScale(1);
        });
        
        EventBus.emit('current-scene-ready', this);
    }

    changeScene ()
    {
        this.scene.start('MainMenu');
    }
}
