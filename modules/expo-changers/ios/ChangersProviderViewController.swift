import UIKit

// Overlay only the dismissal control; preserve the provider's full sheet area.
final class ChangersProviderViewController: UIViewController {
  private let provider: UIViewController
  var onClose: (() -> Void)?
  var onDismiss: (() -> Void)?

  init(provider: UIViewController) {
    self.provider = provider
    super.init(nibName: nil, bundle: nil)
    modalPresentationStyle = provider.modalPresentationStyle
    modalTransitionStyle = provider.modalTransitionStyle
    isModalInPresentation = provider.isModalInPresentation
  }

  required init?(coder: NSCoder) { fatalError("init(coder:) has not been implemented") }

  override func viewDidLoad() {
    super.viewDidLoad()
    view.backgroundColor = .systemBackground

    let close = UIButton(type: .system)
    close.setImage(UIImage(systemName: "xmark", withConfiguration: UIImage.SymbolConfiguration(pointSize: 20, weight: .semibold)), for: .normal)
    close.tintColor = .white
    close.layer.shadowColor = UIColor.black.cgColor
    close.layer.shadowOpacity = 0.6
    close.layer.shadowRadius = 2
    close.layer.shadowOffset = CGSize(width: 0, height: 1)
    close.accessibilityLabel = "Klima-Taler schließen"
    close.accessibilityIdentifier = "klimaTaler.close"
    close.addTarget(self, action: #selector(closePressed), for: .touchUpInside)

    addChild(provider)
    view.addSubview(provider.view)
    view.addSubview(close)
    for item in [close, provider.view!] {
      item.translatesAutoresizingMaskIntoConstraints = false
    }
    NSLayoutConstraint.activate([
      close.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 8),
      close.trailingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.trailingAnchor, constant: -8),
      close.widthAnchor.constraint(equalToConstant: 44),
      close.heightAnchor.constraint(equalToConstant: 44),
      provider.view.topAnchor.constraint(equalTo: view.topAnchor),
      provider.view.leadingAnchor.constraint(equalTo: view.leadingAnchor),
      provider.view.trailingAnchor.constraint(equalTo: view.trailingAnchor),
      provider.view.bottomAnchor.constraint(equalTo: view.bottomAnchor)
    ])
    provider.didMove(toParent: self)
  }

  @objc private func closePressed() { onClose?() }

  override func viewDidDisappear(_ animated: Bool) {
    super.viewDidDisappear(animated)
    // A provider-owned full-screen child is not a dismissal of this sheet.
    if isBeingDismissed || presentingViewController == nil {
      let notify = onDismiss
      onDismiss = nil
      notify?()
    }
  }
}
