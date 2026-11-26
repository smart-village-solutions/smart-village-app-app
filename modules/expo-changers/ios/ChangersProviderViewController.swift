import UIKit

// Keep presentation/lifecycle ownership in the host while the SDK owns all UI.
final class ChangersProviderViewController: UIViewController {
  private let provider: UIViewController
  var onDismiss: (() -> Void)?

  init(provider: UIViewController) {
    self.provider = provider
    super.init(nibName: nil, bundle: nil)
    modalPresentationStyle = .fullScreen
    modalTransitionStyle = provider.modalTransitionStyle
    isModalInPresentation = provider.isModalInPresentation
  }

  required init?(coder _: NSCoder) { fatalError("init(coder:) has not been implemented") }

  override var childForStatusBarStyle: UIViewController? { provider }
  override var childForStatusBarHidden: UIViewController? { provider }

  override func viewDidLoad() {
    super.viewDidLoad()
    view.backgroundColor = .systemBackground

    addChild(provider)
    view.addSubview(provider.view)
    provider.view.translatesAutoresizingMaskIntoConstraints = false
    NSLayoutConstraint.activate([
      provider.view.topAnchor.constraint(equalTo: view.topAnchor),
      provider.view.leadingAnchor.constraint(equalTo: view.leadingAnchor),
      provider.view.trailingAnchor.constraint(equalTo: view.trailingAnchor),
      provider.view.bottomAnchor.constraint(equalTo: view.bottomAnchor)
    ])
    provider.didMove(toParent: self)
  }

  override func viewDidDisappear(_ animated: Bool) {
    super.viewDidDisappear(animated)
    // A provider-owned full-screen child is not a dismissal of this container.
    if isBeingDismissed || presentingViewController == nil {
      let notify = onDismiss
      onDismiss = nil
      notify?()
    }
  }
}
