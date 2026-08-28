import ExpoModulesCore
import UIKit

public final class GrayscaleCompositorModule: Module {
  private weak var overlayView: UIView?

  public func definition() -> ModuleDefinition {
    Name("GrayscaleCompositor")

    AsyncFunction("setEnabled") { (isEnabled: Bool) in
      self.setEnabled(isEnabled)
    }
    .runOnQueue(.main)
  }

  private func setEnabled(_ isEnabled: Bool) {
    guard isEnabled else {
      overlayView?.removeFromSuperview()
      overlayView = nil
      return
    }

    guard let window = activeWindow else {
      return
    }

    if let overlayView {
      if overlayView.superview !== window {
        overlayView.removeFromSuperview()
        attach(overlayView, to: window)
      }
      window.bringSubviewToFront(overlayView)
      return
    }

    let overlayView = UIView(frame: window.bounds)
    overlayView.translatesAutoresizingMaskIntoConstraints = false
    overlayView.isUserInteractionEnabled = false
    overlayView.isAccessibilityElement = false
    overlayView.accessibilityElementsHidden = true
    overlayView.backgroundColor = UIColor(white: 0.5, alpha: 1.0)
    overlayView.layer.compositingFilter = "saturationBlendMode"
    overlayView.layer.zPosition = 10_000

    attach(overlayView, to: window)
    self.overlayView = overlayView
  }

  private func attach(_ overlayView: UIView, to window: UIWindow) {
    window.addSubview(overlayView)
    NSLayoutConstraint.activate([
      overlayView.leadingAnchor.constraint(equalTo: window.leadingAnchor),
      overlayView.trailingAnchor.constraint(equalTo: window.trailingAnchor),
      overlayView.topAnchor.constraint(equalTo: window.topAnchor),
      overlayView.bottomAnchor.constraint(equalTo: window.bottomAnchor)
    ])
  }

  private var activeWindow: UIWindow? {
    UIApplication.shared.connectedScenes
      .compactMap { $0 as? UIWindowScene }
      .flatMap(\.windows)
      .first(where: \.isKeyWindow)
  }
}
