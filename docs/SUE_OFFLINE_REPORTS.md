# SUE report delivery

New reports are saved before the first submission attempt. The form gets a stable local UUID,
and attachments are copied to `Paths.document/sue-reports/<UUID>/` before the outbox entry is
written. An interrupted draft cleanup cannot enqueue the same UUID twice.

## Offline form data and module isolation

- The delivery runtime is mounted inside the settings providers and starts only when SUE
  has a configured API key and server URL. Apps without SUE do not register its timer,
  app-state listener or query invalidation subscription.
- An installed app with saved SUE settings can initialize offline without refreshing its
  main-server token. Apps without SUE keep their existing startup behavior.
- Categories, map rules, attachment limits, required fields and postal-code validation
  are saved after successful reads in `sueResourceCacheV1:*` keys. Form steps are saved
  separately in `sueReportProgressV1:*`, so they survive Apollo content-cache expiration.
  These caches contain no API keys and never change bookmarks or other modules' data.
- These read caches are separated by endpoint (and area ID for postal codes). Test and
  production data are not reused across endpoints. Cached read data is used offline or
  when a read fails; read requests include a 30-second timeout for the response body.
- A first online visit is needed to populate the form data. This does not make the entire
  app offline-capable: navigation and non-SUE content retain their existing cache behavior.
- A connected Wi-Fi network with explicitly unavailable internet keeps queued reports
  pending. Form-step validation does not mutate the cached configuration, and local report
  IDs remain the row keys even when different backends return the same backend ID.

## Compatibility with installed apps

- `sueMyReports` retains its existing format and records. These records are never enqueued or
  resubmitted, including records without an ID or records whose public lookup returns 404.
- `sueReportValues` remains a form draft, not a send queue. Drafts from earlier versions are
  restored for editing; they are never sent without the user pressing Send. Startup no longer
  deletes this key.
- New reports use a separate, versioned `sueOutboxV1` key. Confirmed entries remain there as
  local history, and “Meine Meldungen” combines both stores. Unknown versions and malformed
  storage are not replaced with empty state.
- Each new report is bound to its original POST endpoint. Switching test/production URLs
  does not redirect queued reports. No API keys are stored in outbox entries.
- Attachment paths are reconstructed from the current document directory after an app
  update/restore. Photos from old reports are not moved or deleted.

## Delivery states

| State | Behavior |
| --- | --- |
| `pending` | Stored locally; automatically eligible for sending. No backend ID yet. |
| `sending` | A durable marker has been written before POST begins. |
| `sent` | HTTP success and a valid `service_request_id` have been received and stored. |
| `failed` | The server explicitly rejected the request (400, 401, 403, 404, 405, 413, 415 or 422). The user can retry or edit it. |
| `uncertain` | The request may have reached the server, but confirmation is missing. Automatic retries are disabled. |

The delivery label is separate from the municipality's processing status. Pending reports do
not display a fabricated backend ID or an official processing status.

## Automatic sending and failure recovery

The runtime checks at startup, reconnect and foreground entry. While the app is active, a
30-second timer checks due reports. A GET to the configured services endpoint must succeed
before POST. Failed health checks retain the report and back off from 30 seconds to 15 minutes.
Each network operation has a 30-second timeout, including reading a POST confirmation body.
Concurrent triggers share one worker; storage changes are serialized.

There is no OS background-delivery task. The user must leave the app open or reopen it to
resume delivery. An active request may finish when the app moves to the background, but the
worker will not start another POST there.

Backend idempotency support has not been confirmed. A POST timeout, network interruption,
5xx response, invalid confirmation, interrupted process or failure to save a received receipt
is therefore treated conservatively. A persisted `sending` entry becomes `uncertain` after
restart. The detail screen explains the situation and requires explicit confirmation before
retrying an uncertain report, because doing so may create a duplicate. A public 404 is not
proof that an unpublished report was never accepted.

Editing is limited to explicitly rejected reports. The original remains stored until the
corrected replacement and its attachments have been saved. Uncertain and confirmed reports
cannot be replaced through this edit action.

## Manual verification on an existing installation

1. Record the titles, IDs and count of existing “Meine Meldungen” entries; leave a form draft.
   Install the update without clearing storage. Existing entries and the draft must remain;
   neither should cause a POST automatically.
2. Submit a new report with a photo in airplane mode. Expect a local-save alert, a waiting
   label and no backend ID. Close and reopen the app without clearing data.
3. Restore connectivity and open the app. Expect one POST after a successful health check,
   followed by the returned ID and the “Übermittelt” label. Reopen again: no repeat POST.
4. Simulate an unavailable services endpoint. The entry must remain pending; restore the
   endpoint and keep the app open until its next retry (or foreground the app).
5. Accept a POST server-side but drop/delay its response. Expect “Übermittlung nicht bestätigt”.
   Reconnection and restart must not repeat POST. Check the backend before using manual retry.
6. Return HTTP 422 for POST. Edit the rejected report, submit the corrected version and check
   that the old local entry is replaced only after the edit is saved.
7. Switch the configured backend URL with a pending entry. It must remain saved and must not
   be sent to the new backend.
8. Open the SUE form online to populate its read caches. Restart in airplane mode with an
   expired main-server token and verify saved forms and history; verify categories, required
   fields and postal codes on the configured SUE navigation path. Repeat with another backend:
   its form data must not come from the original backend's cache.
9. Run an app without SUE configuration. Its startup and navigation must retain their existing
   behavior, and no SUE runtime timer or delivery requests should be registered.

Automated coverage includes legacy isolation, offline/reconnect delivery, backoff, concurrent
triggers, interrupted sends, storage/copy failures, manual retry, rejected edits, list parsing,
runtime lifecycle triggers and full-response timeouts.
