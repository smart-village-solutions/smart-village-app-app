Pod::Spec.new do |s|
  s.name = 'ExpoChangers'
  s.version = '0.1.0'
  s.summary = 'Local Changers adapter for Smart Village App'
  s.description = 'Festgelegte Anbieter-Frameworks, Expo-Lebenszyklus und typisierte asynchrone Schnittstelle.'
  s.author = 'Smart Village Solutions'
  s.homepage = 'https://github.com/Changers/changers-ios-sdk'
  s.license = { :type => 'Proprietary' }
  s.source = { :git => 'https://github.com/Changers/changers-ios-sdk.git', :commit => '4bcbd85dcf3d303fd262b2165d5f57fa6c620ad0' }
  s.platform = :ios, '16.4'
  s.swift_version = '5.0'
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.source_files = '*.swift'
  s.vendored_frameworks = 'Frameworks/ChangersSDK.xcframework', 'Frameworks/MotionTagSDK.xcframework'
  s.pod_target_xcconfig = { 'DEFINES_MODULE' => 'YES' }
end
