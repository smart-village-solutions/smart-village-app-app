import Foundation

private func providerLink(_ path: String...) -> URL? {
  var origin = URLComponents()
  origin.scheme = "https"
  origin.host = "open.klima-taler.com"
  return path.reduce(origin.url) { url, component in url?.appendingPathComponent(component) }
}

// Only validated offer IDs and fixed page names cross the bridge; no arbitrary URLs.
func changersOfferLink(_ offerId: String) -> URL? {
  guard !offerId.isEmpty, offerId.count <= 16, !offerId.hasPrefix("0"),
        offerId.utf8.allSatisfy({ $0 >= 48 && $0 <= 57 }),
        let value = UInt64(offerId), value <= 9_007_199_254_740_991 else { return nil }
  return providerLink("offers", offerId)
}

func changersPageLink(_ target: String) -> URL? {
  guard target == "badges" else { return nil }
  return providerLink("badges")
}

func forwardChangersLink(_ url: URL?, handle: (URL) -> Bool) {
  guard let url else { return }
  // Changers 4.3.0 returns false for links handed to its web app as well.
  // The Bool is not a delivery result and must not reject or dismiss our modal.
  _ = handle(url)
}
