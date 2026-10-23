/**
 * LEVEL LOADER & ASCII TILE GRID PARSER
 * 
 * Parses ASCII tile grid levels into structured data:
 * - Tile dimensions & pixel bounds
 * - Start ('S') and Landing exit pad ('E') positions
 * - Contiguous wall rectangles ('#')
 * - Interactive movable cargo crates ('C')
 * - Security Keycards ('K')
 * - Locked Blast Doors ('X')
 * - Decompression Hull Breaches ('B')
 * - Venting Fire Hazards ('H')
 * - Oxygen restoration canisters ('O')
 */

export const TILE_TYPES = {
  WALL: '#',
  FLOOR: '.',
  START: 'S',
  EXIT: 'E',
  CRATE: 'C',
  KEY: 'K',
  DOOR: 'X',
  BREACH: 'B',
  FIRE: 'H',
  OXYGEN: 'O',
};

/**
 * Merges contiguous horizontal wall tiles into single larger rectangular colliders.
 * This eliminates the classic 2D physics seam snagging problem when sliding along walls.
 * 
 * @param {string[][]} gridArray 
 * @param {number} tileSize 
 * @returns {Array<{x: number, y: number, width: number, height: number, tileX: number, tileY: number, tileWidth: number, tileHeight: number}>}
 */
export function mergeWallRectangles(gridArray, tileSize) {
  const rows = gridArray.length;
  const cols = gridArray[0].length;
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const mergedWalls = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (gridArray[r][c] === TILE_TYPES.WALL && !visited[r][c]) {
        let widthTiles = 0;
        while (
          c + widthTiles < cols &&
          gridArray[r][c + widthTiles] === TILE_TYPES.WALL &&
          !visited[r][c + widthTiles]
        ) {
          visited[r][c + widthTiles] = true;
          widthTiles++;
        }

        const widthPx = widthTiles * tileSize;
        const heightPx = tileSize;
        const x = c * tileSize + widthPx / 2;
        const y = r * tileSize + heightPx / 2;

        mergedWalls.push({
          x,
          y,
          width: widthPx,
          height: heightPx,
          tileX: c,
          tileY: r,
          tileWidth: widthTiles,
          tileHeight: 1,
        });
      }
    }
  }

  return mergedWalls;
}

/**
 * Parses raw JSON level data into structured level metadata.
 * 
 * @param {object} levelData 
 * @param {number} tileSize 
 * @returns {object} Structured level data
 */
export function parseLevel(levelData, tileSize = 76) {
  if (!levelData || !Array.isArray(levelData.grid) || levelData.grid.length === 0) {
    throw new Error('Invalid level data: "grid" must be a non-empty array of strings.');
  }

  const rawGrid = levelData.grid;
  const heightInTiles = rawGrid.length;
  const widthInTiles = rawGrid[0].length;

  const gridArray = rawGrid.map((row, rowIndex) => {
    if (row.length !== widthInTiles) {
      throw new Error(`Invalid level grid: row ${rowIndex} length (${row.length}) does not match first row (${widthInTiles}).`);
    }
    return row.split('');
  });

  let start = null;
  let exit = null;
  const crates = [];
  const keycards = [];
  const doors = [];
  const breaches = [];
  const fireHazards = [];
  const oxygenTanks = [];

  for (let r = 0; r < heightInTiles; r++) {
    for (let c = 0; c < widthInTiles; c++) {
      const char = gridArray[r][c];
      const centerX = c * tileSize + tileSize / 2;
      const centerY = r * tileSize + tileSize / 2;

      switch (char) {
        case TILE_TYPES.START:
          start = { tileX: c, tileY: r, x: centerX, y: centerY };
          break;
        case TILE_TYPES.EXIT:
          exit = { tileX: c, tileY: r, x: centerX, y: centerY };
          break;
        case TILE_TYPES.CRATE:
          crates.push({ tileX: c, tileY: r, x: centerX, y: centerY });
          break;
        case TILE_TYPES.KEY:
          keycards.push({ tileX: c, tileY: r, x: centerX, y: centerY });
          break;
        case TILE_TYPES.DOOR:
          doors.push({ tileX: c, tileY: r, x: centerX, y: centerY, width: tileSize, height: tileSize });
          break;
        case TILE_TYPES.BREACH:
          breaches.push({ tileX: c, tileY: r, x: centerX, y: centerY });
          break;
        case TILE_TYPES.FIRE:
          fireHazards.push({ tileX: c, tileY: r, x: centerX, y: centerY });
          break;
        case TILE_TYPES.OXYGEN:
          oxygenTanks.push({ tileX: c, tileY: r, x: centerX, y: centerY });
          break;
        case TILE_TYPES.WALL:
        case TILE_TYPES.FLOOR:
          break;
        default:
          console.warn(`Unknown tile character '${char}' at (${c}, ${r})`);
      }
    }
  }

  if (!start) {
    throw new Error('Level is missing a Start position ("S").');
  }
  if (!exit) {
    throw new Error('Level is missing an Exit Landing Pad ("E").');
  }

  const mergedWalls = mergeWallRectangles(gridArray, tileSize);
  const pixelWidth = widthInTiles * tileSize;
  const pixelHeight = heightInTiles * tileSize;

  return {
    id: levelData.id || 'sector_01',
    name: levelData.name || 'Vertical Shaft Sector',
    description: levelData.description || '',
    parTime: levelData.parTime || 30,
    widthInTiles,
    heightInTiles,
    tileSize,
    pixelWidth,
    pixelHeight,
    gridArray,
    start,
    exit,
    mergedWalls,
    crates,
    keycards,
    doors,
    breaches,
    fireHazards,
    oxygenTanks,
  };
}
