import React, { useEffect, useRef, useState, useCallback } from "react";

interface Coordinate {
    x: number;
    y: number;
}

export interface SnakeGameProps {
    width?: number;
    height?: number;
    gridSize?: number;
    /**
     * Called whenever the game state updates, e.g. each tick.
     * You might use this to export the state to an AI agent later.
     */
    onGameStateUpdate?: (state: GameState) => void;
}

/** The full game state (extend with more fields if needed). */
export interface GameState {
    snake: Coordinate[];
    food: Coordinate;
    direction: Direction;
    score: number;
    gameOver: boolean;
}

/** Possible directions for the snake. */
export type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

/**
 * SnakeGame
 *
 * Render a snake game on a <canvas> element.
 * The game logic here can be extended to accept or provide
 * data to an AI agent.
 */
export const SnakeGame: React.FC<SnakeGameProps> = ({
    width = 400,
    height = 400,
    gridSize = 20,
    onGameStateUpdate,
}) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    // State
    const [snake, setSnake] = useState<Coordinate[]>([
        { x: 8, y: 10 },
        { x: 7, y: 10 },
        { x: 6, y: 10 },
    ]);
    const [direction, setDirection] = useState<Direction>("RIGHT");
    const [food, setFood] = useState<Coordinate>({ x: 13, y: 10 });
    const [score, setScore] = useState<number>(0);
    const [gameOver, setGameOver] = useState<boolean>(false);

    /**
     * Initialize or reset the game state.
     */
    const initGame = useCallback(() => {
        setSnake([
            { x: 8, y: 10 },
            { x: 7, y: 10 },
            { x: 6, y: 10 },
        ]);
        setDirection("RIGHT");
        setFood({ x: 13, y: 10 });
        setScore(0);
        setGameOver(false);
    }, []);

    /**
     * Move the snake in the current direction by one grid cell.
     */
    const moveSnake = useCallback(() => {
        if (gameOver) return;

        // Copy the current snake
        const newSnake = [...snake];
        const head = newSnake[0];

        let newHead: Coordinate = { ...head };

        switch (direction) {
            case "UP":
                newHead.y -= 1;
                break;
            case "DOWN":
                newHead.y += 1;
                break;
            case "LEFT":
                newHead.x -= 1;
                break;
            case "RIGHT":
                newHead.x += 1;
                break;
            default:
                break;
        }

        // Insert the new head at the front
        newSnake.unshift(newHead);

        // Check if we got food
        if (newHead.x === food.x && newHead.y === food.y) {
            // Increase score
            setScore((prev) => prev + 1);
            // Place new food
            spawnFood(newSnake);
        } else {
            // Remove the tail cell if no food is eaten
            newSnake.pop();
        }

        // Check for collisions
        if (checkCollision(newHead, newSnake)) {
            setGameOver(true);
        }

        setSnake(newSnake);
    }, [direction, food, gameOver, snake]);

    /**
     * Randomly place food that isn't on top of the snake.
     */
    const spawnFood = useCallback(
        (snakePositions: Coordinate[]) => {
            // Example logic: keep generating random positions until we find one not occupied by the snake
            let newFood: Coordinate;
            while (true) {
                newFood = {
                    x: Math.floor(Math.random() * (width / gridSize)),
                    y: Math.floor(Math.random() * (height / gridSize)),
                };
                // Check if the newFood is on the snake
                if (
                    !snakePositions.some(
                        (segment) =>
                            segment.x === newFood.x && segment.y === newFood.y
                    )
                ) {
                    break;
                }
            }
            setFood(newFood);
        },
        [gridSize, height, width]
    );

    /**
     * Check for collisions with walls or self.
     */
    const checkCollision = (head: Coordinate, snakePositions: Coordinate[]) => {
        // Check wall collision
        if (
            head.x < 0 ||
            head.x >= width / gridSize ||
            head.y < 0 ||
            head.y >= height / gridSize
        ) {
            return true;
        }
        // Check self collision (ignore the newly inserted head at index 0)
        for (let i = 1; i < snakePositions.length; i++) {
            if (
                snakePositions[i].x === head.x &&
                snakePositions[i].y === head.y
            ) {
                return true;
            }
        }
        return false;
    };

    /**
     * Draw the game state onto the canvas.
     */
    const draw = useCallback(() => {
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx) return;

        // Clear the canvas
        ctx.clearRect(0, 0, width, height);

        // Draw snake
        ctx.fillStyle = "green";
        snake.forEach((segment) => {
            ctx.fillRect(
                segment.x * gridSize,
                segment.y * gridSize,
                gridSize,
                gridSize
            );
        });

        // Draw food
        ctx.fillStyle = "red";
        ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);

        // Optionally draw a grid for visual reference (debugging)
        // drawGrid(ctx);

        if (gameOver) {
            ctx.fillStyle = "rgba(0,0,0,0.5)";
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = "#fff";
            ctx.font = "24px Arial";
            ctx.fillText("Game Over", width / 2 - 50, height / 2);
        }
    }, [snake, food, gameOver, width, height, gridSize]);

    /**
     * Helper to draw a grid (optional debugging).
     */
    const drawGrid = (ctx: CanvasRenderingContext2D) => {
        ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
        for (let x = 0; x < width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        for (let y = 0; y < height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    };

    /**
     * Keyboard controls for the snake.
     * You can replace or extend this with AI inputs in the future.
     */
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (gameOver) {
                if (e.key === "Enter") {
                    initGame();
                }
                return;
            }

            switch (e.key) {
                case "ArrowUp":
                    if (direction !== "DOWN") setDirection("UP");
                    break;
                case "ArrowDown":
                    if (direction !== "UP") setDirection("DOWN");
                    break;
                case "ArrowLeft":
                    if (direction !== "RIGHT") setDirection("LEFT");
                    break;
                case "ArrowRight":
                    if (direction !== "LEFT") setDirection("RIGHT");
                    break;
                default:
                    break;
            }
        },
        [direction, gameOver, initGame]
    );

    /**
     * Main game loop (updates the snake position).
     * You can adjust the speed by changing the interval delay.
     */
    useEffect(() => {
        const intervalId = setInterval(() => {
            moveSnake();
        }, 200); // Update every 200 ms
        return () => clearInterval(intervalId);
    }, [moveSnake]);

    /**
     * Render the game.
     */
    useEffect(() => {
        draw();
    }, [snake, food, gameOver, draw]);

    /**
     * Handle keyboard listeners.
     */
    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [handleKeyDown]);

    /**
     * Notify external listeners about the game state, for example an AI agent.
     */
    useEffect(() => {
        onGameStateUpdate?.({
            snake,
            food,
            direction,
            score,
            gameOver,
        });
    }, [snake, food, direction, score, gameOver, onGameStateUpdate]);

    return (
        <div style={{ textAlign: "center" }}>
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                style={{
                    border: "1px solid #000",
                    display: "block",
                    margin: "0 auto",
                }}
            />
            <div>
                <p>Score: {score}</p>
                {gameOver && <p>Press Enter to restart</p>}
            </div>
        </div>
    );
};
