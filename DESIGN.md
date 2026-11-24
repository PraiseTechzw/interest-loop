# InterestLoop design system

## Mode

**Operate.** These are screens people work in: scanning feeds, saving items, reviewing prompts. Clarity, consistent edges and native expectations outrank expression.

## Palette

| Role | Light | Dark |
| --- | --- | --- |
| Ground | `#F5F6FB` | `#0E1020` |
| Surface | `#FFFFFF` | `#191C31` |
| Surface alt | `#F1F2F8` | `#232741` |
| Ink | `#171A33` | `#F4F5FF` |
| Secondary | `#565C7A` | `#B6BCDA` |
| Border | `#E3E5EF` | `#323751` |
| Primary | `#5B4FE9` | `#9A8EFF` |
| Accent | `#FF6B5A` | `#FF8A7A` |
| Success | `#189774` | `#4ED6AE` |
| Danger | `#D64550` | `#FF7B85` |

Colour carries status and interest identity, not decoration. No gradients; surfaces separate by a one-step tone and a 1px border. Cards at rest have no shadow.

## Type

One family (system sans). Visible scale: 28/24 for screen titles, 17 for section headings, 14–16 for body, 12 for metadata. Titles use tight tracking (-0.3 to -0.6). Body copy is full ink; secondary text is the muted role, never pale grey. Numeric values use tabular figures where they align.

## Shape and space

- Radius: 8 (small), 10 (controls), 14 (cards), pill for chips only.
- One horizontal gutter (16px) on every screen; section spacing larger than intra-section spacing.
- Section headings have more space above than below.
- One left edge and one right edge across a screen.

## Components

- **Card** — surface fill, 1px border, radius 14, no shadow.
- **Pill** — filter/interests only; selected uses the interest colour, unselected is surface with border.
- **Primary button** — flat brand fill, radius 10, one per screen.
- **Navigation** — plain text rows with a small chevron, not a grid of icon tiles.
- **Metrics** — one flat strip of values and labels, no icon tiles or sparklines.
- **Links** — text with a chevron, no emoji arrows.
- **Icons** — Ionicons at one consistent stroke; no emoji standing in for icons.
- **States** — loading spinner, inline error with retry, designed empty state, full content.

## Anti-slop checklist

- No icon-in-tinted-square feature grids.
- No KPI tiles with icons and coloured accents.
- No gradient hero, no glass, no glow.
- No repeated card grid where a list or plain rows would do.
- No emoji as icons, no decorative dividers, no index numbers.
- No thin uppercase tracked labels.
- No nested cards.

Verify with the Impeccable detector and a production web screenshot at 390px before shipping UI changes.
