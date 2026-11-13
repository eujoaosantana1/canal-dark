// cast.js — personagens do vídeo (estilo cartoon chapado)
import { SKIN } from '/engine/toon.js';
// Valdir, 48, motorista da linha Pimentas–Centro: grisalho nas têmporas, bigode grisalho, uniforme com crachá
export const VALDIR = { skin: SKIN.brown, hair: 'buzz', hairColor: '#2b2420', greyTemples: '#b9b4ad', mustache: true, mustacheColor: '#8d8780', browColor: '#3a322c', wrinkles: true,
  shirt: '#9cc8ee', collar: '#25324f', sleeve: 'short', pants: '#25324f', shoes: '#1f1f22', belly: true, badge: true, badgeColor: '#1f6fd1', lanyard: '#d6332b', epaulette: '#25324f' };
export const NENE = { skin: SKIN.light, hair: 'none', hairColor: '#8a8a8a', browColor: '#6e6e6e', mustache: true, mustacheColor: '#9a9a9a', glasses: true, hat: 'chef', shirt: '#ffffff', sleeve: 'short', apron: '#d94b3d', pants: '#3a3a3a', belly: true };
// "Você" — o espectador
export const VOCE = { skin: SKIN.tan, hair: 'short', hairColor: '#3a2618', shirt: '#4caf6a', sleeve: 'short', pants: '#3b4a6b', shoes: '#2a2a2e' };
