<template>
  <div class="app-layout">
    <a-config-provider :locale="locale">
      <a-layout class="layout-main">
        <!-- 侧边栏 -->
        <a-layout-sider
          v-model:collapsed="collapsed"
          :trigger="null"
          collapsible
          :width="240"
          class="layout-sider"
        >
          <!-- Logo区域 -->
          <div class="logo-container">
            <div class="logo" :class="{ collapsed }">
              <CloudServerOutlined class="logo-icon" />
              <transition name="fade">
                <span v-if="!collapsed" class="logo-text">IP池管理</span>
              </transition>
            </div>
            
            <!-- 版本和状态信息 -->
            <transition name="fade">
              <div v-if="!collapsed" class="logo-info">
                <div class="info-item">
                  <span 
                    class="status-indicator" 
                    :class="{
                      'online': backendStatus === 'online',
                      'offline': backendStatus === 'offline',
                      'checking': backendStatus === 'checking'
                    }"
                  ></span>
                  <span v-if="backendStatus === 'checking'">检测中...</span>
                  <span v-else-if="backendStatus === 'online'">系统运行中</span>
                  <span v-else>系统离线</span>
                </div>
                <div class="info-item version-info">
                  v2.0.2 | Nuxt 3
                </div>
              </div>
            </transition>
          </div>

          <!-- 导航菜单 -->
          <a-menu
            v-model:selectedKeys="urlPath"
            theme="dark"
            mode="inline"
            class="nav-menu"
          >
            <a-menu-item key="/" class="menu-item">
              <NuxtLink to="/" class="menu-link">
                <UnorderedListOutlined class="menu-icon" />
                <span class="menu-text">可用代理</span>
                <span v-if="proxyCount" class="menu-badge">{{ proxyCount }}</span>
              </NuxtLink>
            </a-menu-item>

            <a-menu-item key="/fetchers" class="menu-item">
              <NuxtLink to="/fetchers" class="menu-link">
                <RobotOutlined class="menu-icon" />
                <span class="menu-text">爬取器状态</span>
              </NuxtLink>
            </a-menu-item>

            <a-menu-item key="/api" class="menu-item">
              <NuxtLink to="/api" class="menu-link">
                <ApiOutlined class="menu-icon" />
                <span class="menu-text">API 接口</span>
                <a-badge 
                  :count="16" 
                  :number-style="{ backgroundColor: '#52c41a', fontSize: '10px' }"
                  class="menu-count-badge"
                />
              </NuxtLink>
            </a-menu-item>

            <a-menu-item key="/subscriptions" class="menu-item">
              <NuxtLink to="/subscriptions" class="menu-link">
                <LinkOutlined class="menu-icon" />
                <span class="menu-text">订阅管理</span>
              </NuxtLink>
            </a-menu-item>


            <a-menu-divider />

            <a-menu-item key="github" class="menu-item">
              <a
                href="https://github.com/huppugo1/ProxyPoolWithUI"
                target="_blank"
                class="menu-link"
              >
                <GithubOutlined class="menu-icon" />
                <span class="menu-text">GitHub</span>
                <ExportOutlined class="menu-external" />
              </a>
            </a-menu-item>
          </a-menu>

        </a-layout-sider>

        <!-- 主内容区 -->
        <a-layout>
          <!-- 顶部栏 -->
          <a-layout-header class="layout-header">
            <div class="header-left">
              <MenuUnfoldOutlined
                v-if="collapsed"
                class="trigger"
                @click="collapsed = !collapsed"
              />
              <MenuFoldOutlined
                v-else
                class="trigger"
                @click="collapsed = !collapsed"
              />
              
              <div class="header-breadcrumb">
                <a-breadcrumb>
                  <a-breadcrumb-item>
                    <HomeOutlined />
                  </a-breadcrumb-item>
                  <a-breadcrumb-item>{{ pageTitle }}</a-breadcrumb-item>
                </a-breadcrumb>
              </div>
            </div>

            <div class="header-right">
              <a-space :size="16">
                <a-tooltip title="刷新页面">
                  <a-button type="text" @click="refreshPage">
                    <ReloadOutlined />
                  </a-button>
                </a-tooltip>
                
                <a-tooltip title="全屏">
                  <a-button type="text" @click="toggleFullscreen">
                    <FullscreenOutlined v-if="!isFullscreen" />
                    <FullscreenExitOutlined v-else />
                  </a-button>
                </a-tooltip>
                
                 <a-tooltip :title="themeLabel">
                   <a-button 
                     type="text" 
                     @click="enhancedToggleTheme" 
                     class="theme-toggle"
                     :class="{ switching: isThemeSwitching }"
                     :data-theme="themeMode"
                   >
                     <div class="theme-icon-wrapper">
                       <BulbOutlined v-if="themeIcon === 'SunOutlined'" />
                       <StarOutlined v-else />
                       <div class="theme-status-dot"></div>
                     </div>
                   </a-button>
                 </a-tooltip>
                
                <a-divider type="vertical" />
                
                <a-dropdown>
                  <a-button type="text" class="user-dropdown">
                    <UserOutlined />
                    <span class="username">{{ username }}</span>
                    <DownOutlined class="dropdown-icon" />
                  </a-button>
                  <template #overlay>
                    <a-menu>
                      <a-menu-item key="profile" @click="showProfileModal = true">
                        <UserOutlined />
                        <span>个人信息</span>
                      </a-menu-item>
                      <a-menu-item key="change-password" @click="showPasswordModal = true">
                        <KeyOutlined />
                        <span>修改密码</span>
                      </a-menu-item>
                      <a-menu-divider />
                      <a-menu-item key="logout" @click="handleLogout">
                        <LogoutOutlined />
                        <span>退出登录</span>
                      </a-menu-item>
                    </a-menu>
                  </template>
                </a-dropdown>
              </a-space>
            </div>
          </a-layout-header>

          <!-- 内容区 -->
          <a-layout-content class="layout-content">
            <div class="content-wrapper">
              <slot />
            </div>
          </a-layout-content>

          <!-- 页脚 -->
          <a-layout-footer class="layout-footer">
            <div class="footer-content">
              <div class="footer-left">
                <span>© 2025 IP池管理系统</span>
                <a-divider type="vertical" />
                <span>基于 Nuxt 3 + Vue 3</span>
              </div>
              <div class="footer-right">
                <a href="https://github.com/huppugo1/ProxyPoolWithUI" target="_blank">
                  <GithubOutlined />
                  开源项目
                </a>
              </div>
            </div>
          </a-layout-footer>
        </a-layout>
      </a-layout>
    </a-config-provider>
    
    <!-- 个人信息弹窗 -->
    <a-modal
      v-model:open="showProfileModal"
      title="个人信息"
      :footer="null"
      width="400px"
    >
      <a-descriptions :column="1" bordered size="small">
        <a-descriptions-item label="用户名">
          {{ username }}
        </a-descriptions-item>
        <a-descriptions-item label="角色">
          <a-tag :color="userRole === 'admin' ? 'red' : 'blue'">
            {{ userRole === 'admin' ? '管理员' : '用户' }}
          </a-tag>
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>
    
    <!-- 修改密码弹窗 -->
    <a-modal
      v-model:open="showPasswordModal"
      title="修改密码"
      @ok="handleChangePassword"
      @cancel="resetPasswordForm"
      :confirmLoading="passwordLoading"
    >
      <a-form
        :model="passwordForm"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="旧密码" required>
          <a-input-password
            v-model:value="passwordForm.oldPassword"
            placeholder="请输入旧密码"
            autocomplete="current-password"
          />
        </a-form-item>
        <a-form-item label="新密码" required>
          <a-input-password
            v-model:value="passwordForm.newPassword"
            placeholder="请输入新密码（至少6位）"
            autocomplete="new-password"
          />
        </a-form-item>
        <a-form-item label="确认密码" required>
          <a-input-password
            v-model:value="passwordForm.confirmPassword"
            placeholder="请再次输入新密码"
            autocomplete="new-password"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import {
  CloudServerOutlined,
  UnorderedListOutlined,
  RobotOutlined,
  ApiOutlined,
  LinkOutlined,
  GithubOutlined,
  ExportOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  HomeOutlined,
  ReloadOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  UserOutlined,
  DownOutlined,
  LogoutOutlined,
  KeyOutlined,
  BulbOutlined,
  StarOutlined
} from '@ant-design/icons-vue'
import moment from 'moment'
import { message, Modal } from 'ant-design-vue'
import { useTheme } from '~/composables/useTheme'
import { useBackendStatus } from '~/composables/useBackendStatus'

moment.locale('zh-cn')

const locale = zhCN
const route = useRoute()
const router = useRouter()
// @ts-ignore
const { $http } = useNuxtApp()

// 主题管理
const { themeMode, isDark, themeIcon, themeLabel, loadTheme, toggleTheme, watchSystemTheme } = useTheme()

// 后端连接状态管理
const { backendStatus, backendError, checkBackendStatus, startPeriodicCheck, stopPeriodicCheck } = useBackendStatus()

// 后端状态检测现在由 useBackendStatus composable 提供

// 主题切换动画状态
const isThemeSwitching = ref(false)

// 增强的主题切换函数
const enhancedToggleTheme = () => {
  isThemeSwitching.value = true
  toggleTheme()
  
  // 动画完成后重置状态
  setTimeout(() => {
    isThemeSwitching.value = false
  }, 600)
}

const collapsed = ref(false)
const urlPath = ref<string[]>([])
const isFullscreen = ref(false)
const proxyCount = ref(0)
const username = ref('admin')
const userRole = ref('admin')
const showProfileModal = ref(false)
const showPasswordModal = ref(false)
const passwordLoading = ref(false)
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 页面标题
const pageTitle = computed(() => {
  const titleMap: Record<string, string> = {
    '/': '可用代理列表',
    '/fetchers': '爬取器状态监控',
    '/api': 'API 接口文档',
    '/subscriptions': '订阅链接管理'
  }
  return titleMap[route.path] || '代理池管理'
})

// 更新导航
const updateNav = () => {
  const data = /^\/[^/]*/.exec(route.path || '')
  if (data) {
    urlPath.value = [data[0]]
  } else {
    urlPath.value = []
  }
}

// 刷新页面
const refreshPage = () => {
  router.go(0)
}

// 切换全屏
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

// 监听全屏变化
if (typeof window !== 'undefined') {
  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement
  })
}

// 退出登录
const handleLogout = () => {
  Modal.confirm({
    title: '确认退出',
    content: '确定要退出登录吗？',
    okText: '确定',
    cancelText: '取消',
    onOk: () => {
      // 清除本地存储
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      message.success('退出成功')
      
      // 跳转到登录页
      setTimeout(() => {
        router.push('/login')
      }, 500)
    }
  })
}

// 修改密码
const handleChangePassword = async () => {
  // 验证表单
  if (!passwordForm.value.oldPassword) {
    message.error('请输入旧密码')
    return
  }
  
  if (!passwordForm.value.newPassword) {
    message.error('请输入新密码')
    return
  }
  
  if (passwordForm.value.newPassword.length < 6) {
    message.error('新密码长度至少6位')
    return
  }
  
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    message.error('两次输入的新密码不一致')
    return
  }
  
  passwordLoading.value = true
  
  try {
    await $http.post('/auth/change_password', {
      old_password: passwordForm.value.oldPassword,
      new_password: passwordForm.value.newPassword
    })
    
    message.success('密码修改成功，请重新登录')
    
    // 清除本地存储
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    
    // 关闭弹窗
    showPasswordModal.value = false
    
    // 跳转到登录页
    setTimeout(() => {
      router.push('/login')
    }, 1000)
  } catch (error: any) {
    message.error(error.message || '密码修改失败')
  } finally {
    passwordLoading.value = false
  }
}

// 重置密码表单
const resetPasswordForm = () => {
  passwordForm.value = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
}

// 加载用户信息
const loadUserInfo = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    // 如果没有token，不加载用户信息
    if (!token) {
      return
    }
    
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        username.value = user.username || 'Guest'
        userRole.value = user.role || 'user'
      } catch (e) {
        console.error('解析用户信息失败:', e)
        username.value = 'Guest'
        userRole.value = 'user'
      }
    }
  }
}

watch(() => route.path, updateNav)

onMounted(() => {
  updateNav()
  loadUserInfo()
  loadTheme()
  watchSystemTheme()
  
  // 获取API基础URL并启动定期状态检测
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase as string
  startPeriodicCheck(5, baseURL)
})

onUnmounted(() => {
  // 清理定时器
  stopPeriodicCheck()
})
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
}

.layout-main {
  min-height: 100vh;
}

/* 侧边栏样式 */
.layout-sider {
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  position: relative;
  z-index: 10;
  transition: all var(--transition-normal);
}

/* 浅色模式侧边栏 */
.light .layout-sider {
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

/* 深色模式侧边栏 */
.dark .layout-sider {
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.4);
}


.layout-sider :deep(.ant-layout-sider-children) {
  display: flex;
  flex-direction: column;
}

/* Logo区域 */
.logo-container {
  padding: 16px;
  margin-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: all var(--transition-normal);
}

/* 深色模式Logo区域 */
.dark .logo-container {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  transition: all 0.3s;
}

.logo.collapsed {
  justify-content: center;
}

.logo-icon {
  font-size: 24px;
  color: #1890ff;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
}

/* Logo下方信息 */
.logo-info {
  margin-top: 12px;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: rgba(0, 0, 0, 0.15);
  border-radius: 6px;
}

.logo-info .info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.75);
}

.logo-info .version-info {
  color: rgba(255, 255, 255, 0.55);
  font-family: 'Courier New', monospace;
  font-weight: 500;
  padding-left: 18px;
}

/* 导航菜单 */
.nav-menu {
  flex: 1;
  border-right: none;
  transition: all var(--transition-normal);
}

/* 深色模式菜单 */
.dark .nav-menu :deep(.ant-menu-dark) {
  background: #001529;
}

.dark .nav-menu :deep(.ant-menu-item) {
  color: rgba(255, 255, 255, 0.85);
}

.dark .nav-menu :deep(.ant-menu-item:hover) {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.dark .nav-menu :deep(.ant-menu-item-selected) {
  background: #1890ff;
  color: #fff;
}

.nav-menu :deep(.ant-menu-item) {
  margin: 4px 8px;
  border-radius: 6px;
  height: 44px;
  line-height: 44px;
}

.menu-link {
  display: flex;
  align-items: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  position: relative;
}

.menu-icon {
  font-size: 18px;
}

.menu-text {
  flex: 1;
}

.menu-badge {
  background: #1890ff;
  color: #fff;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
}

.menu-count-badge {
  margin-left: auto;
}

.menu-count-badge :deep(.ant-badge-count) {
  box-shadow: none;
}

.menu-external {
  font-size: 12px;
  opacity: 0.6;
}

/* 顶部栏 */
.layout-header {
  background: var(--bg-secondary);
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: var(--box-shadow);
  position: sticky;
  top: 0;
  z-index: 9;
  transition: all var(--transition-normal);
}

/* 浅色模式顶部栏 */
.light .layout-header {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-bottom: 1px solid var(--border-color);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
}

/* 深色模式顶部栏 */
.dark .layout-header {
  background: linear-gradient(135deg, #2d2d2d 0%, #3a3a3a 100%);
  border-bottom: 1px solid var(--border-color);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* 深色模式强制覆盖 Ant Design Layout 样式 */
.dark .ant-layout {
  background: var(--bg-primary) !important;
  color: var(--text-primary) !important;
}

.dark .ant-layout-content {
  background: var(--bg-primary) !important;
  color: var(--text-primary) !important;
}

.dark .ant-layout-sider {
  background: var(--bg-secondary) !important;
  color: var(--text-primary) !important;
}

.dark .ant-layout-header {
  background: var(--bg-secondary) !important;
  color: var(--text-primary) !important;
}

/* 深色模式覆盖 Ant Design 的 CSS 变量 */
.dark {
  --ant-layout-bg: var(--bg-primary) !important;
  --ant-layout-sider-bg: var(--bg-secondary) !important;
  --ant-layout-header-bg: var(--bg-secondary) !important;
  --ant-layout-content-bg: var(--bg-primary) !important;
  --ant-layout-footer-bg: var(--bg-secondary) !important;
}


.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.trigger {
  font-size: 18px;
  cursor: pointer;
  transition: color 0.3s;
  padding: 8px;
}

.trigger:hover {
  color: #1890ff;
}

.header-breadcrumb :deep(.ant-breadcrumb) {
  font-size: 14px;
}

.header-breadcrumb :deep(.ant-breadcrumb-link) {
  color: var(--text-primary);
  transition: color var(--transition-normal);
}

.header-breadcrumb :deep(.ant-breadcrumb-separator) {
  color: var(--text-secondary);
}

.header-right :deep(.ant-btn) {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: all var(--transition-normal);
}

.header-right :deep(.ant-btn:hover) {
  color: #1890ff;
  background: rgba(24, 144, 255, 0.05);
}

/* 内容区 */
.layout-content {
  margin: 24px;
  min-height: calc(100vh - 184px);
  background: var(--bg-primary);
  transition: all var(--transition-normal);
}

.content-wrapper {
  min-height: 100%;
}

/* 页脚 */
.layout-footer {
  background: var(--bg-secondary);
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
  transition: all var(--transition-normal);
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.footer-left,
.footer-right {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-secondary);
  transition: color var(--transition-normal);
}

.footer-right a {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: color var(--transition-normal);
}

.footer-right a:hover {
  color: #1890ff;
}

/* 主题切换按钮 */
.theme-toggle {
  position: relative;
  transition: all var(--transition-normal);
  color: var(--text-secondary);
  border-radius: 8px;
  padding: 8px 12px;
  min-width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid transparent;
}

/* 主题切换按钮的渐变背景 */
.theme-toggle::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  opacity: 0;
  transition: opacity var(--transition-normal);
  pointer-events: none;
}

.theme-toggle:hover::before {
  opacity: 1;
}

/* 主题切换按钮的波纹效果 */
.theme-toggle::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
  pointer-events: none;
}

.theme-toggle:active::after {
  width: 100px;
  height: 100px;
}

.theme-toggle:hover {
  color: #1890ff;
  background: rgba(24, 144, 255, 0.08);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
}

.theme-toggle:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
}

/* 主题图标包装器 */
.theme-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 主题切换按钮图标动画 */
.theme-toggle :deep(.anticon) {
  transition: all var(--transition-normal);
  font-size: 16px;
  position: relative;
}

.theme-toggle:hover :deep(.anticon) {
  transform: scale(1.1) rotate(5deg);
}

/* 主题状态指示点 */
.theme-status-dot {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 2px solid var(--bg-secondary);
  transition: all var(--transition-normal);
}

/* 不同主题的状态指示点颜色 */
.theme-toggle[data-theme="light"] .theme-status-dot {
  background: #faad14;
  box-shadow: 0 0 0 2px rgba(250, 173, 20, 0.3);
}

.theme-toggle[data-theme="dark"] .theme-status-dot {
  background: #722ed1;
  box-shadow: 0 0 0 2px rgba(114, 46, 209, 0.3);
}


/* 深色模式下的状态指示点 */
.dark .theme-toggle[data-theme="light"] .theme-status-dot {
  background: #faad14;
  box-shadow: 0 0 0 2px rgba(250, 173, 20, 0.4);
}

.dark .theme-toggle[data-theme="dark"] .theme-status-dot {
  background: #9254de;
  box-shadow: 0 0 0 2px rgba(146, 84, 222, 0.4);
}


/* 主题切换时的旋转动画 */
.theme-toggle :deep(.anticon) {
  animation: none;
}

.theme-toggle.switching :deep(.anticon) {
  animation: themeSwitch 0.6s ease-in-out;
}

@keyframes themeSwitch {
  0% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
  50% {
    transform: scale(0.8) rotate(180deg);
    opacity: 0.3;
  }
  100% {
    transform: scale(1) rotate(360deg);
    opacity: 1;
  }
}

/* 主题切换按钮的脉冲效果 */
.theme-toggle[data-theme="light"] :deep(.anticon) {
  animation: lightPulse 2s ease-in-out infinite;
}

.theme-toggle[data-theme="dark"] :deep(.anticon) {
  animation: darkPulse 2s ease-in-out infinite;
}


@keyframes lightPulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(250, 173, 20, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(250, 173, 20, 0);
  }
}

@keyframes darkPulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(114, 46, 209, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(114, 46, 209, 0);
  }
}


/* 浅色模式样式 */
.theme-toggle[data-theme="light"] {
  color: #faad14;
  background: linear-gradient(135deg, rgba(250, 173, 20, 0.1), rgba(255, 193, 7, 0.05));
  border-color: rgba(250, 173, 20, 0.3);
  box-shadow: 0 0 0 1px rgba(250, 173, 20, 0.1);
}

.theme-toggle[data-theme="light"]:hover {
  color: #faad14;
  background: linear-gradient(135deg, rgba(250, 173, 20, 0.15), rgba(255, 193, 7, 0.1));
  border-color: rgba(250, 173, 20, 0.5);
  box-shadow: 0 4px 12px rgba(250, 173, 20, 0.2), 0 0 0 1px rgba(250, 173, 20, 0.2);
}

/* 深色模式样式 */
.theme-toggle[data-theme="dark"] {
  color: #722ed1;
  background: linear-gradient(135deg, rgba(114, 46, 209, 0.1), rgba(75, 0, 130, 0.05));
  border-color: rgba(114, 46, 209, 0.3);
  box-shadow: 0 0 0 1px rgba(114, 46, 209, 0.1);
}

.theme-toggle[data-theme="dark"]:hover {
  color: #722ed1;
  background: linear-gradient(135deg, rgba(114, 46, 209, 0.15), rgba(75, 0, 130, 0.1));
  border-color: rgba(114, 46, 209, 0.5);
  box-shadow: 0 4px 12px rgba(114, 46, 209, 0.2), 0 0 0 1px rgba(114, 46, 209, 0.2);
}


/* 深色模式下的主题切换按钮 */
.dark .theme-toggle {
  color: var(--text-secondary);
}

.dark .theme-toggle:hover {
  color: #1890ff;
  background: rgba(24, 144, 255, 0.15);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.25);
}

/* 深色模式下的主题状态样式 */
.dark .theme-toggle[data-theme="light"] {
  color: #faad14;
  background: linear-gradient(135deg, rgba(250, 173, 20, 0.15), rgba(255, 193, 7, 0.08));
  border-color: rgba(250, 173, 20, 0.4);
  box-shadow: 0 0 0 1px rgba(250, 173, 20, 0.2);
}

.dark .theme-toggle[data-theme="light"]:hover {
  background: linear-gradient(135deg, rgba(250, 173, 20, 0.2), rgba(255, 193, 7, 0.12));
  border-color: rgba(250, 173, 20, 0.6);
  box-shadow: 0 4px 12px rgba(250, 173, 20, 0.3), 0 0 0 1px rgba(250, 173, 20, 0.3);
}

.dark .theme-toggle[data-theme="dark"] {
  color: #9254de;
  background: linear-gradient(135deg, rgba(146, 84, 222, 0.15), rgba(75, 0, 130, 0.08));
  border-color: rgba(146, 84, 222, 0.4);
  box-shadow: 0 0 0 1px rgba(146, 84, 222, 0.2);
}

.dark .theme-toggle[data-theme="dark"]:hover {
  background: linear-gradient(135deg, rgba(146, 84, 222, 0.2), rgba(75, 0, 130, 0.12));
  border-color: rgba(146, 84, 222, 0.6);
  box-shadow: 0 4px 12px rgba(146, 84, 222, 0.3), 0 0 0 1px rgba(146, 84, 222, 0.3);
}


/* 用户下拉菜单 */
.user-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  color: var(--text-primary);
  font-size: 14px;
  transition: all var(--transition-normal);
}

.user-dropdown:hover {
  color: #1890ff;
  background: rgba(24, 144, 255, 0.05);
}

.username {
  font-weight: 500;
}

.dropdown-icon {
  font-size: 12px;
  margin-left: 4px;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式 */
@media (max-width: 768px) {
  .layout-header {
    padding: 0 16px;
  }

  .layout-content {
    margin: 16px;
  }

  .header-breadcrumb {
    display: none;
  }

  .footer-content {
    flex-direction: column;
    text-align: center;
  }
}

/* 菜单栏状态指示器样式 */
.status-indicator {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
  animation: pulse 2s ease-in-out infinite;
}

.status-indicator.online {
  background: #52c41a;
  box-shadow: 0 0 0 2px rgba(82, 196, 26, 0.3);
}

.status-indicator.offline {
  background: #ff4d4f;
  box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.3);
}

.status-indicator.checking {
  background: #faad14;
  box-shadow: 0 0 0 2px rgba(250, 173, 20, 0.3);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* 深色模式菜单栏状态指示器 */
.dark .status-indicator.online {
  background: #52c41a;
  box-shadow: 0 0 0 2px rgba(82, 196, 26, 0.3);
}

.dark .status-indicator.offline {
  background: #ff4d4f;
  box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.3);
}

.dark .status-indicator.checking {
  background: #faad14;
  box-shadow: 0 0 0 2px rgba(250, 173, 20, 0.3);
}
</style>
