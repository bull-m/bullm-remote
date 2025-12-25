package cn.bullm.car

import android.annotation.SuppressLint
import android.os.Bundle
import androidx.activity.enableEdgeToEdge
import android.webkit.WebView
import android.webkit.JavascriptInterface
import android.content.Context

class MainActivity : TauriActivity() {
  private lateinit var wv: WebView

  companion object {
    private const val PREFS_NAME = "WebViewSettings"
    private const val KEY_SCALE = "scale"
  }

  // JavaScript接口类
  inner class WebViewInterface {
    @JavascriptInterface
    fun setScale(scale: Int) {
      // 持久化存储到SharedPreferences
      getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).edit().apply {
        putInt(KEY_SCALE, scale)
        apply()
      }
      wv.post {
        wv.setInitialScale(scale)
      }
    }

    @JavascriptInterface
    fun getScale(): Int {
      return getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        .getInt(KEY_SCALE, 0) // 返回当前保存的scale值
    }

    @JavascriptInterface
    fun reload() {
      wv.post {
        wv.reload() // 重新加载页面
      }
    }
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)
  }

  @SuppressLint("WebViewApiAvailability")
  override fun onWebViewCreate(webView: WebView) {
    wv = webView

    // 从SharedPreferences读取保存的scale值，0表示未设置过
    val currentScale = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      .getInt(KEY_SCALE, 0)

    // 添加JavaScript接口
    wv.addJavascriptInterface(WebViewInterface(), "AndroidWebView")

    wv.settings.apply {
      setSupportZoom(false) // 禁用缩放功能
      builtInZoomControls = false // 禁用缩放控件
      displayZoomControls = false // 隐藏缩放按钮
      useWideViewPort = false // viewport支持
      loadWithOverviewMode = false // 禁用overview模式
    }

    // 只有当保存过scale值时才应用
    if (currentScale > 0) {
      wv.setInitialScale(currentScale)
    }
  }
}
