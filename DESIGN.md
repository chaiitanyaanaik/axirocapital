---
name: Institutional Glass
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#3c4a42'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#6c7a71'
  outline-variant: '#bbcabf'
  surface-tint: '#006c49'
  primary: '#006c49'
  on-primary: '#ffffff'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#4edea3'
  secondary: '#a43073'
  on-secondary: '#ffffff'
  secondary-container: '#fc79bd'
  on-secondary-container: '#76014e'
  tertiary: '#a93349'
  on-tertiary: '#ffffff'
  tertiary-container: '#ff778a'
  on-tertiary-container: '#750626'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#ffd8e7'
  secondary-fixed-dim: '#ffafd3'
  on-secondary-fixed: '#3d0026'
  on-secondary-fixed-variant: '#85145a'
  tertiary-fixed: '#ffdadc'
  tertiary-fixed-dim: '#ffb2b9'
  on-tertiary-fixed: '#400010'
  on-tertiary-fixed-variant: '#891933'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  display-xl:
    fontFamily: Manrope
    fontSize: 64px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Manrope
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.03em
  headline-md:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0.01em
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 32px
  margin-page: 64px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style

This design system is engineered for ultra-premium financial and technological platforms where trust and innovation coexist. The brand personality is institutional yet ethereal, eschewing heavy corporate blocks for a "light-as-air" layered aesthetic. 

The visual style is centered on **Glassmorphism**, utilizing multi-layered translucency to create a sense of infinite depth. By prioritizing white space and delicate mesh gradients over solid fills, the UI achieves a high-fidelity, cutting-edge feel. It targets a sophisticated audience that values precision, transparency, and a modern digital-first experience.

## Colors

The palette is anchored by a deep **Emerald Green** (#10B981), reserved strictly for primary actions and success states to maintain its high-impact authority. The base is a pristine, clean white that serves as the canvas for the glass effects.

To prevent the interface from feeling sterile, ethereal mesh gradients—comprising soft pinks, yellows, and teals—are used as low-opacity background highlights. These gradients should never be static; they are intended to sit far behind the content layer, providing a sense of depth and movement without compromising readability.

## Typography

This design system utilizes **Manrope** across all hierarchies to ensure a unified, tech-forward voice. 

- **Headings:** Use tight tracking (negative letter spacing) and bold weights. This creates a compact, professional look that feels "engineered."
- **Body:** Body text uses generous line heights and neutral tracking to ensure maximum legibility and an airy, open feel.
- **Labels:** Small labels and captions are treated with slightly increased tracking and semi-bold weights for a refined, institutional utility.

## Layout & Spacing

The layout follows a **Fixed Grid** model for desktop, centered within a 1280px container to maintain an institutional structure. The spacing philosophy is rooted in "Negative Space as a Feature," using large margins and gutters to separate content clusters without the need for heavy dividers.

A 12-column grid is standard, with generous 32px gutters that allow the glassmorphic cards to breathe. Vertical rhythm is strictly enforced in multiples of 8px to ensure technical precision.

## Elevation & Depth

Elevation is the defining characteristic of this design system. It is achieved through a combination of backdrop filters and complex shadow stacks rather than simple color shifts.

- **Surface 1 (Base):** Clean white or very light neutral with blurred mesh gradients visible underneath.
- **Surface 2 (Glass):** `backdrop-filter: blur(20px)`, a background opacity of 60-80% white, and a sharp 1px border (#FFFFFF20). 
- **Shadows:** Use multi-layered "ambient" shadows. Instead of one dark shadow, use three layers: a very soft, large-spread neutral shadow; a medium-soft tinted shadow (using the primary color at 5% opacity); and a tight, sharp inner stroke to define the edges.

## Shapes

The shape language is sophisticated and modern, utilizing **Rounded** corners to soften the technical nature of the content. 

- **Standard UI elements:** (Inputs, Small Buttons) use a 0.5rem radius.
- **Containers/Cards:** Use a 1rem radius to emphasize the "floating glass" effect.
- **Interactive Prompts:** Can scale up to 1.5rem (xl) to create a distinct, approachable focal point within the grid.

## Components

### Buttons
- **Primary:** Solid Emerald Green (#10B981) with white text. High-contrast, no shadow, subtle hover lift.
- **Secondary/Glass:** Translucent white background (blur 12px), 1px white border, and emerald text.
- **Ghost:** No background, subtle 1px border that appears only on hover.

### Cards
Cards are the primary vessel for information. They must feature a `backdrop-filter: blur(16px)`, a thin semi-transparent white border, and a multi-layered shadow to appear as though they are hovering above the background mesh.

### Input Fields
Inputs should be "Soft Glass"—extremely light background fills (5% black or 10% white) with a 1px border that glows (Emerald) when focused. 

### Data Visualization
Use thin lines and monochromatic scales. The primary emerald green should be the only color used to highlight specific data points or "success" trends, keeping the visual noise at a minimum.

### Navigation
The top navigation should be a "Floating Dock"—a glassmorphic pill or bar that follows the user, utilizing the same blur and border treatments as the cards to maintain depth consistency.

## Current Home Implementation Notes

These notes capture the current Home direction so design and implementation stay aligned:

- Source of truth is the live component `components/home/HomePage.tsx`
- Hero keeps a high-contrast two-line headline with emerald emphasis on line two
- Current hero copy is `Stop chasing lenders` and `Get working capital faster`
- Hero supports a single primary CTA: `Check My Eligibility`
- Layout is intentionally single-column and center-aligned in the hero region
- Home keeps the `How this works` section directly below hero
- Footer is intentionally minimal (`© 2026 Axiro Capital`)