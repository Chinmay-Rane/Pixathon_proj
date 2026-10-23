/**
 * LEVEL SOLVABILITY CHECKER
 * 
 * Verifies that a level is physically solvable:
 * 1. Checks that a valid path exists from Start ('S') to Exit Pad ('E').
 * 2. Verifies that corridors are open (passable through non-wall tiles).
 * 3. Uses Breadth-First Search (BFS) to guarantee the shortest route is found.
 * 
 * Pure JavaScript - completely independent of Phaser.
 */

import { TILE_TYPES } from './levelLoader.js';

/**
 * Checks if a tile character is walkable by the astronaut.
 * Everything except '#' (wall) can be traversed.
 * @param {string} char 
 * @returns {boolean}
 */
export function isPassable(char) {
  return char !== TILE_TYPES.WALL && char !== undefined && char !== null;
}

/**
 * Checks whether a level grid has a valid passable path from Start to Exit.
 * 
 * @param {object} parsedLevel - Level object from parseLevel()
 * @returns {{ solvable: boolean, pathLength: number, visitedCount: number, error?: string }}
 */
export function checkLevelSolvability(parsedLevel) {
  const { gridArray, start, exit, widthInTiles, heightInTiles } = parsedLevel;

  if (!start || !exit) {
    return {
      solvable: false,
      pathLength: 0,
      visitedCount: 0,
      error: 'Missing start or exit coordinates',
    };
  }

  const startTile = { r: start.tileY, c: start.tileX };
  const exitTile = { r: exit.tileY, c: exit.tileX };

  // BFS Queue: store { r, c, dist }
  const queue = [{ r: startTile.r, c: startTile.c, dist: 0 }];
  const visited = Array.from({ length: heightInTiles }, () => Array(widthInTiles).fill(false));
  visited[startTile.r][startTile.c] = true;

  // 4-directional cardinal movement
  const neighbors = [
    { dr: -1, dc: 0 }, // Up
    { dr: 1, dc: 0 },  // Down
    { dr: 0, dc: -1 }, // Left
    { dr: 0, dc: 1 },  // Right
  ];

  let visitedCount = 0;

  while (queue.length > 0) {
    const current = queue.shift();
    visitedCount++;

    // Reached Exit Pad!
    if (current.r === exitTile.r && current.c === exitTile.c) {
      return {
        solvable: true,
        pathLength: current.dist,
        visitedCount,
      };
    }

    for (const n of neighbors) {
      const nr = current.r + n.dr;
      const nc = current.c + n.dc;

      if (nr >= 0 && nr < heightInTiles && nc >= 0 && nc < widthInTiles) {
        if (!visited[nr][nc] && isPassable(gridArray[nr][nc])) {
          visited[nr][nc] = true;
          queue.push({ r: nr, c: nc, dist: current.dist + 1 });
        }
      }
    }
  }

  // If queue exhausted without reaching exit, level is blocked
  return {
    solvable: false,
    pathLength: 0,
    visitedCount,
    error: `No passable path found from start (${startTile.c}, ${startTile.r}) to exit (${exitTile.c}, ${exitTile.r})`,
  };
}
