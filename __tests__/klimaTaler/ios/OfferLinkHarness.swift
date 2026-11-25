import Foundation

@main
struct OfferLinkHarness {
  static func main() {
    let offer = changersOfferLink("10")!
    assert(offer.scheme == "https" && offer.host == "open.klima-taler.com")
    assert(offer.pathComponents == ["/", "offers", "10"])
    assert(changersOfferLink("9007199254740991") != nil)
    for invalid in ["", "0", "-1", "01", "1.5", "1e2", " 10", "10\n", "١٠", "9007199254740992", "10?token=private", offer.absoluteString] {
      assert(changersOfferLink(invalid) == nil, "An invalid offer identifier was accepted")
    }
    // The real SDK returns false on the ordinary web-offer path. Both results
    // must leave the modal lifecycle to the caller rather than signal a failure.
    let badges = changersPageLink("badges")!
    assert(badges.scheme == offer.scheme && badges.host == offer.host)
    assert(badges.pathComponents == ["/", "badges"])
    for invalid in ["", "app", "map", "teams", "offers", "Badges", ["", "badges"].joined(separator: "/"), "badges?token=private", badges.absoluteString] {
      assert(changersPageLink(invalid) == nil)
    }
    for target in [changersOfferLink("10")!, changersPageLink("badges")!] {
      for sdkResult in [false, true] {
        var delivered: [URL] = []
        forwardChangersLink(target) { url in
          delivered.append(url)
          return sdkResult
        }
        assert(delivered == [target], "The target was not handed to the provider exactly once")
      }
    }
    forwardChangersLink(nil) { _ in
      assertionFailure("A normal dashboard entry must not hand over an offer")
      return false
    }
    print("Offer/page link validation and SDK handoff passed")
  }
}
