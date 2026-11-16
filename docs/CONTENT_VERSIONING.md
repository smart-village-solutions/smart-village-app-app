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
POIs fetch remaining candidates when restricted records would hide a page.

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
and offline cache reads, including version/build boundaries.
