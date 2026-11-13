// cast.js — personagens (estilo cartoon chapado). Escala de criança: s * 0.72
import { SKIN } from '/engine/toon.js';
export const VALDIR = { skin: SKIN.brown, hair: 'buzz', hairColor: '#2b2420', greyTemples: '#b9b4ad', mustache: true, mustacheColor: '#8d8780', browColor: '#3a322c', wrinkles: true,
  shirt: '#9cc8ee', collar: '#25324f', sleeve: 'short', pants: '#25324f', shoes: '#1f1f22', belly: true, badge: true, badgeColor: '#1f6fd1', lanyard: '#d6332b', epaulette: '#25324f' };
// Valdir em casa / churrasco (sem uniforme)
export const VALDIR_CASA = { ...VALDIR, shirt: '#e8e2d0', collar: null, badge: false, epaulette: null, pants: '#4a5a78' };
export const NENE = { skin: SKIN.light, hair: 'none', hairColor: '#8a8a8a', browColor: '#6e6e6e', mustache: true, mustacheColor: '#9a9a9a', glasses: true, hat: 'chef', shirt: '#ffffff', sleeve: 'short', apron: '#d94b3d', pants: '#3a3a3a', belly: true };
export const BIA = { skin: SKIN.brown, hair: 'puffs', hairColor: '#24170f', shirt: '#ff8fb1', sleeve: 'short', skirt: '#5a6fd6', pants: '#5a6fd6', shoes: '#e53935' };
export const BIA_OCULOS = { ...BIA, glasses: true };
export const MARQUINHOS = { skin: SKIN.tan, hair: 'spiky', hairColor: '#1a120c', shades: true, chain: true, shirt: '#ff7a1a', collar: '#ffffff', sleeve: 'short', pants: '#e9e2d0', shoes: '#ffffff' };
export const CIDA = { skin: SKIN.brown, hair: 'bun', hairColor: '#d4cfc8', browColor: '#bdb7ae', glasses: true, wrinkles: true, shirt: '#b39ddb', sleeve: 'long', skirt: '#7e57c2', pants: '#7e57c2', shoes: '#5d4037' };
export const CONTADOR = { skin: SKIN.light, hair: 'sides', hairColor: '#f2f2f2', browColor: '#e0e0e0', glassesLow: true, halo: true, shirt: '#2f3a6b', collar: '#ffffff', tie: '#d32f2f', pants: '#2f3a6b', shoes: '#1a1a1a' };
export const FRENTISTA = { skin: SKIN.tan, hair: 'short', hairColor: '#2a1d17', hat: 'cap', hatColor: '#1e88e5', shirt: '#1e88e5', collar: '#ffd23f', sleeve: 'short', pants: '#0d47a1', shoes: '#212121' };
export const CAIXA = { skin: SKIN.light, hair: 'long', hairColor: '#7b3f1d', shirt: '#43a047', collar: '#ffffff', sleeve: 'short', badge: true, badgeColor: '#2e7d32', lanyard: '#2e7d32', pants: '#263238' };
export const ATENDENTE = { skin: SKIN.dark, hair: 'bun', hairColor: '#1b120c', shirt: '#80cbc4', sleeve: 'short', pants: '#80cbc4', shoes: '#ffffff', badge: true, badgeColor: '#00897b', lanyard: '#00897b' };
export const VOCE = { skin: SKIN.tan, hair: 'short', hairColor: '#3a2618', shirt: '#4caf6a', sleeve: 'short', pants: '#3b4a6b', shoes: '#2a2a2e' };
export const POVO = [
  { skin: SKIN.light, hair: 'short', hairColor: '#6d4c41', shirt: '#ef5350', sleeve: 'short', pants: '#37474f' },
  { skin: SKIN.dark, hair: 'buzz', hairColor: '#111', shirt: '#ffca28', sleeve: 'short', pants: '#455a64' },
  { skin: SKIN.tan, hair: 'long', hairColor: '#212121', shirt: '#7e57c2', sleeve: 'short', skirt: '#5c6bc0', pants: '#5c6bc0' },
  { skin: SKIN.brown, hair: 'puffs', hairColor: '#24170f', shirt: '#26a69a', sleeve: 'short', pants: '#3e2723' },
  { skin: SKIN.light, hair: 'bun', hairColor: '#ffb74d', shirt: '#f06292', sleeve: 'short', skirt: '#ad1457', pants: '#ad1457' },
  { skin: SKIN.tan, hair: 'spiky', hairColor: '#4e342e', shirt: '#8d6e63', sleeve: 'short', pants: '#263238', glasses: true },
];
