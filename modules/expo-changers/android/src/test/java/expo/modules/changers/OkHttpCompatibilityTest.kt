package expo.modules.changers

import java.net.CookieHandler
import java.net.URI
import okhttp3.HttpUrl.Companion.toHttpUrl
import okhttp3.JavaNetCookieJar
import org.junit.Assert.assertEquals
import org.junit.Test

class OkHttpCompatibilityTest {
  @Test
  fun cookieAdapterCanLoadCookiesWithTheResolvedHttpClient() {
    // React Native uses this adapter. Mixing its 4.x version with MotionTag's
    // OkHttp 5.x crashes here with NoClassDefFoundError: okhttp3.internal.Util.
    val handler = object : CookieHandler() {
      override fun get(uri: URI, requestHeaders: Map<String, List<String>>) =
        mapOf("Cookie" to listOf("sva_test=fixture"))

      override fun put(uri: URI, responseHeaders: Map<String, List<String>>) = Unit
    }
    val cookies = JavaNetCookieJar(handler).loadForRequest("https://example.invalid/".toHttpUrl())

    assertEquals(1, cookies.size)
    assertEquals("sva_test", cookies.single().name)
    assertEquals("fixture", cookies.single().value)
  }
}
