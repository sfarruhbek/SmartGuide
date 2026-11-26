---
name: "SmartGuide — Silk Road Editorial"
description: "Warm limestone surfaces paired with Silk Road cobalt and terracotta accents for an outdoor-legible cultural travel PWA."
---

## Overview

SmartGuide is a mobile-first progressive web app for independent travelers exploring Uzbekistan's historic Silk Road cities, beginning with Ichan-Qal'a in Khiva. The visual language balances **editorial heritage** with **tactile modern utility**: warm sun-baked limestone surfaces keep glare comfortable under bright desert sunlight, while deep cobalt glaze and terracotta accents guide attention to GPS stops, live AI voice stories, and local craft recommendations.

The design avoids tourist-brochure clutter. Every screen uses generous negative space, clear typographic hierarchy, and progressive disclosure so travelers can scan their emotional roadmap in seconds while walking.

## Colors

The palette pairs **Silk Road Cobalt** (`primary`) for interactive actions and navigation with **Khiva Terracotta** (`secondary`) for emotional highlights and local craft/dining cues, grounded on **Warm Limestone** (`surface`) tones. **Oasis Teal** (`tertiary`) marks verified historical sources and GPS-active states.

```yaml
colors:
  light:
    primary: "#005284"
    on-primary: "#FFFFFF"
    primary-container: "#0E6BA8"
    on-primary-container: "#D5E8FF"
    secondary: "#9B4500"
    on-secondary: "#FFFFFF"
    secondary-container: "#FD8A42"
    on-secondary-container: "#682C00"
    tertiary: "#005952"
    on-tertiary: "#FFFFFF"
    tertiary-container: "#07736B"
    on-tertiary-container: "#9FF5EA"
    error: "#BA1A1A"
    on-error: "#FFFFFF"
    error-container: "#FFDAD6"
    on-error-container: "#93000A"
    background: "#FDF9F3"
    on-background: "#1C1C18"
    surface: "#FDF9F3"
    surface-dim: "#DDDAD4"
    surface-bright: "#FDF9F3"
    surface-container-lowest: "#FFFFFF"
    surface-container-low: "#F7F3ED"
    surface-container: "#F1EDE7"
    surface-container-high: "#EBE8E2"
    surface-container-highest: "#E6E2DC"
    on-surface: "#1C1C18"
    surface-variant: "#DCE3EE"
    on-surface-variant: "#404750"
    outline: "#717881"
    outline-variant: "#C0C7D1"
    inverse-surface: "#31302D"
    inverse-on-surface: "#F4F0EA"
    inverse-primary: "#99CBFF"
    shadow: "#000000"
    scrim: "#000000"
  dark:
    primary: "#99CBFF"
    on-primary: "#003354"
    primary-container: "#0E6BA8"
    on-primary-container: "#D5E8FF"
    secondary: "#FFB68E"
    on-secondary: "#532200"
    secondary-container: "#AB4C00"
    on-secondary-container: "#FFE2D5"
    tertiary: "#80D5CB"
    on-tertiary: "#003733"
    tertiary-container: "#07736B"
    on-tertiary-container: "#9FF5EA"
    error: "#FFB4AB"
    on-error: "#690005"
    error-container: "#93000A"
    on-error-container: "#FFDAD6"
    background: "#141310"
    on-background: "#E6E2DC"
    surface: "#141310"
    surface-dim: "#141310"
    surface-bright: "#3A3935"
    surface-container-lowest: "#0F0E0B"
    surface-container-low: "#1C1C18"
    surface-container: "#20201C"
    surface-container-high: "#2B2A26"
    surface-container-highest: "#363531"
    on-surface: "#E6E2DC"
    surface-variant: "#404750"
    on-surface-variant: "#C0C7D1"
    outline: "#8A919B"
    outline-variant: "#404750"
    inverse-surface: "#E6E2DC"
    inverse-on-surface: "#31302D"
    inverse-primary: "#00629D"
    shadow: "#000000"
    scrim: "#000000"
```

## Typography

**Cormorant Garamond** brings editorial gravitas to landmark titles and emotional roadmap headings. **Merriweather Sans** handles all UI controls, descriptions, and AI transcripts with high outdoor legibility. **Spline Sans Mono** renders tabular distances, walking durations, and Trip Pass pricing.

```yaml
typography:
  display-lg:
    fontFamily: "Cormorant Garamond"
    fontSize: 40px
    fontWeight: 700
    lineHeight: 44px
    letterSpacing: -0.5px
  display-lg-mobile:
    fontFamily: "Cormorant Garamond"
    fontSize: 30px
    fontWeight: 700
    lineHeight: 34px
    letterSpacing: -0.25px
  headline-lg:
    fontFamily: "Cormorant Garamond"
    fontSize: 34px
    fontWeight: 700
    lineHeight: 40px
    letterSpacing: -0.25px
  headline-lg-mobile:
    fontFamily: "Cormorant Garamond"
    fontSize: 26px
    fontWeight: 700
    lineHeight: 30px
    letterSpacing: -0.2px
  headline-md:
    fontFamily: "Cormorant Garamond"
    fontSize: 22px
    fontWeight: 700
    lineHeight: 28px
    letterSpacing: 0px
  title-lg:
    fontFamily: "Merriweather Sans"
    fontSize: 18px
    fontWeight: 700
    lineHeight: 24px
    letterSpacing: 0px
  title-md:
    fontFamily: "Merriweather Sans"
    fontSize: 15px
    fontWeight: 600
    lineHeight: 20px
    letterSpacing: 0.1px
  body-lg:
    fontFamily: "Merriweather Sans"
    fontSize: 15px
    fontWeight: 400
    lineHeight: 22px
    letterSpacing: 0px
  body-md:
    fontFamily: "Merriweather Sans"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: 0.1px
  label-lg:
    fontFamily: "Merriweather Sans"
    fontSize: 13px
    fontWeight: 600
    lineHeight: 18px
    letterSpacing: 0.2px
  label-sm:
    fontFamily: "Merriweather Sans"
    fontSize: 11px
    fontWeight: 600
    lineHeight: 14px
    letterSpacing: 0.3px
  mono-sm:
    fontFamily: "Spline Sans Mono"
    fontSize: 12px
    fontWeight: 500
    lineHeight: 16px
    letterSpacing: 0px
```

## Layout & Spacing

SmartGuide uses a **Fluid Single-Column Mobile Grid** (`390px` target viewport) with `16px` horizontal page margins and a `4px` base unit (`8px` / `12px` / `16px` / `24px` rhythm). Sticky top bars and bottom PWA navigation docks reserve explicit vertical padding (`pb-24`) so content never hides behind navigation controls.

```yaml
spacing:
  gutter-xs: 4px
  gutter-sm: 8px
  gutter-md: 12px
  gutter-lg: 16px
  gutter-xl: 24px
  section: 32px
  page-margin: 16px
```

## Elevation & Depth

Hierarchy relies on **tonal surface layering** (`surface` -> `surface-container-low` -> `surface-container-lowest`) paired with subtle `1px` `outline-variant` hairlines rather than heavy drop shadows. Only the floating bottom PWA action bar and active audio player pill use soft ambient elevation.

## Shapes

Cards and containers use generous architectural curves inspired by Khiva's arched portals (`16px` for landmark cards, `12px` for nested chips/controls, and `9999px` pill shapes for filters, language toggles, and primary CTA buttons).

```yaml
rounded:
  sm: 6px
  DEFAULT: 12px
  md: 16px
  lg: 20px
  xl: 24px
  full: 9999px
```

## Motion & Micro-interaction

Interactions feel immediate and calm. Tap feedback settles in `100ms`, while bottom sheets and audio drawers enter with a smooth `240ms` deceleration curve. Nothing loops or pulses unless actively recording or playing live audio.

```yaml
motion:
  state-change:
    duration: 100ms
    delay: 0ms
    timingFunction: ease-out
  surface-enter:
    duration: 240ms
    delay: 0ms
    timingFunction: cubic-bezier(0.2, 0, 0, 1)
  surface-exit:
    duration: 150ms
    delay: 0ms
    timingFunction: cubic-bezier(0.3, 0, 1, 1)
```

## Voice & Content Strategy

- **Tone of voice:** Warm, culturally respectful, concise, and vivid. Speaks like a knowledgeable local friend rather than a dry encyclopedia.
- **Capitalisation:** Sentence case for headings, buttons, and navigation labels.
- **Terminology:** Always use *Emotsional Roadmap*, *Jonli AI-Gid*, *Snap & Ask*, and *Trip Pass*.
- **Button labels:** Action-oriented verbs (*Marshrutni boshlash*, *Ovozli gidni tinglash*, *Trip Pass olish*).
- **Numbers & units:** Tabular figures (`tabular-nums`) for walking minutes (`4 daq`), distances (`180 m`), and prices (`$4.99`).

## Components

Component implementations live as individual HTML sticker sheet files in
`components/`. Each file contains the canonical, styled HTML components with
`<!-- COMPONENT: name -->` comment markers. Read each file before use.

- **Badge** → `@components/badge.html` — `badge-numeric`, `badge-dot`
- **Button** → `@components/button.html` — `button-primary`, `button-icon`, `button-with-icon`
- **Card** → `@components/card.html` — `card-elevated`, `card-action`, `card-interactive`, `card-interactive-2`
- **Chip** → `@components/chip.html` — `chip-action`, `chip-input`, `chip-with-icon`
- **Typography** → `@components/typography.html` — `typography-display`, `typography-body`, `typography-label`
