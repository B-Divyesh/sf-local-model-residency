# Visual thesis — glacial minimal ceramics

Local Model Residency makes invisible memory pressure visible. Its surface should feel like a quiet instrument on a cold workbench: pale fired clay, blue glacial shadows, and a small warm ember where attention is needed. The rounded forms refer to stacked model weights without copying a generic system monitor.

## Palette

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--ice` | `#eef3f1` | `#17201f` | page field |
| `--clay` | `#fbfaf5` | `#202a28` | raised working surface |
| `--ink` | `#172525` | `#f4f6f1` | primary text |
| `--slate` | `#526361` | `#b6c3bf` | secondary text |
| `--glaze` | `#176b72` | `#74cbd0` | actions and live state |
| `--glaze-dark` | `#0d5057` | `#b7f3f2` | hover and focus |
| `--ember` | `#a84222` | `#ff9b79` | reload or warning |
| `--moss` | `#287044` | `#7bd59b` | resident and healthy |
| `--crack` | `#a02c32` | `#ff989d` | errors |
| `--hairline` | `#ccd7d3` | `#3c4b48` | borders and chart tracks |

Every text pair is designed for at least 4.5:1 contrast. State always has a word or symbol in addition to color.

## Type

The display face uses `Georgia` with a compact fallback serif. Its cut shapes recall maker's marks pressed into clay. Body and numbers use the local system UI stack for legibility and zero network cost. Model sizes use tabular figures. The scale is 16, 18, 24, 34, and 58 px, with 1.5 body leading and a 66-character reading measure.

## Shape, space, and layout

Spacing follows an 8 px base with 4 px only for tight label pairs. Surfaces have uneven ceramic radii (`28px 18px 24px 16px`) and fine cool-grey borders. The app is a split observatory: resident models on the left, an event kiln on the right. The phone layout drops the illustration crop and stacks the event kiln below the model list. Controls remain at least 44 px.

## Interaction grammar

The main verb is **Scan runtimes**. A scan redraws the current resident set, then appends honest events only when the previous state differs. Runtime endpoint failures appear beside that runtime and never erase other results. Clicking a model opens its ownership and memory evidence. **Copy diagnostic** makes a local, prompt-free text report and confirms the copy. Demo controls live in a narrow frost strip above the app.

## Motion

One signature motion represents residency: model discs settle downward by 8 px and their shadow tightens over 220 ms. New reload events briefly warm from ember to clay. Nothing loops. Under `prefers-reduced-motion`, every transition is removed and state changes remain visible through labels and borders.

## Original asset plan and prompt sheet

The hero is an editorial still life rather than a literal screenshot: three hand-thrown porcelain memory vessels nested inside a translucent blue ice shelf, with a single small rust-colored fired-clay bead displaced from the stack. It explains stable residency versus churn without text.

- Use case: `stylized-concept`
- Subject: three abstract ceramic memory vessels, nested and stable; one small displaced bead
- World: an austere glacial workbench with shallow carved channels
- Materials: matte porcelain, crazed celadon glaze, translucent blue-white ice, dark mineral specks
- Light: soft overcast side light, long quiet shadows, no glow
- Lens: 50 mm editorial product still, eye-level, generous negative space
- Palette words: bone white, lichen grey, deep teal glaze, oxidized rust, charcoal
- Negative list: text, letters, numbers, logos, watermark, people, hands, computers, neon gradients, glossy plastic, generic dashboard UI

Generation command uses the factory image model through `/opt/fleet/lib/gen-image.sh`, 1536×1024 at high quality. Generated on 2026-08-28. The result is original project artwork; its exact prompt is stored beside the source asset. A derived crop becomes the 1200×630 social card. Small interface marks are hand-authored SVG and CSS, not generated.

## Why this fits

Model residency is technical, but the user's question is physical: what is still here, what left, and what returned? Ceramic vessels make capacity and ownership tangible. Glacial restraint supports trust, while the lone ember makes costly churn easy to find.
