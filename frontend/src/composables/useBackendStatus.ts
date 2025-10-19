import { ref } from 'vue'
import { message } from 'ant-design-vue'

// 后端连接状态类型
export type BackendStatus = 'checking' | 'online' | 'offline'

// 后端状态管理
export const useBackendStatus = () => {
  const backendStatus = ref<BackendStatus>('checking')
  const backendError = ref('')
  let statusCheckInterval: ReturnType<typeof setInterval> | null = null

  // 统一的后端状态检测函数
  // 参考index页面的逻辑，通过/proxies_status接口检测
  const checkBackendStatus = async (baseURL?: string) => {
    try {
      backendStatus.value = 'checking'
      backendError.value = ''
      
      // 处理API基础URL
      let apiBaseURL = baseURL
      if (!apiBaseURL) {
        if (typeof window !== 'undefined') {
          // 在浏览器环境中，使用相对路径
          apiBaseURL = ''
        } else {
          // 在服务端渲染时，使用默认的开发端口
          apiBaseURL = 'http://localhost:5000'
        }
      } else if (apiBaseURL === '/') {
        // 如果传入的是根路径，则使用空字符串表示相对路径
        apiBaseURL = ''
      }
      
      // 使用 /ping 接口检测后端是否在线，这个接口不需要认证
      // 如果ping成功，再尝试使用 /proxies_status 接口获取更详细的状态
      const pingUrl = apiBaseURL ? `${apiBaseURL}/ping` : '/ping'
      const response = await fetch(pingUrl, {
        method: 'GET'
      })
      
      if (response.ok) {
        // /ping 端点返回简单的文本 "API OK"
        const text = await response.text()
        if (text.trim() === 'API OK') {
          backendStatus.value = 'online'
          backendError.value = ''
        } else {
          backendStatus.value = 'offline'
          backendError.value = '后端服务响应异常'
        }
      } else {
        backendStatus.value = 'offline'
        backendError.value = `后端服务响应异常 (${response.status})`
      }
    } catch (error: any) {
      backendStatus.value = 'offline'
      
      // 根据错误类型显示不同的提示
      if (error.name === 'AbortError') {
        backendError.value = '连接超时，后端服务可能响应缓慢'
      } else if (error.code === 'ERR_NETWORK') {
        backendError.value = '无法连接到后端服务，请检查服务是否启动'
      } else if (error.code === 'ECONNABORTED') {
        backendError.value = '连接超时，后端服务可能响应缓慢'
      } else {
        backendError.value = error.message || '连接后端服务失败'
      }
      
      console.error('后端状态检测失败:', error)
    }
  }

  // 启动定期状态检测
  const startPeriodicCheck = (intervalSeconds: number = 30, baseURL?: string) => {
    // 清除现有的定时器
    if (statusCheckInterval) {
      clearInterval(statusCheckInterval)
    }
    
    // 立即执行一次检测
    checkBackendStatus(baseURL)
    
    // 设置定期检测
    statusCheckInterval = setInterval(() => {
      checkBackendStatus(baseURL)
    }, intervalSeconds * 1000)
  }

  // 停止定期状态检测
  const stopPeriodicCheck = () => {
    if (statusCheckInterval) {
      clearInterval(statusCheckInterval)
      statusCheckInterval = null
    }
  }

  // 注意：组件卸载时需要手动调用 stopPeriodicCheck() 来清理定时器

  return {
    backendStatus,
    backendError,
    checkBackendStatus,
    startPeriodicCheck,
    stopPeriodicCheck
  }
}
