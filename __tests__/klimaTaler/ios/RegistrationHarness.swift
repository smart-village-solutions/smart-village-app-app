import Foundation

@main
struct RegistrationHarness {
  static func main() {
    let name = "ChangersRegistrationTests.\(UUID().uuidString)"
    let defaults = UserDefaults(suiteName: name)!
    defer { defaults.removePersistentDomain(forName: name) }
    func reset() { defaults.removePersistentDomain(forName: name) }
    var registration = ChangersRegistration(defaults: defaults)
    // First explicit activation, definite offline failure, then process restart and retry.
    registration.prepareActivation(wasActivated: false, hasIdentity: false)
    assert(registration.begin(activated: true, hasIdentity: false, networkAvailable: false) == .offline)
    registration = ChangersRegistration(defaults: UserDefaults(suiteName: name)!)
    assert(registration.state(activated: true, hasIdentity: false) == .notStarted)
    assert(registration.begin(activated: true, hasIdentity: false, networkAvailable: true) == .ready)
    // Repeated taps, connection loss, timeout, and process restart cannot dispatch a second signup.
    assert(registration.begin(activated: true, hasIdentity: false, networkAvailable: true) == .uncertain)
    registration = ChangersRegistration(defaults: UserDefaults(suiteName: name)!)
    assert(registration.begin(activated: true, hasIdentity: false, networkAvailable: true) == .uncertain)
    assert(registration.state(activated: true, hasIdentity: true) == .existing)
    // Logout, stopTracking or deletion must not make signup eligible again.
    registration.prepareActivation(wasActivated: false, hasIdentity: false)
    assert(registration.begin(activated: true, hasIdentity: false, networkAvailable: true) == .uncertain)
    reset()
    // Upgrade from an activated binary: absence of UUID is not proof that signup never happened.
    registration.prepareActivation(wasActivated: true, hasIdentity: false)
    assert(registration.state(activated: true, hasIdentity: false) == .uncertain)
    reset()
    defaults.set("invalid", forKey: "expo.changers.registration.v1")
    assert(registration.state(activated: false, hasIdentity: false) == .uncertain)
    reset()
    // Cancellation/crash after activation but before dispatch remains retryable.
    registration.prepareActivation(wasActivated: false, hasIdentity: false)
    registration = ChangersRegistration(defaults: UserDefaults(suiteName: name)!)
    assert(registration.begin(activated: true, hasIdentity: false, networkAvailable: nil) == .ready)
    print("Registration recovery: 10 assertions passed")
  }
}
