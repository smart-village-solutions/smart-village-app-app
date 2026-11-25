package expo.modules.changers

import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import okhttp3.mockwebserver.SocketPolicy
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import java.util.concurrent.TimeUnit

class ChangersStatisticsClientTest {
  private val server = MockWebServer()

  @Before fun start() = server.start()
  @After fun stop() = server.shutdown()

  private fun client(timeout: Long = 2000) = ChangersStatisticsClient(server.url("/api/statistics/sdk"), timeout)
  private fun read(client: ChangersStatisticsClient = client()) = client.read("fixture-token", "fixture-app", "fixture-device", "fixture-agent")

  private fun failure(code: String, action: () -> Unit) {
    try {
      action()
      fail("Expected a sanitized failure")
    } catch (error: StatisticsFailure) {
      assertEquals(code, error.code)
      assertEquals(code, error.message)
      assertNull(error.cause)
    }
  }

  @Test fun `balance requests use the selected native environment`() {
    assertEquals("https://activity.changers.com/api/statistics/sdk", statisticsEndpoint("production").toString())
    assertEquals("https://activity.maroshi.de/api/statistics/sdk", statisticsEndpoint("stage").toString())
    assertEquals(statisticsEndpoint(BuildConfig.CHANGERS_ENVIRONMENT), ChangersStatisticsClient().endpoint)
    try {
      statisticsEndpoint("prod")
      fail("Invalid environments must not send credentials")
    } catch (error: IllegalArgumentException) {
      assertEquals("E_CONFIGURATION", error.message)
    }
  }

  @Test fun `reads current user balance including true zero without using cumulative or organisation totals`() {
    for (balance in listOf(0.0, 12.5)) {
      server.enqueue(MockResponse().setBody("""{"organisation":{"recoins":999},"user":{"recoins":$balance,"recoins_earned":888,"walking":2,"cycling":3,"co2_avoided":4}}"""))
      assertEquals(mapOf("coins" to balance, "walkingDistance" to 2.0, "cyclingDistance" to 3.0, "co2Avoided" to 4.0), read())
      val request = server.takeRequest(1, TimeUnit.SECONDS)!!
      assertEquals("GET", request.method)
      assertEquals("/api/statistics/sdk", request.path)
      assertEquals("Bearer fixture-token", request.getHeader("Authorization"))
      assertEquals("fixture-app", request.getHeader("x-app"))
      assertEquals("fixture-device", request.getHeader("x-device"))
      assertEquals("fixture-agent", request.getHeader("x-agent"))
      assertEquals("fixture-agent", request.getHeader("User-Agent"))
      assertEquals(0L, request.bodySize)
    }
  }

  @Test fun `missing malformed and nonfinite balances never become zero`() {
    for (body in listOf("{}", "null", "[]", "not JSON", """{"user":null}""", """{"user":{"recoins":null}}""", """{"user":{"recoins":"0"}}""", """{"user":{"recoins":true}}""", """{"user":{"recoins":1e999}}""")) {
      server.enqueue(MockResponse().setBody(body))
      failure("E_PROVIDER") { read() }
    }
    server.enqueue(MockResponse().setBody("""{"user":{"recoins":0}}"""))
    assertEquals(mapOf("coins" to 0.0), read())
  }

  @Test fun `HTTP errors expose no body or request and never retry signup`() {
    for (status in listOf(401, 403, 500)) {
      server.enqueue(MockResponse().setResponseCode(status).setBody("Forbidden token=fixture-token client_secret=fixture-secret"))
      failure(if (status == 500) "E_PROVIDER" else "E_AUTHENTICATION") { read() }
    }
    assertEquals(3, server.requestCount)
  }

  @Test fun `redirects cannot forward credentials or device identity`() {
    val destination = MockWebServer()
    destination.start()
    try {
      destination.enqueue(MockResponse().setBody("{}"))
      server.enqueue(MockResponse().setResponseCode(302).setHeader("Location", destination.url("/capture")))
      failure("E_PROVIDER") { read() }
      assertEquals(0, destination.requestCount)
    } finally { destination.shutdown() }
  }

  @Test fun `timeouts and missing sessions fail without leaking or inventing data`() {
    server.enqueue(MockResponse().setSocketPolicy(SocketPolicy.NO_RESPONSE))
    failure("E_TIMEOUT") { read(client(150)) }
    failure("E_AUTHENTICATION") { client().read("", "fixture-app", "fixture-device", "fixture-agent") }
    assertEquals(1, server.requestCount)
  }

  @Test fun `response size is bounded`() {
    server.enqueue(MockResponse().setBody(" ".repeat(1_048_577)))
    failure("E_PROVIDER") { read() }
  }
}
