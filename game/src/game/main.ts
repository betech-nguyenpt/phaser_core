import { Boot } from './scenes/Boot';
import { GameOver } from './scenes/GameOver';
import { Game as MainGame } from './scenes/Game';
import { MainMenu } from './scenes/MainMenu';
import { AUTO, Game } from 'phaser';
import { Preloader } from './scenes/Preloader';
import { Common } from './utils/Common';

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

const pointerState              = { x: 0, y: 0 };
var debugData: {[key: string]: string} = {
    'backgroundColor': String(config.backgroundColor ?? 'N/A'),
    'mouseX': String(Math.round(pointerState.x)),
    'mouseY': String(Math.round(pointerState.y)),
    'ipAddress': 'Loading...',
    'browserType': 'Unknown',
    'deviceInfo': 'Unknown',
    'nodeVersion': '',
    'phaserVersion': '',
}


const StartGame = (parent: string) => {
    const game = new Game({ ...config, parent });

    debugData.browserType = Common.fnGetBrowserType();
    debugData.deviceInfo = Common.fnGetDeviceCharacteristics();
    Common.fnOverlay(parent, debugData);

    void Common.fnFetchPublicIpAddress().then((ipAddress) => {
        debugData.ipAddress = ipAddress;
        Common.fnOverlay(parent, debugData);
    });

    window.addEventListener('resize', () => {
        game.scale.resize(window.innerWidth, window.innerHeight);
        Common.fnOverlay(parent, debugData);
    });

    window.addEventListener('pointermove', (event) => {
        pointerState.x = event.clientX;
        pointerState.y = event.clientY;
        debugData.mouseX = String(Math.round(pointerState.x));
        debugData.mouseY = String(Math.round(pointerState.y));
        Common.fnOverlay(parent, debugData);
    });

    return game;
}

export default StartGame;
