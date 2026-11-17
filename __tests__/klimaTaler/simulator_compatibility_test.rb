require 'minitest/autorun'
require 'open3'
require_relative '../../modules/expo-changers/ios/simulator_compatibility'

class SimulatorCompatibilityTest < Minitest::Test
  Helper = ExpoChangersSimulatorCompatibility

  def test_only_provider_link_flag_is_conditional_and_repeated_runs_are_stable
    source = "OTHER_LDFLAGS = $(inherited) -ObjC -framework \"Other\" -framework \"ChangersSDK\" -framework \"MotionTagSDK\"\nOTHER_CFLAGS = inherited\n"
    result = Helper.patch_xcconfig(source)
    assert_includes result, '-framework "Other"'
    assert_includes result, '-framework "MotionTagSDK"'
    assert_includes result, '$(EXPO_CHANGERS_SDK_LINK_FLAGS)'
    assert_includes result, "EXPO_CHANGERS_SDK_LINK_FLAGS[sdk=iphonesimulator*][arch=arm64] =\n"
    assert_includes result, "EXPO_CHANGERS_SDK_LINK_FLAGS = -framework \"ChangersSDK\"\n"
    assert_equal result, Helper.patch_xcconfig(result)
  end

  def test_embedding_skips_only_missing_simulator_slice_and_preserves_device_and_intel
    source = <<~'SH'
      install_framework() { printf '%s\n' "$1"; }
      install_framework "${PODS_XCFRAMEWORKS_BUILD_DIR}/ExpoChangers/ChangersSDK.framework"
      install_framework "${PODS_XCFRAMEWORKS_BUILD_DIR}/ExpoChangers/MotionTagSDK.framework"
    SH
    script = Helper.patch_embed_script(source)
    assert_equal script, Helper.patch_embed_script(script)
    [['iphoneos', 'arm64', true], ['iphonesimulator', 'arm64', false], ['iphonesimulator', 'x86_64', true]].each do |platform, arch, expected|
      stdout, stderr, status = Open3.capture3(
        { 'PLATFORM_NAME' => platform, 'ARCHS' => arch, 'PODS_XCFRAMEWORKS_BUILD_DIR' => '/fixture' },
        'bash', stdin_data: script
      )
      assert status.success?, stderr
      assert_equal expected, stdout.include?('ChangersSDK.framework')
      assert_includes stdout, 'MotionTagSDK.framework'
    end
  end
end
