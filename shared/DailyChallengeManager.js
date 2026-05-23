import AsyncStorage from '@react-native-async-storage/async-storage';

const DAILY_CHALLENGE_KEY = '@daily_challenge_data';

const GAMES_CONFIG = {
    'tic-tac-toe': {
        key: 'tic-tac-toe',
        name: 'Tic Tac Toe',
        route: 'TicTacToe',
        icon: 'game-controller',
        iconFamily: 'Ionicons',
        color: '#FF6B6B',
        description: 'Classic X/O game',
    },
    'memory': {
        key: 'memory',
        name: 'Memory Match',
        route: 'MemoryLevelSelection',
        icon: 'bulb',
        iconFamily: 'Ionicons',
        color: '#4D96FF',
        description: 'Match pairs of cards',
    },
    '2048': {
        key: '2048',
        name: '2048',
        route: 'Game2048',
        icon: 'grid',
        iconFamily: 'Ionicons',
        color: '#FFD93D',
        description: 'Reach 2048 tiles',
    },
    'onet': {
        key: 'onet',
        name: 'Onet Master',
        route: 'OnetLevelSelection',
        icon: 'link',
        iconFamily: 'Ionicons',
        color: '#A66CFF',
        description: 'Connect matching tiles',
    },
    'sliding': {
        key: 'sliding',
        name: 'Sliding Puzzle',
        route: 'SlidingPuzzleLevelSelection',
        icon: 'move',
        iconFamily: 'Ionicons',
        color: '#09583f',
        description: 'Order the tiles',
    },
    'flow': {
        key: 'flow',
        name: 'Flow Pipes',
        route: 'FlowLevelSelection',
        icon: 'git-branch',
        iconFamily: 'Ionicons',
        color: '#38c206',
        description: 'Connect all pipes',
    },
    'abacus': {
        key: 'abacus',
        name: 'Abacus Math',
        route: 'AbacusCategory',
        icon: 'calculator',
        iconFamily: 'Ionicons',
        color: '#FF851B',
        description: 'Math operations',
    },
    'sudoku': {
        key: 'sudoku',
        name: 'Sudoku',
        route: 'SudokuLevelSelection',
        icon: 'grid-outline',
        iconFamily: 'Ionicons',
        color: '#39CCCC',
        description: 'Number puzzle',
    },
    'cryptogram': {
        key: 'cryptogram',
        name: 'Cryptogram',
        route: 'CryptogramLevelSelection',
        icon: 'key',
        iconFamily: 'Ionicons',
        color: '#85144b',
        description: 'Decode the secret',
    },
    'shape-tap': {
        key: 'shape-tap',
        name: 'Shape Tap',
        route: 'ShapeTap',
        icon: 'shapes',
        iconFamily: 'Ionicons',
        color: '#01FF70',
        description: 'Tap the shapes',
    },
    'wordle': {
        key: 'wordle',
        name: 'Wordle',
        route: 'Wordle',
        icon: 'text-outline',
        iconFamily: 'Ionicons',
        color: '#10B981',
        description: 'Guess the 5-letter word',
    },
};

class DailyChallengeManager {
    constructor() {
        this.games = Object.values(GAMES_CONFIG);
    }

    getDateString(date = new Date()) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    async loadData() {
        try {
            const saved = await AsyncStorage.getItem(DAILY_CHALLENGE_KEY);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.log('DailyChallengeManager loadData error:', error);
        }
        return { games: {}, todayCompleted: [] };
    }

    async saveData(data) {
        try {
            await AsyncStorage.setItem(DAILY_CHALLENGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.log('DailyChallengeManager saveData error:', error);
        }
    }

    getAllGames() {
        return this.games;
    }

    async getGameStatus(gameKey) {
        const data = await this.loadData();
        const gameData = data.games?.[gameKey] || { streak: 0, lastCompleted: null, totalCompleted: 0 };
        const todayCompleted = data.todayCompleted || [];

        return {
            streak: gameData.streak || 0,
            lastCompleted: gameData.lastCompleted,
            totalCompleted: gameData.totalCompleted || 0,
            completedToday: todayCompleted.includes(gameKey),
        };
    }

    async getAllGamesWithStatus() {
        const data = await this.loadData();
        const todayCompleted = data.todayCompleted || [];
        const gamesData = data.games || {};

        return this.games.map(game => {
            const gameData = gamesData[game.key] || { streak: 0, lastCompleted: null, totalCompleted: 0 };
            return {
                ...game,
                streak: gameData.streak || 0,
                lastCompleted: gameData.lastCompleted,
                totalCompleted: gameData.totalCompleted || 0,
                completedToday: todayCompleted.includes(game.key),
            };
        });
    }

    async getTodayProgress() {
        const data = await this.loadData();
        const todayCompleted = data.todayCompleted || [];

        return {
            completed: todayCompleted,
            remaining: this.games.filter(g => !todayCompleted.includes(g.key)).map(g => g.key),
            completedCount: todayCompleted.length,
            totalCount: this.games.length,
        };
    }

    async completeGame(gameKey) {
        const today = this.getDateString();
        const data = await this.loadData();

        if (!data.games) data.games = {};
        if (!data.todayCompleted) data.todayCompleted = [];

        const gameData = data.games[gameKey] || { streak: 0, lastCompleted: null, totalCompleted: 0 };

        let newStreak = 1;
        if (gameData.lastCompleted) {
            const lastDate = new Date(gameData.lastCompleted);
            const todayDate = new Date(today);
            const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                newStreak = (gameData.streak || 0) + 1;
            } else if (diffDays === 0) {
                newStreak = gameData.streak || 1;
            }
        }

        if (!data.todayCompleted.includes(gameKey)) {
            data.todayCompleted.push(gameKey);
        }

        data.games[gameKey] = {
            streak: newStreak,
            lastCompleted: today,
            totalCompleted: (gameData.totalCompleted || 0) + 1,
        };

        await this.saveData(data);

        return {
            success: true,
            streak: newStreak,
            isFirstCompletionToday: data.todayCompleted.length === 1,
        };
    }

    async getOverallStats() {
        const data = await this.loadData();
        const gamesData = data.games || {};

        let totalCompletions = 0;
        let maxStreak = 0;

        Object.values(gamesData).forEach(gameData => {
            totalCompletions += gameData.totalCompleted || 0;
            if ((gameData.streak || 0) > maxStreak) {
                maxStreak = gameData.streak || 0;
            }
        });

        return {
            totalCompletions,
            maxStreak,
            gamesPlayed: Object.keys(gamesData).length,
        };
    }
}

const dailyChallengeManager = new DailyChallengeManager();

export default dailyChallengeManager;
