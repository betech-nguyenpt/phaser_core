import { useRef, useState, useEffect } from 'react';
import { IRefPhaserGame, PhaserGame } from './PhaserGame';
import { Overlay } from './Overlay';
import { MainMenu } from './game/scenes/MainMenu';
import { Common } from './game/utils/Common';

function App()
{
    // The sprite can only be moved in the MainMenu Scene
    const [canMoveSprite, setCanMoveSprite] = useState(true);

    //  References to the PhaserGame component (game and scene are exposed)
    const phaserRef = useRef<IRefPhaserGame | null>(null);
    const [spritePosition, setSpritePosition] = useState({ x: 0, y: 0 });
    const [mouse, setMouse] = useState({ x: 0, y: 0 });
    const [ipAddress, setIpAddress] = useState('Loading...');
    const [deviceInfo, setDeviceInfo] = useState('');
    const [browserType, setBrowserType] = useState('');
    // Debug info setup
    useEffect(() => {
        const handlePointerMove = (event: PointerEvent) => {
            setMouse({ x: event.clientX, y: event.clientY });
        };
        window.addEventListener('pointermove', handlePointerMove);
        setDeviceInfo(Common.fnGetDeviceCharacteristics());
        setBrowserType(Common.fnGetBrowserType());
        Common.fnFetchPublicIpAddress().then(setIpAddress);
        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
        };
    }, []);

    const changeScene = () => {

        if (phaserRef.current)
        {     
            const scene = phaserRef.current.scene as MainMenu;
            
            if (scene)
            {
                scene.changeScene();
            }
        }
    }

    const moveSprite = () => {

        if (phaserRef.current)
        {

            const scene = phaserRef.current.scene as MainMenu;

            if (scene && scene.scene.key === 'MainMenu')
            {
                // Get the update logo position
                scene.moveLogo(({ x, y }) => {

                    setSpritePosition({ x, y });

                });
            }
        }

    }

    const addSprite = () => {

        if (phaserRef.current)
        {
            const scene = phaserRef.current.scene;

            if (scene)
            {
                // Add more stars
                const x = Phaser.Math.Between(64, scene.scale.width - 64);
                const y = Phaser.Math.Between(64, scene.scale.height - 64);
    
                //  `add.sprite` is a Phaser GameObjectFactory method and it returns a Sprite Game Object instance
                const star = scene.add.sprite(x, y, 'star');
    
                //  ... which you can then act upon. Here we create a Phaser Tween to fade the star sprite in and out.
                //  You could, of course, do this from within the Phaser Scene code, but this is just an example
                //  showing that Phaser objects and systems can be acted upon from outside of Phaser itself.
                scene.add.tween({
                    targets: star,
                    duration: 500 + Math.random() * 1000,
                    alpha: 0,
                    yoyo: true,
                    repeat: -1
                });
            }
        }
    }

    // Event emitted from the PhaserGame component
    const currentScene = (scene: Phaser.Scene) => {

        setCanMoveSprite(scene.scene.key !== 'MainMenu');
        
    }

    return (
        <div id="app">
            <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />
            <Overlay>
                <button className="button" onClick={changeScene}>Change Scene</button>
                <div>
                    <button disabled={canMoveSprite} className="button" onClick={moveSprite}>Toggle Movement</button>
                </div>
                <div>
                    <button className="button" onClick={addSprite}>Add New Sprite</button>
                </div>
                <div style={{ marginTop: 8 }}>
                    window.innerHeight      : {`${Common.fnGetWindowHeight()}`}px<br/>
                    window.innerWidth       : {`${Common.fnGetWindowWidth()}`}px<br/>
                    spritePosX              : {`${spritePosition.x}`}<br/>
                    spritePosY              : {`${spritePosition.y}`}<br/>
                
                    <div>mouseX : {mouse.x}</div>
                    <div>mouseY : {mouse.y}</div>
                    <div>ipAddress : {ipAddress}</div>
                    <div>deviceInfo : <pre style={{ display: 'inline', margin: 0 }}>{deviceInfo}</pre></div>
                    <div>browserType : {browserType}</div>
                </div>
            </Overlay>
        </div>
    )
}

export default App
