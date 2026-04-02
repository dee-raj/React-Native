import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = '@game_group_settings';

class SoundManager {
    constructor() {
        this.currentPlayer = null;
        this.enabled = true;
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;

        try {
            await setAudioModeAsync({
                playsInSilentMode: true,
                shouldPlayInBackground: false,
            });

            const saved = await AsyncStorage.getItem(SETTINGS_KEY);
            if (saved) {
                const settings = JSON.parse(saved);
                this.enabled = settings.sound ?? true;
            }

            this.initialized = true;
        } catch (error) {
            console.log('SoundManager init error:', error.message);
            this.initialized = true;
        }
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.stopAll();
        }
    }

    async play(soundType) {
        if (!this.enabled || !this.initialized) return;

        try {
            if (this.currentPlayer) {
                try {
                    this.currentPlayer.stop();
                } catch (e) {}
            }

            const soundUri = this.getSoundUri(soundType);
            if (!soundUri) return;

            this.currentPlayer = createAudioPlayer(soundUri);
            await this.currentPlayer.play();
        } catch (error) {
            console.log('SoundManager play error:', error.message);
        }
    }

    async stopAll() {
        try {
            if (this.currentPlayer) {
                try {
                    await this.currentPlayer.stop();
                } catch (e) {}
                this.currentPlayer = null;
            }
        } catch (error) {
            console.log('SoundManager stopAll error:', error);
        }
    }

    getSoundUri(type) {
        const soundMap = {
            tap: require('../assets/sounds/tap.wav'),
            correct: require('../assets/sounds/correct.wav'),
            wrong: require('../assets/sounds/wrong.wav'),
            win: require('../assets/sounds/win.wav'),
            'level-up': require('../assets/sounds/level-up.wav'),
            shuffle: require('../assets/sounds/shuffle.wav'),
            click: require('../assets/sounds/click.wav'),
            flip: require('../assets/sounds/flip.wav'),
            match: require('../assets/sounds/match.wav'),
            mismatch: require('../assets/sounds/mismatch.wav'),
            move: require('../assets/sounds/move.wav'),
            merge: require('../assets/sounds/merge.wav'),
            connect: require('../assets/sounds/connect.wav'),
            error: require('../assets/sounds/error.wav'),
            hint: require('../assets/sounds/hint.wav'),
            slide: require('../assets/sounds/slide.wav'),
        };
        
        return soundMap[type] || null;
    }

    async playTap() { await this.play('tap'); }
    async playCorrect() { await this.play('correct'); }
    async playWrong() { await this.play('wrong'); }
    async playWin() { await this.play('win'); }
    async playLevelUp() { await this.play('level-up'); }
    async playShuffle() { await this.play('shuffle'); }
    async playClick() { await this.play('click'); }
    async playFlip() { await this.play('flip'); }
    async playMatch() { await this.play('match'); }
    async playMismatch() { await this.play('mismatch'); }
    async playMove() { await this.play('move'); }
    async playMerge() { await this.play('merge'); }
    async playConnect() { await this.play('connect'); }
    async playError() { await this.play('error'); }
    async playHint() { await this.play('hint'); }
    async playSlide() { await this.play('slide'); }
}

const soundManager = new SoundManager();

export default soundManager;