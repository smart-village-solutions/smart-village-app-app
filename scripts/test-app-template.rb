require "erb"
require "json"
require "minitest/autorun"

# Exercise the same ERB binding used by the Main Server release service.
class AppTemplateTest < Minitest::Test
  def render(overrides = {})
    values = {
      mobile_app_name: "Test Village",
      expo_slug_name: "test-village",
      mobile_app_version_number: "5.1.0",
      eas_project_id: "00000000-0000-0000-0000-000000000000",
      mobile_app_schema_url: "test-village",
      apple_team_id: "TESTTEAM",
      mobile_app_bundle_identifier: "de.example.test",
      mobile_app_ios_build_number: "1",
      mobile_app_android_version_number: 1,
      android_background_color: "#123456",
      asc_app_id: "123456789"
    }.merge(overrides)
    context = Object.new
    values.each { |name, value| context.instance_variable_set("@#{name}", value) }
    template = File.read(File.expand_path("../app.json.erb.tmpl", __dir__))
    JSON.parse(ERB.new(template).result(context.instance_eval { binding })).fetch("expo")
  end

  def test_existing_release_callers_keep_firebase_configuration
    assert_equal "./google-services.json", render.fetch("android").fetch("googleServicesFile")
  end

  def test_push_enabled_releases_keep_firebase_configuration
    config = render(google_services_file_missing: false, push_notifications_enabled: true)
    assert_equal "./google-services.json", config.fetch("android").fetch("googleServicesFile")
  end

  def test_missing_firebase_fails_regardless_of_remote_push_settings
    [true, false, nil, "false", 0].each do |push_setting|
      error = assert_raises(RuntimeError) do
        render(google_services_file_missing: true, push_notifications_enabled: push_setting)
      end
      assert_includes error.message, "google-services.json"
      assert_includes error.message, "waste reminders and future remote push settings"
    end
    assert_raises(RuntimeError) { render(google_services_file_missing: true) }
  end

  def test_disabled_remote_push_still_keeps_firebase_for_reminders_and_future_settings
    config = render(google_services_file_missing: false, push_notifications_enabled: false)
    assert_equal "./google-services.json", config.fetch("android").fetch("googleServicesFile")
    assert_equal "de.example.test", config.fetch("android").fetch("package")
    assert_equal "de.example.test", config.fetch("ios").fetch("bundleIdentifier")
  end

  def test_tenant_branding_and_build_versions_are_preserved
    config = render(mobile_app_name: "Münster", expo_slug_name: "another-village",
                    mobile_app_bundle_identifier: "de.example.another",
                    mobile_app_version_number: "6.2.0", mobile_app_android_version_number: 42,
                    mobile_app_ios_build_number: "7", android_background_color: "#abcdef")
    assert_equal "Münster", config.fetch("name")
    assert_equal "another-village", config.fetch("slug")
    assert_equal "6.2.0", config.fetch("version")
    assert_equal "de.example.another", config.fetch("android").fetch("package")
    assert_equal 42, config.fetch("android").fetch("versionCode")
    assert_equal "7", config.fetch("ios").fetch("buildNumber")
    assert_equal "#abcdef", config.fetch("android").fetch("adaptiveIcon").fetch("backgroundColor")
  end

  def test_native_template_alignment
    config = render
    plugins = config.fetch("plugins").map { |plugin| plugin.is_a?(Array) ? plugin.first : plugin }
    assert_equal 1, plugins.count("@maplibre/maplibre-react-native")
    assert_includes plugins, "expo-notifications"
    assert_includes config.fetch("android").fetch("blockedPermissions"), "READ_EXTERNAL_STORAGE"
    assert_equal "1.1.3", config.fetch("extra").fetch("sueVersion")
  end
end
