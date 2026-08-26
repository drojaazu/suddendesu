# sudden-desu.net Website

This is the source for the blog at sudden-desu.net.

# Building

Requires at least [Hugo](https://gohugo.io/) 0.164.0, extended edition. Run `hugo` from the
root of the project to generate the site in the public subdirectory.

# Contributing

We welcome original articles that relate to the site's topics: digital archaeology, software and game disassemblies and analysis, emulation, data preservation, Japanese gaming culture and history, and so on. Please create a new *entry* as outlined below and submit a PR for review.

# Content

## Entries

These are the main entries for the site. To generate a new entry:

`hugo new entry/new-entry-title`

## Pages

These are used for any content that is closely related to the site itself. Currently there is only one page, the About section.

To generate a new page:

`hugo new page/new-page-title`

## Images

Put images in the entry's `img/` directory and reference them with plain markdown —
`![caption](img/thing.png)`. Everything else is automatic:

- Native-resolution screenshots (PNG/GIF, 640px wide or under) are served untouched and
  displayed at a whole-number scale factor with `image-rendering: pixelated`, so they
  stay crisp. Non-integer scaling is what makes pixel art look mushy.
- Photos and scans wider than 1200px are resized to WebP and given a `srcset`.
- `width`, `height`, `loading="lazy"` and `decoding="async"` are emitted for everything.

The link text becomes both the `<figcaption>` and the `alt` text, so it is worth writing.
The thresholds live under `params.image_rules` in `hugo.yaml`. The shared implementation
is `layouts/_partials/img.html`.

## Shortcodes

All of the image shortcodes wrap `_partials/img.html` and accept the same named
parameters (`src`, `alt`, `caption`, `class`, `imgclass`).

### figure

The general-purpose one. `{{< figure "img/thing.png" caption="..." >}}`

### zoomimg

For images that are quite small. Can be clicked and held to zoom in.

### tinyimg

For very small images, rendered crisply at native size.

### large-image

For large, non-screenshot images (such as scans or photos).

### noborder

Drops the border and corner radius.

