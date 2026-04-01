import { useRef, useState, useEffect } from 'react';
import { IRefPhaserGame, PhaserGame } from './PhaserGame';
import { Overlay } from './Overlay';
import { MainMenu } from './game/scenes/MainMenu';
import { EventBus } from './game/EventBus';
import { SNAKE_ARENA_LEADERBOARD_EVENT, SNAKE_ARENA_STATS_EVENT, SnakeArenaLeaderboardEntry, SnakeArenaStats, loadSnakeArenaLeaderboard } from './game/utils/SnakeArena';
import { Common } from './game/utils/Common';

function App()
{
    // The sprite can only be moved in the MainMenu Scene
    const [canMoveSprite, setCanMoveSprite] = useState(true);
    const [currentSceneName, setCurrentSceneName] = useState('MainMenu');

    //  References to the PhaserGame component (game and scene are exposed)
    const phaserRef = useRef<IRefPhaserGame | null>(null);
    const followerSpriteRef = useRef<Phaser.GameObjects.Sprite | null>(null);
    const followerCleanupRef = useRef<(() => void) | null>(null);
    const [spritePosition, setSpritePosition] = useState({ x: 0, y: 0 });
    const [mouse, setMouse] = useState({ x: 0, y: 0 });
    const [ipAddress, setIpAddress] = useState('Loading...');
    const [deviceInfo, setDeviceInfo] = useState('');
    const [browserType, setBrowserType] = useState('');
    const [arenaStats, setArenaStats] = useState<SnakeArenaStats>({
        sceneName: 'MainMenu',
        length: 0,
        foodEaten: 0,
        aliveBots: 0,
        foodsOnMap: 0
    });
    const [leaderboard, setLeaderboard] = useState<SnakeArenaLeaderboardEntry[]>([]);
    // Debug info setup
    useEffect(() => {
        const handlePointerMove = (event: PointerEvent) => {
            setMouse({ x: event.clientX, y: event.clientY });
        };

        const handleArenaStats = (stats: SnakeArenaStats) => {
            setArenaStats(stats);
            setCurrentSceneName(stats.sceneName);
        };

        const handleLeaderboard = (entries: SnakeArenaLeaderboardEntry[]) => {
            setLeaderboard(entries);
        };

        window.addEventListener('pointermove', handlePointerMove);
        setDeviceInfo(Common.fnGetDeviceCharacteristics());
        setBrowserType(Common.fnGetBrowserType());
        Common.fnFetchPublicIpAddress().then(setIpAddress);
        setLeaderboard(loadSnakeArenaLeaderboard());
        EventBus.on(SNAKE_ARENA_STATS_EVENT, handleArenaStats);
        EventBus.on(SNAKE_ARENA_LEADERBOARD_EVENT, handleLeaderboard);

        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            EventBus.off(SNAKE_ARENA_STATS_EVENT, handleArenaStats);
            EventBus.off(SNAKE_ARENA_LEADERBOARD_EVENT, handleLeaderboard);
            if (followerCleanupRef.current)
            {
                followerCleanupRef.current();
                followerCleanupRef.current = null;
            }
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
                if (followerCleanupRef.current)
                {
                    followerCleanupRef.current();
                    followerCleanupRef.current = null;
                }

                if (followerSpriteRef.current && followerSpriteRef.current.active)
                {
                    followerSpriteRef.current.destroy();
                    followerSpriteRef.current = null;
                }

                const centerX = scene.scale.width * 0.5;
                const centerY = scene.scale.height * 0.5;
                const follower = scene.add.sprite(centerX, centerY, 'star').setDepth(200);

                const updateFollower = () => {
                    if (!follower.active)
                    {
                        return;
                    }

                    const pointer = scene.input.activePointer;
                    follower.x = Phaser.Math.Linear(follower.x, pointer.worldX, 0.08);
                    follower.y = Phaser.Math.Linear(follower.y, pointer.worldY, 0.08);
                };

                scene.events.on('update', updateFollower);

                followerCleanupRef.current = () => {
                    scene.events.off('update', updateFollower);
                };

                followerSpriteRef.current = follower;
            }
        }
    }

    // Event emitted from the PhaserGame component
    const currentScene = (scene: Phaser.Scene) => {

        if (followerCleanupRef.current)
        {
            followerCleanupRef.current();
            followerCleanupRef.current = null;
        }

        followerSpriteRef.current = null;

        setCurrentSceneName(scene.scene.key);
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
                    currentScene            : {currentSceneName}<br/>
                    playerLength            : {arenaStats.length}<br/>
                    foodEaten               : {arenaStats.foodEaten}<br/>
                    aliveBots               : {arenaStats.aliveBots}<br/>
                    foodsOnMap              : {arenaStats.foodsOnMap}<br/>
                    bestLength              : {leaderboard[0]?.length ?? 0}<br/>
                
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
