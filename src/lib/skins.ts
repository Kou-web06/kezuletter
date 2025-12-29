export type SkinKey = 'standard' | 'newYear' | 'anniversary';

export const SKINS: Record<SkinKey, {
  name: string;
  scratchImg: string;
  revealedImg: string;
  particleColor: string;
  font: string;
  textColor: string;
}> = {
  standard: {
    name: 'スタンダード',
    scratchImg: '/textures/silver.png',
    revealedImg: '/textures/default.png',
    particleColor: '#c0c0c0',
    font: 'sans-serif',
    textColor: '#606060',
  },
  newYear: {
    name: '新年',
    scratchImg: '/textures/newYear.png',
    revealedImg: '/textures/newYear.back.png',
    particleColor: '#ffd700',
    font: 'serif',
    textColor: '#603000',
  },
  anniversary: {
    name: '記念日',
    scratchImg: '/textures/anniversary.png',
    revealedImg: '/textures/anniversary.back.png',
    particleColor: '#ffd700',
    font: 'serif',
    textColor: '#4f4617ff',
  },
};
