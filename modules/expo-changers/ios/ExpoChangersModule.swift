import ExpoModulesCore
import ChangersSDK
import UIKit

public class ExpoChangersModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoChangers")
    Constants(["badgeLinks": true])
    Events("onProviderClosed")
    OnCreate { [weak self] in
      ChangersRuntime.shared.onProviderClosed = { [weak self] in self?.sendEvent("onProviderClosed", [:]) }
    }
    OnDestroy { ChangersRuntime.shared.onProviderClosed = nil }
    AsyncFunction("getStatus") { ChangersRuntime.shared.status() }.runOnQueue(.main)
    AsyncFunction("setEnabled") { (enabled: Bool) in ChangersRuntime.shared.setEnabled(enabled) }.runOnQueue(.main)
    AsyncFunction("activate") { (p: Promise) in ChangersRuntime.shared.accept(p) }.runOnQueue(.main)
    AsyncFunction("getUserUUID") { (p: Promise) in
      guard ChangersRuntime.shared.requireReady(p) else { return }
      p.resolve(ChangersInstance.shared().userUUID)
    }.runOnQueue(.main)
    AsyncFunction("openProvider") { (p: Promise) in self.openProvider(.main, promise: p) }.runOnQueue(.main)
    AsyncFunction("openOffer") { (offerId: String, p: Promise) in
      guard let url = changersOfferLink(offerId) else { p.reject("E_INVALID_ARGUMENT", "Ungültiges Angebot."); return }
      self.openProvider(.main, promise: p, targetURL: url)
    }.runOnQueue(.main)
    AsyncFunction("openTarget") { (target: String, p: Promise) in
      if target == "marketplace" {
        self.openProvider(.marketplace, promise: p)
      } else if let url = changersPageLink(target) {
        self.openProvider(.main, promise: p, targetURL: url)
      } else {
        p.reject("E_UNSUPPORTED", "Dieses Ziel wird nicht unterstützt.")
      }
    }.runOnQueue(.main)
    AsyncFunction("closeProvider") { ChangersRuntime.shared.closeProvider() }.runOnQueue(.main)
    AsyncFunction("registerUser") { (p: Promise) in ChangersRuntime.shared.authenticate(nil, promise: p) }.runOnQueue(.main)
    AsyncFunction("loginUser") { (uuid: String, p: Promise) in ChangersRuntime.shared.authenticate(uuid, promise: p) }.runOnQueue(.main)
    AsyncFunction("fetchStatistics") { (p: Promise) in ChangersRuntime.shared.statistics(p) }.runOnQueue(.main)
    AsyncFunction("stopTracking") { ChangersRuntime.shared.stop() }.runOnQueue(.main)
    AsyncFunction("logout") { (p: Promise) in
      let runtime = ChangersRuntime.shared
      guard runtime.operation == nil else { p.reject("E_BUSY", "Die vorherige SDK-Anfrage wird noch bearbeitet."); return }
      runtime.controller?.dismiss(animated: true); runtime.controller = nil
      runtime.stop()
      if runtime.initialized { ChangersInstance.shared().logoutUser() }
      p.resolve(nil)
    }.runOnQueue(.main)
  }
  private func routeLink(_ url: URL?) {
    forwardChangersLink(url) { ChangersInstance.shared().handleDeepLink($0) }
  }
  private func openProvider(_ page: ChangersPageEnum, promise: Promise, targetURL: URL? = nil) {
    let runtime = ChangersRuntime.shared
    guard runtime.requireReady(promise) else { return }
    guard ChangersInstance.shared().isLoggedIn else { promise.reject("E_AUTHENTICATION", "Bitte zuerst ein Konto erstellen oder anmelden."); return }
    if runtime.opening {
      if targetURL != nil { promise.reject("E_BUSY", "Die Anbieteroberfläche wird bereits geöffnet.") }
      else { promise.resolve(nil) }
      return
    }
    if runtime.controller?.presentingViewController != nil {
      routeLink(targetURL)
      promise.resolve(nil)
      return
    }
    guard let presenter = appContext?.utilities?.currentViewController() else { promise.reject("E_NO_ACTIVITY", "Keine aktive Ansicht gefunden."); return }
    guard presenter.presentedViewController == nil else { promise.reject("E_BUSY", "Eine andere Ansicht ist bereits geöffnet."); return }
    runtime.opening = true
    weak var presentedController: UIViewController?
    // Changers 4.3.0 keeps readiness on its singleton after the previous view closes.
    // A fresh web app must queue links until its own readiness callback arrives.
    ChangersInstance.shared().isWebAppReadyForDeepLinks = false
    let provider = ChangersInstance.shared().webApp(at: page, with: {
      guard let current = presentedController, runtime.controller === current else { return }
      runtime.closeProvider()
    })
    let controller = ChangersProviderViewController(provider: provider)
    presentedController = controller
    controller.onDismiss = { [weak controller] in
      guard let controller, runtime.controller === controller else { return }
      runtime.providerClosed()
    }
    runtime.controller = controller
    let observer = ChangersDismissalObserver()
    observer.original = provider.presentationController?.delegate
    runtime.dismissalObserver = observer
    controller.presentationController?.delegate = observer
    presenter.present(controller, animated: true) {
      if !runtime.enabled {
        controller.dismiss(animated: false)
        if runtime.controller === controller { runtime.providerClosed() }
      } else if runtime.controller === controller {
        runtime.opening = false
        // Let the SDK defer the target until its web app/onboarding is ready.
        // Only hand it over after our own presentation has succeeded.
        self.routeLink(targetURL)
      }
      promise.resolve(nil)
    }
  }
}
