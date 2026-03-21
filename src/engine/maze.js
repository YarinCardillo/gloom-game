import { EXTRA_WALLS_RATIO } from "./constants.js";

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generate a maze using recursive DFS carving, then remove extra walls
 * to create multiple paths (preventing single-solution mazes).
 */
export function generateMaze(cols, rows) {
  const grid = Array.from({ length: rows }, () => Array(cols).fill(1));

  function carve(x, y) {
    grid[y][x] = 0;
    for (const [dx, dy] of shuffle([[0, 2], [0, -2], [2, 0], [-2, 0]])) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx > 0 && nx < cols - 1 && ny > 0 && ny < rows - 1 && grid[ny][nx] === 1) {
        grid[y + dy / 2][x + dx / 2] = 0;
        carve(nx, ny);
      }
    }
  }

  carve(1, 1);
  removeExtraWalls(grid, cols, rows);
  return grid;
}

function removeExtraWalls(grid, cols, rows) {
  const target = Math.floor(cols * rows * EXTRA_WALLS_RATIO);
  let added = 0;
  const maxAttempts = cols * rows * 3;

  for (let i = 0; i < maxAttempts && added < target; i++) {
    const x = 1 + Math.floor(Math.random() * (cols - 2));
    const y = 1 + Math.floor(Math.random() * (rows - 2));
    if (grid[y][x] !== 1) continue;

    const adjacentOpen = [[0, 1], [0, -1], [1, 0], [-1, 0]].filter(
      ([dy, dx]) => grid[y + dy]?.[x + dx] === 0
    );

    if (adjacentOpen.length >= 2) {
      grid[y][x] = 0;
      added++;
    }
  }
}

/**
 * Find a random empty cell at least minDist (Manhattan) from all avoid positions.
 */
export function findRandomEmpty(maze, avoid, minDist) {
  const cells = [];
  for (let y = 1; y < maze.length - 1; y++) {
    for (let x = 1; x < maze[0].length - 1; x++) {
      if (maze[y][x] !== 0) continue;
      const tooClose = avoid.some(
        ([ax, ay]) => Math.abs(x - ax) + Math.abs(y - ay) < minDist
      );
      if (!tooClose) cells.push([x, y]);
    }
  }
  return cells.length > 0
    ? cells[Math.floor(Math.random() * cells.length)]
    : [1, 1];
}
