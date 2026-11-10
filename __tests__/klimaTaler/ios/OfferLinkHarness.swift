import Foundation

@main
struct OfferLinkHarness {
  static func main() {
    assert(changersOfferLink("10")?.absoluteString == "https://open.klima-taler.com/offers/10")
    assert(changersOfferLink("9007199254740991") != nil)
    for invalid in ["", "0", "-1", "01", "1.5", "1e2", " 10", "10\n", "١٠", "9007199254740992", "10?token=private", "https://example.org/offers/10"] {
      assert(changersOfferLink(invalid) == nil, "An invalid offer identifier was accepted")
    }
    // The real SDK returns false on the ordinary web-offer path. Both results
    // must leave the modal lifecycle to the caller rather than signal a failure.
    let target = changersOfferLink("10")!
    for sdkResult in [false, true] {
      var delivered: [URL] = []
      forwardChangersOffer(target) { url in
        delivered.append(url)
        return sdkResult
      }
      assert(delivered == [target], "The offer was not handed to the provider exactly once")
    }
    forwardChangersOffer(nil) { _ in
      assertionFailure("A normal dashboard entry must not hand over an offer")
      return false
    }
    print("Offer link validation and SDK handoff passed")
  }
}
