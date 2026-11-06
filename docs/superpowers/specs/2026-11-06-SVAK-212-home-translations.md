# SVAK-212: Configured homepage translations

## Behavior

Keep the municipality's versioned `globalSettings` as the source. Translate section headings, detail headings passed from those sections, and buttons that lead from a section to its full list. This includes arbitrary municipal wording. The first English read requests translations automatically. While a translation is pending, display the configured original. While the home screen is focused, briefly retry pending reads and apply each ready translation independently. A failing button must never delay a ready section heading. Keep the configured original if no result is available. Widget and menu titles are outside this change.

English is the first target. French and Portuguese will be enabled together across all then-existing translation profiles in a separate step. That step must retain translation on first read.

## Profile and field ownership

`global-settings-v1` is an internal profile ID, following the existing `news-v1` convention. It versions the translation contract, not the app, the JSON file, or the municipality's settings. Derive its allowlist from the fields consumed by `HomeScreen.js` and documented in `HOME_SCREEN_SECTION_CONFIGURATION.md`:

| Source | Translatable fields |
| --- | --- |
| `homeScreenConfig[].categoriesNews[]` for `newsItems`, and fallback `sections.categoriesNews[]` | `categoryTitle`, `categoryTitleDetail`, `categoryButton` |
| `homeScreenConfig[]` for `pointsOfInterestAndTours` and `eventRecords` | `title`, `buttonTitle` |
| `sections` fallback for those two queries | `headlinePointsOfInterestAndTours`, `buttonPointsOfInterestAndTours`, `headlineEvents`, `buttonEvents` |

Match the app's section selection, visibility and fallback rules. Only extract rendered plain-text values from the selected configuration. Keep app-provided defaults in the existing app catalog; preserve query variables, navigation parameters, URLs, and other settings. Replace the literal German label mapping in `04b305449` when the profile is connected.

## Implementation order

1. **Studio:** Extend the existing Mainserver translation endpoint with a separate, strict profile validator for one plain-text label per work item. Bound sizes, reject unknown keys and unsupported locales, and reuse the existing service identity, instance binding, module activation and DeepL path. Keep `news-v1` validation and behavior intact. No new per-instance switch or URL list.
2. **Mainserver:** Select the same authorized and versioned `globalSettings` as the existing public JSON read. Add an opt-in translation read that returns field path, original value or identity, and state (`ready`, `pending`, or `unavailable`) separately from the original JSON. Reuse the news cache and lease/retry behavior, with a per-field digest incorporating profile and exact source. Scope results by municipality and target locale. Jobs must read the source from the selected server-side configuration and verify it before calling Studio and again before publishing. A changed field gets a new result on first read; unchanged fields keep their cached results. Do not accept source text or an arbitrary JSON path from the app.
3. **Mobile app:** Read translations with the existing locale and app version. Overlay ready values at the existing field consumption points, including the detail title passed through navigation. Keep local/offline settings as originals. Poll only while focused and only for a bounded time while fields are pending. Do not reapply old responses after a locale or settings change; compare each response against the current source. Older Mainservers and unavailable responses fall back to original settings.

## Acceptance checks

- Studio accepts only the allowed label payload for an authorized instance, rejects disabled and cross-instance requests, and still accepts existing news requests.
- On first English read of a configured heading, detail title and button, the Mainserver queues eligible fields once. Ready fields appear even while another field is pending or has failed. Test tenant, locale and version separation and a configuration edit during a running job. Verify that editing one field leaves other cached translations usable.
- On SVA Demo in Staging, configure freely worded German labels and open the homepage in English. Confirm original labels during a delayed request, then live independent updates without reopening the page. Confirm a ready label on the first render with cached data, and confirm that returning to German immediately shows the configured originals. Check unchanged destinations and a news translation as a regression test.
- Run the relevant repository checks. Put product changes on the corresponding SVAK-212 feature branches, including fixes first tested on `staging/demo`. Staging only for rollout and device verification.
