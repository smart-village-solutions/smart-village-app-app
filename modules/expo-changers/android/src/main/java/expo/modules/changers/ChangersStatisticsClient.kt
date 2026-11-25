package expo.modules.changers

import com.google.gson.JsonObject
import com.google.gson.JsonParser
import okhttp3.HttpUrl
import okhttp3.HttpUrl.Companion.toHttpUrl
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.IOException
import java.io.InterruptedIOException
import java.util.concurrent.TimeUnit

internal class StatisticsFailure(val code: String) : Exception(code)

/**
 * Read-only replacement for sdkstaging 1.20.6 readStatistics(), using its exact
 * endpoint/headers. That vendor method logs an authenticated cURL command and
 * may sign up a new identity on Forbidden. Neither path may run for a widget.
 */
internal class ChangersStatisticsClient(
  private val endpoint: HttpUrl = "https://activity.maroshi.de/api/statistics/sdk".toHttpUrl(),
  timeoutMillis: Long = 20_000
) {
  // Dedicated client: no SDK/Fuel or app logging interceptors, cookies or cache.
  // Never forward the SDK's custom identity headers to a redirect destination.
  private val client = OkHttpClient.Builder()
    .followRedirects(false).followSslRedirects(false)
    .retryOnConnectionFailure(false)
    .callTimeout(timeoutMillis, TimeUnit.MILLISECONDS)
    .connectTimeout(timeoutMillis, TimeUnit.MILLISECONDS)
    .readTimeout(timeoutMillis, TimeUnit.MILLISECONDS)
    .build()

  fun read(token: String, app: String, device: String, agent: String): Map<String, Double> {
    if (token.isBlank()) throw StatisticsFailure("E_AUTHENTICATION")
    try {
      val request = Request.Builder().url(endpoint)
        .header("Authorization", "Bearer $token")
        .header("x-app", app).header("x-device", device)
        .header("x-agent", agent).header("User-Agent", agent)
        .header("Accept", "application/json")
        .header("Content-Type", "application/json; utf-8")
        .build()
      return client.newCall(request).execute().use { response ->
        // Preserve the provider session on all failures. In particular, do not
        // invoke the vendor's recursive signup fallback on 401/403.
        if (response.code == 401 || response.code == 403) throw StatisticsFailure("E_AUTHENTICATION")
        if (!response.isSuccessful) throw StatisticsFailure("E_PROVIDER")
        val body = response.body ?: throw StatisticsFailure("E_PROVIDER")
        val source = body.source()
        source.request(1_048_577)
        if (source.buffer.size > 1_048_576) throw StatisticsFailure("E_PROVIDER")
        parse(body.string())
      }
    } catch (error: StatisticsFailure) {
      throw error
    } catch (_: InterruptedIOException) {
      throw StatisticsFailure("E_TIMEOUT")
    } catch (_: IOException) {
      throw StatisticsFailure("E_NETWORK")
    } catch (_: Exception) {
      // Never expose a request, response, token or exception cause to JS/logs.
      throw StatisticsFailure("E_PROVIDER")
    }
  }

  private fun parse(body: String): Map<String, Double> {
    val root = JsonParser.parseString(body)
    if (!root.isJsonObject) throw StatisticsFailure("E_PROVIDER")
    val user = root.asJsonObject.get("user")
    if (user == null || !user.isJsonObject) throw StatisticsFailure("E_PROVIDER")
    // SDK OrganisationStatistics.recoins is the user's current balance;
    // recoins_earned is cumulative and must not be used for the widget.
    val coins = number(user.asJsonObject, "recoins") ?: throw StatisticsFailure("E_PROVIDER")
    return mutableMapOf("coins" to coins).apply {
      number(user.asJsonObject, "walking")?.let { put("walkingDistance", it) }
      number(user.asJsonObject, "cycling")?.let { put("cyclingDistance", it) }
      number(user.asJsonObject, "co2_avoided")?.let { put("co2Avoided", it) }
    }
  }

  private fun number(user: JsonObject, key: String): Double? {
    val value = user.get(key) ?: return null
    if (!value.isJsonPrimitive || !value.asJsonPrimitive.isNumber) return null
    return value.asDouble.takeIf { it.isFinite() }
  }
}
