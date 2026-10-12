package expo.modules.changers
import android.app.Application
import android.content.Context
import expo.modules.core.interfaces.Package
import expo.modules.core.interfaces.ApplicationLifecycleListener
class ChangersPackage : Package {
  override fun createApplicationLifecycleListeners(context: Context) = listOf(object : ApplicationLifecycleListener {
    override fun onCreate(application: Application) { ChangersRuntime.bootstrap(application) }
  })
}
class ChangersFileProvider : androidx.core.content.FileProvider()
