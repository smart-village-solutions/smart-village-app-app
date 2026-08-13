Pod::Spec.new do |s|
  s.name             = 'OnOffSwitchLabels'
  s.version          = '1.0.0'
  s.summary          = 'Provides the iOS On/Off Labels accessibility preference to React Native.'
  s.description      = 'An Expo module that observes the iOS On/Off Labels accessibility setting.'
  s.license          = { :type => 'GPL-3.0' }
  s.author           = 'Smart Village Solutions'
  s.homepage         = 'https://github.com/smart-village-solutions/smart-village-app-app'
  s.platforms        = { :ios => '15.1' }
  s.swift_version    = '5.9'
  s.source           = { :git => 'https://github.com/smart-village-solutions/smart-village-app-app.git' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }

  s.source_files = '**/*.swift'
end
