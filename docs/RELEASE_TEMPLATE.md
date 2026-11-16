# Release template configuration

The Main Server release service renders `app.json.erb.tmpl` with an ERB binding.
Existing callers keep `android.googleServicesFile` pointing to `./google-services.json`.

When the release service detects a missing Firebase file, it may set
`@google_services_file_missing = true`. Generation then fails unless the caller
also supplies `@push_notifications_enabled = false`, derived from the tenant's
`globalSettings.settings.pushNotifications` configuration. Only the boolean
`false` permits a release without Firebase; missing or unrecognized values fail
closed with an actionable error. Do not infer disabled push from a missing file.
Push-enabled tenants must supply their Firebase configuration before releasing.
The Main Server caller must implement this contract before using the missing-file
fallback. No Main Server code is changed by this template update.

Run the rendering regression tests with Ruby (standard-library Minitest):

```sh
ruby scripts/test-app-template.rb
```

Changes to config plugins and Android permissions require a compatible native
build. An OTA update cannot apply these native settings. Validate Android FCM
registration on the new native build for each push-enabled tenant.
