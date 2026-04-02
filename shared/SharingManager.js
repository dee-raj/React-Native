import { Share, Platform } from 'react-native';

const APP_NAME = 'GameGroup';
const APP_MESSAGE = `🎮 ${APP_NAME} - 11 Fun Brain Games in One App!

Features:
• Tic Tac Toe, Memory Match, 2048, Sudoku
• Daily Challenges with streaks
• Sound effects
• Dark/Light theme

Play smarter, have fun! 🧠✨

Download from: https://play.google.com/store/apps/details?id=com.deeraj.GameGroup`;

export const shareApp = async () => {
    try {
        const result = await Share.share({
            message: APP_MESSAGE,
            title: `Share ${APP_NAME}`,
        });
        return result;
    } catch (error) {
        console.log('Error sharing app:', error);
    }
};

export const shareGameResult = async (gameName, score, additionalInfo = '') => {
    try {
        const message = `🎮 ${gameName} on ${APP_NAME}!\n\nScore: ${score}${additionalInfo ? '\n' + additionalInfo : ''}\n\nCan you beat me? Play now!`;
        
        await Share.share({
            message: message,
            title: `Share your ${gameName} result!`,
        });
    } catch (error) {
        console.log('Error sharing game result:', error);
    }
};

export const shareDailyChallenge = async (streak, completedGames, totalGames) => {
    try {
        const emoji = streak >= 7 ? '🔥' : streak >= 3 ? '⚡' : '✨';
        const message = `${emoji} Daily Challenge on ${APP_NAME}!\n\nCompleted ${completedGames}/${totalGames} games today!\n🔥 Current streak: ${streak} days\n\nCan you beat my streak? Play now!`;
        
        await Share.share({
            message: message,
            title: 'Share Daily Challenge!',
        });
    } catch (error) {
        console.log('Error sharing daily challenge:', error);
    }
};

export const shareLevelComplete = async (gameName, level, stars = 0) => {
    try {
        const starsStr = stars > 0 ? '⭐'.repeat(stars) : '';
        const message = `🎯 ${gameName} Complete!\n\nLevel: ${level}${starsStr}\n\nPlaying on ${APP_NAME} - 11 fun brain games!`;
        
        await Share.share({
            message: message,
            title: 'Share Level Complete!',
        });
    } catch (error) {
        console.log('Error sharing level complete:', error);
    }
};

export default {
    shareApp,
    shareGameResult,
    shareDailyChallenge,
    shareLevelComplete,
};