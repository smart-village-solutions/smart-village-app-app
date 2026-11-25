package expo.modules.changers

// Use the same safe integer range as JavaScript; no arbitrary URLs enter the SDK.
internal fun changersOfferLink(offerId: String): String? {
  if (!Regex("^[1-9][0-9]{0,15}$").matches(offerId)) return null
  val value = offerId.toLongOrNull() ?: return null
  if (value > 9_007_199_254_740_991L) return null
  return "https://open.klima-taler.com/offers/$offerId"
}

// Page names are resolved locally, never treated as user-supplied URLs.
internal fun changersPageLink(target: String): String? =
  if (target == "badges") "https://open.klima-taler.com/badges" else null
