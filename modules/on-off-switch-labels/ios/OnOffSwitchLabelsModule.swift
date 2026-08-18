import ExpoModulesCore
import UIKit

private let onOffSwitchLabelsChangedEvent = "onOffSwitchLabelsChanged"

public final class OnOffSwitchLabelsModule: Module {
  public func definition() -> ModuleDefinition {
    Name("OnOffSwitchLabels")

    Events(onOffSwitchLabelsChangedEvent)

    AsyncFunction("isEnabled") {
      return UIAccessibility.isOnOffSwitchLabelsEnabled
    }
    .runOnQueue(.main)

    OnStartObserving(onOffSwitchLabelsChangedEvent) {
      NotificationCenter.default.addObserver(
        self,
        selector: #selector(self.onOffSwitchLabelsDidChange),
        name: UIAccessibility.onOffSwitchLabelsDidChangeNotification,
        object: nil
      )
      NotificationCenter.default.addObserver(
        self,
        selector: #selector(self.onOffSwitchLabelsDidChange),
        name: UIApplication.didBecomeActiveNotification,
        object: nil
      )
    }

    OnStopObserving(onOffSwitchLabelsChangedEvent) {
      NotificationCenter.default.removeObserver(
        self,
        name: UIAccessibility.onOffSwitchLabelsDidChangeNotification,
        object: nil
      )
      NotificationCenter.default.removeObserver(
        self,
        name: UIApplication.didBecomeActiveNotification,
        object: nil
      )
    }
  }

  @objc
  private func onOffSwitchLabelsDidChange() {
    sendEvent(onOffSwitchLabelsChangedEvent, [
      "isEnabled": UIAccessibility.isOnOffSwitchLabelsEnabled
    ])
  }
}
