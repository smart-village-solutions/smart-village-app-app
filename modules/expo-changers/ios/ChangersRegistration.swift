import Foundation

// Activation only allows SDK initialization. It is not evidence of an account.
// Persist before calling the vendor: a lost response must never trigger another signup.
final class ChangersRegistration {
  enum State: String { case notStarted, uncertain, existing }
  enum Attempt { case ready, offline, uncertain }
  private let defaults: UserDefaults
  private let key = "expo.changers.registration.v1"

  init(defaults: UserDefaults = .standard) { self.defaults = defaults }

  func state(activated: Bool, hasIdentity: Bool) -> State {
    if hasIdentity {
      defaults.set(State.existing.rawValue, forKey: key)
      return .existing
    }
    if let saved = defaults.string(forKey: key) {
      return State(rawValue: saved) ?? .uncertain
    }
    // An older activated installation may already have sent a signup request.
    return activated ? .uncertain : .notStarted
  }

  func prepareActivation(wasActivated: Bool, hasIdentity: Bool) {
    let current = state(activated: wasActivated, hasIdentity: hasIdentity)
    defaults.set(current.rawValue, forKey: key)
  }

  func begin(activated: Bool, hasIdentity: Bool, networkAvailable: Bool?) -> Attempt {
    guard state(activated: activated, hasIdentity: hasIdentity) == .notStarted else { return .uncertain }
    // A known offline path is a definite failure before dispatch, safe to retry.
    guard networkAvailable != false else { return .offline }
    defaults.set(State.uncertain.rawValue, forKey: key)
    // Flush the attempt marker before the external side effect, including on restart.
    return defaults.synchronize() ? .ready : .uncertain
  }
}
