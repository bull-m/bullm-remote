package cn.bullm.car

import android.annotation.SuppressLint
import android.os.Bundle
import androidx.activity.enableEdgeToEdge
import android.webkit.WebView
import android.webkit.JavascriptInterface
import android.content.Context
import android.webkit.WebSettings
import androidx.activity.OnBackPressedCallback

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

    onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
      override fun handleOnBackPressed() {
        wv.evaluateJavascript("javascript:androidBackCallback()") { result ->
          if (result == "\"exit\"") {
            wv.destroy()
            finish()
            finishAffinity()
          } 
        }
      }
    });
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
      // 禁用缓存（可选，避免后台缓存占用）
      cacheMode = WebSettings.LOAD_NO_CACHE
      // 允许后台加载资源
      loadsImagesAutomatically = true
      // 禁用自动暂停 JS（关键：避免后台暂停定时器）
      setMediaPlaybackRequiresUserGesture(false)
      // 开启 DOM 存储（保存页面状态）
      domStorageEnabled = true
    }

    // 只有当保存过scale值时才应用
    if (currentScale > 0) {
      wv.setInitialScale(currentScale)
    }
  }

}
