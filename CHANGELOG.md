# Changelog

All notable changes to this fork (W2F / illenium-appearance) are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- **Clothing hero: manual ped rotation** — Transparent drag zone above the outfit carousel; click-and-drag horizontally to rotate the character. Sends `appearance_rotate_ped` to the client with heading delta (`SetEntityHeading`). Subtle hint: “drag to rotate” when hovering.

### Changed

- **Preview lighting without auto-spin** — `appearance_turntable_start` still applies W2F preview timecycle when configured; automatic continuous rotation via `pedTurn` in a loop was removed (`client/turntable.lua`).

### Fixed

- **Tattoo preview hash** — `setPreviewTattoo` now uses `joaat()` on the gender-specific tattoo hash when calling `AddPedDecorationFromHashes`, matching `setTattoos` behavior (previews could fail silently before).
- **Head blend reads** — `getPedHeadBlend` guards missing `shapeMix` / `skinMix` before `string.sub`, avoiding script errors when native blend data was unset (could manifest as sliders / skin tone seeming broken).
- **NUI: Input component build** — Removed invalid deep import from `react-select` internals in `Input.tsx` (risk of failed or fragile builds).
- **NUI: tattoo delete state** — `handleDeleteTattoo` clones tattoo state before mutation so React sees updates reliably.
- **NUI: tattoo list filtering** — `filterTattoos` returns a new settings object instead of mutating live `appearanceSettings` (prevents empty or wrong tattoo lists after re-renders).
- **NUI: settings fetch** — `fetchSettings` `useCallback` now lists `appearanceSettings` in deps to avoid stale closure and redundant refetches.

### Developer notes

- Rebuild UI after TS changes: `cd web-src/web && npm install && npm run build` (output: `web/dist/`). Close the FXServer console or restart the resource if `web/dist/assets` is locked during build (Windows `EBUSY`).
