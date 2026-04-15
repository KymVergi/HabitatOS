// Asset loader for Kenney assets
// Assets are in public/assets/ and served from /assets/ at runtime

export const ASSET_PATHS = {
  tilesets: {
    // 16x16 packed (no gaps) — use these in canvas drawImage
    monochrome_packed:    '/assets/tilesets/1bit/Tilesheet/monochrome_packed.png',
    colored_packed:       '/assets/tilesets/1bit/Tilesheet/colored_packed.png',
    // 16x16 with 1px transparent gap
    monochrome_transparent_packed: '/assets/tilesets/1bit/Tilesheet/monochrome-transparent_packed.png',
    colored_transparent_packed:    '/assets/tilesets/1bit/Tilesheet/colored-transparent_packed.png',
  },

  icons: {
    folder_black: '/assets/icons/game-icons/PNG/Black/1x/',
    folder_white: '/assets/icons/game-icons/PNG/White/1x/',
    coin:    '/assets/icons/game-icons/PNG/White/1x/coin.png',
    star:    '/assets/icons/game-icons/PNG/White/1x/star.png',
    heart:   '/assets/icons/game-icons/PNG/White/1x/heart.png',
    shield:  '/assets/icons/game-icons/PNG/White/1x/shield.png',
    gear:    '/assets/icons/game-icons/PNG/Black/1x/gear.png',
    home:    '/assets/icons/game-icons/PNG/Black/1x/home.png',
    locked:  '/assets/icons/game-icons/PNG/Black/1x/locked.png',
  },

  ui: {
    spritesheet:         '/assets/ui/pixel-ui/Spritesheet/UIpackSheet_transparent.png',
    spritesheet_magenta: '/assets/ui/pixel-ui/Spritesheet/UIpackSheet_magenta.png',
    panel_space:         '/assets/ui/pixel-ui/9-Slice/space.png',
    panel_list:          '/assets/ui/pixel-ui/9-Slice/list.png',
  },

  emotes: {
    folder: '/assets/sprites/emotes/PNG/Pixel/Style 7/',
    faceHappy:   '/assets/sprites/emotes/PNG/Pixel/Style 7/emote_faceHappy.png',
    faceSad:     '/assets/sprites/emotes/PNG/Pixel/Style 7/emote_faceSad.png',
    faceAngry:   '/assets/sprites/emotes/PNG/Pixel/Style 7/emote_faceAngry.png',
    sleep:       '/assets/sprites/emotes/PNG/Pixel/Style 7/emote_sleep.png',
    dots2:       '/assets/sprites/emotes/PNG/Pixel/Style 7/emote_dots2.png',
    dots3:       '/assets/sprites/emotes/PNG/Pixel/Style 7/emote_dots3.png',
    cash:        '/assets/sprites/emotes/PNG/Pixel/Style 7/emote_cash.png',
    heart:       '/assets/sprites/emotes/PNG/Pixel/Style 7/emote_heart.png',
    heartBroken: '/assets/sprites/emotes/PNG/Pixel/Style 7/emote_heartBroken.png',
    idea:        '/assets/sprites/emotes/PNG/Pixel/Style 7/emote_idea.png',
    question:    '/assets/sprites/emotes/PNG/Pixel/Style 7/emote_question.png',
    exclamation: '/assets/sprites/emotes/PNG/Pixel/Style 7/emote_exclamation.png',
    alert:       '/assets/sprites/emotes/PNG/Pixel/Style 7/emote_alert.png',
    stars:       '/assets/sprites/emotes/PNG/Pixel/Style 7/emote_stars.png',
    music:       '/assets/sprites/emotes/PNG/Pixel/Style 7/emote_music.png',
    anger:       '/assets/sprites/emotes/PNG/Pixel/Style 7/emote_anger.png',
    laugh:       '/assets/sprites/emotes/PNG/Pixel/Style 7/emote_laugh.png',
  },
} as const;

// Tileset layout: 49 columns × 22 rows, each tile is 16×16 px (packed, no gaps)
export const TILE_SIZE = 16;
export const TILESET_COLS = 49;

// Get pixel offset of tile at grid position (col, row)
export const tileOffset = (col: number, row: number) => ({
  sx: col * TILE_SIZE,
  sy: row * TILE_SIZE,
});

// Check at runtime if a path resolves (useful for optional assets)
export const imageExists = async (url: string): Promise<boolean> => {
  try {
    const r = await fetch(url, { method: 'HEAD' });
    return r.ok;
  } catch {
    return false;
  }
};

export default ASSET_PATHS;
