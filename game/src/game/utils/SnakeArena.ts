export const SNAKE_ARENA_STATS_EVENT = 'snake-arena-stats';
export const SNAKE_ARENA_LEADERBOARD_EVENT = 'snake-arena-leaderboard';
export const MAX_LEADERBOARD_ENTRIES = 5;
export const SNAKE_ARENA_LEADERBOARD_STORAGE_KEY = 'phaser-core-snake-arena-leaderboard';

export interface SnakeArenaStats
{
    sceneName: string;
    length: number;
    foodEaten: number;
    aliveBots: number;
    foodsOnMap: number;
}

export interface SnakeArenaLeaderboardEntry
{
    length: number;
    foodEaten: number;
    reason: string;
    achievedAt: number;
}

function isBrowserAvailable (): boolean
{
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function normalizeLeaderboardEntry (entry: Partial<SnakeArenaLeaderboardEntry>): SnakeArenaLeaderboardEntry | null
{
    if (typeof entry.length !== 'number' || typeof entry.foodEaten !== 'number' || typeof entry.reason !== 'string' || typeof entry.achievedAt !== 'number')
    {
        return null;
    }

    return {
        length: Math.max(0, Math.round(entry.length)),
        foodEaten: Math.max(0, Math.round(entry.foodEaten)),
        reason: entry.reason,
        achievedAt: entry.achievedAt
    };
}

export function loadSnakeArenaLeaderboard (): SnakeArenaLeaderboardEntry[]
{
    if (!isBrowserAvailable())
    {
        return [];
    }

    try
    {
        const rawData = window.localStorage.getItem(SNAKE_ARENA_LEADERBOARD_STORAGE_KEY);
        if (!rawData)
        {
            return [];
        }

        const parsedData = JSON.parse(rawData) as Partial<SnakeArenaLeaderboardEntry>[];
        if (!Array.isArray(parsedData))
        {
            return [];
        }

        return parsedData
            .map(normalizeLeaderboardEntry)
            .filter((entry): entry is SnakeArenaLeaderboardEntry => entry !== null)
            .sort((left, right) => right.length - left.length || right.foodEaten - left.foodEaten || left.achievedAt - right.achievedAt)
            .slice(0, MAX_LEADERBOARD_ENTRIES);
    }
    catch
    {
        return [];
    }
}

export function recordSnakeArenaLeaderboardEntry (entry: Omit<SnakeArenaLeaderboardEntry, 'achievedAt'> & { achievedAt?: number }): SnakeArenaLeaderboardEntry[]
{
    const normalizedEntry = normalizeLeaderboardEntry({
        ...entry,
        achievedAt: entry.achievedAt ?? Date.now()
    });

    if (!normalizedEntry)
    {
        return loadSnakeArenaLeaderboard();
    }

    const nextLeaderboard = [...loadSnakeArenaLeaderboard(), normalizedEntry]
        .sort((left, right) => right.length - left.length || right.foodEaten - left.foodEaten || left.achievedAt - right.achievedAt)
        .slice(0, MAX_LEADERBOARD_ENTRIES);

    if (isBrowserAvailable())
    {
        try
        {
            window.localStorage.setItem(SNAKE_ARENA_LEADERBOARD_STORAGE_KEY, JSON.stringify(nextLeaderboard));
        }
        catch
        {
            return nextLeaderboard;
        }
    }

    return nextLeaderboard;
}