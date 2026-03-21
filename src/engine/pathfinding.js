const DIRS = [[0, 1], [0, -1], [1, 0], [-1, 0]];

/**
 * BFS shortest path from (sx,sy) to (tx,ty).
 * Returns array of [x,y] steps (excluding start), or null if unreachable.
 */
export function bfsPath(maze, sx, sy, tx, ty) {
  if (sx === tx && sy === ty) return [];

  const queue = [[sx, sy]];
  const visited = new Set([`${sx},${sy}`]);
  const parent = {};

  while (queue.length > 0) {
    const [x, y] = queue.shift();

    for (const [dx, dy] of DIRS) {
      const nx = x + dx;
      const ny = y + dy;
      const key = `${nx},${ny}`;

      if (visited.has(key) || maze[ny]?.[nx] !== 0) continue;
      visited.add(key);
      parent[key] = [x, y];

      if (nx === tx && ny === ty) {
        return reconstructPath(parent, sx, sy, tx, ty);
      }
      queue.push([nx, ny]);
    }
  }
  return null;
}

function reconstructPath(parent, sx, sy, tx, ty) {
  const path = [];
  let cx = tx;
  let cy = ty;
  while (cx !== sx || cy !== sy) {
    path.unshift([cx, cy]);
    [cx, cy] = parent[`${cx},${cy}`];
  }
  return path;
}

/**
 * Find the farthest reachable cell from (sx, sy) using BFS.
 */
export function findFarthest(maze, sx, sy) {
  const queue = [[sx, sy, 0]];
  const visited = new Set([`${sx},${sy}`]);
  let best = [sx, sy];
  let maxDist = 0;

  while (queue.length > 0) {
    const [x, y, d] = queue.shift();
    if (d > maxDist) {
      maxDist = d;
      best = [x, y];
    }
    for (const [dx, dy] of DIRS) {
      const nx = x + dx;
      const ny = y + dy;
      const key = `${nx},${ny}`;
      if (!visited.has(key) && maze[ny]?.[nx] === 0) {
        visited.add(key);
        queue.push([nx, ny, d + 1]);
      }
    }
  }
  return best;
}
