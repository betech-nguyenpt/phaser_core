import { GameObjects, Scene } from 'phaser';

import { EventBus } from '../EventBus';

export class MainMenu extends Scene
{
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;
    startButton: GameObjects.Text;
    buttonBg: GameObjects.Rectangle;
    logoTween: Phaser.Tweens.Tween | null;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        this.background = this.add.image(512, 384, 'background');

        this.logo = this.add.image(512, 300, 'logo').setDepth(100);

        this.title = this.add.text(512, 200, 'Snake Hunt', {
            fontFamily: 'Arial Black', fontSize: 48, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        // Create button background
        this.buttonBg = this.add.rectangle(512, 400, 250, 80, 0xff6600).setDepth(99).setInteractive({ useHandCursor: true });

        // Create button text
        this.startButton = this.add.text(512, 400, 'START GAME', {
            fontFamily: 'Arial Black', fontSize: 32, color: '#ffffff',
            stroke: '#000000', strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        // Attach click event to background (better hit area)
        this.buttonBg.on('pointerdown', () => {
            console.log('START GAME button clicked');
            this.changeScene();
        });

        this.buttonBg.on('pointerover', () => {
            this.buttonBg.setScale(1.1);
            this.startButton.setScale(1.1);
        });

        this.buttonBg.on('pointerout', () => {
            this.buttonBg.setScale(1);
            this.startButton.setScale(1);
        });

        EventBus.emit('current-scene-ready', this);
    }
    
    changeScene ()
    {
        console.log('changeScene called, switching to Game scene');
        if (this.logoTween)
        {
            this.logoTween.stop();
            this.logoTween = null;
        }

        this.scene.start('Game');
    }

    moveLogo (vueCallback: ({ x, y }: { x: number, y: number }) => void)
    {
        if (this.logoTween)
        {
            if (this.logoTween.isPlaying())
            {
                this.logoTween.pause();
            }
            else
            {
                this.logoTween.play();
            }
        } 
        else
        {
            this.logoTween = this.tweens.add({
                targets: this.logo,
                x: { value: 750, duration: 3000, ease: 'Back.easeInOut' },
                y: { value: 80, duration: 1500, ease: 'Sine.easeOut' },
                yoyo: true,
                repeat: -1,
                onUpdate: () => {
                    if (vueCallback)
                    {
                        vueCallback({
                            x: Math.floor(this.logo.x),
                            y: Math.floor(this.logo.y)
                        });
                    }
                }
            });
        }
    }
}
