# Manual multilingual texts.js installation

Download a complete, sealed municipal `texts.js` from SVA Studio and replace
`src/config/texts.js` in the customer app checkout. Review the German customer
texts and included languages before building. The download does not change any
installed app or trigger a translation request.

Use Studio export format 2 for this app version (5.0.0). Format 1 belongs to the
older 4.3.0 text structure and must not replace this app's file. The reviewed
format-2 import manifest is available in the Studio repository at
`packages/core/tests/fixtures/mobile-texts/manifest-v2.json`. The existing Studio
source importer accepts that JSON manifest; it does not execute JavaScript files.
Existing translations remain stored when importing a newer manifest. New keys
still require complete translations before a multilingual snapshot can be sealed.

The file exports `textsByLocale`, `texts`, and `setTextsLocale`. All existing
direct and barrel imports and `texts.…` accesses stay unchanged. Functions keep
their locale-local references and plural branches; the app name comes from
`app.json`.

`index.js` restores the local `textsLocale` setting and calls
`setTextsLocale(selectedLocale)` **before requiring App.js**. This order also
initializes module-level labels in the selected language. An absent or unknown
locale selects the entire German catalog. A storage read failure does not erase
the saved preference.

Settings links to a dedicated language screen. German is always offered. Other
languages require both a bundled catalog and a current Mainserver release. `LanguageSettings` owns the selection, confirmation, and
loading/error state; the settings footer keeps its development actions.
Selecting another language shows a restart warning, including possible loss of
unsaved input. Confirmation persists the choice and reloads the app using
`expo-updates` (development uses `DevSettings.reload`). A failed write leaves the
active language unchanged; a failed reload shows an error and retains the saved
choice for the next launch. No per-component subscriptions are required.

Run `yarn lint`, `yarn test --watchman=false`, and the Expo bundle check before
shipping a replaced file. Also check the restart on installed iOS and Android
builds. This change adds no native dependency, automatic download, server rollout,
DeepL request, or runtime evaluation of uploaded code.

## Mainserver language releases — app contract, 5 November 2026

The Demo integration at `gitlab/staging/demo` (`67be3449e`, feature commit
`b6bd826d7`) provided the bundled catalogs, the language restart flow,
`Accept-Language`, and the English news detail pilot. The shared app reuses these
pieces without importing Demo configuration or its OTA version.

Mainserver `gitlab/staging` at `be4e5536` accepts a Studio activation policy,
but its policy currently stores only `["en"]` or `[]` for news. It does not
expose an app-facing locale list. The app adapter and its tests use this
**proposed** contract on the same authenticated GraphQL endpoint as news:

```graphql
query AppTranslationLocales {
  appTranslationLocales
}
```

Return a non-null list of non-null strings (`[String!]!`), e.g.
`{"data":{"appTranslationLocales":["en","fr","pt-PT"]}}`. Resolve the municipality
from the normal app authentication and tenant routing; do not accept a client
supplied instance or municipality ID. Return a complete, current snapshot of
canonical app catalog codes, independent of the request language. An empty list
is a successful revocation of all optional languages. A missing field, failed
request, or malformed payload is not a revocation; the app retains the last
successful list in memory and offers only German before its first valid list.

Studio needs to include the instance's released language codes in its existing
authenticated policy synchronization to Mainserver, with the generation guard
that rejects stale updates. Mainserver needs to store that list per municipality
and expose it through the field above. Its news resolver, jobs, and Studio
handler must also support the same target codes; the currently bundled Portuguese catalog is
`pt-PT`, so `pt` alone does not enable it.
If news is unavailable for an approved locale or article, return the complete
German source. Legacy news responses without translation metadata are German.
The app validates explicit metadata against the requested language and reads
German explicitly if the server returns unverifiable metadata.

The app refreshes releases on startup, reconnection and foreground. A successful
list that excludes the active optional language saves German and reloads the app
so existing module-level `texts.…` labels refresh too. News requests are bound
to one locale, including pending results, persisted responses and read-aloud.
The fixed catalog still comes from the manual `texts.js` installation above.

## Dynamic content translations — confirmed contract, 27 October 2026

Planning only; this does not authorize implementation or commits. The existing
`texts.js` export and manual installation remain separate. The matching server
contract is recorded in `main-server/plans/002-app-translation-gateway.md` in the
sibling repository.

The app sends its selected language centrally through `Accept-Language` (for
example, `en`). GraphQL queries need no additional language arguments. Existing
response fields remain strings in their current structure, with either a complete,
current translation or a complete German fallback per displayed content. Language
maps, `*I18n` fields, and translation wrapper objects are not the standard response.

An authorized non-German app content request triggers missing translations in the
background. The Main-Server verifies access, the current source, and language
availability, then checks its shared MySQL translation table. A hit requires no
Studio call. A miss creates a deduplicated background job through Studio/DeepL;
the Main-Server validates and stores the returned result. No separate REST batch
submission by the app is required. Repeated requests, concurrent requests, and
GraphQL aliases must not create duplicate jobs.

German requests, saving/importing originals, denied access, disabled languages,
and reserved fixed-catalog artifacts create no dynamic translation jobs. For HTML
and JSON Static Contents, only approved display fields are translated; technical
values, IDs, URLs, and form controls remain unchanged. Reuse depends on the current
text, municipality, target language, context, and format. Changed text gets a new
key. Studio form reads remain read-only and do not update the 90-day usage clock.
The server must distinguish app and Studio access through a trusted context.

The content request does not wait for DeepL. Missing translations initially return
German in the same structure. Within a maximum of five seconds, the app may read
again. On error or timeout, the opened view remains German, with no later swap.

Before implementation, agree how fallback and readiness are signaled and how the
confirmed ten-minute pickup reference is conveyed. No polling endpoint, REST status
format, or additional mandatory resource fields are decided yet.
`Accept-Language` alone does not partition Apollo's normalized or persisted cache:
the app must isolate languages and source versions and allow a fresh server read
to discover a ready translation after a cached German fallback. The existing
language-selection restart does not establish that cache contract by itself.

### Assigned app planning work — APP-1 through APP-3

Continue on `feature/SVAK-212-mehrsprachigkeit`; preserve existing uncommitted
work. Main-Server Plan 002, sections 4, 5, and 11, owns the shared contract.
The following are bounded proposals for MS-1/MS-2 acceptance, not a decided
API/cache architecture or authorization to implement.

#### APP-1: central header and cache boundaries

| Verified existing path | Current behavior | Required consequence |
| --- | --- | --- |
| `index.js`, `src/helpers/textsLocaleHelper.js` | Fixed-text locale is chosen before App modules load; switching reloads the app | Reuse this effective locale for the Main-Server client; no second locale provider |
| `src/index.js:88–128` | Central auth/HTTP link; one `InMemoryCache` and one unpartitioned persisted snapshot | Add `Accept-Language` here while retaining auth mode/headers; language must also isolate memory and disk caches |
| `src/helpers/cacheHelper.js:102` | Expiring storage already accepts `cacheKey` and derives its expiry key | Use the same partition key in Apollo persistence and this adapter, retaining the expiry policy |
| `src/hooks/staticContent.ts:66`, `src/helpers/graphqlHelper.js:10` | Only name/version query arguments; refresh can use `cache-first`, offline uses `cache-only` | Known German fallback must allow network revalidation; retain queries and renderer data shapes |
| `src/ReactQueryProvider.tsx:15–27` | React Query is memory-only; reset removes keys containing `apollo-cache-persist` | Preserve reset compatibility; review locale keys only for actual localized React Query endpoints |

Smallest candidate: reuse Apollo with one active normalized cache per selected
language and verified backend/municipal access scope. Use separately scoped disk
snapshots, for example `apollo-cache-persist:<scope>:<locale>`, and retain German
originals for offline fallback. Exact scope/key encoding, access boundaries, and
how the German snapshot is read alongside the selected language remain APP-1/MS-2
agreements. App slug or a language header alone does not prove municipal access.
Do not apply the Main-Server header indiscriminately to Consul/OParl/external clients.

Preserve the legacy snapshot and user preferences/data. Never restore an unknown
legacy snapshot as target-language content; German reuse requires verified scope
and source-language provenance. Temporary storage/network failures do not purge
recoverable state. A restart alone does not establish language isolation on disk.

A cached response needs actual-language/completeness/source information alongside
its data: German returned for an English request is a fallback, not ready English.
How that metadata survives normalized/persisted cache restoration is explicitly
open. Revalidate known fallback despite the ordinary refresh interval. Proposed
repeat reads bypass cache (`no-cache`) until scope/source/view-generation checks
accept the response; guard before writing it into a normalized cache. Exact local
metadata storage and write ordering are not decided here.

Bind pending work to locale, access scope, query/variables, view generation, and
server-reported source version/digest. Reject incompatible late replies before
cache writes/rendering after navigation, language/access changes, or a known source
change. A hash identifies equality, not revision order; overlapping requests need
generation checks. Offline can only use the last verified stored source; discovering
an unknown server change requires revalidation. No destructive cache reset is proposed.

#### APP-2: loading, repeat reads, and fallback

Use the existing content-read boundary, initially `useStaticContent` and
`HtmlScreen`, rather than changing every query or string renderer. One HTML
Static Content is the first display unit; the first JSON form profile should group
all its approved text fields. List resources may complete independently.

| Situation | Proposed display behavior |
| --- | --- |
| Complete matching local translation | Display immediately |
| Offline | Immediately show complete local translation or a known German original; if neither exists, use the existing unavailable state |
| Online, missing complete translation | Start neutral loading and the content request; hold returned German as the fallback candidate |
| Complete matching target result within five seconds | Commit every visible text field of that unit together |
| German response with pending work | Repeat the same query over the network within the remaining budget; no separate mandatory submit |
| Translation/network error or deadline | Commit an authorized German original, otherwise unavailable; stop retrying and keep this choice for the opened unit |
| Confirmed access/source denial | Show unavailable; do not reveal cached German as a workaround |
| Confirmed disabled language | Follow the mandatory language-selection flow, not ordinary translation fallback |
| Response after fallback was committed | No replacement in the opened unit; later openings may use a valid ready result |

The budget is at most five seconds from opening/requesting the unit, including
network time; retries do not restart it. Cancel/detach unfinished view work at the
deadline. A new explicit opening/refresh starts a new view generation. Preserve
list/pagination semantics and actual content language for fallback notices/read-aloud.

**Minimal response proposal for MS-1 approval:** keep resource `data` unchanged and
put optional per-unit status in the GraphQL envelope's `extensions`. All names
below are illustrative and unapproved. For a query alias `page`, an initial
English request could return:

```json
{
  "data": { "page": { "content": "<p>Montags geöffnet.</p>" } },
  "extensions": {
    "contentLocales": [
      {
        "path": ["page"],
        "sourceDigest": "source-1",
        "servedLocale": "de",
        "state": "pending",
        "handle": "opaque-receipt"
      }
    ]
  }
}
```

A ready repeat read would keep the same structure, set `content` to
`"<p>Open Mondays.</p>"`, and report the matching digest with
`servedLocale: "en", state: "ready"`. In a mixed list, separate metadata could
identify `["items", 0]` as English/ready and `["items", 1]` as German/pending.
Paths must follow this response's aliases/positions, not become durable identities.
A single `Content-Language` header cannot identify those different unit states.
Missing metadata must not silently imply ready target-language content.

Recommend repeating the original content query for the first integration rather
than adding a mandatory separate status endpoint. The confirmed pickup handle is
an ephemeral receipt valid for ten minutes from issuance; polling must not extend
it, and it neither authorizes content nor extends the five-second UI deadline.
Delivery, expiry signaling, whether/how it is echoed, and correlation with repeated
content reads or an optional status operation remain MS-1/APP-2 decisions. No REST
status/request shape is approved. Existing hooks do not expose this response metadata;
Apollo must not be assumed to persist `extensions` automatically.

#### APP-3: existing completion work, not new implementation

- [ ] Isolate the catalog fixture in `__tests__/screens/SettingsScreen.test.js`:
  its German-only assertion conflicts with the real four-language export.
- [ ] Isolate/restore fixtures in `__tests__/components/LanguageSettings.test.js`:
  radio index 1 currently means English, not Portuguese. Tests temporarily replacing
  `pt-PT` must restore the original catalog instead of deleting it.
- [ ] Perform installed iOS/Android checks for four-language selection, confirmation/
  cancel, restart/persistence, captured labels/navigation titles, and storage/reload
  failure recovery. These device checks remain outstanding.
- [ ] After contract approval, test cache isolation/offline provenance, pending-to-ready
  despite `cache-first`, mixed lists/aliases, source/access/locale changes, deadline
  boundaries and late responses. No new tests are written in this planning step.
- [ ] Joint first proof: approved simple HTML Static Content, then profiled JSON with
  translated display fields and unchanged IDs/URLs/form controls. Subsequently cover
  all confirmed content types; the proof sequence does not reduce release scope.

The fixed `texts.js` installation remains a manual intermediate delivery. Automatic
catalog updates and the dynamic translation/cache path are not implemented by it.

### Joint decisions still required

| Owners | Open agreement |
| --- | --- |
| MS-1 + APP-2 | Status/fallback metadata placement and names, actual served language, source digest/version, per-unit/alias/list correlation and legacy-server behavior |
| MS-1 + APP-2 | Pickup delivery/echo/expiry and relation to repeat content reads; whether any optional read-only status operation is needed |
| APP-1 + MS-2 | Verified cache scope, legacy German handling, offline readiness metadata, pre-write generation checks, and server response-cache invalidation |
| MS-1 + ST-2 | Trusted app/Studio distinction and authenticated bounded translation service, without a second permanent dynamic store in Studio |
| MS-2 + ST-1 + APP-2 | Approved display profiles, deduplicated jobs, accepted example responses and the shared first proof |

The section above records the planning-only handoff. The subsequently authorized
news pilot below supersedes that restriction for its app source and mock tests.
Backend files remain read-only here; no commits, pushes or deployments.

### English news pilot — 27 October 2026

Implemented on `feature/SVAK-212-mehrsprachigkeit`, without changing the fixed catalog:

- `getGraphqlAuthHeaders` centrally sends the active catalog's `Accept-Language` for
  both existing Main-Server clients. Other API clients are unchanged.
- Apollo persistence uses a new scoped key in both `persistCache` and its existing
  expiry adapter. Old unscoped storage is preserved and is not restored into it.
- English news details use `rawRequest` to retain `extensions.appTranslations`:
  `{path, sourceDigest, servedLocale, state}` with a 64-character SHA-256 digest,
  `de|en`, and `pending|ready|unavailable`. The existing query still returns ordinary
  strings; its root path is `['newsItem']`. Metadata matching understands aliases
  and list indices; this pilot UI only consumes the single-news query.
- Each persisted news response stores data and metadata together under an expiring
  key containing the news ID and a SHA-256 scope of namespace, endpoint, OAuth-client
  configuration, exact request credentials and selected language. Credentials never
  appear in storage keys. Token rotation deliberately creates a new cache scope.
- The news pilot bypasses both Apollo normalization and React Query's shared detail
  cache, and does not trust unscoped route/list snapshots as an authorized fallback.
  This is not a redesign of private-data caching in other app screens.
- A cached complete English message displays immediately; online revalidation may
  update the cache for the next opening, but never replaces that opened view.
  Otherwise pending results repeat the same query every 500 ms within one five-second
  budget including the first request. At expiry the view settles on the available
  German response, or shows unavailable if none exists. Offline reads use only this
  scoped cache. Explicit refresh starts a new budget.
- Missing metadata is German legacy data. `unavailable/de`, including unsupported
  payload/media news, remains wholly German. HTTP/GraphQL rejection hides cached
  fallback in the current view; transient transport/storage failures preserve it.
  Scope changes, navigation and superseded reads cannot commit stale responses.
- Read-aloud chunks use the actually served language, with existing German defaults
  retained. Static Content localization is not part of this pilot.

Verification: six focused suites passed (33 tests, two skipped, one snapshot), covering
headers/scopes, metadata, pending/ready/unavailable, legacy responses, offline access,
source changes, late responses, navigation, stable cached display and English/German
speech. Targeted ESLint reported no errors and four existing hook warnings. The full
test run reported 201 passing / 12 failing suites (1258 passing / 20 failing tests), including existing mock/snapshot
failures and the previously identified replaced-catalog assumptions. Full ESLint was
stopped after repeatedly reporting React Native dependency parser errors.

Integration remains unverified against a running Main-Server/Studio/DeepL chain and
installed iOS/Android builds. The server contract is documented in
`main-server/doc/app_translation_news_pilot.md`; actual feature configuration and the
existing authenticated service binding must be verified there before live activation.
No server configuration, secrets, database state or Studio files were changed here.

English is present in the installed source catalog alongside German, French and
Portuguese and is offered by the existing language-settings entry. Simulator UI
availability has not been rechecked in this step.

### Temporary local Main-Server selection (development builds only)

Set the local tenant origin and select an existing development OAuth configuration
when starting Metro:

```sh
EXPO_PUBLIC_MAIN_SERVER_URL=http://de-musterhausen.server.smart-village.local:4000 \
EXPO_PUBLIC_MAIN_SERVER_CONFIG=musterhausen yarn start --clear --port 8081
```

`getMainServerUrl` applies this origin consistently to both GraphQL clients, OAuth
and reachability. It accepts only HTTP(S) loopback origins (`localhost`, `127.0.0.1`,
`[::1]`, Android emulator `10.0.2.2`) and the existing local tenant pattern
`<slug>.server.smart-village.local`, without credentials, paths, query or fragment.
In release builds the variable is ignored. With the variable unset, the configured
endpoint and existing SecureStore keys are unchanged; restart Metro/app when changing
the variable. No branding, secrets, native settings or existing running service is
modified by this selection.

OAuth paths and app credentials still come from the existing development configuration.
`EXPO_PUBLIC_MAIN_SERVER_CONFIG` selects an existing `secrets` entry only when the
local development override is enabled; otherwise the namespace remains authoritative.
It contains a configuration name, never credentials.
No credential is supplied through `EXPO_PUBLIC_*`, logged, or newly hard-coded. The
local database must already have the matching development OAuth application. Public
access token and expiry use separate SecureStore keys scoped to the local origin,
namespace and OAuth client; regular-instance tokens and saved profile data are retained.
Private/member/voucher GraphQL modes are deliberately blocked with the override so
their existing remote credentials are never forwarded to the local test server.
The English news pilot uses the public mode and server-scoped caches described above.

Before a real run, confirm the local server origin/port and matching development OAuth
registration, start the existing dev client, choose English in Settings, and open the
chosen plain-text/HTML news item. Observe `newsItem` metadata and the bounded pending/
ready flow. Studio migrations, DeepL setup and the existing Audience/service binding
remain separate prerequisites; no live backend or DeepL run has been performed here.

Override verification: 38 targeted tests passed across five suites (two skipped),
including default/release behavior, local-origin validation, OAuth/GraphQL selection
and scoped token keys. Targeted lint had no errors and two pre-existing hook warnings.
The updated full test run passed 202 suites / 1271 tests and retained the same 12 failing
suites / 20 failing tests. Full lint was bounded to 45 seconds and stopped after
repeated dependency-parser errors. No installed-device or live service test was run.

### Actual local integration check — 27 October 2026

The user chose local checks only, retaining the no-push constraint. No staging rollout
or remote identity/configuration change was performed.

- Reproduced the startup failure in the booted iPhone 16e simulator: the selected
  endpoint did not return an access token, and `auth` attempted to save
  `undefined` in SecureStore. Added a minimal HTTP/token validation guard and two
  regression cases (401 and a 200 response missing its token). Tokens already saved
  are not overwritten by these failures. The simulator now reports the underlying
  Main-Server authentication failure; it has **not** displayed an English news item.
- Correction after checking the actual running Metro process: its override is
  `http://127.0.0.1:3000`, where Studio from another checkout is listening. The app
  therefore sends its Main-Server requests to Studio. The configured internal
  development URL is only the fallback and is not the running target. No local
  Main-Server is listening on port 4000. This port mismatch is the immediate startup
  blocker; missing local OAuth configuration is a separate prerequisite below.
- The fallback app configuration uses the internal development server. Its OAuth
  application UID is absent from the local Main-Server database. That database has
  41 municipalities and existing news, but no `app_translations` table. No migration
  or speculative OAuth/municipality registration was applied during this check.
- The local Studio development configuration targets `sva_studio_bus_test`. With the
  correct RLS instance context, `de-studio-sandbox` has an enabled DeepL interface,
  encrypted key present, `last_check_status=succeeded`, and English selected. This
  is stored setup status, not a fresh successful DeepL request.
- The local sandbox's `sva_mainserver` connection points to the remote demo server,
  has no `translationService` binding, and the translation module is not effective.
  The local Main-Server database has no matching `demo` municipality. These mappings
  must be established deliberately; a development URL override does not establish
  identity or tenant authorization.
- Existing Studio on port 3000 belongs to another checkout and returns HTML 404 for
  the service route. Started the current translation branch separately on port 3002
  using the existing local runtime configuration: the same POST correctly returns
  JSON 401 `service_authentication_invalid`. No authentication guard was bypassed,
  key copied to another instance, translated row fabricated, or DeepL call made.

Targeted checks: 40 tests passed (five suites, two skipped), targeted lint clean.
Full tests: 202 suites / 1273 tests passed; the same 12 suites / 20 tests failed.
Full lint was stopped at 45 seconds of repeated dependency-parser errors.

Remaining local prerequisites are a confirmed app/municipality/OAuth mapping, the
normal Main-Server migration and worker startup, and a correctly enabled Studio
module with an authorized service binding. The Main-Server transport currently
requires HTTPS for Studio; localhost HTTP is not silently accepted. If the existing
Keycloak service account lacks the required Studio audience, changing it is a remote
configuration action and remains outside the user's local-only instruction.

### Local services and simulator follow-up — 27 October 2026

The port mismatch above is now corrected. Metro on 8081 uses the tenant origin and
existing `musterhausen` OAuth configuration shown above. The installed iPhone 16e
dev client successfully authenticates as the existing local application; English was
selected through Settings and the normal restart confirmation. The menu and article
actions display English catalog text. Settings remains accessible when the optional
About configuration is missing (three regression cases).

Local-only runtime isolation:

- Main-Server: port 4000, MySQL `smart_village_translation_pilot`, municipality 53
  (`de-musterhausen`), app user 515. The isolated database received all pending regular
  migrations, including `app_translations`; the original development database was not
  migrated. Sidekiq consumes only `default` in Redis database 15.
- Studio: current translation branch on port 3002, PostgreSQL
  `sva_studio_translation_pilot`, copied from the existing local test database. The
  other checkout on port 3000 remains untouched. The sandbox's existing DeepL setup
  decrypts with the existing runtime keyring and reports ready with English selected.
- A narrow local HTTPS proxy on 3443 forwards only the translation route to 3002,
  using existing development certificates. Main-Server and Sidekiq use a temporary
  public CA bundle containing the normal roots and that development CA. TLS
  validation remains enabled. No private key was created or copied.
- In the cloned Studio database only, the existing sandbox Main-Server interface
  points to the local tenant and contains the exact issuer/client/subject binding
  with audience `sva-studio-app-translations`. No DeepL key was transferred to a
  different instance.

The isolated database contains a controlled **German source** news item 406215,
`Neue Öffnungszeiten der Stadtbibliothek`, reachable through More →
`Lokaler Übersetzungstest: Bibliothek`. Its plain-text/HTML source passes the
`news-v1` eligibility check. The simulator loaded its German title, intro and body
from the local Main-Server; no English translation was inserted or fabricated.

The real Main-Server service token currently has audience `account`. An actual
TLS-verified POST with that token and this news source returns HTTP 401
`service_authentication_invalid` from local Studio. Adding the dedicated audience
mapper to the existing remote Keycloak client requires the user's pending approval;
no remote configuration has been changed. The Main-Server translation feature stays
disabled in the clone until that requirement is satisfied, to avoid exhausting retry
leases while authentication is known to fail.

**The English news end-to-end test is not complete.** Once the service token contains
the dedicated audience, enable `settings.app_translations` in municipality 53 of the
clone with `locales: ["en"]`,
`studio_url: "https://localhost:3443/api/v1/app-translations/translate"` and
`studio_instance_id: "de-studio-sandbox"`. Open the source news with English selected,
observe the real worker/provider result and reopen after readiness if the bounded
foreground wait elapsed. Verify `servedLocale=en`, the translated title/body and a
simulator screenshot before declaring success. No push or deployment was performed.

Validation for this follow-up: seven focused suites / 49 tests passed, including
OAuth configuration selection, local tenant origins, missing About data, language
confirmation/recovery and translated-news behavior. Targeted ESLint exited 0 with
dependency parser diagnostics. The full run before correcting two stale language
test fixtures passed 203 suites / 1278 tests and failed 12 suites / 20 tests (including
three failures in those two fixtures, now passing in the focused run). Five snapshots
failed. Full `yarn lint` was bounded at 45 seconds of repeated React Native dependency
parser errors. `git diff --check` passed. No Android simulator check was performed.

### Successful local news translation — 27 October 2026, evening

The user explicitly approved adding only the dedicated audience to the existing
remote Keycloak service client. In realm `svs-intern-studio-staging`, client
`sva-saas-mainserver` now has mapper `studio-app-translations-audience` with custom
audience `sva-studio-app-translations` in access tokens only. Other direct mappers
were verified unchanged. The existing Studio admin client was used because
`kcadm.sh` was unavailable; no accounts, roles, push or deployment were involved.

The real service call exposed a Studio bug: PostgreSQL returns separate `Date`
objects for interface `updatedAt` values, so identity comparisons discarded the
completed DeepL response as a configuration change. The two comparisons now use
serialized timestamp values. A regression test accepts distinct objects for the
same timestamp and rejects an actual one-millisecond provider timestamp change.
Temporary diagnostics were removed. The service suite passed 35 tests with one
optional database test skipped; targeted lint had zero errors and one existing
non-null assertion warning.

The local Studio launch was also corrected to preserve the existing encryption key
identifier exactly when copying the existing runtime configuration in memory. The
provider now reports ready without changing or copying private key files. After the
configuration and code fixes, the failed isolated test row's retry budget was reset;
no translated entries were supplied manually.

Opening news 406215 with English selected triggered the normal GraphQL → Sidekiq →
HTTPS Studio → DeepL chain. `app_translations` row 1 became `ready` on the next
attempt and contains the real translated title, block title, intro and HTML body.
The simulator accessibility tree displayed:

- **New opening hours for the municipal library**
- From November onwards, you’ll also be able to visit us on Mondays.
- The municipal library is open on Mondays from 9 am to 6 pm. We look forward to
  seeing you.

The original German source article remains unchanged. Static menu/tab content is
still German: only the news-detail pilot is connected to dynamic translation.
Local servers remain running so the user can continue testing.

Final authenticated GraphQL verification returned HTTP 200 for both locales:
German returned the unchanged source title; English returned the translated title
with `extensions.appTranslations[0].servedLocale="en"`, `state="ready"` and digest
`a5181f47111478e407b2077d5a47429f417bd8f12ab23c21d6103c125561ab61`.
The final pixel screenshot was inspected at `/tmp/svak212-english-news-final.png`
and shows the English title, intro and body. The article was left open in English.
