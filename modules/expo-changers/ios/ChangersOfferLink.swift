import Foundation

// Only public offer IDs cross the bridge; never accept arbitrary URLs or credentials.
func changersOfferLink(_ offerId: String) -> URL? {
  guard !offerId.isEmpty, offerId.count <= 16, !offerId.hasPrefix("0"),
        offerId.utf8.allSatisfy({ $0 >= 48 && $0 <= 57 }),
        let value = UInt64(offerId), value <= 9_007_199_254_740_991 else { return nil }
  return URL(string: "https://open.klima-taler.com/offers/\(offerId)")
}

func forwardChangersOffer(_ url: URL?, handle: (URL) -> Bool) {
  guard let url else { return }
  // Changers 4.3.0 returns false for links handed to its web app as well.
  // The Bool is not a delivery result and must not reject or dismiss our modal.
  _ = handle(url)
}
