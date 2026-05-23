import { getWordOfTheDay } from "./utils";

/**
 * Robust standard Wordle scoring algorithm.
 * Handles duplicate letters perfectly (prioritizes correct index matches first,
 * then maps present misplaced letters from left to right up to the occurrence count of the target,
 * and marks the rest as absent).
 *
 * @param {string} guess - The 5-letter guessed word
 * @param {string} target - The 5-letter target word
 * @returns {Array<{char: string, status: 'correct' | 'present' | 'absent'}>}
 */
export const scoreGuess = (guess, target) => {
    const guessChars = guess?.toLowerCase()?.split('');
    const targetChars = target?.toLowerCase()?.split('');
    const results = Array(5).fill(null);

    // Track which target characters and guess characters have been matched
    const targetMatched = Array(5).fill(false);
    const guessMatched = Array(5).fill(false);

    // First pass: Find exact matches (correct index) -> 'correct' (Green)
    for (let i = 0; i < 5; i++) {
        if (guessChars[i] === targetChars[i]) {
            results[i] = {
                char: guessChars[i],
                status: 'correct'
            };
            targetMatched[i] = true;
            guessMatched[i] = true;
        }
    }

    // Second pass: Find misplaced letters -> 'present' (Yellow) or 'absent' (Gray)
    for (let i = 0; i < 5; i++) {
        if (guessMatched[i]) continue;

        let found = false;
        for (let j = 0; j < 5; j++) {
            if (!targetMatched[j] && guessChars[i] === targetChars[j]) {
                results[i] = {
                    char: guessChars[i],
                    status: 'present'
                };
                targetMatched[j] = true;
                found = true;
                break;
            }
        }

        if (!found) {
            results[i] = {
                char: guessChars[i],
                status: 'absent'
            };
        }
    }

    return results;
};

/**
 * Checks if guess is correct and returns scoring info.
 */
export const isCorrectGuess = (guess) => {
    if (!guess || guess.length !== 5) {
        return { error: `Only 5 character words currently supported.` };
    }
    const target = getWordOfTheDay();
    const isCorrect = guess?.toLowerCase() === target?.toLowerCase();
    const scored = scoreGuess(guess, target);

    return {
        guess: guess?.toLowerCase(),
        was_correct: isCorrect,
        character_info: scored.map(cell => ({
            char: cell.char,
            scoring: {
                in_word: cell.status !== 'absent',
                correct_idx: cell.status === 'correct'
            }
        }))
    };
};

