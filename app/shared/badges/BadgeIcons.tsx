import React from "react";

/**
 * Iconițele medaliilor: pixel-art pe grilă 16×16, transcrise din design.
 *
 * Fiecare glifă e o listă de rânduri de caractere:
 *   #  → #202020 (mygray)     o  → #E86842 (myorange)
 *   h  → #EA8A6D (hover)      w  → #F1F1F1 (mywhite)
 *   .  → transparent
 *
 * De ce grile și nu SVG-uri scrise de mână: se citesc, se corectează cu ochiul
 * liber și nu se pot strica la un find-and-replace. Rândurile se compilează o
 * singură dată la încărcarea modulului (nu la fiecare render) în <rect>-uri
 * late, comprimând orizontal pixelii identici — o iconiță iese în ~10-20 de
 * dreptunghiuri în loc de 256.
 *
 * Fișier fără „use client": sunt componente pur prezentaționale, deci merg și în
 * componente server (chip-ul de pe profil), și în cele client (galeria, toast-ul).
 */

const PALETTE: Record<string, string> = {
  "#": "#202020",
  o: "#E86842",
  h: "#EA8A6D",
  w: "#F1F1F1",
};

interface PixelRect {
  x: number;
  y: number;
  width: number;
  fill: string;
}

/**
 * Compilează grila în dreptunghiuri, centrând glifa în celula de 16×16 după
 * bounding box-ul pixelilor desenați. Centrarea e ce ține iconițele aliniate
 * între ele deși grilele au înălțimi diferite (un tort are 12 rânduri, un scut
 * are 16).
 */
function compile(rows: string[]): PixelRect[] {
  const grid = rows.map((row) => row.padEnd(16, ".").slice(0, 16));

  let minX = 16;
  let maxX = -1;
  let minY = 16;
  let maxY = -1;
  grid.forEach((row, y) => {
    for (let x = 0; x < 16; x++) {
      if (!PALETTE[row[x]]) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  });

  const dx = maxX < 0 ? 0 : Math.floor((16 - (maxX - minX + 1)) / 2) - minX;
  const dy = maxY < 0 ? 0 : Math.floor((16 - (maxY - minY + 1)) / 2) - minY;

  const rects: PixelRect[] = [];
  grid.forEach((row, y) => {
    let x = 0;
    while (x < 16) {
      const char = row[x];
      if (!PALETTE[char]) {
        x++;
        continue;
      }
      let end = x + 1;
      while (end < 16 && row[end] === char) end++;
      rects.push({ x: x + dx, y: y + dy, width: end - x, fill: PALETTE[char] });
      x = end;
    }
  });
  return rects;
}

// ────────────────────────────────────────────────────────────────────────────
// Grilele
// ────────────────────────────────────────────────────────────────────────────

const GRIDS: Record<string, string[]> = {
  // ── speciale (se văd pe tile inversat) ──
  shield_star: [
    "................",
    "..wwwwwwwwwwww..",
    "..woooooooooow..",
    "..woooowwoooow..",
    "..wooowwwwooow..",
    "..wowwwwwwwwow..",
    "..wooowwwwooow..",
    "..woowwoowwoow..",
    "..woooooooooow..",
    "...woooooooow...",
    "...woooooooow...",
    "....woooooow....",
    ".....woooow.....",
    "......woow......",
    ".......ww.......",
    "................",
  ],
  crown: [
    ".......ww.......",
    "................",
    "..oo...oo...oo..",
    "..oo...oo...oo..",
    "..oo..oooo..oo..",
    "..oo.oooooo.oo..",
    "..oooooooooooo..",
    "..oooooooooooo..",
    "..owwoowwoowwo..",
    "..oooooooooooo..",
    "..wwwwwwwwwwww..",
    "................",
  ],
  trophy: [
    "................",
    ".wwwwwwwwwwwwww.",
    "w..oooooooooo..w",
    "w..oowwoowwoo..w",
    "w..owwwwwwwwo..w",
    "ww.oowwwwwwoo.ww",
    "...ooowwwwooo...",
    "....ooowwooo....",
    ".....oooooo.....",
    ".......oo.......",
    ".......oo.......",
    ".....wwwwww.....",
    "....wwwwwwww....",
    "................",
  ],

  // ── vechime: tortul crește o lumânare pe an ──
  cake1: [
    "................",
    ".......oo.......",
    ".......##.......",
    ".......##.......",
    "..############..",
    "..#oooooooooo#..",
    "..#wowwowwoww#..",
    "..#wwwwwwwwww#..",
    "..#wwwwwwwwww#..",
    "..############..",
    ".##############.",
    "................",
  ],
  cake2: [
    "................",
    "....oo....oo....",
    "....##....##....",
    "....##....##....",
    "..############..",
    "..#oooooooooo#..",
    "..#wowwowwoww#..",
    "..#wwwwwwwwww#..",
    "..#wwwwwwwwww#..",
    "..############..",
    ".##############.",
    "................",
  ],
  cake3: [
    "................",
    "...oo..oo..oo...",
    "...##..##..##...",
    "...##..##..##...",
    "..############..",
    "..#oooooooooo#..",
    "..#wowwowwoww#..",
    "..#wwwwwwwwww#..",
    "..#wwwwwwwwww#..",
    "..############..",
    ".##############.",
    "................",
  ],

  // ── definiții ──
  ice_cracked: [
    "................",
    "..############..",
    "..#wwwww#wwww#..",
    "..#wwww#wwwww#..",
    "..#wwww#wwwhw#..",
    "..#www#wwwwhw#..",
    "..#ww#wwwwwww#..",
    "..#www##wwwww#..",
    "..#wwww#wwwww#..",
    "..#wwwww#wwww#..",
    "..#wwwww#wwww#..",
    "..############..",
    "................",
  ],
  pencil_lines: [
    "................",
    ".........####...",
    ".........#hh#...",
    ".........####...",
    "..####...#oo#...",
    ".........#oo#...",
    "..######.#oo#...",
    ".........#oo#...",
    "..#####..#oo#...",
    ".........#oo#...",
    "..###....#ww#...",
    ".........#ww#...",
    "..........##....",
    "................",
  ],
  book: [
    "................",
    "................",
    "..############..",
    "..##ooooooooo#..",
    "..##ooooooooo#..",
    "..##oowwwwwoo#..",
    "..##oowwwwwoo#..",
    "..##ooooooooo#..",
    "..##ooooooooo#..",
    "..##ooooooooo#..",
    "..##ooooooooo#..",
    "..##ooooooooo#..",
    "..############..",
    "................",
  ],
  book_open: [
    "................",
    "................",
    "................",
    "..#####..#####..",
    ".#wwwww##wwwww#.",
    ".#wooow##wooow#.",
    ".#wwwww##wwwww#.",
    ".#wooow##wooow#.",
    ".#wwwww##wwwww#.",
    "#wwwwww##wwwwww#",
    "################",
    "................",
  ],
  stack: [
    "................",
    "................",
    "................",
    "................",
    "..############..",
    "..#oooooooooo#..",
    "..#oooooooooo#..",
    ".##############.",
    ".#wwwwwwwwwwww#.",
    ".#wwwwwwwwwwww#.",
    "..############..",
    "..#hhhhhhhhhh#..",
    "..#hhhhhhhhhh#..",
    "..############..",
    "................",
  ],
  stack_star: [
    ".......oo.......",
    ".....oooooo.....",
    "......oooo......",
    ".....oo..oo.....",
    "................",
    "..############..",
    "..#oooooooooo#..",
    ".##############.",
    ".#wwwwwwwwwwww#.",
    ".#wwwwwwwwwwww#.",
    "..############..",
    "..#hhhhhhhhhh#..",
    "..############..",
    "................",
  ],

  // ── like-uri: aceeași inimă ca butonul de like, tot mai împodobită ──
  heart_pale: [
    "................",
    "................",
    "..hhhh....hhhh..",
    ".hhhhhh..hhhhhh.",
    ".hhhhhhhhhhhhhh.",
    ".hhhhhhhhhhhhhh.",
    "..hhhhhhhhhhhh..",
    "...hhhhhhhhhh...",
    "....hhhhhhhh....",
    ".....hhhhhh.....",
    "......hhhh......",
    ".......hh.......",
    "................",
  ],
  heart: [
    "................",
    "................",
    "..oooo....oooo..",
    ".oooooo..oooooo.",
    ".oooooooooooooo.",
    ".oooooooooooooo.",
    "..oooooooooooo..",
    "...oooooooooo...",
    "....oooooooo....",
    ".....oooooo.....",
    "......oooo......",
    ".......oo.......",
    "................",
  ],
  heart_double: [
    "................",
    "................",
    "................",
    "................",
    ".oo..oo.........",
    "oooooooo.hh..hh.",
    "oooooooohhhhhhhh",
    ".oooooo.hhhhhhhh",
    "..oooo...hhhhhh.",
    "...oo.....hhhh..",
    "...........hh...",
    "................",
  ],
  heart_crown: [
    "....o..oo..o....",
    "....o.oooo.o....",
    "....oooooooo....",
    "....ohhoohho....",
    "................",
    "..oooo....oooo..",
    ".oooooo..oooooo.",
    ".oooooooooooooo.",
    "..oooooooooooo..",
    "...oooooooooo...",
    "....oooooooo....",
    ".....oooooo.....",
    "......oooo......",
    ".......oo.......",
    "................",
  ],
  heart_fire: [
    "..h.....h....h..",
    "..h....hh....h..",
    ".hh...hhh...hh..",
    ".hhh..hhhh..hhh.",
    "..hh..hhhh..hh..",
    "..oooo....oooo..",
    ".oooooo..oooooo.",
    ".oooooooooooooo.",
    "..oooooooooooo..",
    "...oooooooooo...",
    "....oooooooo....",
    ".....oooooo.....",
    "......oooo......",
    ".......oo.......",
    "................",
  ],

  // ── rapoarte ──
  flag: [
    "................",
    "...##...........",
    "...##ooooooooo..",
    "...##oooooooooo.",
    "...##ooooooooo..",
    "...##ooooooo....",
    "...##...........",
    "...##...........",
    "...##...........",
    "...##...........",
    "...##...........",
    "...##...........",
    "..######........",
    "................",
  ],
  eye: [
    "................",
    "................",
    "................",
    "....########....",
    "..##wwwwwwww##..",
    ".#wwwwoooowwww#.",
    ".#wwwoo##oowww#.",
    ".#wwwwoooowwww#.",
    "..##wwwwwwww##..",
    "....########....",
    "................",
  ],
  broom: [
    ".......##.......",
    ".......##.......",
    ".......##.......",
    ".......##.......",
    ".......##.......",
    ".......##.......",
    ".....######.....",
    ".....#oooo#.....",
    "....hhhhhhhh....",
    "....hhhhhhhh....",
    "...hhhhhhhhhh...",
    "...hhhhhhhhhh...",
    "...hh.hh.hh.hh..",
    "................",
  ],
  shield_heart: [
    "................",
    "..############..",
    "..#wwwwwwwwww#..",
    "..#wwoowwooww#..",
    "..#woooooooow#..",
    "..#woooooooow#..",
    "..#wwooooooww#..",
    "..#wwwoooowww#..",
    "..#wwwwoowwww#..",
    "...#wwwwwwww#...",
    "...#wwwwwwww#...",
    "....#wwwwww#....",
    ".....#wwww#.....",
    "......#ww#......",
    ".......##.......",
    "................",
  ],

  // ── scris mărunt ──
  contract: [
    "...#######......",
    "...#wwwww##.....",
    "...#wwwww#w#....",
    "...#wwwww#ww#...",
    "...#woooooow#...",
    "...#wwwwwwww#...",
    "...#woooooow#...",
    "...#wwwwwwww#...",
    "...#woooowww#...",
    "...#wwwwwwww#...",
    "...#wwwwwoow#...",
    "...#wwwwwoow#...",
    "...##########...",
  ],
  padlock: [
    "................",
    "................",
    ".....######.....",
    "....##....##....",
    "....##....##....",
    "....##....##....",
    "..############..",
    "..#oooooooooo#..",
    "..#oooooooooo#..",
    "..#ooo####ooo#..",
    "..#oooo##oooo#..",
    "..#oooooooooo#..",
    "..############..",
    "................",
  ],

  // ── easter eggs ──
  camera: [
    "................",
    "................",
    "....####........",
    "..############..",
    "..#ooooooooow#..",
    "..#ooo####ooo#..",
    "..#oo#whww#oo#..",
    "..#oo#wwww#oo#..",
    "..#ooo####ooo#..",
    "..#oooooooooo#..",
    "..############..",
    "................",
  ],
  note: [
    "................",
    "........##......",
    "........###.....",
    "........##.##...",
    "........##..##..",
    "........##...##.",
    "........##......",
    "........##......",
    "....oooo##......",
    "...oooooo#......",
    "...oooooo.......",
    "....oooo........",
    "................",
  ],

  // ── secrete ──
  question: [
    "................",
    "....oooooooo....",
    "...oooooooooo...",
    "...ooo....ooo...",
    "..........ooo...",
    ".........ooo....",
    ".......ooo......",
    "......ooo.......",
    "......ooo.......",
    "................",
    "......ooo.......",
    "......ooo.......",
    "................",
  ],
  dice: [
    "................",
    "..############..",
    "..#wwwwwwwwww#..",
    "..#woowwwwwww#..",
    "..#woowwwwwww#..",
    "..#wwwwwwwwww#..",
    "..#wwwwoowwww#..",
    "..#wwwwoowwww#..",
    "..#wwwwwwwwww#..",
    "..#wwwwwwwoow#..",
    "..#wwwwwwwoow#..",
    "..############..",
    "................",
  ],
  compass: [
    "................",
    ".....######.....",
    "...##wwwwww##...",
    "..#wwwwoowwww#..",
    "..#wwwoooowww#..",
    ".#wwwwoooowwww#.",
    ".#wwwww##wwwww#.",
    ".#wwww####wwww#.",
    "..#wwww##wwww#..",
    "...##wwwwww##...",
    ".....######.....",
    "................",
  ],

  // ── comunitate ──
  bug: [
    "................",
    "...##......##...",
    "....##....##....",
    ".....######.....",
    "....oooooooo....",
    ".##oooo##oooo##.",
    "...oooo##oooo...",
    ".##oooo##oooo##.",
    "...oooo##oooo...",
    ".##oooo##oooo##.",
    "....oooooooo....",
    ".....oooooo.....",
    "................",
  ],
  plane: [
    "................",
    "..##............",
    "..#####.........",
    "..#oo#####......",
    "..#ooooo#####...",
    "..#oooooooo####.",
    "..#oooo#####....",
    "..#oo##.........",
    "..###...........",
    "................",
  ],

  // ── merch ──
  mug: [
    "....h..h........",
    "....h..h........",
    "..########......",
    "..#oooooo#####..",
    "..#oooooo#..##..",
    "..#oowwoo#..##..",
    "..#oowwoo#..##..",
    "..#oooooo#.##...",
    "..#oooooo###....",
    "..#oooooo#......",
    "..########......",
    "................",
  ],
  hoodie: [
    "................",
    ".....######.....",
    "....##wwww##....",
    "...##wwwwww##...",
    "..#oowwwwwwoo#..",
    ".##ooowwwwooo##.",
    ".##oooowwoooo##.",
    ".##oooooooooo##.",
    ".##oooooooooo##.",
    "...oooooooooo...",
    "...o########o...",
    "...o#oooooo#o...",
    "...wwwwwwwwww...",
    "................",
  ],
  tshirt: [
    "................",
    "..####....####..",
    ".#oooo####oooo#.",
    "#oooooooooooooo#",
    "#oo#oooooooo#oo#",
    "####oooooooo####",
    "...#oooooooo#...",
    "...#oowwwwoo#...",
    "...#oowwwwoo#...",
    "...#oooooooo#...",
    "...#oooooooo#...",
    "...##########...",
    "................",
  ],
  cap: [
    "................",
    ".......oo.......",
    ".....######.....",
    "....#oooooo#....",
    "...#oo#oo#oo#...",
    "...#oo#oo#oo#...",
    "..#oooooooooo#..",
    "..############..",
    "....##########..",
    "......########..",
    "................",
  ],

  // ── endgame ──
  grass: [
    "................",
    ".......oo.......",
    "..h....oo....h..",
    "..h..o.oo.o..h..",
    "..hh.o.oo.o.hh..",
    "...h.o.oo.o.h...",
    "...hho.oo.ohh...",
    "....hooooooh....",
    "....wwwwwwww....",
    "...wwwwwwwwww...",
    "................",
  ],
};

/** Ce glifă folosește fiecare medalie. */
const ICON_BY_ACHIEVEMENT: Record<string, string> = {
  "rol-moderator": "shield_star",
  "rol-admin": "crown",
  "vechime-1": "cake1",
  "vechime-2": "cake2",
  "vechime-3": "cake3",
  "def-1": "ice_cracked",
  "def-5": "pencil_lines",
  "def-10": "book",
  "def-25": "book_open",
  "def-50": "stack",
  "def-100": "stack_star",
  influencer: "trophy",
  "like-10": "heart_pale",
  "like-50": "heart",
  "like-100": "heart_double",
  "like-250": "heart_crown",
  "like-500": "heart_fire",
  "report-1": "flag",
  "report-5": "eye",
  "report-10": "broom",
  "report-25": "shield_heart",
  terms: "contract",
  privacy: "padlock",
  "egg-instagram": "camera",
  "egg-tiktok": "note",
  "secret-real": "dice",
  "lost-404": "compass",
  beta: "bug",
  share: "plane",
  "merch-cana": "mug",
  "merch-hoodie": "hoodie",
  "merch-tricou": "tshirt",
  "merch-chipiu": "cap",
  "endgame-100": "grass",
};

// ────────────────────────────────────────────────────────────────────────────
// Componente
// ────────────────────────────────────────────────────────────────────────────

export interface BadgeIconProps {
  /** latura în px (galerie 64, chip de profil 18, toast 32) */
  size?: number;
  className?: string;
}

function makeIcon(rows: string[]): React.FC<BadgeIconProps> {
  const rects = compile(rows); // o dată per glifă, la încărcarea modulului

  const Icon: React.FC<BadgeIconProps> = ({ size = 64, className }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      width={size}
      height={size}
      shapeRendering="crispEdges"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {rects.map((rect, index) => (
        <rect
          key={index}
          x={rect.x}
          y={rect.y}
          width={rect.width}
          height={1}
          fill={rect.fill}
        />
      ))}
    </svg>
  );
  return Icon;
}

/** Iconița fiecărei medalii, după id-ul din catalog. */
export const BADGE_ICONS: Record<string, React.FC<BadgeIconProps>> = Object.fromEntries(
  Object.entries(ICON_BY_ACHIEVEMENT).map(([id, glyph]) => [id, makeIcon(GRIDS[glyph])])
);

/** Semnul de întrebare pentru medaliile secrete încă blocate. */
export const UnknownBadgeIcon = makeIcon(GRIDS.question);

/**
 * Iconița unei medalii. `revealed=false` pe o medalie secretă blocată dă „?" —
 * decizia de a ascunde titlul stă în catalog (displayFor), aici doar glifa.
 */
export function BadgeIcon({
  id,
  revealed = true,
  size,
  className,
}: BadgeIconProps & { id: string; revealed?: boolean }) {
  const Icon = (revealed && BADGE_ICONS[id]) || UnknownBadgeIcon;
  return <Icon size={size} className={className} />;
}
