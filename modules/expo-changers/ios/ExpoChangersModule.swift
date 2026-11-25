#if !targetEnvironment(simulator) || !arch(arm64)
import ExpoModulesCore
import ChangersSDK
import UIKit

public class ExpoChangersModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoChangers")
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
    AsyncFunction("openTarget") { (target: String, p: Promise) in
      guard target == "marketplace" else { p.reject("E_UNSUPPORTED", "Nur das Ziel Marktplatz ist bestätigt."); return }
      self.openProvider(.marketplace, promise: p)
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
  private func openProvider(_ page: ChangersPageEnum, promise: Promise) {
    let runtime = ChangersRuntime.shared
    guard runtime.requireReady(promise) else { return }
    guard ChangersInstance.shared().isLoggedIn else { promise.reject("E_AUTHENTICATION", "Bitte zuerst ein Konto erstellen oder anmelden."); return }
    if runtime.opening || runtime.controller?.presentingViewController != nil { promise.resolve(nil); return }
    guard let presenter = appContext?.utilities?.currentViewController() else { promise.reject("E_NO_ACTIVITY", "Keine aktive Ansicht gefunden."); return }
    guard presenter.presentedViewController == nil else { promise.reject("E_BUSY", "Eine andere Ansicht ist bereits geöffnet."); return }
    runtime.opening = true
    weak var presentedController: UIViewController?
    let provider = ChangersInstance.shared().webApp(at: page, with: {
      guard let current = presentedController, runtime.controller === current else { return }
      runtime.closeProvider()
    })
    let controller = ChangersProviderViewController(provider: provider)
    presentedController = controller
    controller.onClose = { [weak controller] in
      guard let controller, runtime.controller === controller else { return }
      runtime.closeProvider()
    }
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
      }
      promise.resolve(nil)
    }
  }
}

#endif
