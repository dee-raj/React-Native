export const STORAGE_KEY = '@cryptogram_progress';

const QUOTES = {
    easy: [
        { text: 'KNOWLEDGE IS POWER', author: 'Francis Bacon' },
        { text: 'DREAM BIG AND DARE TO FAIL', author: 'Norman Vaughan' },
        { text: 'SIMPLICITY IS THE ULTIMATE SOPHISTICATION', author: 'Leonardo da Vinci' },
        { text: 'BE THE CHANGE YOU WISH TO SEE IN THE WORLD', author: 'Mahatma Gandhi' },
        { text: 'IN THE MIDDLE OF DIFFICULTY LIES OPPORTUNITY', author: 'Albert Einstein' },
        { text: 'ACT AS IF WHAT YOU DO MAKES A DIFFERENCE IT DOES', author: 'William James' },
        { text: 'THE ONLY WAY TO DO GREAT WORK IS TO LOVE WHAT YOU DO', author: 'Steve Jobs' },
        { text: 'LIFE IS WHAT HAPPENS WHEN YOU ARE BUSY MAKING OTHER PLANS', author: 'John Lennon' },
    ],
    classic: [
        { text: 'BELIEVE YOU CAN AND YOU ARE HALFWAY THERE', author: 'Theodore Roosevelt' },
        { text: 'THE FUTURE BELONGS TO THOSE WHO BELIEVE IN THE BEAUTY OF THEIR DREAMS', author: 'Eleanor Roosevelt' },
        { text: 'THE GREATEST GLORY IN LIVING LIES NOT IN NEVER FALLING BUT IN RISING EVERY TIME WE FALL', author: 'Nelson Mandela' },
        { text: 'IT IS DURING OUR DARKEST MOMENTS THAT WE MUST FOCUS TO SEE THE LIGHT', author: 'Aristotle' },
        { text: 'THE ONLY IMPOSSIBLE JOURNEY IS THE ONE YOU NEVER BEGIN', author: 'Tony Robbins' },
        { text: 'SUCCESS IS NOT FINAL FAILURE IS NOT FATAL IT IS THE COURAGE TO CONTINUE THAT COUNTS', author: 'Winston Churchill' },
        { text: 'IN THE END IT IS NOT THE YEARS IN YOUR LIFE THAT COUNT IT IS THE LIFE IN YOUR YEARS', author: 'Abraham Lincoln' },
        { text: 'THE WAY TO GET STARTED IS TO QUIT TALKING AND BEGIN DOING', author: 'Walt Disney' },
    ],
    hard: [
        { text: 'TWO THINGS ARE INFINITE THE UNIVERSE AND HUMAN STUPIDITY AND I AM NOT SURE ABOUT THE UNIVERSE', author: 'Albert Einstein' },
        { text: 'HERE IS MY SECRET IT IS VERY SIMPLE IT IS ONLY WITH THE HEART THAT ONE CAN SEE RIGHTLY WHAT IS ESSENTIAL IS INVISIBLE TO THE EYE', author: 'Antoine de Saint Exupery' },
        { text: 'THE INDIVIDUAL HAS ALWAYS HAD TO STRUGGLE TO KEEP FROM BEING OVERWHELMED BY THE TRIBE IF YOU TRY IT YOU WILL BE LONELY OFTEN AND SOMETIMEN FRIGHTENED BUT NO PRICE IS TOO HIGH TO PAY FOR THE PRIVILEGE OF OWNING YOURSELF', author: 'Friedrich Nietzsche' },
        { text: 'THE ONLY TRUE WISDOM IS IN KNOWING YOU KNOW NOTHING', author: 'Socrates' },
        { text: 'TO BE YOURSELF IN A WORLD THAT IS CONSTANTLY TRYING TO MAKE YOU SOMETHING ELSE IS THE GREATEST ACCOMPLISHMENT', author: 'Ralph Waldo Emerson' },
        { text: 'DO NOT GO WHERE THE PATH MAY LEAD GO INSTEAD WHERE THERE IS NO PATH AND LEAVE A TRAIL', author: 'Ralph Waldo Emerson' },
        { text: 'I HAVE NOT FAILED I HAVE JUST FOUND TEN THOUSAND WAYS THAT WILL NOT WORK', author: 'Thomas Edison' },
        { text: 'IT IS NOT THE CRITIC WHO COUNTS NOT THE MAN WHO POINTS OUT HOW THE STRONG MAN STUMBLES THE CREDIT BELONGS TO THE MAN WHO IS ACTUALLY IN THE ARENA WHOSE FACE IS MARRED BY DUST AND SWEAT AND BLOOD', author: 'Theodore Roosevelt' },
    ],
};

const DIFFICULTY_CONFIG = {
    easy: { label: 'Easy', color: '#10B981', levels: 8, lives: 5, hints: 3 },
    classic: { label: 'Classic', color: '#F59E0B', levels: 8, lives: 4, hints: 2 },
    hard: { label: 'Hard', color: '#EF4444', levels: 8, lives: 3, hints: 1 },
};

const seededShuffle = (seed) => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    let s = seed;
    for (let i = letters.length - 1; i > 0; i--) {
        s = (s * 9301 + 49297) % 233280;
        const j = Math.floor((s / 233280) * (i + 1));
        [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    return letters;
};

const generateCipher = (difficulty, levelIndex) => {
    const seed = difficulty.length * 1000 + levelIndex * 137 + 42;
    const shuffled = seededShuffle(seed);
    const plain = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const map = {};
    for (let i = 0; i < 26; i++) {
        map[plain[i]] = shuffled[i];
    }
    return map;
};

const encodeQuote = (text, cipherMap) => {
    return text.split('').map(ch => {
        if (cipherMap[ch]) return cipherMap[ch];
        return ch;
    }).join('');
};

export const getDifficultyList = () => {
    return Object.entries(DIFFICULTY_CONFIG).map(([key, config]) => ({
        id: key,
        ...config,
    }));
};

export const getCryptogramLevels = (difficulty) => {
    const config = DIFFICULTY_CONFIG[difficulty];
    if (!config) return [];
    return Array.from({ length: config.levels }, (_, i) => ({
        level: i + 1,
        index: i,
        difficulty,
        label: `${config.label} ${i + 1}`,
    }));
};

export const getTotalLevels = (difficulty) => {
    return DIFFICULTY_CONFIG[difficulty]?.levels || 0;
};

export const getLevelData = (difficulty, levelIndex) => {
    const quotes = QUOTES[difficulty];
    if (!quotes || !quotes[levelIndex]) return null;

    const quote = quotes[levelIndex];
    const cipherMap = generateCipher(difficulty, levelIndex);
    const encoded = encodeQuote(quote.text, cipherMap);
    const config = DIFFICULTY_CONFIG[difficulty];

    const uniqueLetters = new Set();
    for (const ch of quote.text) {
        if (ch >= 'A' && ch <= 'Z') uniqueLetters.add(ch);
    }

    return {
        original: quote.text,
        author: quote.author,
        encoded,
        cipherMap,
        uniqueLetters: Array.from(uniqueLetters).sort(),
        difficulty,
        levelIndex,
        lives: config.lives,
        maxHints: config.hints,
    };
};

export const getHintsRemaining = (difficulty) => {
    return DIFFICULTY_CONFIG[difficulty]?.hints || 1;
};
