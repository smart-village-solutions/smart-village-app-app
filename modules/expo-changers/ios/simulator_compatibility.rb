# Changers 4.2.0 has no arm64 simulator slice. Keep the real device/x86_64 SDK
# integration, but let the arm64 simulator compile the explicit unavailable bridge.
module ExpoChangersSimulatorCompatibility
  LINK_VARIABLE = 'EXPO_CHANGERS_SDK_LINK_FLAGS'.freeze
  FRAMEWORK = /(?:^|\/)ChangersSDK\.framework(?:\/|$)/.freeze

  def self.patch_xcconfig(contents)
    lines = contents.lines.reject { |line| line.start_with?(LINK_VARIABLE) }
    lines.map! do |line|
      line.start_with?('OTHER_LDFLAGS =') ? line.gsub('-framework "ChangersSDK"', "$(#{LINK_VARIABLE})") : line
    end
    lines.join + "#{LINK_VARIABLE} = -framework \"ChangersSDK\"\n#{LINK_VARIABLE}[sdk=iphonesimulator*][arch=arm64] =\n"
  end

  def self.patch_embed_script(contents)
    marker = '# expo-changers: arm64 simulator has no provider SDK'
    return contents if contents.include?(marker)
    contents.gsub(/^([ \t]*)install_framework ("[^\n]*\/ExpoChangers\/ChangersSDK\.framework")$/) do
      indent, framework = Regexp.last_match(1), Regexp.last_match(2)
      "#{indent}#{marker}\n#{indent}if [[ \"$PLATFORM_NAME\" != \"iphonesimulator\" || \" $ARCHS \" == *\" x86_64 \"* ]]; then\n#{indent}  install_framework #{framework}\n#{indent}fi"
    end
  end

  def self.apply(installer)
    installer.aggregate_targets.each do |aggregate|
      next unless aggregate.pod_targets.any? { |target| target.pod_name == 'ExpoChangers' }
      aggregate.xcconfigs.each_key do |configuration|
        path = aggregate.xcconfig_path(configuration)
        File.write(path, patch_xcconfig(File.read(path)))
      end
      script = aggregate.embed_frameworks_script_path
      File.write(script, patch_embed_script(File.read(script))) if File.exist?(script)
      aggregate.user_targets.each do |target|
        phase = target.shell_script_build_phases.find { |item| item.name == '[CP] Embed Pods Frameworks' }
        next unless phase
        # The unavailable simulator has no ChangersSDK.framework output to depend on.
        # Always run embedding so removing this one input cannot stale a device framework.
        phase.input_paths = phase.input_paths.reject { |path| path.match?(FRAMEWORK) }
        phase.output_paths = phase.output_paths.reject { |path| path.match?(FRAMEWORK) }
        phase.always_out_of_date = '1'
        (Array(phase.input_file_list_paths) + Array(phase.output_file_list_paths)).each do |list|
          path = list.gsub('${PODS_ROOT}', installer.sandbox.root.to_s)
          next unless File.exist?(path)
          File.write(path, File.readlines(path).reject { |line| line.strip.match?(FRAMEWORK) }.join)
        end
      end
      aggregate.user_project.save
    end
  end
end
