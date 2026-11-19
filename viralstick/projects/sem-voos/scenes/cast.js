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
// ---- vídeo 2: E se a internet parasse por 72 horas ----
export const JURA = { skin: SKIN.tan, hair: 'sides', hairColor: '#e8e4dc', browColor: '#cfc9bf', mustache: true, mustacheColor: '#e0dbd2', glasses: true, wrinkles: true,
  shirt: '#c8a96a', collar: '#8d6e3f', sleeve: 'short', apron: '#3f6fb5', pants: '#5d4a3a', shoes: '#3e2723', belly: true };
export const DUDA = { skin: SKIN.tan, hair: 'long', hairColor: '#3a2416', shirt: '#ffd23f', sleeve: 'short', skirt: '#26a69a', pants: '#26a69a', shoes: '#e53935' };
export const THIAGO = { skin: SKIN.light, hair: 'spiky', hairColor: '#c58b2a', shades: false, chain: true, shirt: '#111318', collar: '#111318', sleeve: 'short', pants: '#e9e2d0', shoes: '#ffffff' };
export const TECNICO = { skin: SKIN.brown, hair: 'short', hairColor: '#1b120c', glasses: true, halo: true, shirt: '#5c6bc0', collar: '#ffffff', sleeve: 'long', badge: true, badgeColor: '#3949ab', lanyard: '#3949ab', pants: '#283593', shoes: '#1a1a1a' };
export const LURDES = { skin: SKIN.light, hair: 'bun', hairColor: '#cfc8bf', browColor: '#bdb7ae', wrinkles: true, shirt: '#f48fb1', sleeve: 'long', skirt: '#8e24aa', pants: '#8e24aa', shoes: '#5d4037' };
export const MOTOBOY = { skin: SKIN.dark, hair: 'buzz', hairColor: '#111', hat: 'cap', hatColor: '#e53935', shirt: '#e53935', collar: '#ffd23f', sleeve: 'long', pants: '#263238', shoes: '#111' };
export const MOTORISTA = { skin: SKIN.tan, hair: 'short', hairColor: '#2a1d17', mustache: true, mustacheColor: '#2a1d17', hat: 'cap', hatColor: '#1565c0', shirt: '#90a4ae', sleeve: 'short', pants: '#37474f', shoes: '#212121', belly: true };
export const CLIENTE = { skin: SKIN.brown, hair: 'long', hairColor: '#1b120c', shirt: '#ab47bc', sleeve: 'short', skirt: '#6a1b9a', pants: '#6a1b9a', shoes: '#212121' };
// ---- vídeo 3: Por que a conta de luz sobe mesmo quando você economiza? ----
export const NEIDE = { skin: SKIN.tan, hair: 'bun', hairColor: '#d8d2c8', browColor: '#c4bdb2', glasses: true, wrinkles: true, shirt: '#ef8fa0', collar: '#ffffff', sleeve: 'long', skirt: '#5c6bc0', pants: '#5c6bc0', shoes: '#6d4c41' };
export const GUI = { skin: SKIN.tan, hair: 'short', hairColor: '#2a1a10', shirt: '#26a69a', sleeve: 'short', pants: '#3b5b8c', shoes: '#fafafa' };
export const MARCAO = { skin: SKIN.light, hair: 'buzz', hairColor: '#5a4636', shades: true, shirt: '#fafafa', sleeve: 'short', pants: '#1e88e5', shoes: '#ffd23f', belly: true, chain: true };
const COB = (shirt, hat, extra = {}) => ({ skin: SKIN.tan, hair: 'short', hairColor: '#2a1d17', hat: 'cap', hatColor: hat, shirt, collar: '#ffffff', sleeve: 'long', pants: '#37474f', shoes: '#1a1a1a', badge: true, badgeColor: hat, lanyard: hat, ...extra });
export const ENERGIA = COB('#fdd835', '#f9a825', { skin: SKIN.brown, hair: 'long', hairColor: '#1b120c', skirt: '#37474f' });
export const DISTRIB = COB('#fb8c00', '#e65100', { skin: SKIN.light });
export const TRANSM = COB('#42a5f5', '#1565c0', { skin: SKIN.dark, hair: 'bun', hairColor: '#111', skirt: '#37474f' });
export const ENCARGO = COB('#90a4ae', '#546e7a', { skin: SKIN.light, glasses: true, mustache: true, mustacheColor: '#6d4c41' });
export const IMPOSTO = COB('#e53935', '#b71c1c', { skin: SKIN.tan, belly: true, tie: '#212121', collar: '#ffffff', hat: undefined, hair: 'sides', hairColor: '#424242' });
export const GATO = { skin: SKIN.tan, hair: 'short', hairColor: '#111', hat: 'cap', hatColor: '#212121', shades: true, shirt: '#37474f', sleeve: 'long', pants: '#212121', shoes: '#111' };
// ---- vídeo 4: E se o Brasil tivesse só um feriado por ano? ----
export const ROSE = { skin: SKIN.brown, hair: 'long', hairColor: '#2b1a10', shirt: '#e53935', collar: '#ffffff', sleeve: 'short', pants: '#263238', shoes: '#1a1a1a', badge: true, badgeColor: '#c62828', lanyard: '#c62828' };
export const ROSE_CASA = { ...ROSE, shirt: '#ffb74d', collar: null, badge: false, skirt: '#5c6bc0', pants: '#5c6bc0' };
export const LARA = { skin: SKIN.brown, hair: 'puffs', hairColor: '#24170f', shirt: '#4fc3f7', sleeve: 'short', skirt: '#ffca28', pants: '#ffca28', shoes: '#e53935' };
export const FABIO = { skin: SKIN.light, hair: 'short', hairColor: '#111111', shirt: '#263238', collar: '#ffffff', tie: '#c62828', sleeve: 'long', pants: '#263238', shoes: '#111', belly: true };
export const FABIO_PRAIA = { skin: SKIN.light, hair: 'short', hairColor: '#3a3a3a', shirt: '#ffeb3b', sleeve: 'short', pants: '#4fc3f7', shoes: '#8d6e63', belly: true, shades: true };
export const ZE = { skin: SKIN.tan, hair: 'sides', hairColor: '#eeeeee', browColor: '#e0e0e0', mustache: true, mustacheColor: '#f5f5f5', wrinkles: true, hat: 'cap', hatColor: '#f4d03f', shirt: '#26c6da', sleeve: 'short', pants: '#795548', shoes: '#5d4037', belly: true };
// ---- vídeo 5: Por que o pão francês não existe na França? ----
export const GABRIEL = { skin: SKIN.light, hair: 'short', hairColor: '#6d4c41', mustache: true, mustacheColor: '#4e342e', shirt: '#efebe9', sleeve: 'long', apron: '#d7ccc8', pants: '#3e2723', shoes: '#5d4037', glasses: true };
export const LUC = { skin: SKIN.light, hair: 'sides', hairColor: '#bdbdbd', browColor: '#9e9e9e', mustache: true, mustacheColor: '#9e9e9e', hat: 'chef', shirt: '#1e88e5', stripe: '#ffffff', sleeve: 'long', apron: '#ffffff', pants: '#263238', belly: true };
// ---- vídeo 6: E se nevasse no Brasil inteiro? ----
export const CHIQUINHA = { skin: SKIN.brown, hair: 'bun', hairColor: '#3a2a20', browColor: '#2b1d15', wrinkles: true, shirt: '#ffca28', sleeve: 'short', skirt: '#26a69a', pants: '#26a69a', shoes: '#8d6e63', apron: '#ffffff' };
export const CHIQUINHA_FRIO = { ...CHIQUINHA, shirt: '#c62828', stripe: '#ffffff', sleeve: 'long', apron: null, hat: 'cap', hatColor: '#90caf9' };
export const ARLINDO = { skin: SKIN.light, hair: 'short', hairColor: '#9e9e9e', browColor: '#8d8d8d', mustache: true, mustacheColor: '#bdbdbd', wrinkles: true, shirt: '#6d4c41', collar: '#efebe9', sleeve: 'long', pants: '#37474f', shoes: '#3e2723', belly: true };
export const ARLINDO_CALOR = { ...ARLINDO, shirt: '#ffffff', collar: null, sleeve: 'short', pants: '#795548' };
// vídeo 7 — salário mínimo
export const TAINA = { skin: SKIN.brown, hair: 'puffs', hairColor: '#1b120c', browColor: '#1b120c', shirt: '#26a69a', collar: '#e0f2f1', sleeve: 'short', pants: '#37474f', shoes: '#212121', badge: true, badgeColor: '#00897b', lanyard: '#00695c' };
export const TAINA_CASA = { ...TAINA, shirt: '#ff8a65', collar: null, badge: false, lanyard: null, pants: '#5c6bc0' };
export const DAVI = { skin: SKIN.brown, hair: 'short', hairColor: '#1b120c', shirt: '#ffd23f', sleeve: 'short', pants: '#1e88e5', shoes: '#e53935' };
export const ADEMIR = { skin: SKIN.light, hair: 'short', hairColor: '#9e9e9e', browColor: '#4e342e', mustache: true, mustacheColor: '#5d4037', wrinkles: true, shirt: '#ffffff', sleeve: 'short', pants: '#795548', shoes: '#4e342e', belly: true };

// ---- vídeo 8: E se o 13º salário deixasse de existir ----
export const NONATO = { skin: SKIN.light, hair: 'sides', hairColor: '#bdbdbd', browColor: '#8d8d8d', mustache: true, mustacheColor: '#757575', glasses: true, wrinkles: true, shirt: '#1e88e5', collar: '#ffffff', sleeve: 'long', apron: '#c62828', pants: '#5d4037', shoes: '#3e2723', belly: true };
export const CRIS = { skin: SKIN.tan, hair: 'long', hairColor: '#3e2723', browColor: '#3e2723', shirt: '#c62828', collar: '#ffffff', sleeve: 'short', badge: true, badgeColor: '#fbc02d', lanyard: '#fbc02d', pants: '#263238', shoes: '#1a1a1a' };

// ---- vídeo 9: E se desse pra parcelar tudo em 12 vezes ----
export const KAUA = { skin: SKIN.brown, hair: 'spiky', hairColor: '#1b120c', browColor: '#1b120c', shirt: '#ff7043', sleeve: 'short', pants: '#3949ab', shoes: '#fafafa' };
export const KAUA_CALL = { ...KAUA, shirt: '#455a64', collar: '#90a4ae', badge: true, badgeColor: '#ff7043', lanyard: '#ff7043' };
export const SOCORRO = { skin: SKIN.tan, hair: 'bun', hairColor: '#6d4c41', browColor: '#5d4037', glasses: true, wrinkles: true, shirt: '#ffb300', sleeve: 'long', skirt: '#6d4c41', pants: '#6d4c41', shoes: '#4e342e' };
export const VENDEDOR = { skin: SKIN.light, hair: 'short', hairColor: '#212121', browColor: '#212121', shirt: '#1565c0', collar: '#ffffff', sleeve: 'short', badge: true, badgeColor: '#ffd23f', lanyard: '#ffd23f', pants: '#263238', shoes: '#111111' };

// ---- vídeo 10: A última semana da escala 6x1 ----
export const JOSI = { skin: SKIN.brown, hair: 'bun', hairColor: '#1b120c', browColor: '#1b120c', shirt: '#e53935', collar: '#ffffff', sleeve: 'short', badge: true, badgeColor: '#ffd23f', lanyard: '#c62828', apron: '#c62828', pants: '#263238', shoes: '#1a1a1a' };
export const JOSI_CASA = { ...JOSI, shirt: '#ab47bc', collar: null, badge: false, lanyard: null, apron: null, pants: '#37474f' };
export const LUANA = { skin: SKIN.brown, hair: 'puffs', hairColor: '#1b120c', browColor: '#1b120c', shirt: '#ffeb3b', sleeve: 'short', skirt: '#1e88e5', pants: '#1e88e5', shoes: '#e53935' };
export const HELIO = { skin: SKIN.light, hair: 'sides', hairColor: '#9e9e9e', browColor: '#616161', mustache: true, mustacheColor: '#757575', wrinkles: true, belly: true, shirt: '#ffffff', collar: '#ffffff', tie: '#c62828', sleeve: 'short', badge: true, badgeColor: '#ffd23f', lanyard: '#c62828', pants: '#455a64', shoes: '#212121' };

// vídeo 11 (Jornal do Universo: a nuvem caiu)
export const APRESENTADORA = { skin: SKIN.tan, hair: 'long', hairColor: '#2b1a12', browColor: '#2b1a12', shirt: '#1e3a8a', collar: '#ffffff', sleeve: 'long', badge: false, pants: '#1e3a8a', shoes: '#1a1a1a' };
export const RAFA = { skin: SKIN.light, hair: 'short', hairColor: '#4e342e', browColor: '#3e2723', glasses: true, shirt: '#78909c', collar: '#cfd8dc', sleeve: 'long', pants: '#37474f', shoes: '#eceff1' };
// vídeo 12 (Sem Voos)
export const VALDEMAR = { skin: SKIN.tan, hair: 'buzz', hairColor: '#5d5550', greyTemples: '#cfcac4', mustache: true, mustacheColor: '#4a423c', browColor: '#3a322c', wrinkles: true, shirt: '#1565c0', collar: '#1565c0', sleeve: 'short', pants: '#37474f', shoes: '#212121', belly: true };
export const VALDEMAR_BONE = { ...VALDEMAR, hat: 'cap', hatColor: '#fbc02d' };
export const NENE_TAXI = { skin: SKIN.brown, hair: 'short', hairColor: '#1b120c', browColor: '#1b120c', hat: 'cap', hatColor: '#e53935', shirt: '#43a047', collar: '#43a047', sleeve: 'short', pants: '#455a64', shoes: '#eceff1' };
export const LUCIA = { skin: SKIN.light, hair: 'long', hairColor: '#6d4c41', browColor: '#5d4037', glasses: true, shirt: '#ffffff', collar: '#90caf9', sleeve: 'long', badge: true, badgeColor: '#1e88e5', lanyard: '#1e88e5', pants: '#90caf9', shoes: '#eceff1' };
export const RAIMUNDO = { skin: SKIN.brown, hair: 'short', hairColor: '#1b120c', browColor: '#1b120c', wrinkles: true, hat: 'palha', shirt: '#26a69a', sleeve: 'short', pants: '#5d4037', shoes: '#3e2723' };
export const SONIA = { skin: SKIN.tan, hair: 'curl', hairColor: '#4e342e', browColor: '#3e2723', shirt: '#ab47bc', collar: '#f3e5f5', sleeve: 'short', skirt: '#6a1b9a', pants: '#6a1b9a', shoes: '#4a148c' };
export const ATENDENTE_UNI = { ...TECNICO };
