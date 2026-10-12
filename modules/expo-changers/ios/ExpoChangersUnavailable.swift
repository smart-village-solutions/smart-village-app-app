#if targetEnvironment(simulator) && arch(arm64)
import ExpoModulesCore

// The vendor ships no arm64 simulator binary. Never fabricate a provider session.
public class ExpoChangersModule: Module {
  private func unavailable(_ promise: Promise) {
    promise.reject("E_SIMULATOR_UNSUPPORTED", "Klima-Taler benötigt auf diesem Mac ein echtes iPhone.")
  }
  public func definition() -> ModuleDefinition {
    Name("ExpoChangers")
    Events("onProviderClosed")
    AsyncFunction("setEnabled") { (enabled: Bool, p: Promise) in
      if enabled { self.unavailable(p) } else { p.resolve(nil) }
    }
    AsyncFunction("getStatus") { (p: Promise) in self.unavailable(p) }
    AsyncFunction("activate") { (p: Promise) in self.unavailable(p) }
    AsyncFunction("getUserUUID") { (p: Promise) in self.unavailable(p) }
    AsyncFunction("openProvider") { (p: Promise) in self.unavailable(p) }
    AsyncFunction("closeProvider") { }
    AsyncFunction("registerUser") { (p: Promise) in self.unavailable(p) }
    AsyncFunction("loginUser") { (_: String, p: Promise) in self.unavailable(p) }
    AsyncFunction("fetchStatistics") { (p: Promise) in self.unavailable(p) }
    AsyncFunction("stopTracking") { (p: Promise) in self.unavailable(p) }
    AsyncFunction("logout") { (p: Promise) in self.unavailable(p) }
    AsyncFunction("openTarget") { (_: String, p: Promise) in self.unavailable(p) }
  }
}

public class ChangersAppDelegateSubscriber: ExpoAppDelegateSubscriber { }
#endif
