# Pakistan Railways — Web Brand Guidelines (Agent Reference)

Condensed from the official Pakistan Railways Brand Identity & Guidelines (v1.0) into rules an AI coding agent can apply directly when building or styling a website for Pakistan Railways.

---

## 1. Color Palette

### Primary colors

| Name | Hex | RGB | Contrast on white | Contrast on black |
|---|---|---|---|---|
| Heritage Green | `#1F4D36` | 31, 77, 54 | 9.66 (AAA) | 2.17 (fail) |
| Ember Red | `#A63A2C` | 166, 58, 44 | 6.44 (AA) | 3.26 (AA, large text only) |
| Signal Gold | `#F8B735` | 248, 183, 53 | 1.78 (fail) | 11.82 (AAA) |
| Pumpkin | `#DA7A11` | 218, 122, 17 | 3.10 (AA, large text only) | 6.77 (AA) |

### Secondary colors

| Name | Hex | RGB | Contrast on white | Contrast on black |
|---|---|---|---|---|
| Surface Green | `#EAF4EF` | 234, 244, 239 | 1.12 (fail) | 18.69 (AAA) |
| Cream | `#F7F3E8` | 247, 243, 232 | 1.11 (fail) | 18.94 (AAA) |
| White | `#FFFFFF` | 255, 255, 255 | — | 21.00 (AAA) |
| Black | `#000000` | 0, 0, 0 | 21.00 (AAA) | — |

### Rules for the agent

- **Use only these 8 colors.** Do not introduce new hex values into the palette.
- **Body text contrast:** Heritage Green and Ember Red are the only primary colors safe for normal-size text on a white background. Signal Gold and Pumpkin fail or only pass at large-text size on white — use them for backgrounds, accents, icons, or large headings, not small body copy.
- **On dark/black backgrounds:** Signal Gold, Surface Green, Cream, and White all pass AAA — prefer these for text on dark sections.
- **Color distribution ratio** (apply roughly this weighting across a page/component):
  - 40% — dominant neutral (white/cream, main background)
  - 20% — Heritage Green
  - 15% — secondary neutral
  - 10% — Ember Red
  - 5% each — Signal Gold, Pumpkin, Surface Green, Black, and one remaining accent
  - In practice: keep the UI mostly neutral/white with green as the dominant brand color, red as a secondary accent, and gold/pumpkin used sparingly (badges, icons, highlights, CTAs).
- **Never use gradients.**
- **Never apply drop shadows or other effects to brand colors, logo, or type.**
- **Never set body/paragraph text color using the accent colors that fail contrast** (Signal Gold or Cream/Surface Green on light backgrounds).
- **Never combine colors arbitrarily** — only pair colors that meet the contrast table above for the given text size/role.

### Suggested CSS custom properties

```css
:root {
  --pr-heritage-green: #1F4D36;
  --pr-ember-red: #A63A2C;
  --pr-signal-gold: #F8B735;
  --pr-pumpkin: #DA7A11;
  --pr-surface-green: #EAF4EF;
  --pr-cream: #F7F3E8;
  --pr-white: #FFFFFF;
  --pr-black: #000000;
}
```

---

## 2. Typography

| Language | Typeface |
|---|---|
| English | Instrument Sans |
| Urdu | Jameel Noori Nastaleeq Kasheeda |

### Rules for the agent

- Use **Instrument Sans** for all English UI text (headings, body, labels, buttons).
- Use **Jameel Noori Nastaleeq Kasheeda** for all Urdu text — this is a Nastaliq-style font and needs proper RTL handling (`dir="rtl"`, appropriate `lang="ur"` attribute) plus adequate line-height, since Nastaliq scripts render taller/more vertically dynamic than Latin type.
- Keep the typographic system limited — a small, consistent set of weights (do not introduce many extra weights/styles beyond what's needed for a clear hierarchy: e.g., regular, medium, bold).
- Suggested CSS:

```css
:root {
  --font-en: "Instrument Sans", system-ui, sans-serif;
  --font-ur: "Jameel Noori Nastaleeq Kasheeda", "Noto Nastaliq Urdu", serif;
}

[lang="en"] { font-family: var(--font-en); }
[lang="ur"] { font-family: var(--font-ur); direction: rtl; }
```

- If either font is unavailable/not licensed for web embedding, fall back to a close open-source equivalent (e.g., a geometric/humanist sans for English, Noto Nastaliq Urdu for Urdu) rather than a generic system font, to preserve the brand feel.

---

## 3. Logo Usage

### Available logo variants

- **Primary logo** — horizontal lockup (symbol + English wordmark + Urdu wordmark). Default choice for header/footer/nav.
- **Vertical logo** — stacked version. Only use if explicitly requested; don't default to it.
- **Symbol only** — icon without wordmark. Use where horizontal space is limited (e.g., collapsed nav, small UI chrome).
- **Avatar** — most simplified mark, framed in a circle in the signature brand color. Use only for very small/compact contexts: favicons, app icons, social avatars, watermarks. **Never use the avatar as the main site logo.**

### Sizing

- **Minimum size for screen use: 20px.** Never render the logo smaller than this.
- No fixed maximum size — scale up freely as long as it stays legible; if it looks illegible at a given size, it's too small for that context.
- Avatar mark width = 70% of its circular frame.

### Clear space

- Maintain a minimum clear space around the logo equal to the x-height of the English wordmark (cap height to baseline). Do not let other UI elements, text, or images enter this padding.
- Apply the same clear-space rule to the symbol-only mark.

### Color usage

- Use only approved logo color combinations with strong contrast between logo and background (full color on white/cream, or single-color/white-out version on dark or busy backgrounds/images).
- On images or busy backgrounds where the reversed (white) version isn't legible or appropriate, use the full-white logo variant.

### Do NOT (applies to logo everywhere in the UI)

- Don't stretch, squash, or distort the logo's aspect ratio.
- Don't outline the logo.
- Don't rotate the logo.
- Don't apply shadows, glows, or other effects.
- Don't apply patterns or textures inside/behind the logo.
- Don't recolor the logo with unapproved colors — only the approved palette/color combinations above.
- Don't place the logo on a background with insufficient contrast.

---

## 4. General Do-Nots (site-wide, applies beyond just the logo)

- No gradients anywhere in the UI (buttons, backgrounds, text).
- No drop shadows/glow/bevel effects on brand elements.
- No low-contrast color pairings — check every text/background pair against the contrast table in section 1.
- Don't ignore the color distribution ratio — don't build pages that are, e.g., mostly Signal Gold or mostly Ember Red.
- Don't set running/body text in a saturated accent color; reserve accents for short labels, buttons, icons, and highlights.

---

## 5. Quick Reference Summary for Component Building

- **Backgrounds:** White `#FFFFFF` / Cream `#F7F3E8` / Surface Green `#EAF4EF` (light), or Black `#000000` / Heritage Green `#1F4D36` (dark sections).
- **Primary brand color / nav / footer / CTA base:** Heritage Green `#1F4D36`.
- **Secondary accent (alerts, secondary CTA):** Ember Red `#A63A2C`.
- **Tertiary accents (badges, highlights, icons only, not text):** Signal Gold `#F8B735`, Pumpkin `#DA7A11`.
- **Body text:** Heritage Green or Black on light backgrounds; White, Cream, or Signal Gold on dark backgrounds.
- **Fonts:** Instrument Sans (English), Jameel Noori Nastaleeq Kasheeda (Urdu), no flourishes, limited weight set.
- **Logo:** primary horizontal lockup by default, min 20px, preserve clear space, never distort/rotate/recolor/shadow it, avatar only for favicon/social/watermark contexts.
