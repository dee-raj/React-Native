import { five_char_words } from "./words";

let cached_date = new Date();
let cached_idx = -1;

/**
 * A simple, lightweight string-seeded pseudorandom number generator (PRNG).
 * Returns a function that produces floats in the range [0, 1).
 */
const seedrandom = (seed) => {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < seed.length; i++) {
        h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
    }
    let a = h >>> 0;
    return function() {
        a = (a + 0x7ed55d16) + (a << 12);
        a = (a ^ 0xc761c23c) ^ (a >>> 19);
        a = (a + 0x165667b1) + (a << 5);
        a = (a + 0xd3a2646c) ^ (a << 9);
        a = (a + 0xfd7046c5) + (a << 3);
        a = (a ^ 0xb55a4f09) ^ (a >>> 16);
        return (a >>> 0) / 4294967296;
    };
};

/**
 * Determines the number of days a specific `Date` has been since 01/01/2000.
 * @param date The `Date` in question
 * @returns The number of days `date` has been since 01/01/2000.
 */
const getDayDiff = (date) => {
    return Math.floor(
        (date.valueOf() - new Date(2000, 0, 0).valueOf()) / (1000 * 60 * 60 * 24)
    );
};

/**
 * Determines whether a specific Date is the same as our currently cached date.
 * For our purpose, a Date is the same if the day, month, and full year match.
 * @param date The Date in question.
 * @returns Whether or not a Date's day, month, and full year match the cached date.
 */
const isSameDate = (date) => {
    return (
        date.getDate() === cached_date.getDate() &&
        date.getMonth() === cached_date.getMonth() &&
        date.getFullYear() === cached_date.getFullYear()
    );
};

/**
 * Checks to see if a character is present within a word.
 *
 * @param guess The character in question
 * @param ans The word we are looking to find the character in
 * @returns Whether or not guess is present in ans.
 */
const isCharInWord = (guess, ans) => {
    for (let i = 0; i < ans.length; i++) {
        if (guess === ans[i]) {
            return true;
        }
    }
    return false;
};

/**
 * Based on the current day of the year, returns a pseudorandom word from our word bank.
 *
 * @returns The "word of the day" -- which is a pseudorandomly selected word.
 */
const getWordOfTheDay = () => {
    const date = new Date();

    if (isSameDate(date) && cached_idx !== -1) {
        return five_char_words[cached_idx];
    }

    cached_date = date; // Cache the date
    const rng = seedrandom(getDayDiff(date).toString());
    let idx = Math.floor(rng() * five_char_words.length);
    cached_idx = idx; // Cache the index.
    return five_char_words[idx];
};
export { getWordOfTheDay, getDayDiff as getDayOfYear, isCharInWord };

