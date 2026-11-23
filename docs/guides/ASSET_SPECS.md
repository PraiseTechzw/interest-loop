# Brand asset specifications and generation prompts

Use this when supplying your own artwork for InterestLoop. Every asset below has an exact filename, dimensions, format, safe area and a ready-to-use prompt.

> The files currently in `assets/` are generic template placeholders from the initial commit (a blue "A" and grid circles). **Replace all of them.** Their sizes are correct, but they are not InterestLoop branding.

---

## 1. Brand foundation

### Palette (must match the app's design tokens)

| Role | Light | Dark | Hex |
| --- | --- | --- | --- |
| Primary | Indigo | Lavender | `#5B4FE9` / `#9A8EFF` |
| Accent | Coral | Soft coral | `#FF6B5A` / `#FF8A7A` |
| Background | Mist | Midnight | `#F5F6FB` / `#0E1020` |
| Surface | White | Slate | `#FFFFFF` / `#191C31` |
| Success | Green | Mint | `#189774` / `#4ED6AE` |
| Text | Ink | Frost | `#171A33` / `#F4F5FF` |

### Concept

"InterestLoop" = a closed loop connecting things you love: **news → movies → discovery → knowledge graph → coach → learning → back to news**. The mark should read as a continuous circular path or soft infinity loop with 3–5 small nodes/dots, suggesting connection and return. Avoid a letter "A", shields, compasses, generic tech hexagons, or stock AI gradients.

### Master style prompt (prepend to image prompts)

> Flat, refined vector app-icon style, geometric and precise, smooth curves, subtle depth via one soft shadow, limited palette of indigo `#5B4FE9`, coral `#FF6B5A`, white and pale mist `#F5F6FB`, generous negative space, crisp edges, no photorealism, no 3D bevels, no text, no watermark, centred composition, professional product design, Expo/React Native mobile app branding.

### Master negative prompt

> text, letters, numbers, watermark, signature, mockup, device frame, rounded-corner icon container, glossy 3D, cyberpunk neon, excessive gradients, clutter, faces, clip art, stock vector, mockup background, illegible fine detail.

---

## 2. Required app assets

### 2.1 `assets/icon.png` — iOS / universal app icon

| Property | Value |
| --- | --- |
| Dimensions | **1024 × 1024 px** |
| Format | PNG |
| Transparency | **No alpha** — full-bleed square |
| Corners | **Square** — the OS applies the mask |
| Safe area | Keep the mark inside the central **~820 × 820 px**; no critical detail in outer 100 px |
| Referenced by | `app.json` → `icon` |

**Prompt:**

> [MASTER STYLE] A confident InterestLoop app icon: a continuous indigo loop formed by three interlocking arcs, with one coral node where the arcs meet, on a solid rich indigo `#5B4FE9` full-bleed background. The loop is white with a single coral accent dot. Perfectly centred, flat vector, no rounded frame, no text, crisp edges, ample padding.

---

### 2.2 `assets/android-icon-foreground.png` — Android adaptive foreground

| Property | Value |
| --- | --- |
| Dimensions | **512 × 512 px** |
| Format | PNG |
| Transparency | **Yes**, transparent outside the artwork |
| Safe area | Android masks to a circle/squircle and crops the outer third. Keep all key art inside the central **~310 × 310 px** (61% of canvas) |
| Referenced by | `app.json` → `android.adaptiveIcon.foregroundImage` |

**Prompt:**

> [MASTER STYLE] Transparent background. Only the InterestLoop mark: a white continuous loop with a coral `#FF6B5A` meeting node, centred and scaled to occupy roughly 60% of the canvas width. No background, no circle, no shadow, no text. Leave wide transparent margins for Android's adaptive icon mask.

---

### 2.3 `assets/android-icon-background.png` — Android adaptive background

| Property | Value |
| --- | --- |
| Dimensions | **512 × 512 px** |
| Format | PNG |
| Transparency | No — opaque, same dimensions as foreground |
| Safe area | Full bleed; keep pattern subtle because the foreground sits on top |
| Referenced by | `app.json` → `android.adaptiveIcon.backgroundImage` |

**Prompt:**

> [MASTER STYLE] A full-bleed 512×512 square background in solid indigo `#5B4FE9` with an extremely subtle darker-indigo concentric-ring motif behind the centre, low contrast, no logo, no text, no shadow. Designed as the background layer beneath a white loop mark.

---

### 2.4 `assets/android-icon-monochrome.png` — Android 13 themed icon

| Property | Value |
| --- | --- |
| Dimensions | **432 × 432 px** |
| Format | PNG |
| Transparency | Yes — transparent background |
| Colour | **Single flat colour only** (white or dark grey); Android tints it |
| Rule | Must be the **same silhouette** as the foreground asset |
| Referenced by | `app.json` → `android.adaptiveIcon.monochromeImage` |

**Prompt:**

> [MASTER STYLE] Transparent background. A single flat solid white silhouette of the same InterestLoop continuous-loop mark used in the foreground icon, centred at ~60% canvas width. One colour only, no coral accent, no gradient, no shadow, no text.

---

### 2.5 `assets/splash-icon.png` — launch/splash image

| Property | Value |
| --- | --- |
| Dimensions | **1024 × 1024 px** |
| Format | PNG (only PNG supported) |
| Transparency | **Yes** |
| Safe area | Mark centred at ~55–60% of canvas; the config scales it via `imageWidth` |
| Note | Currently **unconfigured** — see §5 |
| Referenced by | `expo-splash-screen` plugin config (to be added) |

**Prompt:**

> [MASTER STYLE] Transparent background. A clean centred InterestLoop loop mark, white with a coral accent node, sized to about 55% of the canvas. No background, no grid, no text, no shadow. Optimised to appear on an indigo splash background and on a near-black dark-mode splash background.

---

### 2.6 `assets/favicon.png` — web browser tab icon

| Property | Value |
| --- | --- |
| Dimensions | **48 × 48 px** |
| Format | PNG |
| Transparency | Optional; opaque preferred |
| Rule | Extreme simplification — no fine lines, readable at 16 px |
| Referenced by | `app.json` → `web.favicon` |

**Prompt:**

> [MASTER STYLE] Ultra-simple 48×48 favicon: a bold indigo loop glyph with one coral dot, thick strokes, no thin details, no text, high contrast, readable at 16×16 pixels.

---

## 3. Repository and store graphics

### 3.1 `.github/social-preview.png` — GitHub social preview

| Property | Value |
| --- | --- |
| Dimensions | **1280 × 640 px** |
| Format | PNG (recommended under 1 MB) |
| Background | Opaque, dark midnight `#0E1020` or indigo gradient |
| Safe area | Keep text 80 px from all edges |

**Prompt:**

> [MASTER STYLE] Wide 1280×640 social card. Dark midnight `#0E1020` background. Left third: large InterestLoop loop mark in white and coral. Right two-thirds: bold modern sans-serif wordmark "InterestLoop" in white, below it the tagline "Your interests, one loop." in pale mist, and a small row of four pills reading NEWS · MOVIES · DISCOVER · COACH. Clean editorial layout, generous spacing, no device mockup, no screenshot.

---

### 3.2 `assets/store/feature-graphic.png` — Google Play feature graphic

| Property | Value |
| --- | --- |
| Dimensions | **1024 × 500 px** |
| Format | PNG or JPEG, no transparency |
| Cropping | Play also crops to a 500×500 square — keep the logo and headline inside the central **500 × 500 px** |
| Safe area | 40 px outer margin |

**Prompt:**

> [MASTER STYLE] Wide 1024×500 banner, indigo `#5B4FE9` background with a soft coral glow on the right. Centred within the middle 500 px: the InterestLoop loop mark above the wordmark "InterestLoop". Along the bottom edge, small white pill labels: OFFLINE NEWS · MOVIE PICKS · KNOWLEDGE GRAPH · MINDSET COACH. No device frames, no small print, no text near edges.

---

### 3.3 Google Play phone screenshots — `assets/store/play/01-home.png` … `08-capsule.png`

| Property | Value |
| --- | --- |
| Dimensions | **1080 × 1920 px** each (9:16 portrait) |
| Format | PNG or JPEG |
| Count | Minimum 2, recommended 6 |
| Safe area | Keep UI 90 px from top and 120 px from bottom; no browser chrome |

**Prompts (one per screenshot):**

1. `01-home.png` — "App UI screenshot of the InterestLoop Home screen: large 'InterestLoop' greeting, indigo 'Your interests' hero card with CIA/Geek/3D/Learning pills, four quick-action tiles (Coach, Graph, Saved, Paths), a Top stories card and a Movie picks card. Clean light theme, mobile portrait, no device frame."
2. `02-news.png` — "App UI screenshot of the News screen titled 'Tech News', interest filter pills, sample story cards with source and date, bookmark buttons, a small info banner about demo data. Light theme, mobile portrait."
3. `03-movies.png` — "App UI screenshot of the Movies screen titled 'Movie Night', genre filter pills, movie cards with rating stars and bookmark buttons, one poster placeholder monogram. Light theme, mobile portrait."
4. `04-discover.png` — "App UI screenshot of the Discover screen titled 'Discover', source pills All/Hacker News/Reddit/Curated, ranked cards with score and age, bookmark buttons. Light theme, mobile portrait."
5. `05-graph.png` — "App UI screenshot of a Knowledge Graph: indigo, coral, teal and green nodes arranged in a circle on a white canvas, thin connecting lines, zoom controls, topic detail card beneath. Light theme, mobile portrait."
6. `06-coach.png` — "App UI screenshot of the Mindset Coach: category pills, a large first-principles question card, a text field for reflection, Save and Skip buttons, progress stats at top. Light theme, mobile portrait."
7. `07-learning.png` — "App UI screenshot of Learning Paths: a card titled 'CIA & Intelligence path' with a progress bar showing 1 of 4 steps, numbered steps with checkboxes and source labels. Light theme, mobile portrait."
8. `08-capsule.png` — "App UI screenshot of the Time Capsule: dated card showing interests, saved counts and top topics, an off-by-default reflection privacy switch, and a Copy / share capsule button. Light theme, mobile portrait."

Use the same font, spacing and indigo/coral palette across all screenshots. Do not invent features that are not in the app.

---

### 3.4 App Store screenshots — required iPhone/iPad sizes

Generate the same eight screens in each required size. Verify exact list in App Store Connect before uploading.

| Device class | Dimensions | Suggested folder |
| --- | --- | --- |
| 6.9" iPhone | **1290 × 2796 px** | `assets/store/ios/6.9/` |
| 6.5" iPhone | **1284 × 2778 px** | `assets/store/ios/6.5/` |
| 13" iPad (app supports tablets) | **2064 × 2752 px** | `assets/store/ios/ipad-13/` |

Prompt suffix for all:

> Same InterestLoop screen as the Play screenshot, but composed for the target device aspect ratio. Keep all content away from the top status bar and bottom home indicator. No device frame, no captions outside the app UI.

---

## 4. Optional assets

| Asset | Dimensions | When needed |
| --- | --- | --- |
| `assets/ios-dark-icon.png`, `assets/ios-tinted-icon.png` | 1024 × 1024 each | Only if using `ios.icon` variants in app config |
| `assets/notification-icon.png` | 96 × 96, white silhouette on transparent | Only if adding push notifications |
| `public/manifest-icon-192.png`, `public/manifest-icon-512.png` | 192×192, 512×512 | Only if publishing the web build as an installable PWA |
| `assets/store/demo-preview.mp4` | 15–30 s, portrait | Optional App Store app preview / README GIF |

---

## 5. Configuration to apply once the artwork is supplied

### 5.1 Splash screen (currently missing)

```bash
npx expo install expo-splash-screen
```

```json
"plugins": [
  [
    "expo-splash-screen",
    {
      "backgroundColor": "#5B4FE9",
      "image": "./assets/splash-icon.png",
      "imageWidth": 200,
      "dark": {
        "backgroundColor": "#0E1020",
        "image": "./assets/splash-icon.png"
      }
    }
  ]
]
```

### 5.2 GitHub social preview

Repository → Settings → General → Social preview → Upload `.github/social-preview.png`.

### 5.3 Store uploads

- Google Play Console → Store presence → Store listing (feature graphic + screenshots + copy)
- App Store Connect → App Information (icon) and App Store → Screenshots (per device class)

---

## 6. Quality checklist

- [ ] Every PNG has the exact dimensions listed
- [ ] Icons are square, full-bleed, and have **no** rounded corners baked in
- [ ] Adaptive foreground and monochrome share the same silhouette
- [ ] Transparent assets truly have an alpha channel
- [ ] No text baked into app icons (store screenshots may contain UI text)
- [ ] Palette matches the hex values in §1
- [ ] Artwork is legible when the icon is scaled to 48 px
- [ ] Screenshots show the real app, not invented screens
- [ ] `app.json` references were checked after replacing files
- [ ] Web export and EAS preview build still succeed after replacement
