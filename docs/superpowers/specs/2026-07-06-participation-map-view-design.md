# Participation Map View Design

## Context

The Participation Portal already provides category-based lists and an "Alle Beteiligungen ansehen" entry point for `ParticipationProject` records. Users want an additional map view so they can quickly recognize active participation projects nearby.

This feature must be isolated to the Participation module. Existing shared list and POI map behavior must not be generalized or modified in a way that changes behavior for other customers.

## Goals

- Add a floating action button labeled `Kartenansicht` on Participation project lists.
- Open a dedicated Participation map screen from that button.
- Show active Participation projects with valid geo coordinates as clickable pins.
- Show a bottom preview for the selected pin with thumbnail and project metadata.
- Allow navigation from the preview into the existing Participation detail screen.
- Preserve current list filter context when entering the map view.

## Non-Goals

- No refactor of the generic `Overviews` screen to support Participation maps.
- No reuse of the POI list/map toggle state machine for Participation.
- No behavior changes for non-Participation `genericItems` lists.
- No attempt to render projects without valid geo coordinates on the map.

## UX

### List Screen

On `Index` screens backed by `QUERY_TYPES.GENERIC_ITEMS` and `genericType: ParticipationProject`, a floating action button is shown at the bottom, matching the existing POI floating button pattern.

The button label is `Kartenansicht`.

The button is only shown when the current filtered result set contains at least one active Participation project with a valid geo location.

### Map Screen

Pressing the floating button opens a dedicated `ParticipationProjectMapScreen`.

The screen header shows a close button (`X`) in the top left. Pressing it returns to the exact previous list screen using `navigation.goBack()`, preserving the user's current filter and navigation context.

The map screen does not replace the list screen in-place. It is a separate route scoped to Participation.

### Marker Interaction

Each eligible Participation project is rendered as a clickable map pin.

Pressing a pin opens a bottom preview card similar to the existing map preview behavior. The preview contains:

- thumbnail image when available
- title
- small metadata such as date and type when available

Pressing the preview card opens the existing Participation detail screen for that project.

## Data Model and Filtering

### Source Data

The map screen loads `QUERY_TYPES.GENERIC_ITEMS` with `genericType: ParticipationProject` and the same filter context as the source list.

The request should remove list pagination limits for the map, so all eligible items for the current filter are available.

### Active Projects

Only active Participation projects are shown on the map.

Implementation should use the Participation project's status payload in a single explicit helper so the definition of "active" is localized and testable. If the current dataset uses a normalized active status value, that value should be matched there instead of scattering status checks across components.

### Geo Location

Geo coordinates should be resolved using the existing `getParticipationProjectGeoLocation` helper. Projects without a valid coordinate are excluded from marker rendering but remain visible in list screens.

## Architecture

### New Screen

Create a dedicated screen:

- `src/screens/ParticipationProject/ParticipationProjectMapScreen.tsx`

Responsibilities:

- fetch filtered Participation project data for map use
- derive active, geocoded marker entries
- render the map
- manage selected marker state
- render selected project preview
- navigate to detail
- provide header close behavior

### Floating Button Integration

Add a Participation-specific floating button integration to the existing generic items list flow without changing behavior for other generic item types.

This should be implemented with a narrow condition:

- `query === QUERY_TYPES.GENERIC_ITEMS`
- `queryVariables.genericType === GenericType.ParticipationProject`

The button handler navigates to the dedicated Participation map screen and forwards the current list `queryVariables`, list title, and any additional context needed by detail navigation.

### Marker Preview Mapping

Add a small Participation-specific mapping helper that converts a `ParticipationProject` item into:

- map marker coordinates
- preview card props
- detail navigation params

This keeps map rendering code smaller and reduces duplication with existing Participation list item formatting.

## Error Handling

- If no active geocoded Participation projects exist for the current filter, the list screen does not show the floating button.
- If the map screen receives no eligible markers, it renders a stable empty state instead of crashing or showing a broken map interaction.
- Missing thumbnails are allowed; the preview falls back to text-only content.
- Missing optional metadata such as type or date must not block rendering.

## Testing

Add tests for the isolated Participation behavior only.

### Unit / Component Coverage

1. The Participation list flow shows the floating map button only for `ParticipationProject` lists with at least one active, geocoded item.
2. The button navigates to the dedicated Participation map screen with the current filter context.
3. The map screen transforms only active, geocoded Participation projects into markers.
4. Selecting a marker renders the preview card with thumbnail fallback behavior.
5. Pressing the preview navigates to the existing Participation detail screen.
6. The map screen close button returns to the previous list screen.

## Implementation Notes

- Reuse existing Participation helpers for date, title, thumbnail, and geo location wherever practical.
- Keep all new logic scoped under the Participation module or guarded by `ParticipationProject` checks.
- Avoid modifying POI-specific map logic except for extracting tiny reusable primitives if strictly necessary.

## Acceptance Criteria

1. From `Alle Beteiligungen ansehen`, users can open a Participation map via a floating `Kartenansicht` button when eligible data exists.
2. From category-filtered Participation lists, users can open the same Participation map view with the active filter preserved.
3. The map displays only active Participation projects with coordinates as clickable pins.
4. Pin selection opens a preview with thumbnail and project context.
5. Preview selection opens the Participation detail screen.
6. The map can be closed via an `X` button in the top-left header, returning to the previous list.
7. No POI or shared list/map behavior changes for other modules or customers.
