import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import GamesHome from '../games/GamesHome';
import TicTacToeScreen from '../games/TicTacToe/TicTacToeScreen';
import LevelSelectionScreen from '../games/MemoryGame/LevelSelectionScreen';
import MemoryGameScreen from '../games/MemoryGame/MemoryGameScreen';
import Game2048Screen from '../games/Game2048/Game2048Screen';
import OnetLevelSelectionScreen from '../games/OnetMaster/OnetLevelSelectionScreen';
import OnetMasterScreen from '../games/OnetMaster/OnetMasterScreen';
import SlidingPuzzleLevelSelectionScreen from '../games/SlidingPuzzle/SlidingPuzzleLevelSelectionScreen';
import SlidingPuzzleScreen from '../games/SlidingPuzzle/SlidingPuzzleScreen';
import FlowLevelSelectionScreen from '../games/FlowPipes/FlowLevelSelectionScreen';
import FlowGameScreen from '../games/FlowPipes/FlowGameScreen';
import AbacusCategoryScreen from '../games/Abacus/AbacusCategoryScreen';
import AbacusLevelSelectionScreen from '../games/Abacus/AbacusLevelSelectionScreen';
import AbacusGameScreen from '../games/Abacus/AbacusGameScreen';
import SpeakAndLearnScreen from '../games/SpeakAndLearn/SpeakAndLearnScreen';


const Stack = createStackNavigator();

const GameStack = () => {
    return (
        <Stack.Navigator
            initialRouteName="GamesHome"
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#784575',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
                headerTitleAlign: 'center',
                gestureEnabled: false,
                gestureDirection: 'horizontal',
                headerShown: false,
            }}
        >
            <Stack.Screen
                name="GamesHome"
                component={GamesHome}
            />
            <Stack.Screen
                name="TicTacToe"
                component={TicTacToeScreen}
                options={{ title: 'Tic Tac Toe' }}
            />
            <Stack.Screen
                name="MemoryLevelSelection"
                component={LevelSelectionScreen}
                options={{ title: 'Select Level' }}
            />
            <Stack.Screen
                name="MemoryGame"
                component={MemoryGameScreen}
                options={{ title: 'Memory Match' }}
            />
            <Stack.Screen
                name="Game2048"
                component={Game2048Screen}
                options={{ title: '2048' }}
            />
            <Stack.Screen
                name="OnetLevelSelection"
                component={OnetLevelSelectionScreen}
                options={{ title: 'Onet Level Selection' }}
            />
            <Stack.Screen
                name="OnetMaster"
                component={OnetMasterScreen}
                options={{ title: 'Onet Master' }}
            />
            <Stack.Screen
                name="SlidingPuzzleLevelSelection"
                component={SlidingPuzzleLevelSelectionScreen}
                options={{ title: 'Sliding Puzzle Levels' }}
            />
            <Stack.Screen
                name="SlidingPuzzle"
                component={SlidingPuzzleScreen}
                options={{ title: 'Sliding Puzzle' }}
            />
            <Stack.Screen
                name="FlowLevelSelection"
                component={FlowLevelSelectionScreen}
                options={{ title: 'Flow Pipes Levels' }}
            />
            <Stack.Screen
                name="FlowGame"
                component={FlowGameScreen}
                options={{ title: 'Flow Pipes' }}
            />
            <Stack.Screen
                name="AbacusCategory"
                component={AbacusCategoryScreen}
                options={{ title: 'Choose Category' }}
            />
            <Stack.Screen
                name="AbacusLevelSelection"
                component={AbacusLevelSelectionScreen}
                options={{ title: 'Abacus Levels' }}
            />
            <Stack.Screen
                name="AbacusGame"
                component={AbacusGameScreen}
                options={{ title: 'Abacus Math' }}
            />
            <Stack.Screen
                name="SpeakAndLearn"
                component={SpeakAndLearnScreen}
                options={{ title: 'Speak & Learn', headerShown: false }}
            />

        </Stack.Navigator>
    );
};

export default GameStack;
