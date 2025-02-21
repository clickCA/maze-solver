import { useState, useEffect } from "react";
import { MazeCell } from "./MazeCell";
import { motion, AnimatePresence } from "framer-motion";
import useSound from "use-sound";
import Tilt from "react-parallax-tilt";
import Confetti from "react-confetti";

const CELL_SIZE = 25; // Reduced from 30
const WIDTH = 30; // Reduced from 34
const HEIGHT = 15;

type MazeType = ("w" | "c" | "v" | "p")[][];
type Position = [number, number];

export const Maze = () => {
    const [maze, setMaze] = useState<MazeType>([]);
    const [solving, setSolving] = useState(false);
    const [shortestPath, setShortestPath] = useState<Position[]>([]);
    const [showConfetti, setShowConfetti] = useState(false);
    const [playClick] = useSound("/click.mp3");
    const [playSuccess] = useSound("/success.mp3");
    const [stats, setStats] = useState({
        visitedCells: 0,
        pathLength: 0,
        timeElapsed: 0,
    });

    const sleep = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));

    const generateMaze = async () => {
        const newMaze = Array(HEIGHT)
            .fill(null)
            .map(() => Array(WIDTH).fill("w")) as MazeType;

        // Set start and end points
        const start: Position = [0, 1];
        const end: Position = [HEIGHT - 1, WIDTH - 2];
        newMaze[start[0]][start[1]] = "c";
        newMaze[end[0]][end[1]] = "c";

        // Carve a clear tunnel directly from start to end before randomizing
        // This ensures we always have at least one solvable path
        let [sx, sy] = start;
        let [ex, ey] = end;
        while (sx !== ex || sy !== ey) {
            newMaze[sx][sy] = "c";
            if (sx < ex) sx++;
            if (sx > ex) sx--;
            if (sy < ey) sy++;
            if (sy > ey) sy--;
        }
        newMaze[sx][sy] = "c";

        const generatePath = async (row: number, col: number) => {
            const directions = [
                [0, 2], // right
                [2, 0], // down
                [0, -2], // left
                [-2, 0], // up
            ];

            // Shuffle directions randomly
            directions.sort(() => Math.random() - 0.5);

            for (const [dx, dy] of directions) {
                const newRow = row + dx;
                const newCol = col + dy;

                if (
                    newRow > 0 &&
                    newRow < HEIGHT - 1 &&
                    newCol > 0 &&
                    newCol < WIDTH - 1 &&
                    newMaze[newRow][newCol] === "w"
                ) {
                    // Mark the path and the cell between
                    newMaze[row + dx / 2][col + dy / 2] = "c";
                    newMaze[newRow][newCol] = "c";
                    await generatePath(newRow, newCol);
                }
            }
        };

        // Start from near the entrance
        await generatePath(1, 1);
        setMaze([...newMaze]);
    };

    const solveMaze = async (algorithm: "bfs" | "dfs") => {
        if (solving) return;
        setSolving(true);

        const newMaze = maze.map((row) => [...row]);
        const start = [0, 1];
        const end = [HEIGHT - 1, WIDTH - 2];

        if (algorithm === "bfs") {
            await bfs(newMaze, start, end);
        } else {
            await dfs(newMaze, start, end);
        }

        setSolving(false);
    };

    const bfs = async (mazeArray: MazeType, start: Position, end: Position) => {
        const startTime = performance.now();
        const queue: Position[] = [start];
        const visited = new Set();
        const parent = new Map<string, Position>();
        let visitedCount = 0;

        while (queue.length > 0) {
            const [x, y] = queue.shift()!;
            const key = `${x},${y}`;

            if (visited.has(key)) continue;
            visited.add(key);
            visitedCount++;

            if (x === end[0] && y === end[1]) {
                const endTime = performance.now();
                setStats({
                    visitedCells: visitedCount,
                    pathLength: 0, // Will be updated in reconstructPath
                    timeElapsed: Math.round(endTime - startTime),
                });
                await reconstructPath(parent, start, end, mazeArray);
                return true;
            }

            mazeArray[x][y] = "v";
            setMaze([...mazeArray]);
            await sleep(50);

            const directions = [
                [0, 1],
                [1, 0],
                [-1, 0],
                [0, -1],
            ];
            for (const [dx, dy] of directions) {
                const newX = x + dx;
                const newY = y + dy;

                if (
                    newX >= 0 &&
                    newX < HEIGHT &&
                    newY >= 0 &&
                    newY < WIDTH &&
                    mazeArray[newX][newY] === "c"
                ) {
                    queue.push([newX, newY]);
                    parent.set(`${newX},${newY}`, [x, y]);
                }
            }
        }
        return false;
    };

    const reconstructPath = async (
        parent: Map<string, Position>,
        start: Position,
        end: Position,
        mazeArray: MazeType
    ) => {
        const path: Position[] = [];
        let current = end;

        while (current[0] !== start[0] || current[1] !== start[1]) {
            path.push(current);
            current = parent.get(`${current[0]},${current[1]}`)!;
        }
        path.push(start);
        path.reverse();

        setStats((prev) => ({
            ...prev,
            pathLength: path.length,
        }));

        // Animate the shortest path
        for (const [x, y] of path) {
            mazeArray[x][y] = "p";
            setMaze([...mazeArray]);
            await sleep(100);
        }
        setShortestPath(path);
    };

    const dfs = async (mazeArray: MazeType, start: number[], end: number[]) => {
        const startTime = performance.now();
        let visitedCount = 0;

        const dfsHelper = async (x: number, y: number): Promise<boolean> => {
            if (x === end[0] && y === end[1]) {
                const endTime = performance.now();
                setStats((prev) => ({
                    ...prev,
                    timeElapsed: Math.round(endTime - startTime),
                }));
                return true;
            }
            if (
                x < 0 ||
                x >= HEIGHT ||
                y < 0 ||
                y >= WIDTH ||
                mazeArray[x][y] !== "c"
            )
                return false;

            mazeArray[x][y] = "v";
            visitedCount++;
            setStats((prev) => ({
                ...prev,
                visitedCells: visitedCount,
            }));

            setMaze([...mazeArray]);
            await sleep(50);

            const directions = [
                [0, 1],
                [1, 0],
                [-1, 0],
                [0, -1],
            ];
            for (const [dx, dy] of directions) {
                const newX = x + dx;
                const newY = y + dy;
                if (await dfsHelper(newX, newY)) return true;
            }

            return false;
        };

        return dfsHelper(start[0], start[1]);
    };

    const handleSolveClick = async (algorithm: "bfs" | "dfs") => {
        playClick();
        await solveMaze(algorithm);
        playSuccess();
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
    };

    const handleGenerateClick = () => {
        if (!solving) {
            playClick();
            setStats({
                visitedCells: 0,
                pathLength: 0,
                timeElapsed: 0,
            });
            generateMaze();
        }
    };

    useEffect(() => {
        generateMaze();
    }, []);

    return (
        <div className="maze-dashboard">
            <div className="maze-section">
                <motion.div
                    className="maze-header"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h2>Maze Visualization</h2>
                    <p>
                        Watch as the algorithms find their way through the maze
                    </p>
                </motion.div>

                <div className="maze-content">
                    <Tilt
                        tiltMaxAngleX={2}
                        tiltMaxAngleY={2}
                        scale={1.02}
                        transitionSpeed={2000}
                        className="maze-tilt-wrapper"
                    >
                        <motion.div
                            className="maze"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            style={{
                                display: "grid",
                                gridTemplateColumns: `repeat(${WIDTH}, ${CELL_SIZE}px)`,
                            }}
                        >
                            {maze.map((row, i) =>
                                row.map((cell, j) => (
                                    <MazeCell
                                        key={`${i}-${j}`}
                                        type={cell}
                                        size={CELL_SIZE}
                                    />
                                ))
                            )}
                        </motion.div>
                    </Tilt>

                    <div className="stats-panel">
                        <div className="stat-item">
                            <span className="stat-label">Visited Cells</span>
                            <motion.span
                                className="stat-value"
                                animate={{ scale: [1, 1.2, 1] }}
                            >
                                {stats.visitedCells}
                            </motion.span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Path Length</span>
                            <motion.span
                                className="stat-value"
                                animate={{ scale: [1, 1.2, 1] }}
                            >
                                {stats.pathLength}
                            </motion.span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Time</span>
                            <motion.span
                                className="stat-value"
                                animate={{ scale: [1, 1.2, 1] }}
                            >
                                {stats.timeElapsed}ms
                            </motion.span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="controls-section">
                <h3>Controls</h3>
                <div className="controls-grid">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleGenerateClick}
                        disabled={solving}
                        className="control-button generate"
                    >
                        <span className="button-icon">🎲</span>
                        Generate New Maze
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSolveClick("bfs")}
                        disabled={solving}
                        className="control-button solve-bfs"
                    >
                        <span className="button-icon">🔍</span>
                        Solve with BFS
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSolveClick("dfs")}
                        disabled={solving}
                        className="control-button solve-dfs"
                    >
                        <span className="button-icon">🎯</span>
                        Solve with DFS
                    </motion.button>
                </div>
            </div>
            {showConfetti && <Confetti />}
        </div>
    );
};
