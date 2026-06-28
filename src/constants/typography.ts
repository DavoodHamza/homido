/**
 * Common typography styles used across the entire app.
 * Import these in any screen or component for consistent text styling.
 *
 * Usage:
 *   import { Typography } from '@/constants/typography';
 *   <Text style={Typography.h1}>Page Title</Text>
 */

import { StyleSheet, Platform } from 'react-native';
import { Fonts } from '@/constants/theme';

export const Typography = StyleSheet.create({
  // ── Page-level headings ──────────────────────────────
  /** Large hero text – splash screens, onboarding (fontSize 36) */
  hero: {
    fontSize: 36,
    fontWeight: '800',
    lineHeight: 42,
    letterSpacing: -0.5,
  },

  /** Primary page heading (fontSize 28) */
  h1: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
    letterSpacing: -0.3,
  },

  /** Section heading (fontSize 22) */
  h2: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
  },

  /** Sub-section heading (fontSize 18) */
  h3: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },

  // ── Body text ────────────────────────────────────────
  /** Default body text (fontSize 16) */
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },

  /** Bold body text (fontSize 16) */
  bodyBold: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
  },

  /** Medium weight body text (fontSize 16) */
  bodyMedium: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
  },

  // ── Small text ───────────────────────────────────────
  /** Secondary / caption text (fontSize 14) */
  caption: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },

  /** Bold caption text (fontSize 14) */
  captionBold: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },

  /** Tiny label text – badges, tags (fontSize 12) */
  label: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },

  /** Bold label text (fontSize 12) */
  labelBold: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },

  // ── Special ──────────────────────────────────────────
  /** Large stat numbers (fontSize 24) */
  stat: {
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
  },

  /** Big stat / revenue numbers (fontSize 28) */
  bigStat: {
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
  },

  /** Button text (fontSize 16) */
  button: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },

  /** Monospace / code text (fontSize 12) */
  code: {
    fontFamily: Fonts.mono,
    fontWeight: Platform.select({ android: '700' }) ?? '500',
    fontSize: 12,
    lineHeight: 18,
  },
});
