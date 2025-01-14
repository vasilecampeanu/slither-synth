import React from "react";
import { SnakeGame } from "./styles/SnakeGame";

export const App: React.FC = () => {
    const handleGameStateUpdate = (gameState: any) => {
        console.log("Game State:", gameState);
    };

    return (
        <div>
            <h1>Snake Game</h1>
            <SnakeGame
                width={400}
                height={400}
                gridSize={20}
                onGameStateUpdate={handleGameStateUpdate}
            />
        </div>
    );
};
