# Payload-based content visibility

GraphQL content can optionally specify minimum installed app requirements:

```json
{ "payload": { "minVersion": "5.0.0", "minBuild": 1573 } }
```

Each supplied requirement must pass independently. Versions compare numerically
using SemVer ordering; builds accept nonnegative integers or numeric strings,
including dotted iOS build strings. Version must be a JSON string. Null or missing
requirements preserve existing visibility. Invalid explicit requirements, or
unknown installed values needed by a requirement, hide the record.

The installed native version/build come from `expo-application`, not OTA config.
No new native dependency is required. The helper filters presentation data without
changing network caches, pagination offsets, credentials or saved bookmarks.
Shared list parsing, maps, details, voucher categories/counts and event calendars
use the same projection. Restricted details show the existing unavailable-content
message before voucher redemption controls or read-aloud content are exposed.
Paginated lists continue past hidden-only pages using raw offsets and the existing
page size. When version filtering hides records, pagination uses the same list
parser and date/publication filtering as the rendered list.
It stops at a displayed record, an empty page or a duplicate-only response. Records
are never removed from the raw cache and offsets count raw rows. If version
requirements hide nothing, the existing one-page request behavior remains unchanged.

Importers must merge requirements into both POI and voucher payloads while
preserving all other metadata and existing IDs. Requirements are generic: no
customer, provider or category IDs are embedded in the app. Apps and records
without requirements retain their existing behavior.

Clients must fetch refreshed payloads; older cached records without requirements
remain unrestricted until refreshed. This is presentation filtering, not server
access control. Older app binaries need a compatible OTA patch to understand it.

Run `yarn lint` and `yarn test`. Focused coverage is in contentVisibility.test.ts,
contentVisibilityParser.test.ts and VoucherContentVisibility.test.ts. Verify mixed
restricted/unrestricted records in lists, maps, counts, bookmarks, direct details
and offline cache reads, including version/build boundaries. Pagination regression
coverage is in the helper and hook `contentPagination` tests. The
`contentPaginationVisibility.test.tsx` regression tests exercise the actual parser
with mixed version-restricted, expired, unpublished and eligible Generic Items.
Generic Item calendar visibility is
covered by `genericItemEventsVisibility.test.tsx` with the real occurrence parser.

Generic Item calendar sources are filtered before conversion into occurrences, so
all calendar/list/widget consumers share the same eligible records. Raw cached
responses and query keys are preserved. Hidden-only initial pages load automatically;
concurrent end-reached callbacks share the in-flight request. Refresh, unmount and
filter changes invalidate pending pagination updates.
Transient failures retain cached records and allow an explicit refresh/retry.


## Using the filter in another customer app

Integrate this shared change into that app's source branch and release a compatible
client build or OTA update. No Klima-Taler module, customer ID or feature flag is
required. Existing content remains visible when its payload has no requirements.

Set requirements on the affected records in that customer's API/importer, using
the app's actual native version and build numbers. A single `minBuild` requirement
applies to both iOS and Android, so check both platforms before choosing a value.
If only a version boundary is needed, omit `minBuild`; if only a build boundary
is needed, omit `minVersion`. Higher app versions still need to satisfy an explicit
build requirement.

Before rollout, test one unrestricted record and records below/at/above the chosen
version/build boundary in lists, map pins and direct details. Refresh records online,
then repeat with cached data offline. An installed client without this patch does
not interpret the new fields.
