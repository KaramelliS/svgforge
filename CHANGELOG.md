# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.5.0] - 2026-09-29

### Added

- `--opacity` on every card (`0`–`1` or `0`–`100`).
- 32 card types and 22 themes, including `profile`, `steps`, `pills`, `callout`, `compare`, `social`, `checklist`, and `cover`.
- `--shadow`, `--scale`, and `--border-width` (`0` hides the outline).
- Theme gallery under `examples/themes/`.

### Changed

- `--shadow` is applied once in `wrap()`, not both in the card and in `wrap()`.
- `callout` uses `*` for `tip` and `i` for `info`.

### Fixed

- `figure` places its `clipPath` inside `<defs>`.
- `rating` clips only the partial star.

### Security

- User strings go through `escapeXml` (`&`, `<`, `>`, `"`, `'`).
- `svgforge render` refuses `out` paths that contain `..` or are absolute.
- `figure` accepts only `https://` URLs without credentials.
