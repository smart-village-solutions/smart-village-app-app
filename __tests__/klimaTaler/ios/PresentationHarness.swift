import UIKit

@main class AppDelegate: UIResponder, UIApplicationDelegate {
  func application(_: UIApplication, configurationForConnecting session: UISceneSession, options _: UIScene.ConnectionOptions) -> UISceneConfiguration {
    let config = UISceneConfiguration(name: "Test", sessionRole: session.role)
    config.delegateClass = SceneDelegate.self
    return config
  }
}

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
  var window: UIWindow?
  func scene(_ scene: UIScene, willConnectTo _: UISceneSession, options _: UIScene.ConnectionOptions) {
    let window = UIWindow(windowScene: scene as! UIWindowScene)
    let driver = Driver()
    window.rootViewController = driver
    self.window = window
    window.makeKeyAndVisible()
  }
}

class Driver: UIViewController {
  var started = false
  var checks: [String] = []
  var dismissals = 0
  let directory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
  override func viewDidLoad() {
    super.viewDidLoad()
    view.backgroundColor = .systemBackground
  }
  override func viewDidAppear(_ animated: Bool) {
    super.viewDidAppear(animated)
    guard !started else { return }
    started = true
    run(0)
  }
  func require(_ condition: Bool, _ message: String) {
    if !condition {
      writeFile(Data(("FAILED: " + message).utf8), named: "result.txt")
      fatalError(message)
    }
    checks.append(message)
  }
  func run(_ scenario: Int) {
    let provider = UIViewController()
    provider.view.backgroundColor = UIColor(red: 0, green: 0.48, blue: 0.17, alpha: 1)
    provider.modalPresentationStyle = .pageSheet
    let label = UILabel(frame: CGRect(x: 20, y: 70, width: 350, height: 60))
    label.numberOfLines = 0
    label.text = "Native UI test fixture\nNo provider SDK or account"
    provider.view.addSubview(label)
    let sheet = ChangersProviderViewController(provider: provider)
    sheet.overrideUserInterfaceStyle = scenario == 0 ? .dark : .light
    if scenario == 2, #available(iOS 17.0, *) {
      sheet.traitOverrides.preferredContentSizeCategory = .accessibilityExtraExtraExtraLarge
    }
    dismissals = 0
    sheet.onDismiss = { [weak self] in self?.dismissals += 1 }
    sheet.onClose = { [weak sheet] in sheet?.dismiss(animated: true) }
    present(sheet, animated: false) {
      sheet.view.layoutIfNeeded()
      self.require(provider.parent === sheet, "provider containment")
      let button = sheet.view.subviews.compactMap { $0 as? UIButton }.first!
      self.require(button.accessibilityLabel == "Klima-Taler schließen", "accessible close label")
      self.require(button.bounds.width >= 44 && button.bounds.height >= 44, "44-point hit target")
      let frame = button.convert(button.bounds, to: sheet.view)
      self.require(provider.view.frame == sheet.view.bounds, "provider fills sheet without an extra header")
      self.require(sheet.view.subviews.count == 2, "only provider and floating close control")
      self.require(frame.maxX <= sheet.view.bounds.maxX - 8, "close button stays inside right edge")
      self.require(sheet.view.hitTest(CGPoint(x: frame.midX, y: frame.midY), with: nil) === button, "overlay receives close taps")
      let contentPoint = CGPoint(x: sheet.view.bounds.midX, y: sheet.view.bounds.midY)
      self.require(sheet.view.hitTest(contentPoint, with: nil)?.isDescendant(of: provider.view) == true, "other touches reach provider")
      self.require(frame.minY >= sheet.view.safeAreaInsets.top, "button within safe area")
      self.require(!sheet.view.hasAmbiguousLayout, "unambiguous container layout")
      self.require(provider.view.frame.height > sheet.view.bounds.height / 2, "provider retains usable height")
      self.require(frame.maxY < sheet.view.safeAreaInsets.top + 100, "close button stays at top")
      if scenario == 0 {
        let renderer = UIGraphicsImageRenderer(bounds: self.view.window!.bounds)
        let screenshot = renderer.pngData { _ in self.view.window!.drawHierarchy(in: self.view.window!.bounds, afterScreenUpdates: true) }
        self.writeFile(screenshot, named: "close-button.png")
        button.sendActions(for: .touchUpInside)
        self.afterDismiss(scenario)
      } else if scenario == 1 {
        provider.dismiss(animated: true)
        self.afterDismiss(scenario)
      } else {
        self.presentChild(provider, button: button, scenario: scenario)
      }
    }
  }
  func writeFile(_ data: Data, named filename: String) {
    do { try data.write(to: directory.appendingPathComponent(filename)) }
    catch { fatalError("Unable to write test artifact: \(filename): \(error)") }
  }
  func presentChild(_ provider: UIViewController, button: UIButton, scenario: Int) {
        let child = UIViewController()
        child.view.backgroundColor = .systemBlue
        child.modalPresentationStyle = .fullScreen
        provider.present(child, animated: false) {
          self.require(self.dismissals == 0, "provider-owned full-screen child does not close entry")
          child.dismiss(animated: false) {
            button.sendActions(for: .touchUpInside)
            self.afterDismiss(scenario)
          }
        }
  }
  func afterDismiss(_ scenario: Int) {
    DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
      self.require(self.presentedViewController == nil, "sheet closed in scenario \(scenario)")
      self.require(self.dismissals == 1, "exactly one dismissal in scenario \(scenario)")
      if scenario < 2 { self.run(scenario + 1) }
      else {
        self.writeFile(Data(("PASSED: \(self.checks.count) checks\n" + self.checks.joined(separator: "\n")).utf8), named: "result.txt")
      }
    }
  }
}
