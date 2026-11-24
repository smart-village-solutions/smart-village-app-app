# Release template configuration

The Main Server release service renders `app.json.erb.tmpl` with an ERB binding.
Existing callers keep `android.googleServicesFile` pointing to `./google-services.json`.

Firebase configuration is required for every Android release. When the release
service detects a missing file, it may set `@google_services_file_missing = true`;
generation then fails with an actionable error. A disabled tenant
`globalSettings.settings.pushNotifications` value does not permit omission:
existing waste-reminder users can still require a server push token, and remote
settings can enable push after installation. The template always retains
`android.googleServicesFile`, including for callers without the missing-file flag,
so the native build also validates the file's presence.

Provide the tenant's valid Firebase configuration before releasing. Do not use an
empty path or remove the field to bypass that requirement. No Main Server code is
changed by this template update. Supporting Firebase-free binaries would require
a separate native capability contract covering every token consumer and settings
version; this template does not produce those binaries.

Run the rendering regression tests with Ruby (standard-library Minitest):

```sh
ruby scripts/test-app-template.rb
```

Changes to config plugins and Android permissions require a compatible native
build. An OTA update cannot apply these native settings. Validate Android FCM
registration on the new native build for each push-enabled tenant.
