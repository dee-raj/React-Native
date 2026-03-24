export const ABACUS_CATEGORIES = [
    {
        id: 'addition',
        name: 'Addition',
        icon: 'add',
        colors: ['#48DBFB', '#2E86DE']
    },
    {
        id: 'subtraction',
        name: 'Subtraction',
        icon: 'minus',
        colors: ['#FF9F43', '#FF6B6B']
    },
    {
        id: 'multiplication',
        name: 'Multiplication',
        icon: 'star-of-life',
        colors: ['#1DD1A1', '#10AC84']
    },
    {
        id: 'division',
        name: 'Division',
        icon: 'divide',
        colors: ['#43FF8B', '#919104']
    },
    {
        id: 'hard',
        name: 'Hard Mode',
        icon: 'fire',
        colors: ['#6A5AE0', '#8E78FF']
    },
];

export const getLevelConfig = (category, level) => {
    // ✅ Base difficulty scaling
    const baseRange = Math.min(5 + level * 5, 200);
    const baseQuestions = Math.min(4 + level * 2, 50);
    const mode = level <= 8
        ? 'MCQ'
        : level <= 15
            ? (level % 2 === 0 ? 'MIXED' : 'MCQ')
            : 'INPUT';

    // ✅ Determine operations
    let operations = [];
    if (category === 'addition') operations = ['+'];
    else if (category === 'subtraction') operations = ['-'];
    else if (category === 'multiplication') operations = ['*'];
    else if (category === 'division') operations = ['/'];
    else operations = ['+', '-', '*', '/'];

    // ✅ Hard mode enhancement
    if (category === 'hard') {
        return {
            range: Math.min(baseRange * 2, 300),
            operations: ['+', '-', '*', '/'],
            mode: 'INPUT',
            questions: Math.min(baseQuestions + 10, 60),
        };
    }
    // ✅ Standard mode
    return {
        range: baseRange,
        operations,
        mode,
        questions: baseQuestions,
    };
};
