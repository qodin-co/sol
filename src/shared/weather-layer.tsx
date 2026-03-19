'use client';

/**
 * skins/shared/weather-layer.tsx  (v3 — per-skin differentiation + full phase reactivity)
 */

import { useEffect, useId, useRef, useState } from 'react';
import type { SolarPhase } from '../hooks/useSolarPosition';
import { lerpColor } from '../lib/solar-lerp';
import type { WeatherCategory } from '../widgets/solar-widget.shell';

export type WeatherSkin =
  | 'foundry'
  | 'meridian'
  | 'mineral'
  | 'paper'
  | 'signal'
  | 'aurora'
  | 'tide'
  | 'sundial'
  | 'void'
  | 'parchment';

// ─── PhaseColors ──────────────────────────────────────────────────────────────

export interface PhaseColors {
  cloudBase: string;
  cloudShadow: string;
  cloudHi: string;
  rainColor: string;
  snowColor: string;
  fogColor: string;
  skyTint: string;
  boltColor: string;
  boltGlow: string;
}

// ─── FOUNDRY phase colors ─────────────────────────────────────────────────────

const FOUNDRY_PHASE_COLORS: Record<SolarPhase, PhaseColors> = {
  midnight: {
    cloudBase: 'rgba(30,  34,  52,  0.94)',
    cloudShadow: 'rgba(12,  14,  26,  0.86)',
    cloudHi: 'rgba(58,  68,  100, 0.18)',
    rainColor: 'rgba(100, 140, 210, 0.72)',
    snowColor: 'rgba(162, 186, 230, 0.88)',
    fogColor: 'rgba(50,  60,  92,  0.42)',
    skyTint: 'rgba(14,  16,  38,  0.55)',
    boltColor: 'rgba(212, 228, 255, 0.96)',
    boltGlow: 'rgba(178, 210, 255, 0.92)',
  },
  night: {
    cloudBase: 'rgba(38,  46,  68,  0.92)',
    cloudShadow: 'rgba(18,  22,  40,  0.82)',
    cloudHi: 'rgba(72,  90,  130, 0.22)',
    rainColor: 'rgba(120, 160, 222, 0.70)',
    snowColor: 'rgba(178, 200, 240, 0.86)',
    fogColor: 'rgba(60,  74,  110, 0.38)',
    skyTint: 'rgba(20,  24,  50,  0.50)',
    boltColor: 'rgba(216, 232, 255, 0.96)',
    boltGlow: 'rgba(182, 214, 255, 0.90)',
  },
  dawn: {
    cloudBase: 'rgba(178, 130, 110, 0.84)',
    cloudShadow: 'rgba(110, 72,  56,  0.74)',
    cloudHi: 'rgba(255, 208, 170, 0.52)',
    rainColor: 'rgba(158, 178, 220, 0.65)',
    snowColor: 'rgba(240, 224, 212, 0.86)',
    fogColor: 'rgba(200, 164, 144, 0.44)',
    skyTint: 'rgba(110, 64,  44,  0.40)',
    boltColor: 'rgba(255, 230, 194, 0.94)',
    boltGlow: 'rgba(255, 198, 150, 0.86)',
  },
  sunrise: {
    cloudBase: 'rgba(210, 130, 84,  0.86)',
    cloudShadow: 'rgba(140, 70,  34,  0.76)',
    cloudHi: 'rgba(255, 218, 150, 0.58)',
    rainColor: 'rgba(174, 190, 226, 0.65)',
    snowColor: 'rgba(246, 230, 214, 0.86)',
    fogColor: 'rgba(210, 160, 120, 0.46)',
    skyTint: 'rgba(132, 56,  24,  0.42)',
    boltColor: 'rgba(255, 240, 174, 0.96)',
    boltGlow: 'rgba(255, 210, 114, 0.88)',
  },
  morning: {
    cloudBase: 'rgba(255, 255, 255, 0.93)',
    cloudShadow: 'rgba(194, 200, 220, 0.70)',
    cloudHi: 'rgba(255, 255, 255, 0.86)',
    rainColor: 'rgba(140, 174, 230, 0.72)',
    snowColor: 'rgba(230, 240, 255, 0.90)',
    fogColor: 'rgba(200, 212, 232, 0.46)',
    skyTint: 'rgba(140, 158, 190, 0.28)',
    boltColor: 'rgba(200, 220, 255, 0.96)',
    boltGlow: 'rgba(170, 202, 255, 0.88)',
  },
  'solar-noon': {
    cloudBase: 'rgba(255, 255, 255, 0.96)',
    cloudShadow: 'rgba(184, 194, 220, 0.62)',
    cloudHi: 'rgba(255, 255, 255, 0.92)',
    rainColor: 'rgba(120, 164, 230, 0.75)',
    snowColor: 'rgba(224, 236, 255, 0.92)',
    fogColor: 'rgba(194, 210, 234, 0.48)',
    skyTint: 'rgba(130, 150, 190, 0.25)',
    boltColor: 'rgba(200, 220, 255, 0.96)',
    boltGlow: 'rgba(170, 202, 255, 0.88)',
  },
  afternoon: {
    cloudBase: 'rgba(255, 248, 228, 0.91)',
    cloudShadow: 'rgba(200, 190, 164, 0.68)',
    cloudHi: 'rgba(255, 255, 238, 0.82)',
    rainColor: 'rgba(150, 180, 230, 0.70)',
    snowColor: 'rgba(240, 234, 214, 0.88)',
    fogColor: 'rgba(210, 204, 184, 0.44)',
    skyTint: 'rgba(150, 134, 90,  0.28)',
    boltColor: 'rgba(255, 246, 180, 0.96)',
    boltGlow: 'rgba(255, 226, 120, 0.88)',
  },
  sunset: {
    cloudBase: 'rgba(216, 114, 70,  0.88)',
    cloudShadow: 'rgba(140, 54,  24,  0.78)',
    cloudHi: 'rgba(255, 198, 130, 0.56)',
    rainColor: 'rgba(180, 187, 220, 0.65)',
    snowColor: 'rgba(246, 224, 210, 0.85)',
    fogColor: 'rgba(214, 144, 104, 0.46)',
    skyTint: 'rgba(140, 46,  20,  0.46)',
    boltColor: 'rgba(255, 226, 160, 0.96)',
    boltGlow: 'rgba(255, 190, 100, 0.88)',
  },
  dusk: {
    cloudBase: 'rgba(80,  54,  120, 0.90)',
    cloudShadow: 'rgba(40,  24,  70,  0.80)',
    cloudHi: 'rgba(158, 128, 210, 0.38)',
    rainColor: 'rgba(154, 170, 230, 0.70)',
    snowColor: 'rgba(220, 214, 246, 0.88)',
    fogColor: 'rgba(110, 90,  160, 0.42)',
    skyTint: 'rgba(44,  24,  90,  0.50)',
    boltColor: 'rgba(220, 210, 255, 0.96)',
    boltGlow: 'rgba(190, 175, 255, 0.88)',
  },
};

// ─── MERIDIAN phase colors ─────────────────────────────────────────────────────

const MERIDIAN_PHASE_COLORS: Record<SolarPhase, PhaseColors> = {
  midnight: {
    cloudBase: 'rgba(52,  60,  80,  0.55)',
    cloudShadow: 'rgba(28,  34,  52,  0.45)',
    cloudHi: 'rgba(80,  96,  128, 0.18)',
    rainColor: 'rgba(90,  120, 170, 0.60)',
    snowColor: 'rgba(140, 160, 200, 0.75)',
    fogColor: 'rgba(44,  52,  76,  0.35)',
    skyTint: 'rgba(20,  24,  40,  0.42)',
    boltColor: 'rgba(180, 200, 230, 0.90)',
    boltGlow: 'rgba(140, 170, 220, 0.80)',
  },
  night: {
    cloudBase: 'rgba(58,  68,  90,  0.52)',
    cloudShadow: 'rgba(32,  38,  58,  0.42)',
    cloudHi: 'rgba(88,  106, 140, 0.16)',
    rainColor: 'rgba(100, 130, 180, 0.58)',
    snowColor: 'rgba(150, 172, 210, 0.72)',
    fogColor: 'rgba(50,  60,  84,  0.32)',
    skyTint: 'rgba(22,  26,  44,  0.38)',
    boltColor: 'rgba(185, 205, 235, 0.90)',
    boltGlow: 'rgba(148, 176, 224, 0.80)',
  },
  dawn: {
    cloudBase: 'rgba(210, 190, 168, 0.72)',
    cloudShadow: 'rgba(168, 148, 124, 0.56)',
    cloudHi: 'rgba(240, 222, 200, 0.44)',
    rainColor: 'rgba(148, 164, 196, 0.55)',
    snowColor: 'rgba(225, 212, 196, 0.80)',
    fogColor: 'rgba(195, 178, 158, 0.38)',
    skyTint: 'rgba(88,  64,  44,  0.28)',
    boltColor: 'rgba(240, 218, 180, 0.88)',
    boltGlow: 'rgba(220, 188, 144, 0.76)',
  },
  sunrise: {
    cloudBase: 'rgba(228, 196, 148, 0.76)',
    cloudShadow: 'rgba(180, 148, 100, 0.60)',
    cloudHi: 'rgba(252, 228, 185, 0.48)',
    rainColor: 'rgba(158, 172, 208, 0.58)',
    snowColor: 'rgba(235, 218, 196, 0.82)',
    fogColor: 'rgba(210, 185, 148, 0.40)',
    skyTint: 'rgba(100, 68,  28,  0.30)',
    boltColor: 'rgba(248, 228, 168, 0.90)',
    boltGlow: 'rgba(228, 198, 128, 0.80)',
  },
  morning: {
    cloudBase: 'rgba(248, 248, 242, 0.82)',
    cloudShadow: 'rgba(200, 204, 216, 0.58)',
    cloudHi: 'rgba(255, 255, 252, 0.70)',
    rainColor: 'rgba(128, 158, 208, 0.62)',
    snowColor: 'rgba(218, 228, 248, 0.82)',
    fogColor: 'rgba(195, 205, 222, 0.40)',
    skyTint: 'rgba(100, 116, 148, 0.20)',
    boltColor: 'rgba(190, 210, 245, 0.90)',
    boltGlow: 'rgba(158, 190, 238, 0.80)',
  },
  'solar-noon': {
    cloudBase: 'rgba(252, 252, 252, 0.85)',
    cloudShadow: 'rgba(188, 196, 218, 0.55)',
    cloudHi: 'rgba(255, 255, 255, 0.75)',
    rainColor: 'rgba(112, 150, 218, 0.65)',
    snowColor: 'rgba(215, 228, 252, 0.84)',
    fogColor: 'rgba(188, 202, 228, 0.42)',
    skyTint: 'rgba(96,  118, 158, 0.18)',
    boltColor: 'rgba(185, 208, 248, 0.90)',
    boltGlow: 'rgba(152, 188, 242, 0.80)',
  },
  afternoon: {
    cloudBase: 'rgba(248, 242, 224, 0.82)',
    cloudShadow: 'rgba(198, 188, 162, 0.60)',
    cloudHi: 'rgba(255, 250, 234, 0.72)',
    rainColor: 'rgba(138, 165, 212, 0.62)',
    snowColor: 'rgba(232, 226, 205, 0.82)',
    fogColor: 'rgba(202, 196, 174, 0.38)',
    skyTint: 'rgba(118, 106, 72,  0.20)',
    boltColor: 'rgba(245, 232, 168, 0.90)',
    boltGlow: 'rgba(225, 208, 128, 0.80)',
  },
  sunset: {
    cloudBase: 'rgba(218, 168, 120, 0.75)',
    cloudShadow: 'rgba(170, 116, 72,  0.62)',
    cloudHi: 'rgba(248, 205, 158, 0.48)',
    rainColor: 'rgba(168, 175, 212, 0.58)',
    snowColor: 'rgba(238, 215, 198, 0.80)',
    fogColor: 'rgba(205, 150, 108, 0.38)',
    skyTint: 'rgba(110, 52,  20,  0.32)',
    boltColor: 'rgba(245, 218, 152, 0.90)',
    boltGlow: 'rgba(225, 182, 108, 0.80)',
  },
  dusk: {
    cloudBase: 'rgba(100, 84,  140, 0.68)',
    cloudShadow: 'rgba(62,  48,  96,  0.56)',
    cloudHi: 'rgba(148, 128, 188, 0.30)',
    rainColor: 'rgba(140, 154, 210, 0.62)',
    snowColor: 'rgba(210, 202, 238, 0.80)',
    fogColor: 'rgba(98,  82,  142, 0.35)',
    skyTint: 'rgba(38,  20,  72,  0.38)',
    boltColor: 'rgba(210, 200, 245, 0.90)',
    boltGlow: 'rgba(178, 165, 238, 0.80)',
  },
};

// ─── MINERAL phase colors ──────────────────────────────────────────────────────

const MINERAL_PHASE_COLORS: Record<SolarPhase, PhaseColors> = {
  midnight: {
    cloudBase: 'rgba(48,  48,  72,  0.88)',
    cloudShadow: 'rgba(20,  20,  40,  0.76)',
    cloudHi: 'rgba(140, 140, 200, 0.45)',
    rainColor: 'rgba(100, 120, 220, 0.80)',
    snowColor: 'rgba(160, 180, 240, 0.88)',
    fogColor: 'rgba(40,  44,  80,  0.45)',
    skyTint: 'rgba(10,  12,  40,  0.55)',
    boltColor: 'rgba(200, 220, 255, 0.96)',
    boltGlow: 'rgba(160, 190, 255, 0.90)',
  },
  night: {
    cloudBase: 'rgba(20,  44,  100, 0.90)',
    cloudShadow: 'rgba(8,   22,  60,  0.78)',
    cloudHi: 'rgba(200, 160, 60,  0.55)',
    rainColor: 'rgba(100, 140, 230, 0.82)',
    snowColor: 'rgba(170, 195, 248, 0.88)',
    fogColor: 'rgba(16,  36,  88,  0.48)',
    skyTint: 'rgba(12,  24,  64,  0.58)',
    boltColor: 'rgba(210, 230, 255, 0.96)',
    boltGlow: 'rgba(170, 200, 255, 0.90)',
  },
  dawn: {
    cloudBase: 'rgba(228, 168, 180, 0.85)',
    cloudShadow: 'rgba(190, 118, 130, 0.72)',
    cloudHi: 'rgba(255, 210, 220, 0.60)',
    rainColor: 'rgba(180, 155, 210, 0.72)',
    snowColor: 'rgba(248, 230, 235, 0.88)',
    fogColor: 'rgba(210, 155, 168, 0.45)',
    skyTint: 'rgba(160, 80,  96,  0.38)',
    boltColor: 'rgba(255, 220, 230, 0.94)',
    boltGlow: 'rgba(240, 180, 200, 0.86)',
  },
  sunrise: {
    cloudBase: 'rgba(192, 64,  32,  0.90)',
    cloudShadow: 'rgba(128, 28,  12,  0.80)',
    cloudHi: 'rgba(255, 160, 100, 0.60)',
    rainColor: 'rgba(200, 100, 60,  0.68)',
    snowColor: 'rgba(248, 200, 175, 0.86)',
    fogColor: 'rgba(170, 56,  28,  0.42)',
    skyTint: 'rgba(120, 32,  12,  0.45)',
    boltColor: 'rgba(255, 200, 140, 0.96)',
    boltGlow: 'rgba(255, 160, 80,  0.88)',
  },
  morning: {
    cloudBase: 'rgba(220, 168, 24,  0.88)',
    cloudShadow: 'rgba(160, 110, 8,   0.72)',
    cloudHi: 'rgba(255, 230, 120, 0.65)',
    rainColor: 'rgba(200, 150, 20,  0.70)',
    snowColor: 'rgba(248, 228, 160, 0.88)',
    fogColor: 'rgba(195, 145, 16,  0.42)',
    skyTint: 'rgba(140, 90,  8,   0.30)',
    boltColor: 'rgba(255, 240, 120, 0.96)',
    boltGlow: 'rgba(255, 210, 60,  0.88)',
  },
  'solar-noon': {
    cloudBase: 'rgba(64,  176, 152, 0.88)',
    cloudShadow: 'rgba(24,  110, 90,  0.74)',
    cloudHi: 'rgba(180, 248, 232, 0.62)',
    rainColor: 'rgba(40,  160, 130, 0.72)',
    snowColor: 'rgba(180, 248, 232, 0.88)',
    fogColor: 'rgba(40,  148, 120, 0.42)',
    skyTint: 'rgba(16,  80,  64,  0.28)',
    boltColor: 'rgba(180, 255, 240, 0.96)',
    boltGlow: 'rgba(100, 240, 210, 0.88)',
  },
  afternoon: {
    cloudBase: 'rgba(196, 128, 24,  0.90)',
    cloudShadow: 'rgba(136, 80,  8,   0.76)',
    cloudHi: 'rgba(255, 210, 100, 0.62)',
    rainColor: 'rgba(180, 110, 16,  0.68)',
    snowColor: 'rgba(248, 218, 155, 0.86)',
    fogColor: 'rgba(172, 104, 12,  0.40)',
    skyTint: 'rgba(120, 64,  4,   0.28)',
    boltColor: 'rgba(255, 230, 100, 0.96)',
    boltGlow: 'rgba(255, 195, 40,  0.88)',
  },
  sunset: {
    cloudBase: 'rgba(120, 16,  32,  0.92)',
    cloudShadow: 'rgba(72,  6,   16,  0.82)',
    cloudHi: 'rgba(210, 100, 120, 0.55)',
    rainColor: 'rgba(160, 60,  80,  0.70)',
    snowColor: 'rgba(240, 185, 196, 0.86)',
    fogColor: 'rgba(100, 14,  28,  0.42)',
    skyTint: 'rgba(80,  8,   20,  0.48)',
    boltColor: 'rgba(255, 180, 200, 0.96)',
    boltGlow: 'rgba(240, 120, 148, 0.88)',
  },
  dusk: {
    cloudBase: 'rgba(64,  16,  112, 0.92)',
    cloudShadow: 'rgba(36,  6,   72,  0.82)',
    cloudHi: 'rgba(200, 155, 255, 0.55)',
    rainColor: 'rgba(140, 80,  220, 0.72)',
    snowColor: 'rgba(220, 190, 255, 0.88)',
    fogColor: 'rgba(55,  14,  100, 0.44)',
    skyTint: 'rgba(36,  8,   64,  0.50)',
    boltColor: 'rgba(220, 180, 255, 0.96)',
    boltGlow: 'rgba(180, 130, 255, 0.88)',
  },
};

// ─── PAPER phase colors ────────────────────────────────────────────────────────

const PAPER_PHASE_COLORS: Record<SolarPhase, PhaseColors> = {
  midnight: {
    cloudBase: 'rgba(40,  32,  20,  0.75)',
    cloudShadow: 'rgba(20,  14,  8,   0.65)',
    cloudHi: 'rgba(75,  62,  40,  0.28)',
    rainColor: 'rgba(80,  65,  45,  0.68)',
    snowColor: 'rgba(140, 128, 100, 0.80)',
    fogColor: 'rgba(50,  40,  25,  0.38)',
    skyTint: 'rgba(10,  8,   4,   0.50)',
    boltColor: 'rgba(200, 180, 130, 0.92)',
    boltGlow: 'rgba(170, 145, 90,  0.82)',
  },
  night: {
    cloudBase: 'rgba(50,  40,  24,  0.72)',
    cloudShadow: 'rgba(26,  20,  10,  0.62)',
    cloudHi: 'rgba(88,  72,  48,  0.26)',
    rainColor: 'rgba(90,  74,  52,  0.66)',
    snowColor: 'rgba(152, 138, 108, 0.78)',
    fogColor: 'rgba(60,  48,  30,  0.36)',
    skyTint: 'rgba(14,  10,  5,   0.46)',
    boltColor: 'rgba(210, 188, 138, 0.92)',
    boltGlow: 'rgba(180, 152, 98,  0.82)',
  },
  dawn: {
    cloudBase: 'rgba(192, 128, 80,  0.72)',
    cloudShadow: 'rgba(140, 85,  45,  0.60)',
    cloudHi: 'rgba(235, 185, 138, 0.48)',
    rainColor: 'rgba(160, 105, 62,  0.60)',
    snowColor: 'rgba(235, 205, 175, 0.80)',
    fogColor: 'rgba(175, 115, 70,  0.38)',
    skyTint: 'rgba(100, 55,  20,  0.35)',
    boltColor: 'rgba(245, 215, 165, 0.90)',
    boltGlow: 'rgba(220, 178, 118, 0.80)',
  },
  sunrise: {
    cloudBase: 'rgba(200, 130, 48,  0.75)',
    cloudShadow: 'rgba(148, 85,  20,  0.62)',
    cloudHi: 'rgba(245, 198, 118, 0.50)',
    rainColor: 'rgba(168, 110, 42,  0.62)',
    snowColor: 'rgba(242, 212, 175, 0.82)',
    fogColor: 'rgba(182, 118, 45,  0.40)',
    skyTint: 'rgba(110, 60,  14,  0.38)',
    boltColor: 'rgba(248, 220, 145, 0.90)',
    boltGlow: 'rgba(225, 188, 98,  0.80)',
  },
  morning: {
    cloudBase: 'rgba(225, 205, 155, 0.65)',
    cloudShadow: 'rgba(175, 152, 105, 0.52)',
    cloudHi: 'rgba(252, 238, 200, 0.45)',
    rainColor: 'rgba(148, 118, 72,  0.58)',
    snowColor: 'rgba(245, 232, 205, 0.80)',
    fogColor: 'rgba(205, 184, 138, 0.35)',
    skyTint: 'rgba(100, 78,  32,  0.22)',
    boltColor: 'rgba(240, 220, 168, 0.88)',
    boltGlow: 'rgba(215, 190, 120, 0.78)',
  },
  'solar-noon': {
    cloudBase: 'rgba(238, 225, 188, 0.60)',
    cloudShadow: 'rgba(185, 168, 125, 0.48)',
    cloudHi: 'rgba(255, 248, 220, 0.42)',
    rainColor: 'rgba(138, 108, 62,  0.55)',
    snowColor: 'rgba(248, 238, 215, 0.78)',
    fogColor: 'rgba(215, 198, 155, 0.32)',
    skyTint: 'rgba(88,  68,  24,  0.18)',
    boltColor: 'rgba(238, 218, 165, 0.86)',
    boltGlow: 'rgba(208, 182, 110, 0.76)',
  },
  afternoon: {
    cloudBase: 'rgba(218, 185, 118, 0.70)',
    cloudShadow: 'rgba(168, 135, 72,  0.56)',
    cloudHi: 'rgba(248, 225, 175, 0.48)',
    rainColor: 'rgba(155, 118, 55,  0.60)',
    snowColor: 'rgba(242, 225, 188, 0.80)',
    fogColor: 'rgba(198, 162, 98,  0.36)',
    skyTint: 'rgba(108, 72,  22,  0.25)',
    boltColor: 'rgba(245, 218, 148, 0.90)',
    boltGlow: 'rgba(218, 182, 95,  0.78)',
  },
  sunset: {
    cloudBase: 'rgba(176, 100, 55,  0.75)',
    cloudShadow: 'rgba(120, 58,  22,  0.64)',
    cloudHi: 'rgba(228, 158, 100, 0.48)',
    rainColor: 'rgba(145, 85,  40,  0.62)',
    snowColor: 'rgba(235, 198, 165, 0.80)',
    fogColor: 'rgba(155, 88,  46,  0.40)',
    skyTint: 'rgba(90,  42,  12,  0.38)',
    boltColor: 'rgba(240, 200, 135, 0.90)',
    boltGlow: 'rgba(215, 160, 82,  0.80)',
  },
  dusk: {
    cloudBase: 'rgba(130, 95,  52,  0.72)',
    cloudShadow: 'rgba(82,  56,  25,  0.60)',
    cloudHi: 'rgba(182, 148, 95,  0.38)',
    rainColor: 'rgba(110, 78,  38,  0.60)',
    snowColor: 'rgba(218, 195, 155, 0.78)',
    fogColor: 'rgba(112, 82,  42,  0.36)',
    skyTint: 'rgba(62,  38,  12,  0.42)',
    boltColor: 'rgba(225, 195, 130, 0.88)',
    boltGlow: 'rgba(195, 158, 82,  0.78)',
  },
};

// ─── SIGNAL phase colors ───────────────────────────────────────────────────────

const SIGNAL_PHASE_COLORS: Record<SolarPhase, PhaseColors> = {
  midnight: {
    cloudBase: 'rgba(30, 144, 212, 0.20)',
    cloudShadow: 'rgba(20, 100, 160, 0.15)',
    cloudHi: 'rgba(30, 144, 212, 0.45)',
    rainColor: 'rgba(30, 144, 212, 0.80)',
    snowColor: 'rgba(30, 144, 212, 0.70)',
    fogColor: 'rgba(30, 144, 212, 0.12)',
    skyTint: 'rgba(0,  0,   0,   0.40)',
    boltColor: 'rgba(30, 144, 212, 0.96)',
    boltGlow: 'rgba(30, 144, 212, 0.90)',
  },
  night: {
    cloudBase: 'rgba(46, 128, 192, 0.18)',
    cloudShadow: 'rgba(28, 84,  140, 0.14)',
    cloudHi: 'rgba(46, 128, 192, 0.42)',
    rainColor: 'rgba(46, 128, 192, 0.78)',
    snowColor: 'rgba(46, 128, 192, 0.68)',
    fogColor: 'rgba(46, 128, 192, 0.10)',
    skyTint: 'rgba(0,  0,   0,   0.38)',
    boltColor: 'rgba(46, 128, 192, 0.96)',
    boltGlow: 'rgba(46, 128, 192, 0.88)',
  },
  dawn: {
    cloudBase: 'rgba(212, 128, 32,  0.20)',
    cloudShadow: 'rgba(160, 88,  16,  0.15)',
    cloudHi: 'rgba(212, 128, 32,  0.48)',
    rainColor: 'rgba(212, 128, 32,  0.82)',
    snowColor: 'rgba(212, 128, 32,  0.72)',
    fogColor: 'rgba(212, 128, 32,  0.12)',
    skyTint: 'rgba(0,  0,   0,   0.38)',
    boltColor: 'rgba(212, 128, 32,  0.96)',
    boltGlow: 'rgba(212, 128, 32,  0.90)',
  },
  sunrise: {
    cloudBase: 'rgba(212, 160, 32,  0.20)',
    cloudShadow: 'rgba(160, 116, 16,  0.15)',
    cloudHi: 'rgba(212, 160, 32,  0.48)',
    rainColor: 'rgba(212, 160, 32,  0.82)',
    snowColor: 'rgba(212, 160, 32,  0.72)',
    fogColor: 'rgba(212, 160, 32,  0.12)',
    skyTint: 'rgba(0,  0,   0,   0.36)',
    boltColor: 'rgba(212, 160, 32,  0.96)',
    boltGlow: 'rgba(212, 160, 32,  0.90)',
  },
  morning: {
    cloudBase: 'rgba(192, 144, 16,  0.18)',
    cloudShadow: 'rgba(140, 100, 8,   0.13)',
    cloudHi: 'rgba(192, 144, 16,  0.44)',
    rainColor: 'rgba(192, 144, 16,  0.80)',
    snowColor: 'rgba(192, 144, 16,  0.70)',
    fogColor: 'rgba(192, 144, 16,  0.10)',
    skyTint: 'rgba(0,  0,   0,   0.30)',
    boltColor: 'rgba(192, 144, 16,  0.96)',
    boltGlow: 'rgba(192, 144, 16,  0.88)',
  },
  'solar-noon': {
    cloudBase: 'rgba(200, 200, 168, 0.18)',
    cloudShadow: 'rgba(150, 150, 120, 0.13)',
    cloudHi: 'rgba(200, 200, 168, 0.42)',
    rainColor: 'rgba(200, 200, 168, 0.78)',
    snowColor: 'rgba(200, 200, 168, 0.68)',
    fogColor: 'rgba(200, 200, 168, 0.10)',
    skyTint: 'rgba(0,  0,   0,   0.28)',
    boltColor: 'rgba(200, 200, 168, 0.96)',
    boltGlow: 'rgba(200, 200, 168, 0.88)',
  },
  afternoon: {
    cloudBase: 'rgba(192, 136, 32,  0.18)',
    cloudShadow: 'rgba(140, 96,  16,  0.14)',
    cloudHi: 'rgba(192, 136, 32,  0.44)',
    rainColor: 'rgba(192, 136, 32,  0.80)',
    snowColor: 'rgba(192, 136, 32,  0.70)',
    fogColor: 'rgba(192, 136, 32,  0.10)',
    skyTint: 'rgba(0,  0,   0,   0.28)',
    boltColor: 'rgba(192, 136, 32,  0.96)',
    boltGlow: 'rgba(192, 136, 32,  0.88)',
  },
  sunset: {
    cloudBase: 'rgba(192, 72,  32,  0.20)',
    cloudShadow: 'rgba(140, 44,  16,  0.15)',
    cloudHi: 'rgba(192, 72,  32,  0.48)',
    rainColor: 'rgba(192, 72,  32,  0.82)',
    snowColor: 'rgba(192, 72,  32,  0.72)',
    fogColor: 'rgba(192, 72,  32,  0.12)',
    skyTint: 'rgba(0,  0,   0,   0.34)',
    boltColor: 'rgba(192, 72,  32,  0.96)',
    boltGlow: 'rgba(192, 72,  32,  0.90)',
  },
  dusk: {
    cloudBase: 'rgba(184, 48,  32,  0.20)',
    cloudShadow: 'rgba(134, 28,  16,  0.15)',
    cloudHi: 'rgba(184, 48,  32,  0.48)',
    rainColor: 'rgba(184, 48,  32,  0.82)',
    snowColor: 'rgba(184, 48,  32,  0.72)',
    fogColor: 'rgba(184, 48,  32,  0.12)',
    skyTint: 'rgba(0,  0,   0,   0.36)',
    boltColor: 'rgba(184, 48,  32,  0.96)',
    boltGlow: 'rgba(184, 48,  32,  0.90)',
  },
};

// ─── AURORA phase colors ───────────────────────────────────────────────────────

const AURORA_PHASE_COLORS: Record<SolarPhase, PhaseColors> = {
  midnight: {
    cloudBase: 'rgba(32,  64,  128, 0.55)',
    cloudShadow: 'rgba(8,   24,  68,  0.45)',
    cloudHi: 'rgba(80,  140, 220, 0.35)',
    rainColor: 'rgba(80,  140, 220, 0.70)',
    snowColor: 'rgba(130, 185, 240, 0.80)',
    fogColor: 'rgba(20,  48,  100, 0.38)',
    skyTint: 'rgba(4,   8,   38,  0.52)',
    boltColor: 'rgba(180, 210, 255, 0.94)',
    boltGlow: 'rgba(130, 178, 255, 0.88)',
  },
  night: {
    cloudBase: 'rgba(16,  88,  56,  0.50)',
    cloudShadow: 'rgba(6,   48,  28,  0.42)',
    cloudHi: 'rgba(64,  200, 140, 0.38)',
    rainColor: 'rgba(64,  200, 140, 0.65)',
    snowColor: 'rgba(120, 230, 185, 0.78)',
    fogColor: 'rgba(10,  64,  40,  0.35)',
    skyTint: 'rgba(4,   12,  12,  0.50)',
    boltColor: 'rgba(168, 248, 210, 0.94)',
    boltGlow: 'rgba(100, 220, 165, 0.88)',
  },
  dawn: {
    cloudBase: 'rgba(128, 48,  80,  0.58)',
    cloudShadow: 'rgba(80,  22,  48,  0.48)',
    cloudHi: 'rgba(200, 100, 155, 0.38)',
    rainColor: 'rgba(180, 95,  148, 0.62)',
    snowColor: 'rgba(240, 168, 205, 0.78)',
    fogColor: 'rgba(100, 36,  62,  0.38)',
    skyTint: 'rgba(24,  8,   32,  0.48)',
    boltColor: 'rgba(248, 190, 225, 0.94)',
    boltGlow: 'rgba(220, 140, 188, 0.86)',
  },
  sunrise: {
    cloudBase: 'rgba(128, 64,  40,  0.55)',
    cloudShadow: 'rgba(80,  32,  16,  0.46)',
    cloudHi: 'rgba(230, 138, 80,  0.40)',
    rainColor: 'rgba(220, 110, 70,  0.58)',
    snowColor: 'rgba(248, 195, 162, 0.78)',
    fogColor: 'rgba(100, 50,  28,  0.36)',
    skyTint: 'rgba(40,  16,  16,  0.45)',
    boltColor: 'rgba(255, 220, 175, 0.92)',
    boltGlow: 'rgba(240, 180, 110, 0.84)',
  },
  morning: {
    cloudBase: 'rgba(200, 160, 80,  0.42)',
    cloudShadow: 'rgba(152, 115, 50,  0.35)',
    cloudHi: 'rgba(240, 205, 130, 0.30)',
    rainColor: 'rgba(175, 138, 58,  0.50)',
    snowColor: 'rgba(238, 215, 162, 0.68)',
    fogColor: 'rgba(170, 135, 58,  0.28)',
    skyTint: 'rgba(80,  58,  14,  0.22)',
    boltColor: 'rgba(240, 220, 150, 0.88)',
    boltGlow: 'rgba(210, 182, 90,  0.78)',
  },
  'solar-noon': {
    cloudBase: 'rgba(140, 198, 230, 0.45)',
    cloudShadow: 'rgba(90,  148, 185, 0.36)',
    cloudHi: 'rgba(190, 228, 252, 0.32)',
    rainColor: 'rgba(80,  158, 218, 0.52)',
    snowColor: 'rgba(185, 225, 252, 0.70)',
    fogColor: 'rgba(110, 170, 210, 0.28)',
    skyTint: 'rgba(36,  80,  120, 0.18)',
    boltColor: 'rgba(175, 222, 252, 0.88)',
    boltGlow: 'rgba(120, 190, 240, 0.78)',
  },
  afternoon: {
    cloudBase: 'rgba(195, 155, 65,  0.44)',
    cloudShadow: 'rgba(145, 108, 35,  0.36)',
    cloudHi: 'rgba(238, 200, 110, 0.30)',
    rainColor: 'rgba(170, 130, 45,  0.50)',
    snowColor: 'rgba(235, 208, 148, 0.68)',
    fogColor: 'rgba(162, 122, 38,  0.28)',
    skyTint: 'rgba(72,  50,  8,   0.20)',
    boltColor: 'rgba(238, 210, 130, 0.88)',
    boltGlow: 'rgba(205, 170, 72,  0.78)',
  },
  sunset: {
    cloudBase: 'rgba(128, 72,  40,  0.58)',
    cloudShadow: 'rgba(80,  38,  16,  0.48)',
    cloudHi: 'rgba(220, 128, 80,  0.40)',
    rainColor: 'rgba(200, 100, 58,  0.58)',
    snowColor: 'rgba(242, 185, 155, 0.76)',
    fogColor: 'rgba(98,  54,  25,  0.36)',
    skyTint: 'rgba(24,  8,   16,  0.45)',
    boltColor: 'rgba(248, 205, 155, 0.92)',
    boltGlow: 'rgba(220, 162, 95,  0.84)',
  },
  dusk: {
    cloudBase: 'rgba(96,  48,  128, 0.58)',
    cloudShadow: 'rgba(52,  18,  80,  0.48)',
    cloudHi: 'rgba(165, 100, 220, 0.40)',
    rainColor: 'rgba(150, 88,  210, 0.62)',
    snowColor: 'rgba(220, 185, 248, 0.78)',
    fogColor: 'rgba(72,  34,  100, 0.38)',
    skyTint: 'rgba(16,  8,   24,  0.48)',
    boltColor: 'rgba(210, 178, 252, 0.92)',
    boltGlow: 'rgba(175, 130, 240, 0.84)',
  },
};

// ─── TIDE phase colors ─────────────────────────────────────────────────────────

const TIDE_PHASE_COLORS: Record<SolarPhase, PhaseColors> = {
  midnight: {
    cloudBase: 'rgba(60,80,100,0.70)',
    cloudShadow: 'rgba(30,44,60,0.60)',
    cloudHi: 'rgba(100,130,160,0.25)',
    rainColor: 'rgba(128,184,208,0.72)',
    snowColor: 'rgba(232,244,248,0.85)',
    fogColor: 'rgba(176,200,216,0.38)',
    skyTint: 'rgba(16,24,36,0.48)',
    boltColor: 'rgba(200,232,255,0.94)',
    boltGlow: 'rgba(160,210,248,0.88)',
  },
  night: {
    cloudBase: 'rgba(68,92,112,0.68)',
    cloudShadow: 'rgba(36,52,68,0.56)',
    cloudHi: 'rgba(110,144,174,0.22)',
    rainColor: 'rgba(128,184,208,0.70)',
    snowColor: 'rgba(232,244,248,0.84)',
    fogColor: 'rgba(176,200,216,0.36)',
    skyTint: 'rgba(18,28,40,0.44)',
    boltColor: 'rgba(200,232,255,0.94)',
    boltGlow: 'rgba(160,210,248,0.86)',
  },
  dawn: {
    cloudBase: 'rgba(168,200,216,0.72)',
    cloudShadow: 'rgba(120,152,170,0.58)',
    cloudHi: 'rgba(210,230,240,0.40)',
    rainColor: 'rgba(128,184,208,0.65)',
    snowColor: 'rgba(232,244,248,0.86)',
    fogColor: 'rgba(176,200,216,0.40)',
    skyTint: 'rgba(80,100,120,0.30)',
    boltColor: 'rgba(200,232,255,0.92)',
    boltGlow: 'rgba(160,210,248,0.84)',
  },
  sunrise: {
    cloudBase: 'rgba(168,200,216,0.75)',
    cloudShadow: 'rgba(120,156,176,0.60)',
    cloudHi: 'rgba(215,232,242,0.44)',
    rainColor: 'rgba(128,184,208,0.68)',
    snowColor: 'rgba(232,244,248,0.86)',
    fogColor: 'rgba(176,200,216,0.42)',
    skyTint: 'rgba(88,110,130,0.32)',
    boltColor: 'rgba(200,232,255,0.94)',
    boltGlow: 'rgba(160,210,248,0.86)',
  },
  morning: {
    cloudBase: 'rgba(168,200,216,0.78)',
    cloudShadow: 'rgba(130,164,184,0.62)',
    cloudHi: 'rgba(220,238,248,0.48)',
    rainColor: 'rgba(128,184,208,0.70)',
    snowColor: 'rgba(232,244,248,0.88)',
    fogColor: 'rgba(176,200,216,0.44)',
    skyTint: 'rgba(100,128,150,0.24)',
    boltColor: 'rgba(200,232,255,0.94)',
    boltGlow: 'rgba(160,210,248,0.88)',
  },
  'solar-noon': {
    cloudBase: 'rgba(168,200,216,0.80)',
    cloudShadow: 'rgba(136,170,190,0.64)',
    cloudHi: 'rgba(224,240,250,0.50)',
    rainColor: 'rgba(128,184,208,0.72)',
    snowColor: 'rgba(232,244,248,0.90)',
    fogColor: 'rgba(176,200,216,0.46)',
    skyTint: 'rgba(100,140,168,0.20)',
    boltColor: 'rgba(200,232,255,0.94)',
    boltGlow: 'rgba(160,210,248,0.88)',
  },
  afternoon: {
    cloudBase: 'rgba(168,200,216,0.76)',
    cloudShadow: 'rgba(128,162,182,0.62)',
    cloudHi: 'rgba(218,234,244,0.46)',
    rainColor: 'rgba(128,184,208,0.70)',
    snowColor: 'rgba(232,244,248,0.88)',
    fogColor: 'rgba(176,200,216,0.44)',
    skyTint: 'rgba(100,130,156,0.22)',
    boltColor: 'rgba(200,232,255,0.94)',
    boltGlow: 'rgba(160,210,248,0.86)',
  },
  sunset: {
    cloudBase: 'rgba(144,184,204,0.72)',
    cloudShadow: 'rgba(100,140,164,0.58)',
    cloudHi: 'rgba(200,220,234,0.40)',
    rainColor: 'rgba(128,184,208,0.68)',
    snowColor: 'rgba(232,244,248,0.86)',
    fogColor: 'rgba(176,200,216,0.40)',
    skyTint: 'rgba(80,104,128,0.32)',
    boltColor: 'rgba(200,232,255,0.94)',
    boltGlow: 'rgba(160,210,248,0.86)',
  },
  dusk: {
    cloudBase: 'rgba(80,104,128,0.70)',
    cloudShadow: 'rgba(44,64,86,0.58)',
    cloudHi: 'rgba(130,160,190,0.28)',
    rainColor: 'rgba(128,184,208,0.70)',
    snowColor: 'rgba(232,244,248,0.85)',
    fogColor: 'rgba(176,200,216,0.38)',
    skyTint: 'rgba(24,36,52,0.46)',
    boltColor: 'rgba(200,232,255,0.94)',
    boltGlow: 'rgba(160,210,248,0.88)',
  },
};

// ─── SUNDIAL phase colors ──────────────────────────────────────────────────────

const SUNDIAL_PHASE_COLORS: Record<SolarPhase, PhaseColors> = {
  midnight: {
    cloudBase: 'rgba(80,72,56,0.68)',
    cloudShadow: 'rgba(44,38,28,0.56)',
    cloudHi: 'rgba(120,108,84,0.24)',
    rainColor: 'rgba(144,152,152,0.68)',
    snowColor: 'rgba(240,238,232,0.82)',
    fogColor: 'rgba(200,192,168,0.36)',
    skyTint: 'rgba(20,16,10,0.46)',
    boltColor: 'rgba(240,232,208,0.92)',
    boltGlow: 'rgba(255,244,224,0.86)',
  },
  night: {
    cloudBase: 'rgba(88,80,62,0.66)',
    cloudShadow: 'rgba(50,44,32,0.54)',
    cloudHi: 'rgba(128,116,90,0.22)',
    rainColor: 'rgba(144,152,152,0.66)',
    snowColor: 'rgba(240,238,232,0.80)',
    fogColor: 'rgba(200,192,168,0.34)',
    skyTint: 'rgba(22,18,12,0.42)',
    boltColor: 'rgba(240,232,208,0.92)',
    boltGlow: 'rgba(255,244,224,0.84)',
  },
  dawn: {
    cloudBase: 'rgba(192,176,144,0.72)',
    cloudShadow: 'rgba(148,132,104,0.58)',
    cloudHi: 'rgba(228,216,188,0.40)',
    rainColor: 'rgba(144,152,152,0.62)',
    snowColor: 'rgba(240,238,232,0.84)',
    fogColor: 'rgba(200,192,168,0.40)',
    skyTint: 'rgba(88,72,44,0.30)',
    boltColor: 'rgba(240,232,208,0.90)',
    boltGlow: 'rgba(255,244,224,0.82)',
  },
  sunrise: {
    cloudBase: 'rgba(192,176,144,0.75)',
    cloudShadow: 'rgba(152,136,108,0.60)',
    cloudHi: 'rgba(232,220,192,0.44)',
    rainColor: 'rgba(144,152,152,0.64)',
    snowColor: 'rgba(240,238,232,0.84)',
    fogColor: 'rgba(200,192,168,0.42)',
    skyTint: 'rgba(96,78,48,0.32)',
    boltColor: 'rgba(240,232,208,0.92)',
    boltGlow: 'rgba(255,244,224,0.84)',
  },
  morning: {
    cloudBase: 'rgba(192,176,144,0.78)',
    cloudShadow: 'rgba(156,140,112,0.62)',
    cloudHi: 'rgba(234,224,196,0.48)',
    rainColor: 'rgba(144,152,152,0.66)',
    snowColor: 'rgba(240,238,232,0.86)',
    fogColor: 'rgba(200,192,168,0.44)',
    skyTint: 'rgba(100,84,52,0.24)',
    boltColor: 'rgba(240,232,208,0.92)',
    boltGlow: 'rgba(255,244,224,0.86)',
  },
  'solar-noon': {
    cloudBase: 'rgba(192,176,144,0.80)',
    cloudShadow: 'rgba(160,144,116,0.64)',
    cloudHi: 'rgba(236,228,200,0.50)',
    rainColor: 'rgba(144,152,152,0.68)',
    snowColor: 'rgba(240,238,232,0.88)',
    fogColor: 'rgba(200,192,168,0.46)',
    skyTint: 'rgba(100,88,56,0.20)',
    boltColor: 'rgba(240,232,208,0.92)',
    boltGlow: 'rgba(255,244,224,0.86)',
  },
  afternoon: {
    cloudBase: 'rgba(192,176,144,0.76)',
    cloudShadow: 'rgba(154,138,110,0.62)',
    cloudHi: 'rgba(232,222,194,0.46)',
    rainColor: 'rgba(144,152,152,0.66)',
    snowColor: 'rgba(240,238,232,0.86)',
    fogColor: 'rgba(200,192,168,0.44)',
    skyTint: 'rgba(100,82,50,0.22)',
    boltColor: 'rgba(240,232,208,0.92)',
    boltGlow: 'rgba(255,244,224,0.84)',
  },
  sunset: {
    cloudBase: 'rgba(176,156,124,0.72)',
    cloudShadow: 'rgba(130,112,84,0.58)',
    cloudHi: 'rgba(216,200,168,0.40)',
    rainColor: 'rgba(144,152,152,0.64)',
    snowColor: 'rgba(240,238,232,0.84)',
    fogColor: 'rgba(200,192,168,0.40)',
    skyTint: 'rgba(80,64,36,0.32)',
    boltColor: 'rgba(240,232,208,0.90)',
    boltGlow: 'rgba(255,244,224,0.82)',
  },
  dusk: {
    cloudBase: 'rgba(100,88,68,0.68)',
    cloudShadow: 'rgba(60,52,38,0.56)',
    cloudHi: 'rgba(148,132,104,0.26)',
    rainColor: 'rgba(144,152,152,0.66)',
    snowColor: 'rgba(240,238,232,0.82)',
    fogColor: 'rgba(200,192,168,0.36)',
    skyTint: 'rgba(28,22,14,0.44)',
    boltColor: 'rgba(240,232,208,0.92)',
    boltGlow: 'rgba(255,244,224,0.86)',
  },
};

// ─── VOID phase colors ─────────────────────────────────────────────────────────

const VOID_PHASE_COLORS: Record<SolarPhase, PhaseColors> = {
  midnight: {
    cloudBase: 'rgba(20,20,20,0.55)',
    cloudShadow: 'rgba(8,8,8,0.45)',
    cloudHi: 'rgba(40,40,40,0.20)',
    rainColor: 'rgba(32,32,32,0.60)',
    snowColor: 'rgba(56,56,56,0.70)',
    fogColor: 'rgba(24,24,24,0.35)',
    skyTint: 'rgba(4,4,4,0.50)',
    boltColor: 'rgba(255,255,255,0.96)',
    boltGlow: 'rgba(255,255,255,0.92)',
  },
  night: {
    cloudBase: 'rgba(20,20,20,0.52)',
    cloudShadow: 'rgba(8,8,8,0.42)',
    cloudHi: 'rgba(40,40,40,0.18)',
    rainColor: 'rgba(32,32,32,0.58)',
    snowColor: 'rgba(56,56,56,0.68)',
    fogColor: 'rgba(24,24,24,0.32)',
    skyTint: 'rgba(4,4,4,0.48)',
    boltColor: 'rgba(255,255,255,0.96)',
    boltGlow: 'rgba(255,255,255,0.92)',
  },
  dawn: {
    cloudBase: 'rgba(20,20,20,0.50)',
    cloudShadow: 'rgba(8,8,8,0.40)',
    cloudHi: 'rgba(44,44,44,0.18)',
    rainColor: 'rgba(32,32,32,0.56)',
    snowColor: 'rgba(56,56,56,0.66)',
    fogColor: 'rgba(24,24,24,0.30)',
    skyTint: 'rgba(6,6,6,0.44)',
    boltColor: 'rgba(255,255,255,0.96)',
    boltGlow: 'rgba(255,255,255,0.92)',
  },
  sunrise: {
    cloudBase: 'rgba(20,20,20,0.48)',
    cloudShadow: 'rgba(8,8,8,0.38)',
    cloudHi: 'rgba(44,44,44,0.16)',
    rainColor: 'rgba(32,32,32,0.54)',
    snowColor: 'rgba(56,56,56,0.64)',
    fogColor: 'rgba(24,24,24,0.28)',
    skyTint: 'rgba(6,6,6,0.40)',
    boltColor: 'rgba(255,255,255,0.96)',
    boltGlow: 'rgba(255,255,255,0.92)',
  },
  morning: {
    cloudBase: 'rgba(20,20,20,0.45)',
    cloudShadow: 'rgba(8,8,8,0.36)',
    cloudHi: 'rgba(48,48,48,0.16)',
    rainColor: 'rgba(32,32,32,0.52)',
    snowColor: 'rgba(56,56,56,0.62)',
    fogColor: 'rgba(24,24,24,0.26)',
    skyTint: 'rgba(8,8,8,0.36)',
    boltColor: 'rgba(255,255,255,0.96)',
    boltGlow: 'rgba(255,255,255,0.92)',
  },
  'solar-noon': {
    cloudBase: 'rgba(20,20,20,0.42)',
    cloudShadow: 'rgba(8,8,8,0.34)',
    cloudHi: 'rgba(52,52,52,0.16)',
    rainColor: 'rgba(32,32,32,0.50)',
    snowColor: 'rgba(56,56,56,0.60)',
    fogColor: 'rgba(24,24,24,0.24)',
    skyTint: 'rgba(8,8,8,0.32)',
    boltColor: 'rgba(255,255,255,0.96)',
    boltGlow: 'rgba(255,255,255,0.92)',
  },
  afternoon: {
    cloudBase: 'rgba(20,20,20,0.45)',
    cloudShadow: 'rgba(8,8,8,0.36)',
    cloudHi: 'rgba(48,48,48,0.16)',
    rainColor: 'rgba(32,32,32,0.52)',
    snowColor: 'rgba(56,56,56,0.62)',
    fogColor: 'rgba(24,24,24,0.26)',
    skyTint: 'rgba(8,8,8,0.34)',
    boltColor: 'rgba(255,255,255,0.96)',
    boltGlow: 'rgba(255,255,255,0.92)',
  },
  sunset: {
    cloudBase: 'rgba(20,20,20,0.50)',
    cloudShadow: 'rgba(8,8,8,0.40)',
    cloudHi: 'rgba(44,44,44,0.18)',
    rainColor: 'rgba(32,32,32,0.56)',
    snowColor: 'rgba(56,56,56,0.66)',
    fogColor: 'rgba(24,24,24,0.30)',
    skyTint: 'rgba(6,6,6,0.44)',
    boltColor: 'rgba(255,255,255,0.96)',
    boltGlow: 'rgba(255,255,255,0.92)',
  },
  dusk: {
    cloudBase: 'rgba(20,20,20,0.54)',
    cloudShadow: 'rgba(8,8,8,0.44)',
    cloudHi: 'rgba(40,40,40,0.20)',
    rainColor: 'rgba(32,32,32,0.58)',
    snowColor: 'rgba(56,56,56,0.70)',
    fogColor: 'rgba(24,24,24,0.34)',
    skyTint: 'rgba(4,4,4,0.48)',
    boltColor: 'rgba(255,255,255,0.96)',
    boltGlow: 'rgba(255,255,255,0.92)',
  },
};

// ─── PARCHMENT phase colors ────────────────────────────────────────────────────

const PARCHMENT_PHASE_COLORS: Record<SolarPhase, PhaseColors> = {
  midnight: {
    cloudBase: 'rgba(55,53,47,0.18)',
    cloudShadow: 'rgba(55,53,47,0.28)',
    cloudHi: 'rgba(55,53,47,0.07)',
    rainColor: 'rgba(55,53,47,0.30)',
    snowColor: 'rgba(55,53,47,0.22)',
    fogColor: 'rgba(55,53,47,0.12)',
    skyTint: 'transparent',
    boltColor: 'rgba(55,53,47,0.85)',
    boltGlow: 'rgba(55,53,47,0.50)',
  },
  night: {
    cloudBase: 'rgba(55,53,47,0.18)',
    cloudShadow: 'rgba(55,53,47,0.28)',
    cloudHi: 'rgba(55,53,47,0.07)',
    rainColor: 'rgba(55,53,47,0.30)',
    snowColor: 'rgba(55,53,47,0.22)',
    fogColor: 'rgba(55,53,47,0.12)',
    skyTint: 'transparent',
    boltColor: 'rgba(55,53,47,0.85)',
    boltGlow: 'rgba(55,53,47,0.50)',
  },
  dawn: {
    cloudBase: 'rgba(55,53,47,0.14)',
    cloudShadow: 'rgba(55,53,47,0.22)',
    cloudHi: 'rgba(55,53,47,0.06)',
    rainColor: 'rgba(55,53,47,0.24)',
    snowColor: 'rgba(55,53,47,0.18)',
    fogColor: 'rgba(55,53,47,0.10)',
    skyTint: 'transparent',
    boltColor: 'rgba(55,53,47,0.80)',
    boltGlow: 'rgba(55,53,47,0.45)',
  },
  sunrise: {
    cloudBase: 'rgba(55,53,47,0.14)',
    cloudShadow: 'rgba(55,53,47,0.22)',
    cloudHi: 'rgba(55,53,47,0.06)',
    rainColor: 'rgba(55,53,47,0.24)',
    snowColor: 'rgba(55,53,47,0.18)',
    fogColor: 'rgba(55,53,47,0.10)',
    skyTint: 'transparent',
    boltColor: 'rgba(55,53,47,0.80)',
    boltGlow: 'rgba(55,53,47,0.45)',
  },
  morning: {
    cloudBase: 'rgba(55,53,47,0.09)',
    cloudShadow: 'rgba(55,53,47,0.15)',
    cloudHi: 'rgba(55,53,47,0.04)',
    rainColor: 'rgba(55,53,47,0.16)',
    snowColor: 'rgba(55,53,47,0.13)',
    fogColor: 'rgba(55,53,47,0.07)',
    skyTint: 'transparent',
    boltColor: 'rgba(55,53,47,0.75)',
    boltGlow: 'rgba(55,53,47,0.40)',
  },
  'solar-noon': {
    cloudBase: 'rgba(55,53,47,0.08)',
    cloudShadow: 'rgba(55,53,47,0.13)',
    cloudHi: 'rgba(55,53,47,0.04)',
    rainColor: 'rgba(55,53,47,0.14)',
    snowColor: 'rgba(55,53,47,0.11)',
    fogColor: 'rgba(55,53,47,0.06)',
    skyTint: 'transparent',
    boltColor: 'rgba(55,53,47,0.75)',
    boltGlow: 'rgba(55,53,47,0.40)',
  },
  afternoon: {
    cloudBase: 'rgba(55,53,47,0.10)',
    cloudShadow: 'rgba(55,53,47,0.16)',
    cloudHi: 'rgba(55,53,47,0.04)',
    rainColor: 'rgba(55,53,47,0.18)',
    snowColor: 'rgba(55,53,47,0.13)',
    fogColor: 'rgba(55,53,47,0.07)',
    skyTint: 'transparent',
    boltColor: 'rgba(55,53,47,0.75)',
    boltGlow: 'rgba(55,53,47,0.40)',
  },
  sunset: {
    cloudBase: 'rgba(55,53,47,0.12)',
    cloudShadow: 'rgba(55,53,47,0.19)',
    cloudHi: 'rgba(55,53,47,0.05)',
    rainColor: 'rgba(55,53,47,0.22)',
    snowColor: 'rgba(55,53,47,0.16)',
    fogColor: 'rgba(55,53,47,0.09)',
    skyTint: 'transparent',
    boltColor: 'rgba(55,53,47,0.80)',
    boltGlow: 'rgba(55,53,47,0.45)',
  },
  dusk: {
    cloudBase: 'rgba(55,53,47,0.15)',
    cloudShadow: 'rgba(55,53,47,0.24)',
    cloudHi: 'rgba(55,53,47,0.06)',
    rainColor: 'rgba(55,53,47,0.26)',
    snowColor: 'rgba(55,53,47,0.19)',
    fogColor: 'rgba(55,53,47,0.11)',
    skyTint: 'transparent',
    boltColor: 'rgba(55,53,47,0.82)',
    boltGlow: 'rgba(55,53,47,0.48)',
  },
};

// ─── Phase color tables map ────────────────────────────────────────────────────

const SKIN_PHASE_COLORS: Record<WeatherSkin, Record<SolarPhase, PhaseColors>> = {
  foundry: FOUNDRY_PHASE_COLORS,
  meridian: MERIDIAN_PHASE_COLORS,
  mineral: MINERAL_PHASE_COLORS,
  paper: PAPER_PHASE_COLORS,
  signal: SIGNAL_PHASE_COLORS,
  aurora: AURORA_PHASE_COLORS,
  tide: TIDE_PHASE_COLORS,
  sundial: SUNDIAL_PHASE_COLORS,
  void: VOID_PHASE_COLORS,
  parchment: PARCHMENT_PHASE_COLORS,
};

// ─── derivePhaseColors ────────────────────────────────────────────────────────

export function derivePhaseColors(
  blend: { phase: SolarPhase; nextPhase: SolarPhase; t: number },
  skin: WeatherSkin,
): PhaseColors {
  const table = SKIN_PHASE_COLORS[skin];
  const from = table[blend.phase];
  const to = table[blend.nextPhase];
  const t = blend.t;
  const lc = lerpColor;

  return {
    cloudBase: lc(from.cloudBase, to.cloudBase, t),
    cloudShadow: lc(from.cloudShadow, to.cloudShadow, t),
    cloudHi: lc(from.cloudHi, to.cloudHi, t),
    rainColor: lc(from.rainColor, to.rainColor, t),
    snowColor: lc(from.snowColor, to.snowColor, t),
    fogColor: lc(from.fogColor, to.fogColor, t),
    skyTint: lc(from.skyTint, to.skyTint, t),
    boltColor: lc(from.boltColor, to.boltColor, t),
    boltGlow: lc(from.boltGlow, to.boltGlow, t),
  };
}

// ─── Seeded random ─────────────────────────────────────────────────────────────

function seededRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

// ─── WEATHER_ORB_DIM ───────────────────────────────────────────────────────────

export const WEATHER_ORB_DIM: Record<WeatherCategory, number> = {
  clear: 1,
  'partly-cloudy': 0.82,
  overcast: 0.45,
  fog: 0.4,
  drizzle: 0.65,
  rain: 0.5,
  'heavy-rain': 0.35,
  snow: 0.58,
  'heavy-snow': 0.4,
  thunder: 0.3,
};

// ─── Static sky tints (fallback when no phaseColors) ─────────────────────────

type SkyTintMap = Record<WeatherCategory, string>;
const SKY_TINTS: Record<WeatherSkin, SkyTintMap> = {
  foundry: {
    clear: 'transparent',
    'partly-cloudy': 'rgba(200,210,228,0.12)',
    overcast: 'rgba(150,158,180,0.30)',
    fog: 'rgba(200,210,225,0.48)',
    drizzle: 'rgba(140,155,185,0.28)',
    rain: 'rgba(100,118,160,0.35)',
    'heavy-rain': 'rgba(70,85,130,0.45)',
    snow: 'rgba(220,230,248,0.30)',
    'heavy-snow': 'rgba(210,225,248,0.42)',
    thunder: 'rgba(28,30,58,0.55)',
  },
  meridian: {
    clear: 'transparent',
    'partly-cloudy': 'rgba(180,192,210,0.08)',
    overcast: 'rgba(140,148,168,0.20)',
    fog: 'rgba(190,200,216,0.32)',
    drizzle: 'rgba(130,145,175,0.16)',
    rain: 'rgba(96,112,152,0.22)',
    'heavy-rain': 'rgba(68,80,120,0.30)',
    snow: 'rgba(215,225,242,0.18)',
    'heavy-snow': 'rgba(205,218,242,0.28)',
    thunder: 'rgba(20,22,46,0.42)',
  },
  mineral: {
    clear: 'transparent',
    'partly-cloudy': 'rgba(160,180,220,0.15)',
    overcast: 'rgba(80,90,130,0.38)',
    fog: 'rgba(180,190,220,0.50)',
    drizzle: 'rgba(100,120,180,0.30)',
    rain: 'rgba(60,80,160,0.40)',
    'heavy-rain': 'rgba(40,55,130,0.52)',
    snow: 'rgba(200,220,255,0.32)',
    'heavy-snow': 'rgba(185,210,255,0.45)',
    thunder: 'rgba(16,18,52,0.62)',
  },
  paper: {
    clear: 'transparent',
    'partly-cloudy': 'rgba(180,168,140,0.12)',
    overcast: 'rgba(130,120,96,0.28)',
    fog: 'rgba(200,192,168,0.42)',
    drizzle: 'rgba(140,128,100,0.24)',
    rain: 'rgba(100,88,64,0.32)',
    'heavy-rain': 'rgba(68,56,40,0.42)',
    snow: 'rgba(240,235,220,0.30)',
    'heavy-snow': 'rgba(235,230,215,0.42)',
    thunder: 'rgba(24,20,14,0.52)',
  },
  signal: {
    clear: 'transparent',
    'partly-cloudy': 'rgba(0,0,0,0.10)',
    overcast: 'rgba(0,0,0,0.22)',
    fog: 'rgba(0,0,0,0.30)',
    drizzle: 'rgba(0,0,0,0.12)',
    rain: 'rgba(0,0,0,0.18)',
    'heavy-rain': 'rgba(0,0,0,0.28)',
    snow: 'rgba(0,0,0,0.08)',
    'heavy-snow': 'rgba(0,0,0,0.14)',
    thunder: 'rgba(0,0,0,0.45)',
  },
  aurora: {
    clear: 'transparent',
    'partly-cloudy': 'rgba(160,200,220,0.10)',
    overcast: 'rgba(100,130,160,0.25)',
    fog: 'rgba(180,210,230,0.40)',
    drizzle: 'rgba(120,160,200,0.22)',
    rain: 'rgba(80,130,180,0.30)',
    'heavy-rain': 'rgba(50,100,160,0.42)',
    snow: 'rgba(210,230,255,0.28)',
    'heavy-snow': 'rgba(200,225,255,0.40)',
    thunder: 'rgba(20,28,60,0.55)',
  },
  tide: {
    clear: 'transparent',
    'partly-cloudy': 'rgba(168,200,216,0.10)',
    overcast: 'rgba(100,130,150,0.25)',
    fog: 'rgba(176,200,216,0.40)',
    drizzle: 'rgba(128,168,200,0.20)',
    rain: 'rgba(80,128,176,0.28)',
    'heavy-rain': 'rgba(50,96,140,0.40)',
    snow: 'rgba(210,230,248,0.25)',
    'heavy-snow': 'rgba(200,224,244,0.38)',
    thunder: 'rgba(16,24,44,0.50)',
  },
  sundial: {
    clear: 'transparent',
    'partly-cloudy': 'rgba(192,176,144,0.10)',
    overcast: 'rgba(120,108,80,0.25)',
    fog: 'rgba(200,192,168,0.38)',
    drizzle: 'rgba(160,148,120,0.20)',
    rain: 'rgba(120,108,80,0.28)',
    'heavy-rain': 'rgba(80,68,44,0.38)',
    snow: 'rgba(240,238,232,0.22)',
    'heavy-snow': 'rgba(236,232,224,0.35)',
    thunder: 'rgba(20,16,10,0.48)',
  },
  void: {
    clear: 'transparent',
    'partly-cloudy': 'rgba(4,4,4,0.08)',
    overcast: 'rgba(4,4,4,0.18)',
    fog: 'rgba(8,8,8,0.25)',
    drizzle: 'rgba(4,4,4,0.10)',
    rain: 'rgba(4,4,4,0.15)',
    'heavy-rain': 'rgba(4,4,4,0.22)',
    snow: 'rgba(8,8,8,0.10)',
    'heavy-snow': 'rgba(8,8,8,0.16)',
    thunder: 'rgba(4,4,4,0.40)',
  },
  parchment: {
    clear: 'transparent',
    'partly-cloudy': 'transparent',
    overcast: 'transparent',
    fog: 'transparent',
    drizzle: 'transparent',
    rain: 'transparent',
    'heavy-rain': 'transparent',
    snow: 'transparent',
    'heavy-snow': 'transparent',
    thunder: 'transparent',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// CLOUD RENDERERS
// ─────────────────────────────────────────────────────────────────────────────

interface RealisticCloudProps {
  id: string;
  cloudBase: string;
  cloudShadow: string;
  cloudHi: string;
  width: number;
  height: number;
  category: WeatherCategory;
}

function FoundryCloud({
  id,
  cloudBase,
  cloudShadow,
  cloudHi,
  width,
  height,
  category,
}: RealisticCloudProps) {
  const w = width;
  const h = height;
  const cfg = (
    {
      'partly-cloudy': { puffs: 2, soft: 4, hiAlpha: 0.78, baseRy: 0.34, baseYFrac: 0.6 },
      overcast: { puffs: 4, soft: 7, hiAlpha: 0.28, baseRy: 0.44, baseYFrac: 0.56 },
      drizzle: { puffs: 3, soft: 6, hiAlpha: 0.3, baseRy: 0.4, baseYFrac: 0.58 },
      rain: { puffs: 3, soft: 6, hiAlpha: 0.26, baseRy: 0.4, baseYFrac: 0.6 },
      'heavy-rain': { puffs: 4, soft: 8, hiAlpha: 0.18, baseRy: 0.46, baseYFrac: 0.54 },
      snow: { puffs: 3, soft: 5, hiAlpha: 0.55, baseRy: 0.38, baseYFrac: 0.6 },
      'heavy-snow': { puffs: 4, soft: 6, hiAlpha: 0.42, baseRy: 0.44, baseYFrac: 0.57 },
      thunder: { puffs: 4, soft: 9, hiAlpha: 0.12, baseRy: 0.52, baseYFrac: 0.52 },
      fog: { puffs: 2, soft: 11, hiAlpha: 0.18, baseRy: 0.38, baseYFrac: 0.6 },
    } as Record<
      string,
      { puffs: number; soft: number; hiAlpha: number; baseRy: number; baseYFrac: number }
    >
  )[category] ?? { puffs: 3, soft: 5, hiAlpha: 0.4, baseRy: 0.38, baseYFrac: 0.6 };

  const { puffs, soft, hiAlpha, baseRy, baseYFrac } = cfg;
  const cx = w / 2;
  const baseY = h * baseYFrac;

  const puffDefs = Array.from({ length: puffs }, (_, i) => {
    const spread = puffs === 2 ? 0.3 : puffs === 3 ? 0.26 : 0.22;
    const xFrac = puffs > 1 ? i / (puffs - 1) - 0.5 : 0;
    const isCenter = i === Math.floor(puffs / 2);
    return {
      cx: cx + xFrac * w * spread * 2,
      cy: h * (baseYFrac - 0.36) * (isCenter ? 1.0 : 1.06),
      rx: w * (spread + 0.05) * (isCenter ? 1.0 : 0.82),
      ry: h * 0.38 * (isCenter ? 1.0 : 0.88),
    };
  });

  return (
    <svg
      aria-hidden="true"
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      fill="none"
      overflow="visible"
      style={{ display: 'block' }}
    >
      <defs>
        <filter id={`${id}-ds`} x="-30%" y="-20%" width="160%" height="180%">
          <feGaussianBlur stdDeviation={soft * 1.8} />
        </filter>
        <filter id={`${id}-mb`} x="-20%" y="-30%" width="140%" height="160%">
          <feGaussianBlur stdDeviation={soft} />
        </filter>
        <filter id={`${id}-pf`} x="-15%" y="-25%" width="130%" height="150%">
          <feGaussianBlur stdDeviation={soft * 0.72} />
        </filter>
        <filter id={`${id}-hi`} x="-10%" y="-15%" width="120%" height="130%">
          <feGaussianBlur stdDeviation={soft * 0.3} />
        </filter>
        <filter id={`${id}-us`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={soft * 1.1} />
        </filter>
      </defs>
      <ellipse
        cx={cx + w * 0.02}
        cy={baseY + h * 0.14}
        rx={w * 0.44}
        ry={h * 0.1}
        fill={cloudShadow}
        filter={`url(#${id}-ds)`}
        opacity={0.52}
      />
      <ellipse
        cx={cx}
        cy={baseY}
        rx={w * 0.48}
        ry={h * baseRy}
        fill={cloudBase}
        filter={`url(#${id}-mb)`}
      />
      {puffDefs.map((p, i) => (
        <ellipse
          key={`${p.cx}-${p.cy}`}
          cx={p.cx}
          cy={p.cy}
          rx={p.rx}
          ry={p.ry}
          fill={cloudBase}
          filter={`url(#${id}-pf)`}
          opacity={0.92 - i * 0.04}
        />
      ))}
      <ellipse
        cx={cx}
        cy={h * (baseYFrac - 0.12)}
        rx={w * 0.42}
        ry={h * (baseRy + 0.08)}
        fill={cloudBase}
        filter={`url(#${id}-mb)`}
        opacity={0.82}
      />
      <ellipse
        cx={cx - w * 0.1}
        cy={h * (baseYFrac - 0.29)}
        rx={w * 0.18}
        ry={h * 0.12}
        fill={cloudHi}
        filter={`url(#${id}-hi)`}
        opacity={hiAlpha}
      />
      <ellipse
        cx={cx}
        cy={baseY + h * 0.07}
        rx={w * 0.42}
        ry={h * 0.1}
        fill={cloudShadow}
        filter={`url(#${id}-us)`}
        opacity={0.46}
      />
    </svg>
  );
}

interface MinimalCloudProps {
  id: string;
  cloudBase: string;
  cloudHi: string;
  width: number;
  height: number;
  category: WeatherCategory;
}

function MeridianCloud({ id, cloudBase, cloudHi, width, height, category }: MinimalCloudProps) {
  const w = width;
  const h = height;
  const isDark = category === 'overcast' || category === 'thunder' || category === 'heavy-rain';
  const strokeW = isDark ? 1.2 : 0.9;

  return (
    <svg
      aria-hidden="true"
      width={w}
      height={h}
      viewBox="0 0 160 56"
      fill="none"
      overflow="visible"
      style={{ display: 'block' }}
    >
      <defs>
        <filter id={`${id}-blur`} x="-5%" y="-10%" width="110%" height="120%">
          <feGaussianBlur stdDeviation="0.8" />
        </filter>
      </defs>
      <path
        d="M18 42 Q18 28 30 26 Q32 14 46 14 Q52 6 66 10 Q76 2 92 8 Q108 4 116 14 Q132 12 136 24 Q148 24 148 36 Q148 46 136 46 L28 46 Q18 46 18 42Z"
        fill="none"
        stroke={cloudBase}
        strokeWidth={strokeW * 1.2}
        opacity={0.85}
      />
      <path
        d="M28 42 Q28 32 36 30 Q36 20 50 18 Q56 12 68 15 Q78 8 92 12 Q106 8 114 18 Q128 16 132 28 Q142 28 142 38 Q142 44 132 44 L36 44"
        fill="none"
        stroke={cloudBase}
        strokeWidth={strokeW * 0.7}
        opacity={0.38}
      />
      <path
        d="M44 14 Q58 7 72 10 Q82 4 94 8"
        fill="none"
        stroke={cloudHi}
        strokeWidth={strokeW * 0.8}
        strokeLinecap="round"
        opacity={0.65}
        filter={`url(#${id}-blur)`}
      />
      <line
        x1="28"
        y1="46"
        x2="136"
        y2="46"
        stroke={cloudBase}
        strokeWidth={strokeW * 0.5}
        opacity={0.25}
      />
    </svg>
  );
}

interface CrystalCloudProps {
  id: string;
  cloudBase: string;
  cloudShadow: string;
  cloudHi: string;
  width: number;
  height: number;
  category: WeatherCategory;
}

function MineralCloud({
  id,
  cloudBase,
  cloudShadow,
  cloudHi,
  width,
  height,
  category,
}: CrystalCloudProps) {
  const w = width;
  const h = height;
  const isDark = category === 'overcast' || category === 'thunder';

  return (
    <svg
      aria-hidden="true"
      width={w}
      height={h}
      viewBox="0 0 160 64"
      fill="none"
      overflow="visible"
      style={{ display: 'block' }}
    >
      <defs>
        <filter id={`${id}-glow`} x="-20%" y="-30%" width="140%" height="160%">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={`${id}-hi`} x="-5%" y="-10%" width="110%" height="120%">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
      </defs>
      <path
        d="M20 50 L24 32 L36 22 L52 18 L66 10 L82 8 L96 12 L110 8 L124 14 L136 22 L140 32 L144 50 Z"
        fill={cloudBase}
        stroke={cloudHi}
        strokeWidth="0.8"
        opacity={0.88}
      />
      <path
        d="M20 50 L24 32 L52 18 L66 10 L82 8"
        fill="none"
        stroke={cloudHi}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity={isDark ? 0.25 : 0.45}
        filter={`url(#${id}-hi)`}
      />
      <path
        d="M82 8 L110 8 L136 22 L144 50"
        fill="none"
        stroke={cloudShadow}
        strokeWidth="1.0"
        strokeLinecap="round"
        opacity={0.35}
      />
      <path
        d="M52 18 L66 10 L82 8 L96 12 L110 8"
        fill="none"
        stroke={cloudHi}
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity={isDark ? 0.3 : 0.6}
        filter={`url(#${id}-glow)`}
      />
      <path
        d="M24 32 L52 18 L110 8 L136 22"
        fill="none"
        stroke={cloudShadow}
        strokeWidth="0.8"
        opacity={0.28}
      />
    </svg>
  );
}

interface WatercolorCloudProps {
  id: string;
  cloudBase: string;
  cloudShadow: string;
  cloudHi: string;
  width: number;
  height: number;
  category: WeatherCategory;
}

function PaperCloud({
  id,
  cloudBase,
  cloudShadow,
  cloudHi,
  width,
  height,
  category,
}: WatercolorCloudProps) {
  const w = width;
  const h = height;
  const blurAmount = category === 'fog' ? 18 : category === 'overcast' ? 14 : 10;

  return (
    <svg
      aria-hidden="true"
      width={w}
      height={h}
      viewBox="0 0 160 72"
      fill="none"
      overflow="visible"
      style={{ display: 'block' }}
    >
      <defs>
        <filter id={`${id}-wash`} x="-30%" y="-40%" width="160%" height="180%">
          <feGaussianBlur stdDeviation={blurAmount} />
        </filter>
        <filter id={`${id}-edge`} x="-10%" y="-20%" width="120%" height="140%">
          <feGaussianBlur stdDeviation="3.5" />
        </filter>
        <filter id={`${id}-hi`} x="-5%" y="-15%" width="110%" height="130%">
          <feGaussianBlur stdDeviation="2.0" />
        </filter>
      </defs>
      <ellipse
        cx="80"
        cy="42"
        rx="72"
        ry="28"
        fill={cloudBase}
        filter={`url(#${id}-wash)`}
        opacity={0.55}
      />
      <ellipse
        cx="80"
        cy="38"
        rx="60"
        ry="22"
        fill={cloudBase}
        filter={`url(#${id}-edge)`}
        opacity={0.72}
      />
      <ellipse
        cx="65"
        cy="28"
        rx="34"
        ry="20"
        fill={cloudBase}
        filter={`url(#${id}-edge)`}
        opacity={0.6}
      />
      <ellipse
        cx="100"
        cy="30"
        rx="28"
        ry="18"
        fill={cloudBase}
        filter={`url(#${id}-edge)`}
        opacity={0.55}
      />
      <ellipse
        cx="58"
        cy="24"
        rx="20"
        ry="12"
        fill={cloudHi}
        filter={`url(#${id}-hi)`}
        opacity={0.42}
      />
      <ellipse
        cx="80"
        cy="50"
        rx="55"
        ry="12"
        fill={cloudShadow}
        filter={`url(#${id}-wash)`}
        opacity={0.35}
      />
    </svg>
  );
}

interface TerminalCloudProps {
  id: string;
  cloudBase: string;
  cloudHi: string;
  width: number;
  height: number;
  category: WeatherCategory;
}

function SignalCloud({ id, cloudBase, cloudHi, width, height, category }: TerminalCloudProps) {
  const w = width;
  const h = height;
  const isDark = category === 'overcast' || category === 'thunder' || category === 'heavy-rain';
  const blocks = [
    { x: 10, y: 32, w: 18, h: 18 },
    { x: 26, y: 24, w: 22, h: 26 },
    { x: 46, y: 16, w: 20, h: 34 },
    { x: 64, y: 10, w: 28, h: 40 },
    { x: 90, y: 14, w: 22, h: 36 },
    { x: 110, y: 20, w: 20, h: 30 },
    { x: 128, y: 28, w: 18, h: 22 },
  ];

  return (
    <svg
      aria-hidden="true"
      width={w}
      height={h}
      viewBox="0 0 160 56"
      fill="none"
      overflow="visible"
      style={{ display: 'block' }}
    >
      {/* Block fill */}
      {blocks.map((b) => (
        <rect
          key={b.x}
          x={b.x}
          y={b.y}
          width={b.w}
          height={b.h}
          fill={cloudBase}
          opacity={isDark ? 0.85 : 0.7}
        />
      ))}
      {/* Top highlight row */}
      {blocks.map((b) => (
        <line
          key={`h${b.x}`}
          x1={b.x}
          y1={b.y}
          x2={b.x + b.w}
          y2={b.y}
          stroke={cloudHi}
          strokeWidth={1}
          opacity={0.75}
        />
      ))}
      {/* Left edge highlight */}
      {blocks.map((b) => (
        <line
          key={`l${b.x}`}
          x1={b.x}
          y1={b.y}
          x2={b.x}
          y2={b.y + b.h}
          stroke={cloudHi}
          strokeWidth={0.7}
          opacity={0.45}
        />
      ))}
      {/* Scan line overlay */}
      {Array.from({ length: Math.floor(h / 4) }, (_, i) => {
        const y = i * 4 + 2;
        return (
          <line key={y} x1={0} y1={y} x2={w} y2={y} stroke="rgba(0,0,0,0.06)" strokeWidth={1} />
        );
      })}
    </svg>
  );
}

interface AuroraCloudProps {
  id: string;
  cloudBase: string;
  cloudShadow: string;
  cloudHi: string;
  width: number;
  height: number;
  category: WeatherCategory;
}

function AuroraCloud({
  id,
  cloudBase,
  cloudShadow,
  cloudHi,
  width,
  height,
  category,
}: AuroraCloudProps) {
  const w = width;
  const h = height;
  const blurAmount = category === 'fog' ? 22 : 14;

  return (
    <svg
      aria-hidden="true"
      width={w}
      height={h}
      viewBox="0 0 160 60"
      fill="none"
      overflow="visible"
      style={{ display: 'block' }}
    >
      <defs>
        <filter id={`${id}-aurora`} x="-40%" y="-60%" width="180%" height="220%">
          <feGaussianBlur stdDeviation={blurAmount} />
        </filter>
        <filter id={`${id}-glow`} x="-20%" y="-30%" width="140%" height="160%">
          <feGaussianBlur stdDeviation={blurAmount * 0.5} />
        </filter>
        <filter id={`${id}-hi`} x="-10%" y="-20%" width="120%" height="140%">
          <feGaussianBlur stdDeviation={4} />
        </filter>
      </defs>
      <ellipse
        cx="80"
        cy="36"
        rx="78"
        ry="26"
        fill={cloudBase}
        filter={`url(#${id}-aurora)`}
        opacity={0.55}
      />
      <ellipse
        cx="80"
        cy="34"
        rx="60"
        ry="20"
        fill={cloudHi}
        filter={`url(#${id}-glow)`}
        opacity={0.38}
      />
      <ellipse
        cx="75"
        cy="30"
        rx="35"
        ry="14"
        fill={cloudHi}
        filter={`url(#${id}-hi)`}
        opacity={0.45}
      />
      <ellipse
        cx="92"
        cy="38"
        rx="45"
        ry="12"
        fill={cloudShadow}
        filter={`url(#${id}-glow)`}
        opacity={0.28}
      />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER
// ─────────────────────────────────────────────────────────────────────────────

function withAlpha(color: string, alpha: number): string {
  const m = color.match(/rgba?\(([^)]+)\)/);
  if (!m) return color;
  const parts = m[1].split(',').map((s) => s.trim());
  return `rgba(${parts[0]},${parts[1]},${parts[2]},${alpha})`;
}

// ─────────────────────────────────────────────────────────────────────────────
// TIDE / SUNDIAL / VOID renderers
// ─────────────────────────────────────────────────────────────────────────────

interface WeatherRendererColors {
  cloudColor?: string;
  cloudShadow?: string;
  cloudHi?: string;
  rainColor?: string;
  thunderColor?: string;
}

function TideCloudRenderer({
  w,
  h,
  colors,
  opacity,
}: { w: number; h: number; colors: WeatherRendererColors; opacity: number }) {
  const id = useId().replace(/:/g, '');
  const base = colors?.cloudColor ?? '#A8C8D8';
  const shadow = colors?.cloudShadow ?? 'rgba(60,100,140,0.65)';
  const hi = colors?.cloudHi ?? 'rgba(210,248,255,0.65)';
  const cx = w / 2;
  const baseY = h * 0.62;

  return (
    <svg
      aria-hidden="true"
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      fill="none"
      overflow="visible"
      style={{ display: 'block' }}
    >
      <defs>
        <filter id={`tc-ds-${id}`} x="-30%" y="-20%" width="160%" height="180%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
        <filter id={`tc-mb-${id}`} x="-20%" y="-30%" width="140%" height="160%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <filter id={`tc-pf-${id}`} x="-15%" y="-25%" width="130%" height="150%">
          <feGaussianBlur stdDeviation="3.2" />
        </filter>
        <filter id={`tc-hi-${id}`} x="-10%" y="-15%" width="120%" height="130%">
          <feGaussianBlur stdDeviation="1.4" />
        </filter>
        <filter id={`tc-us-${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5.5" />
        </filter>
      </defs>

      {/* Drop shadow — phase-tinted */}
      <ellipse
        cx={cx + w * 0.02}
        cy={baseY + h * 0.14}
        rx={w * 0.5}
        ry={h * 0.09}
        fill={shadow}
        filter={`url(#tc-ds-${id})`}
        opacity={opacity * 0.52}
      />

      {/* Wide flat maritime base */}
      <ellipse
        cx={cx}
        cy={baseY}
        rx={w * 0.52}
        ry={h * 0.3}
        fill={base}
        filter={`url(#tc-mb-${id})`}
        opacity={opacity * 0.88}
      />

      {/* Three puffs */}
      <ellipse
        cx={cx - w * 0.22}
        cy={h * 0.36}
        rx={w * 0.22}
        ry={h * 0.24}
        fill={base}
        filter={`url(#tc-pf-${id})`}
        opacity={opacity * 0.82}
      />
      <ellipse
        cx={cx + w * 0.02}
        cy={h * 0.24}
        rx={w * 0.26}
        ry={h * 0.3}
        fill={base}
        filter={`url(#tc-pf-${id})`}
        opacity={opacity * 0.92}
      />
      <ellipse
        cx={cx + w * 0.26}
        cy={h * 0.38}
        rx={w * 0.2}
        ry={h * 0.22}
        fill={base}
        filter={`url(#tc-pf-${id})`}
        opacity={opacity * 0.78}
      />

      {/* Blend layer */}
      <ellipse
        cx={cx}
        cy={h * 0.46}
        rx={w * 0.48}
        ry={h * 0.26}
        fill={base}
        filter={`url(#tc-mb-${id})`}
        opacity={opacity * 0.68}
      />

      {/* Phase-reactive highlight — warm at sunrise/sunset, cool blue at night */}
      <ellipse
        cx={cx - w * 0.04}
        cy={h * 0.18}
        rx={w * 0.16}
        ry={h * 0.1}
        fill={hi}
        filter={`url(#tc-hi-${id})`}
        opacity={opacity * 0.78}
      />
      <ellipse
        cx={cx - w * 0.2}
        cy={h * 0.28}
        rx={w * 0.09}
        ry={h * 0.06}
        fill={hi}
        filter={`url(#tc-hi-${id})`}
        opacity={opacity * 0.52}
      />

      {/* Underside — phase-tinted ocean reflection */}
      <ellipse
        cx={cx}
        cy={baseY + h * 0.06}
        rx={w * 0.46}
        ry={h * 0.09}
        fill={shadow}
        filter={`url(#tc-us-${id})`}
        opacity={opacity * 0.45}
      />
    </svg>
  );
}

function TideRainRenderer({
  w,
  h,
  rainColorFn,
  angle,
  category,
}: {
  w: number;
  h: number;
  rainColorFn: (a: number) => string;
  angle: number;
  category: WeatherCategory;
}) {
  // Sea rain — heavier drops, slight spray suggestion, more diagonal
  const count = category === 'heavy-rain' ? 80 : category === 'rain' ? 48 : 22;
  const baseLen = category === 'heavy-rain' ? 30 : category === 'rain' ? 20 : 10;
  const seaAngle = category === 'heavy-rain' ? angle + 6 : angle + 3; // sea wind pushes harder
  const r = seededRand(73);
  const drops = Array.from({ length: count }, (_, i) => {
    const layer = r() > 0.45;
    const isSpray = r() > 0.85; // occasional short fat spray drop
    return {
      i,
      x: r() * 112 - 6,
      delay: -(r() * 1.8),
      dur: isSpray ? 0.5 + r() * 0.3 : 0.28 + r() * 0.28,
      alpha: layer ? 0.6 + r() * 0.32 : 0.2 + r() * 0.2,
      len: isSpray ? baseLen * 0.3 : layer ? baseLen : baseLen * 0.55,
      wid: isSpray ? 2.5 : layer ? 1.6 : 0.9,
      spray: isSpray,
    };
  });

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {drops.map((d) => (
        <div
          key={d.i}
          style={{
            position: 'absolute',
            left: `${d.x}%`,
            top: 0,
            width: `${d.wid}px`,
            height: `${d.len}px`,
            background: d.spray
              ? rainColorFn(d.alpha * 0.7)
              : `linear-gradient(to bottom, transparent 0%, ${rainColorFn(d.alpha)} 55%, ${rainColorFn(d.alpha * 0.4)} 100%)`,
            borderRadius: d.spray ? '50%' : '0 0 3px 3px',
            transform: `rotate(${seaAngle}deg)`,
            transformOrigin: 'top center',
            animation: `wRtide ${d.dur}s ${d.delay}s linear infinite`,
          }}
        />
      ))}
    </div>
  );
}

function SundialCloudRenderer({
  w,
  h,
  colors,
  opacity,
}: { w: number; h: number; colors: WeatherRendererColors; opacity: number }) {
  const id = useId().replace(/:/g, '');
  const base = colors?.cloudColor ?? '#C8B898';
  const shadow = colors?.cloudShadow ?? 'rgba(120,85,45,0.65)';
  const hi = colors?.cloudHi ?? 'rgba(255,248,220,0.75)';
  const cx = w / 2;
  const baseY = h * 0.6;

  return (
    <svg
      aria-hidden="true"
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      fill="none"
      overflow="visible"
      style={{ display: 'block' }}
    >
      <defs>
        <filter id={`sd-ds-${id}`} x="-30%" y="-20%" width="160%" height="180%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
        <filter id={`sd-mb-${id}`} x="-20%" y="-30%" width="140%" height="160%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
        <filter id={`sd-pf-${id}`} x="-15%" y="-25%" width="130%" height="150%">
          <feGaussianBlur stdDeviation="2.6" />
        </filter>
        <filter id={`sd-hi-${id}`} x="-10%" y="-15%" width="120%" height="130%">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
        <filter id={`sd-us-${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4.5" />
        </filter>
      </defs>

      {/* Drop shadow — phase warm amber at day, cool slate at night */}
      <ellipse
        cx={cx + w * 0.02}
        cy={baseY + h * 0.14}
        rx={w * 0.46}
        ry={h * 0.09}
        fill={shadow}
        filter={`url(#sd-ds-${id})`}
        opacity={opacity * 0.48}
      />

      {/* Base body */}
      <ellipse
        cx={cx}
        cy={baseY}
        rx={w * 0.48}
        ry={h * 0.3}
        fill={base}
        filter={`url(#sd-mb-${id})`}
        opacity={opacity * 0.85}
      />

      {/* Three upright puffs — taller ry = more column-like */}
      <ellipse
        cx={cx - w * 0.24}
        cy={h * 0.32}
        rx={w * 0.18}
        ry={h * 0.28}
        fill={base}
        filter={`url(#sd-pf-${id})`}
        opacity={opacity * 0.8}
      />
      <ellipse
        cx={cx + w * 0.01}
        cy={h * 0.2}
        rx={w * 0.22}
        ry={h * 0.34}
        fill={base}
        filter={`url(#sd-pf-${id})`}
        opacity={opacity * 0.9}
      />
      <ellipse
        cx={cx + w * 0.26}
        cy={h * 0.34}
        rx={w * 0.17}
        ry={h * 0.26}
        fill={base}
        filter={`url(#sd-pf-${id})`}
        opacity={opacity * 0.76}
      />

      {/* Blend layer */}
      <ellipse
        cx={cx}
        cy={h * 0.44}
        rx={w * 0.44}
        ry={h * 0.26}
        fill={base}
        filter={`url(#sd-mb-${id})`}
        opacity={opacity * 0.65}
      />

      {/* Phase-reactive warm highlight — golden at noon, cool at dusk/dawn */}
      <ellipse
        cx={cx - w * 0.06}
        cy={h * 0.14}
        rx={w * 0.14}
        ry={h * 0.09}
        fill={hi}
        filter={`url(#sd-hi-${id})`}
        opacity={opacity * 0.82}
      />
      <ellipse
        cx={cx - w * 0.22}
        cy={h * 0.24}
        rx={w * 0.08}
        ry={h * 0.06}
        fill={hi}
        filter={`url(#sd-hi-${id})`}
        opacity={opacity * 0.56}
      />

      {/* Underside — phase warm stone shadow */}
      <ellipse
        cx={cx}
        cy={baseY + h * 0.06}
        rx={w * 0.44}
        ry={h * 0.09}
        fill={shadow}
        filter={`url(#sd-us-${id})`}
        opacity={opacity * 0.42}
      />
    </svg>
  );
}

function SundialRainRenderer({
  w,
  h,
  rainColorFn,
  category,
}: {
  w: number;
  h: number;
  rainColorFn: (a: number) => string;
  category: WeatherCategory;
}) {
  // Stone rain — water running down carved stone face
  // Near-vertical, heavier streaks, some short wide smear drops
  const count = category === 'heavy-rain' ? 52 : category === 'rain' ? 32 : 14;
  const baseLen = category === 'heavy-rain' ? 28 : category === 'rain' ? 18 : 9;
  const r = seededRand(89);
  const drops = Array.from({ length: count }, (_, i) => {
    const layer = r() > 0.5;
    const isRunoff = r() > 0.75; // stone runoff — long thin streak
    return {
      i,
      x: r() * 106 - 3,
      delay: -(r() * 2.8), // stone rain is slower, more rhythmic
      dur: isRunoff ? 1.2 + r() * 0.8 : 0.65 + r() * 0.5,
      alpha: layer ? 0.52 + r() * 0.28 : 0.16 + r() * 0.18,
      len: isRunoff ? baseLen * 2.2 : layer ? baseLen : baseLen * 0.6,
      wid: isRunoff ? 0.8 : layer ? 1.2 : 0.65,
      runoff: isRunoff,
    };
  });

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {drops.map((d) => (
        <div
          key={d.i}
          style={{
            position: 'absolute',
            left: `${d.x}%`,
            top: 0,
            width: `${d.wid}px`,
            height: `${d.len}px`,
            background: d.runoff
              ? // Stone runoff — long gradient, like water channeling down carved grooves
                `linear-gradient(to bottom, transparent 0%, ${rainColorFn(d.alpha * 0.4)} 15%, ${rainColorFn(d.alpha)} 50%, ${rainColorFn(d.alpha * 0.6)} 85%, transparent 100%)`
              : `linear-gradient(to bottom, transparent 0%, ${rainColorFn(d.alpha)} 50%, transparent 100%)`,
            borderRadius: d.runoff ? '0' : '50%',
            filter: d.runoff ? 'none' : 'blur(0.3px)',
            // Stone rain is nearly vertical — 1-2° at most
            transform: 'rotate(1deg)',
            transformOrigin: 'top center',
            animation: `wRsundial ${d.dur}s ${d.delay}s linear infinite`,
          }}
        />
      ))}
    </div>
  );
}

function VoidCloudRenderer({
  w,
  h,
  colors,
  opacity,
}: { w: number; h: number; colors: WeatherRendererColors; opacity: number }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg
      aria-hidden="true"
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{ position: 'absolute', inset: 0 }}
    >
      <defs>
        <filter id={`vcf-${id}`} x="-30%" y="-50%" width="160%" height="200%">
          <feGaussianBlur stdDeviation="12" />
        </filter>
      </defs>
      <ellipse
        cx={w * 0.3}
        cy={h * 0.3}
        rx={w * 0.35}
        ry={h * 0.22}
        fill={colors?.cloudColor ?? '#181818'}
        filter={`url(#vcf-${id})`}
        opacity={opacity * 0.55}
      />
      <ellipse
        cx={w * 0.72}
        cy={h * 0.5}
        rx={w * 0.28}
        ry={h * 0.18}
        fill={colors?.cloudColor ?? '#141414'}
        filter={`url(#vcf-${id})`}
        opacity={opacity * 0.45}
      />
    </svg>
  );
}

function VoidThunderRenderer({
  w,
  h,
  colors,
  opacity,
}: { w: number; h: number; colors: WeatherRendererColors; opacity: number }) {
  const id = useId().replace(/:/g, '');
  const flashColor = colors?.thunderColor ?? '#FFFFFF';
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <style>{`
        @keyframes void-thunder-${id} {
          0%, 55%, 100% { opacity: 0; }
          57%  { opacity: ${opacity * 0.88}; }
          60%  { opacity: ${opacity * 0.08}; }
          62%  { opacity: ${opacity * 0.82}; }
          68%  { opacity: 0; }
        }
      `}</style>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: flashColor,
          animation: `void-thunder-${id} 4.5s ease-in-out infinite`,
        }}
      />
      <svg
        aria-hidden="true"
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        style={{ position: 'absolute', inset: 0 }}
      >
        <style>{`
          @keyframes void-bolt-${id} {
            0%, 55%, 70%, 100% { opacity: 0; }
            57%, 68% { opacity: ${opacity * 0.6}; }
          }
        `}</style>
        <polyline
          points={`${w * 0.52},0 ${w * 0.48},${h * 0.4} ${w * 0.54},${h * 0.4} ${w * 0.44},${h}`}
          fill="none"
          stroke={flashColor}
          strokeWidth={1.2}
          style={{ animation: `void-bolt-${id} 4.5s ease-in-out infinite` }}
        />
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WeatherBackdrop
// ─────────────────────────────────────────────────────────────────────────────

export function WeatherBackdrop({
  category,
  skin = 'foundry',
  phaseColors,
}: {
  category: WeatherCategory;
  skin?: WeatherSkin;
  phaseColors?: PhaseColors;
}) {
  if (category === 'clear') return null;

  const tint = phaseColors ? phaseColors.skyTint : SKY_TINTS[skin][category];

  const isDark =
    category === 'overcast' ||
    category === 'thunder' ||
    category === 'heavy-rain' ||
    category === 'heavy-snow';
  const isHeavy = category === 'thunder' || category === 'heavy-rain';

  const darkOverlay: Record<WeatherSkin, [string, string]> = {
    foundry: ['rgba(20,22,44,0.55)', 'rgba(110,118,145,0.40)'],
    meridian: ['rgba(16,18,36,0.42)', 'rgba(90,98,120,0.28)'],
    mineral: ['rgba(10,12,40,0.60)', 'rgba(60,70,110,0.45)'],
    paper: ['rgba(24,18,10,0.48)', 'rgba(80,72,56,0.35)'],
    signal: ['rgba(0,0,0,0.50)', 'rgba(0,0,0,0.30)'],
    aurora: ['rgba(10,20,50,0.52)', 'rgba(60,90,130,0.35)'],
    tide: ['rgba(16,24,40,0.48)', 'rgba(60,80,110,0.32)'],
    sundial: ['rgba(20,16,10,0.45)', 'rgba(80,68,44,0.30)'],
    void: ['rgba(4,4,4,0.55)', 'rgba(4,4,4,0.35)'],
    parchment: ['rgba(55,53,47,0.06)', 'rgba(55,53,47,0.03)'],
  };
  const [heavyDark, lightDark] = darkOverlay[skin];

  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2 }}>
      {tint !== 'transparent' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(to bottom, ${tint} 0%, transparent 80%)`,
            borderRadius: 'inherit',
            transition: 'background 1.2s ease-in-out',
          }}
        />
      )}
      {isDark && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(to bottom, ${isHeavy ? heavyDark : lightDark} 0%, transparent 55%)`,
            borderRadius: 'inherit',
          }}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WeatherLayer
// ─────────────────────────────────────────────────────────────────────────────

export function WeatherLayer({
  category,
  skin = 'foundry',
  opacity = 1,
  phaseColors,
}: {
  category: WeatherCategory;
  skin?: WeatherSkin;
  opacity?: number;
  phaseColors?: PhaseColors;
}) {
  const rand = seededRand(42);
  const [ltFlash, setLtFlash] = useState(false);
  const [ltBolt, setLtBolt] = useState(false);
  const ltRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState<{ w: number; h: number }>({ w: 320, h: 180 });

  useEffect(() => {
    if (category !== 'thunder') {
      setLtFlash(false);
      setLtBolt(false);
      return;
    }
    const r = seededRand(77);
    const go = () => {
      ltRef.current = setTimeout(
        () => {
          setLtBolt(true);
          setLtFlash(true);
          setTimeout(() => {
            setLtFlash(false);
            setTimeout(() => {
              setLtFlash(true);
              setTimeout(() => {
                setLtFlash(false);
                setLtBolt(false);
              }, 90);
            }, 100);
          }, 80);
          go();
        },
        3500 + r() * 7000,
      );
    };
    go();
    return () => {
      if (ltRef.current) clearTimeout(ltRef.current);
    };
  }, [category]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setDims({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (category === 'clear') return null;

  if (skin === 'void' && category === 'thunder') {
    const pc = phaseColors;
    return (
      <div
        ref={containerRef}
        aria-hidden
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity, zIndex: 4 }}
      >
        <VoidThunderRenderer
          w={dims.w}
          h={dims.h}
          colors={{ thunderColor: pc?.boltColor }}
          opacity={opacity}
        />
      </div>
    );
  }

  const fallbackRainColors: Record<WeatherSkin, (a: number) => string> = {
    foundry: (a) => `rgba(190,210,255,${a})`,
    meridian: (a) => `rgba(160,185,220,${a * 0.75})`,
    mineral: (a) => `rgba(140,175,255,${a})`,
    paper: (a) => `rgba(120,100,72,${a * 0.85})`,
    signal: (a) => `rgba(30,144,212,${a})`,
    aurora: (a) => `rgba(180,215,255,${a * 0.8})`,
    tide: (a) => `rgba(160,200,224,${a * 0.75})`,
    sundial: (a) => `rgba(128,136,136,${a * 0.7})`,
    void: (a) => `rgba(32,32,32,${a * 0.6})`,
    parchment: (a) => `rgba(55,53,47,${a * 0.7})`,
  };
  const fallbackSnow: Record<WeatherSkin, string> = {
    foundry: 'rgba(255,255,255,0.9)',
    meridian: 'rgba(220,230,245,0.80)',
    mineral: 'rgba(200,220,255,0.90)',
    paper: 'rgba(240,235,215,0.85)',
    signal: 'rgba(30,144,212,0.80)',
    aurora: 'rgba(210,235,255,0.75)',
    tide: 'rgba(232,244,248,0.82)',
    sundial: 'rgba(240,238,232,0.80)',
    void: 'rgba(56,56,56,0.65)',
    parchment: 'rgba(55,53,47,0.55)',
  };
  const fallbackBolt: Record<WeatherSkin, { bolt: string; flash: string; glow: string }> = {
    foundry: {
      bolt: 'rgba(230,240,255,0.96)',
      flash: 'rgba(210,225,255,0.18)',
      glow: 'rgba(200,220,255,0.95)',
    },
    meridian: {
      bolt: 'rgba(200,215,240,0.90)',
      flash: 'rgba(180,200,230,0.12)',
      glow: 'rgba(180,210,255,0.80)',
    },
    mineral: {
      bolt: 'rgba(220,230,255,0.96)',
      flash: 'rgba(160,180,255,0.22)',
      glow: 'rgba(180,200,255,0.95)',
    },
    paper: {
      bolt: 'rgba(200,180,130,0.90)',
      flash: 'rgba(180,155,100,0.14)',
      glow: 'rgba(200,175,120,0.80)',
    },
    signal: {
      bolt: 'rgba(30,144,212,0.95)',
      flash: 'rgba(30,144,212,0.25)',
      glow: 'rgba(30,144,212,0.90)',
    },
    aurora: {
      bolt: 'rgba(200,240,255,0.92)',
      flash: 'rgba(180,230,255,0.20)',
      glow: 'rgba(160,230,255,0.90)',
    },
    tide: {
      bolt: 'rgba(200,232,255,0.94)',
      flash: 'rgba(200,232,255,0.18)',
      glow: 'rgba(160,210,248,0.88)',
    },
    sundial: {
      bolt: 'rgba(240,232,208,0.92)',
      flash: 'rgba(240,232,208,0.16)',
      glow: 'rgba(255,244,224,0.86)',
    },
    void: {
      bolt: 'rgba(255,255,255,0.96)',
      flash: 'rgba(255,255,255,0.25)',
      glow: 'rgba(255,255,255,0.92)',
    },
    parchment: {
      bolt: 'rgba(55,53,47,0.85)',
      flash: 'rgba(55,53,47,0.06)',
      glow: 'rgba(55,53,47,0.50)',
    },
  };

  const pc = phaseColors;
  const rainColorFn: (a: number) => string = pc
    ? (a) => withAlpha(pc.rainColor, a)
    : fallbackRainColors[skin];
  const snowFill = pc ? pc.snowColor : fallbackSnow[skin];
  const boltFill = pc ? pc.boltColor : fallbackBolt[skin].bolt;
  const boltGlowCol = pc ? pc.boltGlow : fallbackBolt[skin].glow;
  const flashBg = pc ? withAlpha(pc.boltColor, 0.15) : fallbackBolt[skin].flash;
  const cloudBase = pc ? pc.cloudBase : 'rgba(200,210,230,0.85)';
  const cloudShadow = pc ? pc.cloudShadow : 'rgba(150,160,185,0.65)';
  const cloudHi = pc ? pc.cloudHi : 'rgba(255,255,255,0.70)';

  const fogColorFn = pc
    ? (val: number) => withAlpha(pc.fogColor, val)
    : (val: number) => `rgba(200,212,230,${val})`;
  const fogColor2Fn = pc
    ? (val: number) => withAlpha(pc.fogColor, val * 0.72)
    : (val: number) => `rgba(215,225,240,${val * 0.72})`;

  const isDark =
    category === 'overcast' ||
    category === 'thunder' ||
    category === 'heavy-rain' ||
    category === 'heavy-snow';
  const isHeavy = category === 'thunder' || category === 'heavy-rain';
  const cloudCount = isHeavy ? 5 : isDark ? 4 : category === 'partly-cloudy' ? 2 : 3;
  const rainAngle = skin === 'signal' ? 0 : skin === 'mineral' ? 20 : isHeavy ? 16 : 10;
  const showClouds = skin !== 'signal' || (skin === 'signal' && category !== 'fog');

  const bgClouds = showClouds
    ? Array.from({ length: Math.ceil(cloudCount / 2) }, (_, i) => ({
        i,
        speed: 70 + rand() * 50,
        yPct: rand() * 28,
        delay: -(rand() * 80),
        opacity: isDark ? 0.95 : 0.68,
        w: Math.round(192 + rand() * 88),
        h: Math.round(76 + rand() * 34),
        size: 0.9 + rand() * 0.5,
      }))
    : [];

  const fgClouds = showClouds
    ? Array.from({ length: Math.floor(cloudCount / 2) }, (_, i) => ({
        i,
        speed: 45 + rand() * 30,
        yPct: 18 + rand() * 36,
        delay: -(rand() * 60),
        opacity: isDark ? 0.88 : 0.8,
        w: Math.round(144 + rand() * 78),
        h: Math.round(58 + rand() * 30),
        size: 0.65 + rand() * 0.45,
      }))
    : [];

  const rainCount = isHeavy ? 80 : category === 'rain' ? 44 : category === 'drizzle' ? 20 : 0;
  const dropLen = isHeavy ? 26 : category === 'rain' ? 17 : 9;
  const drops = Array.from({ length: rainCount }, (_, i) => {
    const layer = rand() > 0.5;
    return {
      i,
      x: rand() * 110 - 5,
      delay: -(rand() * 2),
      dur: 0.32 + rand() * 0.32,
      alpha: layer ? 0.55 + rand() * 0.35 : 0.22 + rand() * 0.22,
      len: layer ? dropLen : dropLen * 0.6,
      w: layer ? 1.5 : 0.8,
    };
  });

  const snowCount = category === 'heavy-snow' ? 60 : category === 'snow' ? 32 : 0;
  const flakes = Array.from({ length: snowCount }, (_, i) => {
    const sz = 2 + rand() * 4;
    return {
      i,
      x: rand() * 100,
      delay: -(rand() * 10),
      dur: 7 + rand() * 12,
      size: sz,
      drift: (rand() - 0.5) * 50,
      blur: sz < 3.5 ? 1 : 0,
      alpha: 0.5 + rand() * 0.45,
    };
  });

  function renderCloud(id: string, w: number, h: number, size: number) {
    switch (skin) {
      case 'foundry':
        return (
          <FoundryCloud
            id={id}
            cloudBase={cloudBase}
            cloudShadow={cloudShadow}
            cloudHi={cloudHi}
            width={w}
            height={h}
            category={category}
          />
        );
      case 'meridian':
        return (
          <MeridianCloud
            id={id}
            cloudBase={cloudBase}
            cloudHi={cloudHi}
            width={w}
            height={h}
            category={category}
          />
        );
      case 'mineral':
        return (
          <MineralCloud
            id={id}
            cloudBase={cloudBase}
            cloudShadow={cloudShadow}
            cloudHi={cloudHi}
            width={w}
            height={h}
            category={category}
          />
        );
      case 'paper':
        return (
          <PaperCloud
            id={id}
            cloudBase={cloudBase}
            cloudShadow={cloudShadow}
            cloudHi={cloudHi}
            width={w}
            height={h}
            category={category}
          />
        );
      case 'signal':
        return (
          <SignalCloud
            id={id}
            cloudBase={cloudBase}
            cloudHi={cloudHi}
            width={w}
            height={h}
            category={category}
          />
        );
      case 'aurora':
        return (
          <AuroraCloud
            id={id}
            cloudBase={cloudBase}
            cloudShadow={cloudShadow}
            cloudHi={cloudHi}
            width={w}
            height={h}
            category={category}
          />
        );
      case 'parchment':
        return (
          <MeridianCloud
            id={id}
            cloudBase={cloudBase}
            cloudHi={cloudHi}
            width={w}
            height={h}
            category={category}
          />
        );
    }
  }

  function renderDrop(d: (typeof drops)[0]) {
    if (skin === 'signal') {
      return (
        <div
          key={d.i}
          style={{
            position: 'absolute',
            left: `${d.x}%`,
            top: 0,
            width: '1px',
            height: `${d.len}px`,
            background: rainColorFn(d.alpha),
            animation: `wRsignal ${d.dur}s ${d.delay}s linear infinite`,
          }}
        />
      );
    }
    if (skin === 'meridian') {
      return (
        <div
          key={d.i}
          style={{
            position: 'absolute',
            left: `${d.x}%`,
            top: 0,
            width: '0.7px',
            height: `${d.len}px`,
            background: rainColorFn(d.alpha * 0.75),
            borderRadius: '0 0 1px 1px',
            animation: `wRmeridian ${d.dur}s ${d.delay}s linear infinite`,
            transform: `rotate(${rainAngle}deg)`,
            transformOrigin: 'top center',
          }}
        />
      );
    }
    if (skin === 'mineral') {
      return (
        <div
          key={d.i}
          style={{
            position: 'absolute',
            left: `${d.x}%`,
            top: 0,
            width: `${d.w * 1.8}px`,
            height: `${d.len * 0.7}px`,
            background: `linear-gradient(to bottom, transparent 0%, ${rainColorFn(d.alpha)} 40%, ${rainColorFn(d.alpha * 0.5)} 100%)`,
            borderRadius: '0 0 3px 3px',
            transform: `rotate(${rainAngle}deg)`,
            transformOrigin: 'top center',
            animation: `wRmineral ${d.dur}s ${d.delay}s linear infinite`,
          }}
        />
      );
    }
    if (skin === 'paper') {
      const smearW = 1.2 + rand() * 1.5;
      return (
        <div
          key={d.i}
          style={{
            position: 'absolute',
            left: `${d.x}%`,
            top: 0,
            width: `${smearW}px`,
            height: `${d.len * 0.85}px`,
            background: `linear-gradient(to bottom, transparent 0%, ${rainColorFn(d.alpha * 0.8)} 50%, transparent 100%)`,
            borderRadius: '50%',
            filter: 'blur(0.4px)',
            animation: `wRpaper ${d.dur * 1.2}s ${d.delay}s linear infinite`,
          }}
        />
      );
    }
    if (skin === 'aurora') {
      return (
        <div
          key={d.i}
          style={{
            position: 'absolute',
            left: `${d.x}%`,
            top: 0,
            width: `${d.w}px`,
            height: `${d.len * 1.2}px`,
            background: `linear-gradient(to bottom, transparent 0%, ${rainColorFn(d.alpha)} 50%, transparent 100%)`,
            borderRadius: '50%',
            boxShadow: `0 0 3px ${rainColorFn(d.alpha * 0.6)}`,
            animation: `wRaurora ${d.dur}s ${d.delay}s linear infinite`,
            transform: `rotate(${rainAngle}deg)`,
            transformOrigin: 'top center',
          }}
        />
      );
    }
    return (
      <div
        key={d.i}
        style={{
          position: 'absolute',
          left: `${d.x}%`,
          top: 0,
          width: `${d.w}px`,
          height: `${d.len}px`,
          background: `linear-gradient(to bottom, transparent 0%, ${rainColorFn(d.alpha)} 60%, ${rainColorFn(d.alpha * 0.56)} 100%)`,
          borderRadius: '0 0 2px 2px',
          animation: `wRfoundry ${d.dur}s ${d.delay}s linear infinite`,
          transform: `rotate(${rainAngle}deg)`,
          transformOrigin: 'top center',
          transition: 'background 1.2s ease-in-out',
        }}
      />
    );
  }

  function renderFlake(f: (typeof flakes)[0]) {
    if (skin === 'signal') {
      return (
        <div
          key={f.i}
          style={
            {
              position: 'absolute',
              left: `${f.x}%`,
              top: 0,
              width: `${f.size}px`,
              height: `${f.size}px`,
              background: snowFill,
              opacity: 0,
              '--d': `${f.drift}px`,
              '--a': `${f.alpha}`,
              animation: `wS ${f.dur}s ${f.delay}s ease-in-out infinite`,
            } as React.CSSProperties
          }
        />
      );
    }
    if (skin === 'meridian') {
      return (
        <div
          key={f.i}
          style={
            {
              position: 'absolute',
              left: `${f.x}%`,
              top: 0,
              width: `${f.size}px`,
              height: `${f.size}px`,
              borderRadius: '50%',
              border: `${Math.max(0.7, f.size * 0.18)}px solid ${snowFill}`,
              background: 'transparent',
              opacity: 0,
              '--d': `${f.drift}px`,
              '--a': `${f.alpha * 0.75}`,
              animation: `wS ${f.dur}s ${f.delay}s ease-in-out infinite`,
            } as React.CSSProperties
          }
        />
      );
    }
    if (skin === 'mineral') {
      return (
        <div
          key={f.i}
          style={
            {
              position: 'absolute',
              left: `${f.x}%`,
              top: 0,
              width: `${f.size}px`,
              height: `${f.size}px`,
              background: snowFill,
              transform: 'rotate(45deg)',
              boxShadow: `0 0 ${f.size}px ${snowFill}`,
              opacity: 0,
              '--d': `${f.drift}px`,
              '--a': `${f.alpha}`,
              animation: `wS ${f.dur}s ${f.delay}s ease-in-out infinite`,
            } as React.CSSProperties
          }
        />
      );
    }
    if (skin === 'paper') {
      return (
        <div
          key={f.i}
          style={
            {
              position: 'absolute',
              left: `${f.x}%`,
              top: 0,
              width: `${f.size * 0.9}px`,
              height: `${f.size * 1.1}px`,
              borderRadius: '40% 60% 55% 45%',
              background: snowFill,
              filter: 'blur(0.5px)',
              opacity: 0,
              '--d': `${f.drift}px`,
              '--a': `${f.alpha * 0.85}`,
              animation: `wS ${f.dur * 1.2}s ${f.delay}s ease-in-out infinite`,
            } as React.CSSProperties
          }
        />
      );
    }
    if (skin === 'aurora') {
      return (
        <div
          key={f.i}
          style={
            {
              position: 'absolute',
              left: `${f.x}%`,
              top: 0,
              width: `${f.size}px`,
              height: `${f.size}px`,
              borderRadius: '50%',
              background: snowFill,
              boxShadow: `0 0 ${f.size * 2}px ${snowFill}, 0 0 ${f.size * 0.5}px ${withAlpha(snowFill, 0.8)}`,
              opacity: 0,
              '--d': `${f.drift}px`,
              '--a': `${f.alpha}`,
              animation: `wS ${f.dur}s ${f.delay}s ease-in-out infinite`,
            } as React.CSSProperties
          }
        />
      );
    }
    return (
      <div
        key={f.i}
        style={
          {
            position: 'absolute',
            left: `${f.x}%`,
            top: 0,
            width: `${f.size}px`,
            height: `${f.size}px`,
            borderRadius: '50%',
            background: snowFill,
            filter: f.blur ? `blur(${f.blur}px)` : undefined,
            opacity: 0,
            '--d': `${f.drift}px`,
            '--a': `${f.alpha}`,
            animation: `wS ${f.dur}s ${f.delay}s ease-in-out infinite`,
            transition: 'background 1.2s ease-in-out',
          } as React.CSSProperties
        }
      />
    );
  }

  function renderBolt() {
    if (!ltBolt) return null;
    if (skin === 'signal') {
      return (
        <div
          style={{
            position: 'absolute',
            left: '42%',
            top: '10%',
            zIndex: 9,
            width: 3,
            height: 48,
            background: boltFill,
            boxShadow: `0 0 8px ${boltGlowCol}, 0 0 16px ${boltGlowCol}`,
          }}
        />
      );
    }
    if (skin === 'meridian') {
      return (
        <svg
          style={{
            position: 'absolute',
            left: '42%',
            top: '12%',
            zIndex: 9,
            filter: `drop-shadow(0 0 6px ${boltGlowCol})`,
          }}
          width="24"
          height="56"
          viewBox="0 0 24 56"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M14 2 L5 26 L11 26 L8 54 L19 22 L13 22 Z"
            stroke={boltFill}
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      );
    }
    if (skin === 'mineral') {
      return (
        <svg
          style={{
            position: 'absolute',
            left: '40%',
            top: '10%',
            zIndex: 9,
            filter: `drop-shadow(0 0 10px ${boltGlowCol})`,
          }}
          width="36"
          height="64"
          viewBox="0 0 36 64"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M20 2 L8 28 L16 24 L6 62 L28 26 L18 30 Z"
            fill={boltFill}
            stroke={cloudHi}
            strokeWidth="0.8"
          />
          <path
            d="M20 2 L16 14 L22 12"
            stroke={cloudHi}
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
            opacity={0.7}
          />
        </svg>
      );
    }
    if (skin === 'paper') {
      return (
        <svg
          style={{
            position: 'absolute',
            left: '42%',
            top: '10%',
            zIndex: 9,
            filter: `blur(0.5px) drop-shadow(0 0 6px ${boltGlowCol})`,
          }}
          width="28"
          height="60"
          viewBox="0 0 28 60"
          fill="none"
          aria-hidden="true"
        >
          <path d="M16 3 L5 30 L13 28 L10 58 L24 25 L16 27 Z" fill={boltFill} />
        </svg>
      );
    }
    if (skin === 'aurora') {
      return (
        <svg
          style={{
            position: 'absolute',
            left: '40%',
            top: '10%',
            zIndex: 9,
            filter: `drop-shadow(0 0 12px ${boltGlowCol}) drop-shadow(0 0 24px ${boltGlowCol})`,
          }}
          width="36"
          height="68"
          viewBox="0 0 36 68"
          fill="none"
          aria-hidden="true"
        >
          <path d="M20 2 L7 36 L16 34 L11 66 L29 28 L19 30 Z" fill={boltFill} opacity={0.92} />
          <path
            d="M20 2 L7 36 L16 34"
            stroke={cloudHi}
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
            opacity={0.65}
          />
        </svg>
      );
    }
    return (
      <svg
        style={{
          position: 'absolute',
          left: '42%',
          top: '12%',
          zIndex: 9,
          filter: `drop-shadow(0 0 8px ${boltGlowCol})`,
        }}
        width="32"
        height="64"
        viewBox="0 0 32 64"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M18 2 L6 34 L15 34 L10 62 L26 26 L16 26 Z"
          fill={boltFill}
          stroke="rgba(200,225,255,0.20)"
          strokeWidth="0.5"
        />
      </svg>
    );
  }

  const signalGridLines =
    skin === 'signal' &&
    (category === 'rain' ||
      category === 'heavy-rain' ||
      category === 'drizzle' ||
      category === 'snow' ||
      category === 'heavy-snow');

  // ── Per-skin tide/sundial/void cloud dispatch ──────────────────────────────
  if (skin === 'tide') {
    const cloudCount = isHeavy ? 4 : isDark ? 3 : category === 'partly-cloudy' ? 2 : 3;
    const cloudLayers = [
      {
        key: 'bg1',
        top: '0%',
        speed: 80,
        delay: -20,
        opac: isHeavy ? 0.96 : isDark ? 0.88 : 0.72,
        wMul: 0.92,
        hMul: 0.7,
        kf: 'wCbg',
      },
      {
        key: 'fg1',
        top: '18%',
        speed: 55,
        delay: -8,
        opac: isHeavy ? 0.84 : isDark ? 0.75 : 0.58,
        wMul: 0.7,
        hMul: 0.55,
        kf: 'wCfg',
      },
      ...(cloudCount >= 3
        ? [
            {
              key: 'bg2',
              top: '4%',
              speed: 68,
              delay: -38,
              opac: isHeavy ? 0.92 : isDark ? 0.8 : 0.52,
              wMul: 1.05,
              hMul: 0.72,
              kf: 'wCbg',
            },
          ]
        : []),
      ...(cloudCount >= 4
        ? [
            {
              key: 'fg2',
              top: '22%',
              speed: 44,
              delay: -14,
              opac: 0.88,
              wMul: 0.62,
              hMul: 0.5,
              kf: 'wCfg',
            },
          ]
        : []),
    ];

    const hasRain = category === 'rain' || category === 'heavy-rain' || category === 'drizzle';
    const hasSnow = category === 'snow' || category === 'heavy-snow';
    const snowCount = category === 'heavy-snow' ? 55 : 30;
    const sr2 = seededRand(55);
    const snowFlakes = Array.from({ length: snowCount }, (_, i) => {
      const sz = 1.8 + sr2() * 3.0; // lighter, sea-spray-like
      return {
        i,
        x: sr2() * 100,
        sz,
        dur: 6 + sr2() * 8,
        delay: -(sr2() * 10),
        drift: (sr2() - 0.5) * 60, // more horizontal drift — sea wind
        alpha: 0.45 + sr2() * 0.45,
        glow: sz > 3,
      };
    });

    return (
      <div
        ref={containerRef}
        aria-hidden
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity, zIndex: 4 }}
      >
        <style>{`
        @keyframes wCbg { from { transform: translateX(-200px); } to { transform: translateX(460px); } }
        @keyframes wCfg { from { transform: translateX(-150px); } to { transform: translateX(420px); } }
        @keyframes wRtide {
          0%   { transform: translateY(-6%) rotate(13deg); opacity: 0; }
          6%   { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateY(114%) rotate(13deg); opacity: 0; }
        }
        @keyframes wS {
          0%   { transform: translateY(-4%) translateX(0) scale(1); opacity: 0; }
          5%   { opacity: var(--a, 0.7); }
          95%  { opacity: var(--a, 0.7); }
          100% { transform: translateY(112%) translateX(var(--d, 0px)) scale(0.8); opacity: 0; }
        }
        @keyframes wFog  { 0%, 100% { opacity: 0.38; } 50% { opacity: 0.65; } }
        @keyframes wFog2 { 0%, 100% { opacity: 0.22; } 50% { opacity: 0.48; } }
        @keyframes tideFogRise {
          0%   { transform: translateY(0px) scaleX(1.0); opacity: 0.28; }
          50%  { transform: translateY(-8px) scaleX(1.04); opacity: 0.55; }
          100% { transform: translateY(0px) scaleX(1.0); opacity: 0.28; }
        }
      `}</style>

        {/* ── Maritime clouds ── */}
        {category !== 'fog' &&
          cloudLayers.map((cl) => (
            <div
              key={cl.key}
              style={{
                position: 'absolute',
                top: cl.top,
                left: 0,
                opacity: cl.opac,
                animation: `${cl.kf} ${cl.speed}s ${cl.delay}s linear infinite`,
                willChange: 'transform',
              }}
            >
              <TideCloudRenderer
                w={Math.round(dims.w * cl.wMul)}
                h={Math.round(dims.h * cl.hMul)}
                colors={{ cloudColor: cloudBase, cloudShadow: cloudShadow, cloudHi: cloudHi }}
                opacity={1}
              />
            </div>
          ))}

        {/* ── Sea rain ── */}
        {hasRain && (
          <TideRainRenderer
            w={dims.w}
            h={dims.h}
            rainColorFn={rainColorFn}
            angle={rainAngle}
            category={category}
          />
        )}

        {/* ── Sea spray / snow — lighter particles, more horizontal drift ── */}
        {hasSnow && (
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
            {snowFlakes.map((f) => (
              <div
                key={f.i}
                style={
                  {
                    position: 'absolute',
                    left: `${f.x}%`,
                    top: 0,
                    width: f.sz,
                    height: f.sz,
                    borderRadius: '50%',
                    background: snowFill,
                    // Aqueous snow — soft glow like ice crystals over water
                    boxShadow: f.glow ? `0 0 ${f.sz * 2}px rgba(210,240,255,0.8)` : 'none',
                    opacity: 0,
                    ['--d' as string]: `${f.drift}px`,
                    ['--a' as string]: `${f.alpha}`,
                    animation: `wS ${f.dur}s ${f.delay}s ease-in-out infinite`,
                  } as React.CSSProperties
                }
              />
            ))}
          </div>
        )}

        {/* ── Sea mist — rises from water surface (bottom up), not top down ── */}
        {category === 'fog' && (
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
            {/* Water surface fog — densest at bottom, dissipates upward */}
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  // Fog rises from 90% upward — opposite of inland fog
                  bottom: `${i * 16}%`,
                  height: '30%',
                  background: `linear-gradient(to top,
                ${fogColorFn(0.32 - i * 0.05)} 0%,
                ${fogColor2Fn(0.25 - i * 0.04)} 50%,
                transparent 100%)`,
                  filter: 'blur(7px)',
                  animation: `${i % 2 === 0 ? 'tideFogRise' : 'wFog2'} ${14 + i * 4}s ${i * 2.5}s ease-in-out infinite`,
                }}
              />
            ))}
            {/* Mid-level wisps */}
            {[0, 1].map((i) => (
              <div
                key={`w${i}`}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: `${30 + i * 20}%`,
                  height: '22%',
                  background: `linear-gradient(to right,
                transparent 0%,
                ${fogColorFn(0.14 + i * 0.04)} 30%,
                ${fogColor2Fn(0.18 + i * 0.03)} 55%,
                ${fogColorFn(0.14 + i * 0.04)} 78%,
                transparent 100%)`,
                  filter: 'blur(9px)',
                  animation: `${i % 2 === 0 ? 'wFog' : 'wFog2'} ${22 + i * 7}s ${i * 4}s ease-in-out infinite`,
                }}
              />
            ))}
          </div>
        )}

        {/* ── Sea storm / bioluminescent thunder ── */}
        {category === 'thunder' && (
          <div style={{ position: 'absolute', inset: 0 }}>
            {/* Use VoidThunderRenderer but with aqueous blue-teal color */}
            <VoidThunderRenderer
              w={dims.w}
              h={dims.h}
              colors={{ thunderColor: boltFill }}
              opacity={0.72}
            />
          </div>
        )}
      </div>
    );
  }

  if (skin === 'sundial') {
    const cloudCount = isHeavy ? 4 : isDark ? 3 : category === 'partly-cloudy' ? 2 : 3;
    const cloudLayers = [
      {
        key: 'bg1',
        top: '2%',
        speed: 95,
        delay: -28,
        opac: isHeavy ? 0.94 : isDark ? 0.86 : 0.68,
        wMul: 0.94,
        hMul: 0.68,
        kf: 'wCbg',
      },
      {
        key: 'fg1',
        top: '22%',
        speed: 65,
        delay: -12,
        opac: isHeavy ? 0.82 : isDark ? 0.72 : 0.52,
        wMul: 0.68,
        hMul: 0.52,
        kf: 'wCfg',
      },
      ...(cloudCount >= 3
        ? [
            {
              key: 'bg2',
              top: '6%',
              speed: 78,
              delay: -45,
              opac: isHeavy ? 0.9 : isDark ? 0.78 : 0.48,
              wMul: 1.06,
              hMul: 0.75,
              kf: 'wCbg',
            },
          ]
        : []),
      ...(cloudCount >= 4
        ? [
            {
              key: 'fg2',
              top: '26%',
              speed: 50,
              delay: -18,
              opac: 0.85,
              wMul: 0.6,
              hMul: 0.48,
              kf: 'wCfg',
            },
          ]
        : []),
    ];

    const hasRain = category === 'rain' || category === 'heavy-rain' || category === 'drizzle';
    const hasSnow = category === 'snow' || category === 'heavy-snow';
    const snowCount = category === 'heavy-snow' ? 44 : 24;
    const sr3 = seededRand(63);
    const snowFlakes = Array.from({ length: snowCount }, (_, i) => {
      // Stone snow — finer, like marble dust or ash
      const sz = 1.2 + sr3() * 2.2;
      return {
        i,
        x: sr3() * 100,
        sz,
        dur: 10 + sr3() * 13,
        delay: -(sr3() * 15),
        drift: (sr3() - 0.5) * 28, // less drift — stone surfaces are sheltered
        alpha: 0.4 + sr3() * 0.42,
      };
    });

    return (
      <div
        ref={containerRef}
        aria-hidden
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity, zIndex: 4 }}
      >
        <style>{`
        @keyframes wCbg { from { transform: translateX(-200px); } to { transform: translateX(460px); } }
        @keyframes wCfg { from { transform: translateX(-150px); } to { transform: translateX(420px); } }
        @keyframes wRsundial {
          0%   { transform: translateY(-6%) rotate(1deg); opacity: 0; }
          6%   { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateY(114%) rotate(1deg); opacity: 0; }
        }
        @keyframes wS {
          0%   { transform: translateY(-4%) translateX(0) scale(1); opacity: 0; }
          5%   { opacity: var(--a, 0.7); }
          95%  { opacity: var(--a, 0.7); }
          100% { transform: translateY(112%) translateX(var(--d, 0px)) scale(0.8); opacity: 0; }
        }
        @keyframes wFog  { 0%, 100% { opacity: 0.35; } 50% { opacity: 0.58; } }
        @keyframes wFog2 { 0%, 100% { opacity: 0.20; } 50% { opacity: 0.42; } }
        @keyframes stoneMist {
          0%   { transform: translateX(0px) scaleY(1.0); opacity: 0.32; }
          50%  { transform: translateX(12px) scaleY(1.06); opacity: 0.55; }
          100% { transform: translateX(0px) scaleY(1.0); opacity: 0.32; }
        }
      `}</style>

        {/* ── Stone strata clouds — move slower, more stately ── */}
        {category !== 'fog' &&
          cloudLayers.map((cl) => (
            <div
              key={cl.key}
              style={{
                position: 'absolute',
                top: cl.top,
                left: 0,
                opacity: cl.opac,
                animation: `${cl.kf} ${cl.speed}s ${cl.delay}s linear infinite`,
                willChange: 'transform',
              }}
            >
              <SundialCloudRenderer
                w={Math.round(dims.w * cl.wMul)}
                h={Math.round(dims.h * cl.hMul)}
                colors={{ cloudColor: cloudBase, cloudShadow: cloudShadow, cloudHi: cloudHi }}
                opacity={1}
              />
            </div>
          ))}

        {/* ── Stone rain — water down carved grooves ── */}
        {hasRain && (
          <SundialRainRenderer
            w={dims.w}
            h={dims.h}
            rainColorFn={rainColorFn}
            category={category}
          />
        )}

        {/* ── Marble dust / ash snow ── */}
        {hasSnow && (
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
            {snowFlakes.map((f) => (
              <div
                key={f.i}
                style={
                  {
                    position: 'absolute',
                    left: `${f.x}%`,
                    top: 0,
                    width: f.sz,
                    height: f.sz,
                    // Stone snow — hexagonal-ish, not perfectly round
                    borderRadius: '35%',
                    background: snowFill,
                    filter: 'blur(0.3px)',
                    opacity: 0,
                    ['--d' as string]: `${f.drift}px`,
                    ['--a' as string]: `${f.alpha}`,
                    animation: `wS ${f.dur}s ${f.delay}s ease-in-out infinite`,
                  } as React.CSSProperties
                }
              />
            ))}
          </div>
        )}

        {/* ── Morning mist over stone — mid-height horizontal bands ── */}
        {category === 'fog' && (
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
            {/* Primary mist bands — sit at mid-height like valley morning fog */}
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  // Stone fog sits at 20-70% height — not top-down, not bottom-up
                  top: `${18 + i * 14}%`,
                  height: '26%',
                  background: `linear-gradient(to right,
                transparent 0%,
                ${fogColorFn(0.22 + i * 0.04)} 22%,
                ${fogColor2Fn(0.28 + i * 0.03)} 48%,
                ${fogColorFn(0.22 + i * 0.04)} 74%,
                transparent 100%)`,
                  filter: 'blur(5px)',
                  animation: `${i % 2 === 0 ? 'stoneMist' : 'wFog2'} ${22 + i * 7}s ${i * 4}s ease-in-out infinite`,
                }}
              />
            ))}
            {/* Stone base mist — slight warm tinge from sun on stone */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: '30%',
                background: `linear-gradient(to top,
              ${fogColorFn(0.2)} 0%,
              ${fogColor2Fn(0.14)} 55%,
              transparent 100%)`,
                filter: 'blur(6px)',
                animation: 'wFog 18s ease-in-out infinite',
              }}
            />
          </div>
        )}

        {/* ── Classical tempest — angular carved-lightning bolt ── */}
        {category === 'thunder' && (
          <div style={{ position: 'absolute', inset: 0 }}>
            <VoidThunderRenderer
              w={dims.w}
              h={dims.h}
              colors={{ thunderColor: boltFill }}
              opacity={0.62}
            />
            {/* Additional classical bolt overlay — carved stone jagged shape */}
            <svg
              aria-hidden="true"
              style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
              width={dims.w}
              height={dims.h}
              viewBox={`0 0 ${dims.w} ${dims.h}`}
            >
              <style>{`
              @keyframes sundial-bolt {
                0%, 54%, 70%, 100% { opacity: 0; }
                56%, 68% { opacity: 0.55; }
              }
            `}</style>
              {/* Angular Roman-style lightning — sharp geometric, like a carved symbol */}
              <polyline
                points={`${dims.w * 0.54},0 ${dims.w * 0.46},${dims.h * 0.38} ${dims.w * 0.54},${dims.h * 0.38} ${dims.w * 0.4},${dims.h}`}
                fill="none"
                stroke={boltFill}
                strokeWidth={1.8}
                strokeLinejoin="miter"
                style={{
                  animation: 'sundial-bolt 4.5s ease-in-out infinite',
                  filter: `drop-shadow(0 0 4px ${boltFill})`,
                }}
              />
            </svg>
          </div>
        )}
      </div>
    );
  }

  if (skin === 'void' && category !== 'thunder') {
    return (
      <div
        ref={containerRef}
        aria-hidden
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity, zIndex: 4 }}
      >
        <VoidCloudRenderer w={dims.w} h={dims.h} colors={{ cloudColor: cloudBase }} opacity={1} />
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes wCbg{from{transform:translateX(-200px)}to{transform:translateX(460px)}}
        @keyframes wCfg{from{transform:translateX(-150px)}to{transform:translateX(420px)}}
        @keyframes wRfoundry{0%{transform:translateY(-6%) rotate(${rainAngle}deg);opacity:0}6%{opacity:1}90%{opacity:1}100%{transform:translateY(114%) rotate(${rainAngle}deg);opacity:0}}
        @keyframes wRmeridian{0%{transform:translateY(-6%) rotate(${rainAngle}deg);opacity:0}6%{opacity:0.7}90%{opacity:0.7}100%{transform:translateY(114%) rotate(${rainAngle}deg);opacity:0}}
        @keyframes wRmineral{0%{transform:translateY(-6%) rotate(${rainAngle}deg);opacity:0}6%{opacity:1}90%{opacity:1}100%{transform:translateY(114%) rotate(${rainAngle}deg);opacity:0}}
        @keyframes wRpaper{0%{transform:translateY(-6%);opacity:0}6%{opacity:1}90%{opacity:1}100%{transform:translateY(114%);opacity:0}}
        @keyframes wRsignal{0%{transform:translateY(-6%);opacity:0}6%{opacity:1}90%{opacity:1}100%{transform:translateY(114%);opacity:0}}
        @keyframes wRaurora{0%{transform:translateY(-6%) rotate(${rainAngle}deg);opacity:0}6%{opacity:1}90%{opacity:1}100%{transform:translateY(114%) rotate(${rainAngle}deg);opacity:0}}
        @keyframes wS{0%{transform:translateY(-4%) translateX(0) scale(1);opacity:0}5%{opacity:var(--a,0.7)}95%{opacity:var(--a,0.7)}100%{transform:translateY(112%) translateX(var(--d,0px)) scale(0.8);opacity:0}}
        @keyframes wFog{0%,100%{opacity:0.35}50%{opacity:0.62}}
        @keyframes wFog2{0%,100%{opacity:0.20}50%{opacity:0.45}}
        @keyframes wFt{0%{opacity:var(--fo,1)}100%{opacity:0}}
      `}</style>

      <div
        aria-hidden
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity, zIndex: 4 }}
      >
        {/* ── Fog ── */}
        {category === 'fog' &&
          [0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: `${8 + i * 22}%`,
                height: '28%',
                background: `linear-gradient(to right,transparent 0%,${fogColorFn(0.22 + i * 0.06)} 25%,${fogColor2Fn(0.28 + i * 0.05)} 50%,${fogColorFn(0.22 + i * 0.06)} 75%,transparent 100%)`,
                animation: `${i % 2 === 0 ? 'wFog' : 'wFog2'} ${16 + i * 6}s ${i * 2.8}s ease-in-out infinite`,
                filter:
                  skin === 'signal' ? 'none' : skin === 'meridian' ? 'blur(3px)' : 'blur(4px)',
                transition: 'background 1.2s ease-in-out',
              }}
            />
          ))}

        {/* ── Signal scanline grid ── */}
        {signalGridLines && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `repeating-linear-gradient(to right, ${rainColorFn(0.08)} 0px, ${rainColorFn(0.08)} 1px, transparent 1px, transparent 20px)`,
              animation: 'wFog 4s ease-in-out infinite',
            }}
          />
        )}

        {/* ── Background clouds ── */}
        {bgClouds.map((c) => (
          <div
            key={c.i}
            style={{
              position: 'absolute',
              top: `${c.yPct}%`,
              left: 0,
              opacity: c.opacity,
              transform:
                skin === 'foundry' || skin === 'paper' || skin === 'aurora'
                  ? undefined
                  : `scale(${c.size})`,
              transformOrigin: 'left top',
              animation: `wCbg ${c.speed}s ${c.delay}s linear infinite`,
              willChange: 'transform',
            }}
          >
            {renderCloud(`bg${c.i}`, c.w, c.h, c.size)}
          </div>
        ))}

        {/* ── Foreground clouds ── */}
        {fgClouds.map((c) => (
          <div
            key={c.i}
            style={{
              position: 'absolute',
              top: `${c.yPct}%`,
              left: 0,
              opacity: c.opacity,
              transform:
                skin === 'foundry' || skin === 'paper' || skin === 'aurora'
                  ? undefined
                  : `scale(${c.size})`,
              transformOrigin: 'left top',
              animation: `wCfg ${c.speed}s ${c.delay}s linear infinite`,
              willChange: 'transform',
            }}
          >
            {renderCloud(`fg${c.i}`, c.w, c.h, c.size)}
          </div>
        ))}

        {/* ── Rain ── */}
        {drops.map((d) => renderDrop(d))}

        {/* ── Snow ── */}
        {flakes.map((f) => renderFlake(f))}

        {/* ── Lightning bolt ── */}
        {renderBolt()}

        {/* ── Lightning flash ── */}
        {ltFlash && (
          <div
            style={
              {
                position: 'absolute',
                inset: 0,
                borderRadius: 'inherit',
                zIndex: 8,
                background: flashBg,
                animation: 'wFt 0.08s ease-out forwards',
                '--fo': '1',
              } as React.CSSProperties
            }
          />
        )}
      </div>
    </>
  );
}
