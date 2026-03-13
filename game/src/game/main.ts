import { Boot } from './scenes/Boot';
import { EventBus } from './EventBus';
import { GameOver } from './scenes/GameOver';
import { Game as MainGame } from './scenes/Game';
import { MainMenu } from './scenes/MainMenu';
import { AUTO, Game } from 'phaser';
import { Preloader } from './scenes/Preloader';

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    backgroundColor: '#028af8',
    scene: [
        Boot,
        Preloader,
        MainMenu,
        MainGame,
        GameOver
    ]
};

const DEBUG_OVERLAY_ID = 'debug-window-height-overlay';
const DEBUG_TEXT_ID    = 'debug-window-height-overlay-text';
const CHANGE_SCENE_BUTTON_ID = 'debug-window-height-overlay-change-scene';
const pointerState     = { x: 0, y: 0 };
let currentSceneWithChange: (Phaser.Scene & { changeScene?: () => void }) | null = null;

const createOrUpdateDebugOverlay = (parent: string) => {
    const parentElement = document.getElementById(parent) ?? document.body;
    let overlay         = document.getElementById(DEBUG_OVERLAY_ID);

    if (!overlay) {
        overlay                     = document.createElement('div');
        overlay.id                  = DEBUG_OVERLAY_ID;
        overlay.style.position      = 'fixed';
        overlay.style.top           = '8px';
        overlay.style.left          = '8px';
        overlay.style.zIndex        = '99999';
        overlay.style.pointerEvents = 'auto';
        overlay.style.display       = 'flex';
        overlay.style.flexDirection = 'column';
        overlay.style.gap           = '6px';
        overlay.style.padding       = '6px 8px';
        overlay.style.borderRadius  = '4px';
        overlay.style.background    = 'rgba(0, 0, 0, 0.55)';
        overlay.style.color         = '#00ff90';
        overlay.style.fontFamily    = 'monospace';
        overlay.style.fontSize      = '13px';

        const debugText                 = document.createElement('pre');
        debugText.id                    = DEBUG_TEXT_ID;
        debugText.style.margin          = '0';
        debugText.style.whiteSpace      = 'pre';
        debugText.style.pointerEvents   = 'none';
        overlay.appendChild(debugText);

        const changeSceneButton            = document.createElement('button');
        changeSceneButton.id               = CHANGE_SCENE_BUTTON_ID;
        changeSceneButton.textContent      = 'Change Scene';
        changeSceneButton.style.cursor     = 'pointer';
        changeSceneButton.style.fontFamily = 'inherit';
        changeSceneButton.style.fontSize   = '12px';
        changeSceneButton.style.padding    = '4px 8px';

        changeSceneButton.addEventListener('click', () => {
            if (currentSceneWithChange && typeof currentSceneWithChange.changeScene === 'function') {
                currentSceneWithChange.changeScene();
            }
        });

        overlay.appendChild(changeSceneButton);
        parentElement.appendChild(overlay);
    }

    const debugLinesData = [
        `window.innerHeight : ${window.innerHeight}px`,
        `window.innerWidth  : ${window.innerWidth}px`,
        `backgroundColor    : ${String(config.backgroundColor ?? 'N/A')}`,
        `mouseX             : ${Math.round(pointerState.x)}`,
        `mouseY             : ${Math.round(pointerState.y)}`,
        `sceneKey           : ${currentSceneWithChange?.scene.key ?? 'N/A'}`,
    ];

    const debugText = overlay.querySelector(`#${DEBUG_TEXT_ID}`);
    if (debugText) {
        debugText.textContent = debugLinesData.join('\n');
    }

    const changeSceneButton = overlay.querySelector(`#${CHANGE_SCENE_BUTTON_ID}`) as HTMLButtonElement | null;
    if (changeSceneButton) {
        changeSceneButton.disabled = !(currentSceneWithChange && typeof currentSceneWithChange.changeScene === 'function');
    }
};


const StartGame = (parent: string) => {
    const game = new Game({ ...config, parent });

    EventBus.on('current-scene-ready', (scene: Phaser.Scene) => {
        currentSceneWithChange = scene as Phaser.Scene & { changeScene?: () => void };
        createOrUpdateDebugOverlay(parent);
    });

    createOrUpdateDebugOverlay(parent);

    window.addEventListener('resize', () => {
        game.scale.resize(window.innerWidth, window.innerHeight);
        createOrUpdateDebugOverlay(parent);
    });

    window.addEventListener('pointermove', (event) => {
        pointerState.x = event.clientX;
        pointerState.y = event.clientY;
        createOrUpdateDebugOverlay(parent);
    });

    return game;
}

export default StartGame;
