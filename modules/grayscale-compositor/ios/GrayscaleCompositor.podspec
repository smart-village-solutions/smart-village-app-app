Pod::Spec.new do |s|
  s.name           = 'GrayscaleCompositor'
  s.version        = '1.0.0'
  s.summary        = 'Applies the app-wide iOS grayscale accessibility compositor.'
  s.description    = 'A local Expo native module that desaturates the application window with a Core Animation blend mode.'
  s.license        = { :type => 'GPL-3.0' }
  s.author         = 'Smart Village Solutions'
  s.homepage       = 'https://github.com/smart-village-solutions/smart-village-app-app'
  s.platforms      = {
    :ios => '16.4',
    :tvos => '16.4'
  }
  s.source         = { :git => 'https://github.com/smart-village-solutions/smart-village-app-app.git' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = '**/*.swift'
end
