package expo.modules.changers

import org.junit.Assert.*
import org.junit.Test

class ChangersOfferLinkTest {
  @Test fun constructsOnlyThePublicOfferTarget() {
    assertEquals("https://open.klima-taler.com/offers/10", changersOfferLink("10"))
    assertNotNull(changersOfferLink("9007199254740991"))
  }

  @Test fun rejectsUntrustedOrImpreciseIdentifiers() {
    for (invalid in listOf("", "0", "-1", "01", "1.5", "1e2", " 10", "10\n", "١٠", "9007199254740992", "10?token=private", "https://example.org/offers/10")) {
      assertNull(changersOfferLink(invalid))
    }
  }
  @Test fun onlyTheConfirmedBadgePageIsAccepted() {
    assertEquals("https://open.klima-taler.com/badges", changersPageLink("badges"))
    for (invalid in listOf("", "app", "offers", "teams", "map", "Badges", "/badges", "badges?token=private", "https://open.klima-taler.com/badges")) {
      assertNull(changersPageLink(invalid))
    }
  }

}
