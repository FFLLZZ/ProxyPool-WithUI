import { ref, computed, watch } from 'vue'

export type ThemeMode = 'light' | 'dark'

export const useTheme = () => {
  // 主题状态
  const themeMode = ref<ThemeMode>('light')
  const isDark = ref(false)

  // 从本地存储加载主题设置
  const loadTheme = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme-mode')
      if (saved && ['light', 'dark'].includes(saved)) {
        themeMode.value = saved as ThemeMode
      } else {
        // 默认为浅色模式
        themeMode.value = 'light'
      }
      updateTheme()
    }
  }

  // 更新主题
  const updateTheme = () => {
    if (typeof window !== 'undefined') {
      const shouldBeDark = themeMode.value === 'dark'
      isDark.value = shouldBeDark
      
      // 更新 HTML 类名
      const html = document.documentElement
      if (shouldBeDark) {
        html.classList.add('dark')
        html.classList.remove('light')
      } else {
        html.classList.add('light')
        html.classList.remove('dark')
      }
      
      // 更新 Ant Design 主题
      updateAntdTheme(shouldBeDark)
    }
  }

  // 更新 Ant Design 主题
  const updateAntdTheme = (dark: boolean) => {
    if (typeof window !== 'undefined') {
      const configProvider = document.querySelector('.ant-config-provider')
      if (configProvider) {
        configProvider.setAttribute('data-theme', dark ? 'dark' : 'light')
      }
      
      // 强制更新 Ant Design 的 CSS 变量
      const root = document.documentElement
      if (dark) {
        root.style.setProperty('--ant-layout-bg', '#1a1a1a')
        root.style.setProperty('--ant-layout-sider-bg', '#2d2d2d')
        root.style.setProperty('--ant-layout-header-bg', '#2d2d2d')
        root.style.setProperty('--ant-layout-content-bg', '#1a1a1a')
        root.style.setProperty('--ant-layout-footer-bg', '#2d2d2d')
      } else {
        root.style.removeProperty('--ant-layout-bg')
        root.style.removeProperty('--ant-layout-sider-bg')
        root.style.removeProperty('--ant-layout-header-bg')
        root.style.removeProperty('--ant-layout-content-bg')
        root.style.removeProperty('--ant-layout-footer-bg')
      }
    }
  }

  // 切换主题
  const toggleTheme = () => {
    themeMode.value = themeMode.value === 'light' ? 'dark' : 'light'
  }

  // 设置特定主题
  const setTheme = (mode: ThemeMode) => {
    themeMode.value = mode
  }

  // 监听主题模式变化
  watch(themeMode, (newMode) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme-mode', newMode)
      updateTheme()
    }
  })

  // 监听系统主题变化（已移除，只支持手动切换）
  const watchSystemTheme = () => {
    // 不再需要监听系统主题变化
  }

  // 主题图标
  const themeIcon = computed(() => {
    return themeMode.value === 'light' ? 'SunOutlined' : 'MoonOutlined'
  })

  // 主题标签
  const themeLabel = computed(() => {
    return themeMode.value === 'light' ? '浅色模式' : '深色模式'
  })

  return {
    themeMode,
    isDark,
    themeIcon,
    themeLabel,
    loadTheme,
    toggleTheme,
    setTheme,
    updateTheme,
    watchSystemTheme
  }
}
