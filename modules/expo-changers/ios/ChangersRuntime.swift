#if !targetEnvironment(simulator) || !arch(arm64)
import ExpoModulesCore
import ChangersSDK
import UIKit

final class ChangersRuntime {
  static let shared = ChangersRuntime()
  private let activationKey = "expo.changers.activated.v1"
  private(set) var initialized = false
  private(set) var enabled = false
  var launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  weak var controller: UIViewController?
  var opening = false
  var dismissalObserver: ChangersDismissalObserver?
  var onProviderClosed: (() -> Void)?
  func closeProvider() {
    guard let controller else { return }
    controller.dismiss(animated: true) {
      if self.controller === controller { self.providerClosed() }
    }
  }
  func providerClosed() {
    guard controller != nil || opening else { return }
    controller = nil; opening = false; dismissalObserver = nil
    onProviderClosed?()
  }
  var operation: ChangersOperation?
  var config: [String: String] { Bundle.main.object(forInfoDictionaryKey: "ChangersConfiguration") as? [String: String] ?? [:] }
  var configured: Bool { Int(config["clientId"] ?? "") != nil && !(config["clientSecret"] ?? "").isEmpty && !(config["clientName"] ?? "").isEmpty }
  var activated: Bool { UserDefaults.standard.bool(forKey: activationKey) }
  func initialize() {
    guard enabled, configured, activated, !initialized else { return }
    ChangersTracking.sharedInstance.initializeMotionTag(with: launchOptions)
    let sdk = ChangersInstance.shared()
    sdk.debug = false; sdk.maxDebug = false; sdk.isWebViewLogsEnabled = false
    sdk.isWebViewInspectable = false
    sdk.load(config: ChangersConfig(clientId: Int(config["clientId"]!)!, clientSecret: config["clientSecret"]!, clientName: config["clientName"]!, environment: .stage))
    initialized = true
  }
  func accept(_ promise: Promise) {
    guard enabled else { promise.reject("E_DISABLED", "Klima-Taler ist deaktiviert."); return }
    guard configured else { promise.reject("E_CONFIGURATION", "Die Changers-Zugangsdaten fehlen."); return }
    UserDefaults.standard.set(true, forKey: activationKey)
    initialize(); promise.resolve(status())
  }
  func requireReady(_ promise: Promise) -> Bool {
    guard enabled else { promise.reject("E_DISABLED", "Klima-Taler ist deaktiviert."); return false }
    guard configured else { promise.reject("E_CONFIGURATION", "Die Changers-Zugangsdaten fehlen."); return false }
    guard activated else { promise.reject("E_NOT_ACTIVE", "Bitte Klima-Taler zuerst öffnen."); return false }
    guard initialized else { promise.reject("E_NOT_READY", "Das SDK wurde noch nicht initialisiert."); return false }
    return true
  }
  func stop() {
    if initialized { ChangersInstance.shared().stopTracking() }
    UserDefaults.standard.set(false, forKey: activationKey)
  }
  func setEnabled(_ value: Bool) {
    enabled = value
    if value {
      initialize()
    } else {
      controller?.dismiss(animated: false)
      providerClosed()
      // Remote disable is not logout: preserve the existing identity and activation history.
      if initialized { ChangersInstance.shared().stopTracking() }
    }
  }
  private var state: String {
    if !configured { return "unconfigured" }
    if !activated { return "inactive" }
    if initialized { return "ready" }
    return "idle"
  }
  func status() -> [String: Any] {
    ["platform": "ios", "environment": config["environment"] ?? "stage", "sdkVersion": "4.2.0", "motionTagVersion": "6.3.4",
     "state": state,
     "activated": activated, "initialized": initialized, "authenticated": initialized && ChangersInstance.shared().isLoggedIn,
     "tracking": "unknown", "providerOpen": controller?.presentingViewController != nil || opening]
  }
  func authenticate(_ uuid: String?, promise: Promise) {
    guard requireReady(promise) else { return }
    guard operation == nil else { promise.reject("E_BUSY", "Eine andere SDK-Anfrage wird bereits bearbeitet."); return }
    guard !ChangersInstance.shared().isLoggedIn else { promise.reject("E_ALREADY_AUTHENTICATED", "Bitte zuerst vom aktuellen Konto abmelden."); return }
    let op = ChangersOperation(promise: promise); operation = op
    if let uuid {
      guard !uuid.isEmpty, uuid.count <= 128 else { op.fail("E_INVALID_ARGUMENT"); return }
      ChangersInstance.shared().loginUser(uuid: uuid, authenticationDelegate: op, setupDelegate: op)
    } else { ChangersInstance.shared().registerUser(authenticationDelegate: op, setupDelegate: op) }
  }
  func statistics(_ promise: Promise) {
    guard requireReady(promise) else { return }
    guard ChangersInstance.shared().isLoggedIn else { promise.reject("E_AUTHENTICATION", "Bitte zuerst anmelden."); return }
    guard operation == nil else { promise.reject("E_BUSY", "Eine andere SDK-Anfrage wird bereits bearbeitet."); return }
    let op = ChangersOperation(promise: promise); operation = op
    ChangersInstance.shared().fetchStatistic(delegate: op)
  }
}

// Jeder Delegate verwaltet ein Promise. Nach einem Timeout bleibt der Anfrageplatz bis zum SDK-Callback belegt, damit der globale SDK-Delegate während einer laufenden Anfrage nicht neu zugeordnet wird.
final class ChangersOperation: NSObject, ChangersAuthenticationDelegate, ChangersDelegate, ChangersStatisticDelegate {
  private var promise: Promise?
  private var timeout: DispatchWorkItem?
  init(promise: Promise) {
    self.promise = promise; super.init()
    let work = DispatchWorkItem { [weak self] in self?.fail("E_TIMEOUT") }
    timeout = work; DispatchQueue.main.asyncAfter(deadline: .now() + 30, execute: work)
  }
  private func finish(_ value: Any?) {
    if ChangersRuntime.shared.operation === self { ChangersRuntime.shared.operation = nil }
    guard let p = promise else { return }; promise = nil; timeout?.cancel()
    p.resolve(value)
  }
  func fail(_ code: String) {
    if code != "E_TIMEOUT", ChangersRuntime.shared.operation === self { ChangersRuntime.shared.operation = nil }
    guard let p = promise else { return }; promise = nil; timeout?.cancel()
    p.reject(code, "Die Changers-Anfrage konnte nicht abgeschlossen werden. Bitte Verbindung und Client-Berechtigungen prüfen.")
  }
  func didSetupUser(with _: String) { /* setupDidFinish bestätigt den Abschluss der gesamten Einrichtung. */ }
  func setupDidFinish() { DispatchQueue.main.async {
    if !ChangersRuntime.shared.enabled || !ChangersRuntime.shared.activated { ChangersInstance.shared().stopTracking() }
    self.finish(ChangersInstance.shared().userUUID)
  } }
  func setupDidFail(with error: ChangersAuthenticateError?) { DispatchQueue.main.async { self.fail(error == .connectionError ? "E_NETWORK" : "E_AUTHENTICATION") } }
  func statisticDidFail(with error: ChangersAuthenticateError?) { DispatchQueue.main.async { self.fail(error == .connectionError ? "E_NETWORK" : "E_PROVIDER") } }
  func statisticDidSuccess(with statistic: ChangersStatistic) {
    DispatchQueue.main.async { self.finish(["coins": statistic.user.coins, "walkingDistance": statistic.user.walkingDistance, "cyclingDistance": statistic.user.cyclingDistance, "co2Avoided": statistic.user.co2Avoided]) }
  }
}

public class ChangersAppDelegateSubscriber: ExpoAppDelegateSubscriber {
  public func application(_: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil) -> Bool {
    ChangersRuntime.shared.launchOptions = launchOptions
    // Wait for globalSettings before initializing, even after a previous activation.
    return true
  }
  public func application(_: UIApplication, handleEventsForBackgroundURLSession identifier: String, completionHandler: @escaping () -> Void) {
    guard ChangersRuntime.shared.enabled, ChangersRuntime.shared.initialized else { completionHandler(); return }
    ChangersTracking.sharedInstance.handleEvents(forBackgroundURLSession: identifier, completionHandler: completionHandler)
  }
}

// Forward interactive dismissal to the provider and the shared entry coordinator.
final class ChangersDismissalObserver: NSObject, UIAdaptivePresentationControllerDelegate {
  weak var original: UIAdaptivePresentationControllerDelegate?
  func presentationControllerShouldDismiss(_ controller: UIPresentationController) -> Bool {
    original?.presentationControllerShouldDismiss?(controller) ?? true
  }
  func presentationControllerWillDismiss(_ controller: UIPresentationController) {
    original?.presentationControllerWillDismiss?(controller)
  }
  func presentationControllerDidAttemptToDismiss(_ controller: UIPresentationController) {
    original?.presentationControllerDidAttemptToDismiss?(controller)
  }
  func presentationControllerDidDismiss(_ controller: UIPresentationController) {
    original?.presentationControllerDidDismiss?(controller)
    ChangersRuntime.shared.providerClosed()
  }
}

#endif
