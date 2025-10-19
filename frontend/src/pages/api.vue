<template>
  <div class="api-page fade-in">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">
        <ApiOutlined />
        API 接口文档
      </h1>
      <p class="page-description">
        本系统提供的所有 API 接口说明和使用示例
      </p>
    </div>

    <!-- API 统计卡片 -->
    <a-row :gutter="[16, 16]" class="stats-row">
      <a-col :xs="24" :sm="12" :md="6">
        <div class="stat-card gradient-bg-blue">
          <div class="stat-icon">
            <ApiOutlined />
          </div>
          <div class="stat-content">
            <div class="stat-label">总接口数</div>
            <div class="stat-value">{{ totalApis }}</div>
          </div>
        </div>
      </a-col>

      <a-col :xs="24" :sm="12" :md="6">
        <div class="stat-card gradient-bg-green">
          <div class="stat-icon">
            <CheckCircleOutlined />
          </div>
          <div class="stat-content">
            <div class="stat-label">GET 接口</div>
            <div class="stat-value">{{ getApis }}</div>
          </div>
        </div>
      </a-col>

      <a-col :xs="24" :sm="12" :md="6">
        <div class="stat-card gradient-bg-orange">
          <div class="stat-icon">
            <SendOutlined />
          </div>
          <div class="stat-content">
            <div class="stat-label">POST 接口</div>
            <div class="stat-value">{{ postApis }}</div>
          </div>
        </div>
      </a-col>

      <a-col :xs="24" :sm="12" :md="6">
        <div class="stat-card gradient-bg-purple">
          <div class="stat-icon">
            <ThunderboltOutlined />
          </div>
          <div class="stat-content">
            <div class="stat-label">服务状态</div>
            <div class="stat-badge">
              <span 
                class="status-indicator" 
                :class="{
                  'online': backendStatus === 'online',
                  'offline': backendStatus === 'offline',
                  'checking': backendStatus === 'checking'
                }"
              ></span>
              <span v-if="backendStatus === 'checking'">检测中...</span>
              <span v-else-if="backendStatus === 'online'">在线</span>
              <span v-else>离线</span>
            </div>
            <div v-if="backendError" class="status-error">
              {{ backendError }}
            </div>
          </div>
        </div>
      </a-col>
    </a-row>

    <!-- 认证说明 -->
    <a-alert
      message="🔐 接口认证说明"
      type="warning"
      show-icon
      class="auth-notice"
    >
      <template #description>
        <div class="auth-desc">
          <p><strong>🔒 Token 认证（Bearer Token）：</strong></p>
          <ul>
            <li>适用接口：代理获取接口（/fetch_*）、管理接口（/proxies_status、/fetchers_status 等）</li>
            <li>认证方式：在请求头中添加 <code>Authorization: Bearer YOUR_TOKEN</code></li>
            <li>获取 Token：通过 <code>/auth/login</code> 接口登录后获得</li>
          </ul>
          <p><strong>🔑 URL 参数认证（Username & Password）：</strong></p>
          <ul>
            <li>适用接口：传统 Clash 订阅接口（/clash、/clash/proxies、/v2ray）</li>
            <li>认证方式：在 URL 中添加参数 <code>?username=admin&password=admin123</code></li>
            <li>示例：<code>http://localhost:5000/clash?username=admin&password=admin123</code></li>
            <li><strong>⚠️ 安全风险：</strong>密码会出现在URL中，可能被记录在访问日志中</li>
          </ul>
          <p><strong>🔐 加密订阅链接认证（推荐）：</strong></p>
          <ul>
            <li>适用接口：安全订阅接口（/generate_subscription_links、/subscribe/*）</li>
            <li>认证方式：使用 JWT Token 生成加密的订阅链接</li>
            <li>优势：密码不会出现在URL中，更安全</li>
            <li>示例：<code>http://localhost:5000/subscribe/clash?token=ENCRYPTED_TOKEN</code></li>
          </ul>
          <p><strong>⚠️ 注意：</strong>所有接口均需认证后才能使用，推荐使用加密订阅链接</p>
        </div>
      </template>
    </a-alert>

    <!-- API 分类列表 -->
    <a-collapse v-model:activeKey="activeKeys" class="api-collapse" accordion>
      <!-- 认证接口 -->
      <a-collapse-panel key="auth" class="api-panel">
        <template #header>
          <div class="panel-header">
            <LockOutlined class="panel-icon" />
            <span class="panel-title">认证接口</span>
            <a-tag color="red">{{ authApis.length }} 个接口</a-tag>
          </div>
        </template>
        
        <div v-for="api in authApis" :key="api.path" class="api-item">
          <div class="api-header">
            <a-tag :color="getMethodColor(api.method)">{{ api.method }}</a-tag>
            <code class="api-path">{{ api.path }}</code>
            <a-button 
              type="link" 
              size="small" 
              @click="copyToClipboard(getFullUrl(api.path))"
            >
              <CopyOutlined />
              复制
            </a-button>
          </div>
          <div class="api-desc">{{ api.description }}</div>
          <div v-if="api.body" class="api-body">
            <strong>请求体：</strong>
            <pre class="body-code">{{ JSON.stringify(api.body, null, 2) }}</pre>
          </div>
          <div v-if="api.note" class="api-note">
            <strong>说明：</strong>
            <span>{{ api.note }}</span>
          </div>
          <div class="api-example">
            <strong>示例：</strong>
            <code class="example-code">{{ api.example }}</code>
          </div>
          <div v-if="api.response" class="api-response">
            <strong>响应示例：</strong>
            <pre class="response-code">{{ api.response }}</pre>
          </div>
        </div>
      </a-collapse-panel>

      <!-- 代理获取接口 -->
      <a-collapse-panel key="proxy" class="api-panel">
        <template #header>
          <div class="panel-header">
            <DatabaseOutlined class="panel-icon" />
            <span class="panel-title">代理获取接口</span>
            <a-tag color="blue">{{ proxyApis.length }} 个接口</a-tag>
          </div>
        </template>
        
        <div v-for="api in proxyApis" :key="api.path" class="api-item">
          <div class="api-header">
            <a-tag :color="getMethodColor(api.method)">{{ api.method }}</a-tag>
            <code class="api-path">{{ api.path }}</code>
            <a-button 
              type="link" 
              size="small" 
              @click="copyToClipboard(getFullUrl(api.path))"
            >
              <CopyOutlined />
              复制
            </a-button>
          </div>
          <div class="api-desc">{{ api.description }}</div>
          <div v-if="api.params" class="api-params">
            <strong>参数：</strong>
            <span v-for="(param, index) in api.params" :key="index">
              <code>{{ param }}</code>{{ index < api.params.length - 1 ? ', ' : '' }}
            </span>
          </div>
          <div class="api-example">
            <strong>示例：</strong>
            <code class="example-code">{{ api.example }}</code>
            <a-button 
              type="link" 
              size="small"
              @click="testApi(api)"
            >
              <PlayCircleOutlined />
              测试
            </a-button>
          </div>
          <div v-if="api.response" class="api-response">
            <strong>响应示例：</strong>
            <pre class="response-code">{{ api.response }}</pre>
          </div>
        </div>
      </a-collapse-panel>

      <!-- Clash 订阅接口 -->
      <a-collapse-panel key="clash" class="api-panel">
        <template #header>
          <div class="panel-header">
            <CloudOutlined class="panel-icon" />
            <span class="panel-title">Clash 订阅接口</span>
            <a-tag color="purple">{{ clashApis.length }} 个接口</a-tag>
          </div>
        </template>
        
        <div v-for="api in clashApis" :key="api.path" class="api-item">
          <div class="api-header">
            <a-tag :color="getMethodColor(api.method)">{{ api.method }}</a-tag>
            <code class="api-path">{{ api.path }}</code>
            <a-button 
              type="link" 
              size="small" 
              @click="copyToClipboard(getFullUrl(api.path))"
            >
              <CopyOutlined />
              复制
            </a-button>
          </div>
          <div class="api-desc">{{ api.description }}</div>
          <div v-if="api.params" class="api-params">
            <strong>参数：</strong>
            <span v-for="(param, index) in api.params" :key="index">
              <code>{{ param }}</code>{{ index < api.params.length - 1 ? ', ' : '' }}
            </span>
          </div>
          <div v-if="api.note" class="api-note">
            <strong>说明：</strong>
            <span>{{ api.note }}</span>
          </div>
          <div class="api-example">
            <strong>示例：</strong>
            <code class="example-code">{{ api.example }}</code>
            <a-button 
              type="link" 
              size="small"
              @click="testApi(api)"
            >
              <PlayCircleOutlined />
              测试
            </a-button>
          </div>
        </div>
      </a-collapse-panel>

      <!-- V2Ray 订阅接口 -->
      <a-collapse-panel key="v2ray" class="api-panel">
        <template #header>
          <div class="panel-header">
            <CloudOutlined class="panel-icon" />
            <span class="panel-title">V2Ray 订阅接口</span>
            <a-tag color="orange">{{ v2rayApis.length }} 个接口</a-tag>
          </div>
        </template>
        
        <div v-for="api in v2rayApis" :key="api.path" class="api-item">
          <div class="api-header">
            <a-tag :color="getMethodColor(api.method)">{{ api.method }}</a-tag>
            <code class="api-path">{{ api.path }}</code>
            <a-button 
              type="link" 
              size="small" 
              @click="copyToClipboard(getFullUrl(api.path))"
            >
              <CopyOutlined />
              复制
            </a-button>
          </div>
          <div class="api-desc">{{ api.description }}</div>
          <div v-if="api.params" class="api-params">
            <strong>参数：</strong>
            <span v-for="(param, index) in api.params" :key="index">
              <code>{{ param }}</code>{{ index < api.params.length - 1 ? ', ' : '' }}
            </span>
          </div>
          <div v-if="api.note" class="api-note">
            <strong>说明：</strong>
            <span>{{ api.note }}</span>
          </div>
          <div class="api-example">
            <strong>示例：</strong>
            <code class="example-code">{{ api.example }}</code>
            <a-button 
              type="link" 
              size="small"
              @click="testApi(api)"
            >
              <PlayCircleOutlined />
              测试
            </a-button>
          </div>
        </div>
      </a-collapse-panel>

      <!-- 安全订阅接口 -->
      <a-collapse-panel key="subscription" class="api-panel">
        <template #header>
          <div class="panel-header">
            <ThunderboltOutlined class="panel-icon" />
            <span class="panel-title">安全订阅接口</span>
            <a-tag color="red">{{ subscriptionApis.length }} 个接口</a-tag>
          </div>
        </template>
        
        <div v-for="api in subscriptionApis" :key="api.path" class="api-item">
          <div class="api-header">
            <a-tag :color="getMethodColor(api.method)">{{ api.method }}</a-tag>
            <code class="api-path">{{ api.path }}</code>
            <a-button 
              type="link" 
              size="small" 
              @click="copyToClipboard(getFullUrl(api.path))"
            >
              <CopyOutlined />
              复制
            </a-button>
          </div>
          <div class="api-desc">{{ api.description }}</div>
          <div v-if="api.body" class="api-body">
            <strong>请求体：</strong>
            <pre class="body-code">{{ JSON.stringify(api.body, null, 2) }}</pre>
          </div>
          <div v-if="api.note" class="api-note">
            <strong>说明：</strong>
            <span>{{ api.note }}</span>
          </div>
          <div class="api-example">
            <strong>示例：</strong>
            <code class="example-code">{{ api.example }}</code>
            <a-button 
              type="link" 
              size="small"
              @click="generateSubscriptionLinks(api)"
            >
              <ThunderboltOutlined />
              生成订阅链接
            </a-button>
          </div>
          <div v-if="api.response" class="api-response">
            <strong>响应示例：</strong>
            <pre class="response-code">{{ api.response }}</pre>
          </div>
        </div>
        
        <!-- 订阅按钮区域 -->
        <div class="subscription-buttons">
          <a-divider>快速生成订阅链接</a-divider>
          
          <!-- 订阅选项 -->
          <div class="subscription-options">
            <a-checkbox v-model:checked="permanentSubscription" class="permanent-checkbox">
              <span class="option-label">
                <ThunderboltOutlined />
                生成永久订阅链接
              </span>
            </a-checkbox>
            <a-tooltip title="永久链接不会过期，但用户被删除后会自动失效">
              <QuestionCircleOutlined class="help-icon" />
            </a-tooltip>
          </div>
          
          <div class="button-group">
            <a-button 
              type="primary" 
              size="large"
              @click="generateSubscription('clash')"
              :loading="generating"
            >
              <CloudOutlined />
              Clash 订阅
            </a-button>
            <a-button 
              type="default" 
              size="large"
              @click="generateSubscription('v2ray')"
              :loading="generating"
            >
              <CloudOutlined />
              V2Ray 订阅
            </a-button>
            <a-button 
              type="dashed" 
              size="large"
              @click="generateSubscription('both')"
              :loading="generating"
            >
              <ThunderboltOutlined />
              全部订阅
            </a-button>
          </div>
          
          <!-- 订阅链接显示区域 -->
          <div v-if="subscriptionLinks" class="subscription-links">
            <a-divider>生成的订阅链接</a-divider>
            
            <!-- 链接类型标识 -->
            <div class="link-type-badge">
              <a-tag :color="subscriptionLinks.permanent ? 'green' : 'blue'" class="type-tag">
                <ThunderboltOutlined v-if="subscriptionLinks.permanent" />
                <ClockCircleOutlined v-else />
                {{ subscriptionLinks.permanent ? '永久链接' : '临时链接' }}
              </a-tag>
              <span v-if="!subscriptionLinks.permanent" class="expire-info">
                有效期：{{ subscriptionLinks.expires_in ? Math.floor(subscriptionLinks.expires_in / 60) + '分钟' : '永久' }}
              </span>
            </div>
            
            <div v-if="subscriptionLinks.clash" class="link-item">
              <div class="link-header">
                <CloudOutlined class="link-icon" />
                <span class="link-title">Clash 订阅链接</span>
                <a-button 
                  type="link" 
                  size="small"
                  @click="copyToClipboard(subscriptionLinks.clash)"
                >
                  <CopyOutlined />
                  复制
                </a-button>
              </div>
              <code class="link-url">{{ subscriptionLinks.clash }}</code>
            </div>
            <div v-if="subscriptionLinks.v2ray" class="link-item">
              <div class="link-header">
                <CloudOutlined class="link-icon" />
                <span class="link-title">V2Ray 订阅链接</span>
                <a-button 
                  type="link" 
                  size="small"
                  @click="copyToClipboard(subscriptionLinks.v2ray)"
                >
                  <CopyOutlined />
                  复制
                </a-button>
              </div>
              <code class="link-url">{{ subscriptionLinks.v2ray }}</code>
            </div>
            <div class="link-info">
              <a-alert
                :message="subscriptionLinks.permanent ? '永久订阅链接说明' : '临时订阅链接说明'"
                :type="subscriptionLinks.permanent ? 'success' : 'info'"
                show-icon
              >
                <template #description>
                  <ul>
                    <li>订阅链接已加密，无需在URL中暴露用户名和密码</li>
                    <li v-if="subscriptionLinks.permanent">
                      永久链接不会过期，但用户被删除后会自动失效
                    </li>
                    <li v-else>
                      临时链接有效期为1小时，过期后需要重新生成
                    </li>
                    <li>可直接在Clash、V2Ray等客户端中使用</li>
                    <li>支持国家筛选、协议筛选等高级功能</li>
                  </ul>
                </template>
              </a-alert>
            </div>
          </div>
        </div>
      </a-collapse-panel>

      <!-- 管理接口 -->
      <a-collapse-panel key="management" class="api-panel">
        <template #header>
          <div class="panel-header">
            <SettingOutlined class="panel-icon" />
            <span class="panel-title">管理接口</span>
            <a-tag color="green">{{ managementApis.length }} 个接口</a-tag>
          </div>
        </template>
        
        <div v-for="api in managementApis" :key="api.path" class="api-item">
          <div class="api-header">
            <a-tag :color="getMethodColor(api.method)">{{ api.method }}</a-tag>
            <code class="api-path">{{ api.path }}</code>
            <a-button 
              type="link" 
              size="small" 
              @click="copyToClipboard(getFullUrl(api.path))"
            >
              <CopyOutlined />
              复制
            </a-button>
          </div>
          <div class="api-desc">{{ api.description }}</div>
          <div v-if="api.body" class="api-body">
            <strong>请求体：</strong>
            <pre class="body-code">{{ JSON.stringify(api.body, null, 2) }}</pre>
          </div>
          <div class="api-example">
            <strong>示例：</strong>
            <code class="example-code">{{ api.example }}</code>
          </div>
        </div>
      </a-collapse-panel>

      <!-- API接口管理 -->
      <a-collapse-panel key="api-management" class="api-panel">
        <template #header>
          <div class="panel-header">
            <SettingOutlined class="panel-icon" />
            <span class="panel-title">API接口管理</span>
            <a-tag color="red">接口禁用控制</a-tag>
          </div>
        </template>
        
        <div class="api-management-content">
          <a-alert
            message="⚠️ 接口管理说明"
            type="warning"
            show-icon
            class="management-notice"
          >
            <template #description>
              <p>您可以在这里禁用或启用特定的API接口。禁用后，该接口将返回403错误。</p>
              <p><strong>注意：</strong>禁用接口可能影响系统功能，请谨慎操作。</p>
            </template>
          </a-alert>

          <div class="api-controls">
            <a-row :gutter="[16, 16]">
              <a-col :span="12">
                <a-input-search
                  v-model:value="apiSearchText"
                  placeholder="搜索API接口..."
                  @search="filterApis"
                  allow-clear
                />
              </a-col>
              <a-col :span="12">
                <a-space>
                  <a-button @click="loadApiStatus" :loading="loadingApiStatus">
                    <ReloadOutlined />
                    刷新状态
                  </a-button>
                  <a-button type="primary" @click="enableAllApis" :loading="bulkOperation">
                    <CheckCircleOutlined />
                    全部启用
                  </a-button>
                  <a-button danger @click="disableAllApis" :loading="bulkOperation">
                    <CloseCircleOutlined />
                    全部禁用
                  </a-button>
                </a-space>
              </a-col>
            </a-row>
          </div>

          <a-table
            v-if="backendStatus === 'online'"
            :columns="apiManagementColumns"
            :data-source="filteredApiList"
            :pagination="{ pageSize: 10, showSizeChanger: true }"
            :loading="loadingApiStatus"
            row-key="path"
            class="api-management-table"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'">
                <a-switch
                  :checked="record.enabled"
                  @change="toggleApiStatus(record)"
                  :loading="record.toggling"
                />
              </template>
              <template v-else-if="column.key === 'category'">
                <a-tag :color="getCategoryColor(record.category)">
                  {{ getCategoryName(record.category) }}
                </a-tag>
              </template>
              <template v-else-if="column.key === 'path'">
                <code>{{ record.path }}</code>
              </template>
            </template>
          </a-table>
          
          <!-- 后端离线时的提示 -->
          <div v-else-if="backendStatus === 'offline'" class="offline-message">
            <a-result
              status="error"
              title="后端服务离线"
              :sub-title="backendError"
            >
              <template #extra>
                <a-button type="primary" @click="checkBackendStatus">
                  <ReloadOutlined />
                  重新检测
                </a-button>
              </template>
            </a-result>
          </div>
          
          <!-- 检测中时的提示 -->
          <div v-else class="checking-message">
            <a-spin size="large">
              <div class="checking-content">
                <p>正在检测后端服务状态...</p>
              </div>
            </a-spin>
          </div>
        </div>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTheme } from '~/composables/useTheme'
import { useBackendStatus } from '~/composables/useBackendStatus'
import {
  ApiOutlined,
  CheckCircleOutlined,
  SendOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
  CloudOutlined,
  SettingOutlined,
  CopyOutlined,
  PlayCircleOutlined,
  LockOutlined,
  QuestionCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  CloseCircleOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

// 主题管理
const { themeMode } = useTheme()

// 后端连接状态管理
const { backendStatus, backendError, checkBackendStatus, startPeriodicCheck } = useBackendStatus()

// 定义 API 类型
interface ApiItem {
  method: string
  path: string
  description: string
  example: string
  response?: string
  params?: string[]
  note?: string
  body?: Record<string, any>
}

const activeKeys = ref<string[]>(['auth'])

// 订阅相关状态
const generating = ref(false)
const permanentSubscription = ref(false)
const subscriptionLinks = ref<{
  clash?: string, 
  v2ray?: string, 
  permanent?: boolean, 
  expires_in?: number
} | null>(null)

// API管理相关状态
const loadingApiStatus = ref(false)
const bulkOperation = ref(false)
const apiSearchText = ref('')

// 后端连接状态现在由 useBackendStatus composable 提供
const apiList = ref<Array<{
  path: string
  category: string
  enabled: boolean
  toggling?: boolean
}>>([])

// API管理表格列定义
const apiManagementColumns = [
  {
    title: '接口路径',
    dataIndex: 'path',
    key: 'path',
    width: 200
  },
  {
    title: '分类',
    dataIndex: 'category',
    key: 'category',
    width: 120
  },
  {
    title: '状态',
    dataIndex: 'enabled',
    key: 'status',
    width: 100
  }
]

// API 数据
// 认证接口
const authApis: ApiItem[] = [
  {
    method: 'POST',
    path: '/auth/login',
    description: '用户登录，获取访问令牌',
    body: {
      username: 'admin',
      password: 'admin123'
    },
    note: '登录成功后会返回 Token，请妥善保管。Token 默认有效期为 24 小时',
    example: 'curl -X POST http://localhost:5000/auth/login -H "Content-Type: application/json" -d \'{"username":"admin","password":"admin123"}\'',
    response: `{
  "success": true,
  "message": "登录成功",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "username": "admin",
    "role": "admin"
  }
}`
  },
  {
    method: 'POST',
    path: '/auth/change_password',
    description: '修改当前用户密码（需要认证）',
    body: {
      old_password: 'admin123',
      new_password: 'newpassword123'
    },
    note: '需要在请求头中携带有效的 Token。修改密码后需要重新登录',
    example: 'curl -X POST http://localhost:5000/auth/change_password -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" -d \'{"old_password":"admin123","new_password":"newpassword123"}\'',
    response: `{
  "success": true,
  "message": "密码修改成功"
}`
  },
  {
    method: 'POST',
    path: '/auth/verify',
    description: '验证 Token 是否有效',
    note: '需要在请求头中携带 Token',
    example: 'curl -X POST http://localhost:5000/auth/verify -H "Authorization: Bearer YOUR_TOKEN"',
    response: `{
  "success": true,
  "message": "Token 有效",
  "user": {
    "username": "admin",
    "role": "admin"
  }
}`
  }
]

const proxyApis: ApiItem[] = [
  {
    method: 'GET',
    path: '/ping',
    description: '测试 API 状态（无需认证）',
    example: 'curl http://localhost:5000/ping',
    response: 'API OK'
  },
  {
    method: 'GET',
    path: '/fetch_random',
    description: '随机获取一个可用代理（需要 Token 认证）',
    note: '⚠️ 此接口需要认证。请在请求头中添加 Authorization: Bearer YOUR_TOKEN',
    example: 'curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/fetch_random',
    response: 'http://127.0.0.1:8080'
  },
  {
    method: 'GET',
    path: '/fetch_all',
    description: '获取所有可用代理（需要 Token 认证）',
    note: '⚠️ 此接口需要认证。返回所有可用代理，逗号分隔',
    example: 'curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/fetch_all',
    response: 'http://127.0.0.1:8080,http://127.0.0.1:8081,...'
  },
  {
    method: 'GET',
    path: '/fetch_http',
    description: '获取一个 HTTP 代理（需要 Token 认证）',
    note: '⚠️ 此接口需要认证。请在请求头中添加 Authorization: Bearer YOUR_TOKEN',
    example: 'curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/fetch_http',
    response: 'http://127.0.0.1:8080'
  },
  {
    method: 'GET',
    path: '/fetch_http_all',
    description: '获取所有 HTTP 代理（需要 Token 认证）',
    note: '⚠️ 此接口需要认证。请在请求头中添加 Authorization: Bearer YOUR_TOKEN',
    example: 'curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/fetch_http_all',
    response: 'http://127.0.0.1:8080,http://127.0.0.1:8081'
  },
  {
    method: 'GET',
    path: '/fetch_https',
    description: '获取一个 HTTPS 代理（需要 Token 认证）',
    note: '⚠️ 此接口需要认证。请在请求头中添加 Authorization: Bearer YOUR_TOKEN',
    example: 'curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/fetch_https',
    response: 'https://127.0.0.1:8443'
  },
  {
    method: 'GET',
    path: '/fetch_https_all',
    description: '获取所有 HTTPS 代理（需要 Token 认证）',
    note: '⚠️ 此接口需要认证。请在请求头中添加 Authorization: Bearer YOUR_TOKEN',
    example: 'curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/fetch_https_all',
    response: 'https://127.0.0.1:8443,https://127.0.0.1:8444'
  },
  {
    method: 'GET',
    path: '/fetch_socks4',
    description: '获取一个 SOCKS4 代理（需要 Token 认证）',
    note: '⚠️ 此接口需要认证。请在请求头中添加 Authorization: Bearer YOUR_TOKEN',
    example: 'curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/fetch_socks4',
    response: 'socks4://127.0.0.1:1080'
  },
  {
    method: 'GET',
    path: '/fetch_socks4_all',
    description: '获取所有 SOCKS4 代理（需要 Token 认证）',
    note: '⚠️ 此接口需要认证。请在请求头中添加 Authorization: Bearer YOUR_TOKEN',
    example: 'curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/fetch_socks4_all',
    response: 'socks4://127.0.0.1:1080,socks4://127.0.0.1:1081'
  },
  {
    method: 'GET',
    path: '/fetch_socks5',
    description: '获取一个 SOCKS5 代理（需要 Token 认证）',
    note: '⚠️ 此接口需要认证。请在请求头中添加 Authorization: Bearer YOUR_TOKEN',
    example: 'curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/fetch_socks5',
    response: 'socks5://127.0.0.1:1080'
  },
  {
    method: 'GET',
    path: '/fetch_socks5_all',
    description: '获取所有 SOCKS5 代理（需要 Token 认证）',
    note: '⚠️ 此接口需要认证。请在请求头中添加 Authorization: Bearer YOUR_TOKEN',
    example: 'curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/fetch_socks5_all',
    response: 'socks5://127.0.0.1:1080,socks5://127.0.0.1:1081'
  }
]

const clashApis: ApiItem[] = [
  {
    method: 'GET',
    path: '/clash',
    description: '获取 Clash 完整订阅配置（URL 参数认证）',
    params: [
      'username (必填) - 用户名',
      'password (必填) - 密码',
      'c (可选) - 按国家筛选，多个用逗号分隔，如 c=CN,US',
      'nc (可选) - 排除指定国家，如 nc=CN',
      'protocol (可选) - 筛选协议类型：http/https/socks5',
      'limit (可选) - 限制返回数量，默认全部'
    ],
    note: '🔑 此接口使用 URL 参数认证，需要在 URL 中添加 username 和 password 参数。返回完整的 Clash 配置（YAML 格式），包含代理节点、代理组和规则。节点名称格式：🇨🇳 中国+IP 或 IP+端口（无国家信息时）',
    example: 'curl "http://localhost:5000/clash?username=admin&password=admin123&c=CN,US&limit=50"'
  },
  {
    method: 'GET',
    path: '/clash/proxies',
    description: '获取 Clash 代理节点列表（URL 参数认证）',
    params: [
      'username (必填) - 用户名',
      'password (必填) - 密码',
      'c (可选) - 按国家筛选，多个用逗号分隔',
      'nc (可选) - 排除指定国家',
      'protocol (可选) - 筛选协议类型',
      'limit (可选) - 限制返回数量'
    ],
    note: '🔑 此接口使用 URL 参数认证，需要在 URL 中添加 username 和 password 参数。仅返回代理节点列表（YAML 格式），不包含完整配置。适合用于自定义 Clash 配置文件',
    example: 'curl "http://localhost:5000/clash/proxies?username=admin&password=admin123&nc=CN&limit=100"'
  }
]

const v2rayApis: ApiItem[] = [
  {
    method: 'GET',
    path: '/v2ray',
    description: '获取 V2Ray 订阅配置（VMess 格式，URL 参数认证）',
    params: [
      'username (必填) - 用户名',
      'password (必填) - 密码',
      'c (可选) - 按国家筛选，多个用逗号分隔，如 c=CN,US',
      'nc (可选) - 排除指定国家，如 nc=CN',
      'protocol (可选) - 筛选协议类型：http/https',
      'limit (可选) - 限制返回数量，默认全部'
    ],
    note: '🔑 此接口使用 URL 参数认证，需要在 URL 中添加 username 和 password 参数。返回 VMess 格式的订阅链接列表，每行一个 vmess:// 链接。仅支持 HTTP/HTTPS 代理转换为 VMess 节点。',
    example: 'curl "http://localhost:5000/v2ray?username=admin&password=admin123&c=CN,US&limit=50"'
  }
]

const subscriptionApis: ApiItem[] = [
  {
    method: 'POST',
    path: '/generate_subscription_links',
    description: '生成加密的订阅链接（需要认证）',
    body: {
      type: 'clash|v2ray|both',
      permanent: false,
      params: {
        c: 'CN,US',
        nc: 'CN',
        protocol: 'http',
        limit: 100
      }
    },
    note: '🔐 此接口需要认证。生成加密的订阅链接，无需在URL中暴露用户名和密码。支持生成临时链接（1小时有效期）或永久链接（不过期）。',
    example: 'curl -X POST -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" http://localhost:5000/generate_subscription_links -d \'{"type":"clash","permanent":true,"params":{"c":"CN,US","limit":50}}\'',
    response: `{
  "success": true,
  "links": {
    "clash": "http://localhost:5000/subscribe/clash?token=...",
    "v2ray": "http://localhost:5000/subscribe/v2ray?token=..."
  },
  "permanent": true,
  "expires_in": null,
  "message": "永久订阅链接生成成功"
}`
  },
  {
    method: 'GET',
    path: '/subscribe/clash',
    description: '加密的Clash订阅接口',
    params: [
      'token (必填) - 订阅token',
      'params (可选) - 编码的参数'
    ],
    note: '🔐 此接口使用加密token认证，无需在URL中暴露用户名和密码。返回完整的Clash配置。',
    example: 'curl "http://localhost:5000/subscribe/clash?token=YOUR_SUBSCRIPTION_TOKEN&params=ENCODED_PARAMS"'
  },
  {
    method: 'GET',
    path: '/subscribe/v2ray',
    description: '加密的V2Ray订阅接口',
    params: [
      'token (必填) - 订阅token',
      'params (可选) - 编码的参数'
    ],
    note: '🔐 此接口使用加密token认证，无需在URL中暴露用户名和密码。返回V2Ray订阅配置。',
    example: 'curl "http://localhost:5000/subscribe/v2ray?token=YOUR_SUBSCRIPTION_TOKEN&params=ENCODED_PARAMS"'
  }
]

const managementApis: ApiItem[] = [
  {
    method: 'GET',
    path: '/proxies_status',
    description: '获取代理状态和列表（需要认证）',
    params: ['limit (可选) - 限制返回数量，默认 1000'],
    note: '⚠️ 此接口需要认证。请在请求头中添加 Authorization: Bearer YOUR_TOKEN',
    example: 'curl -H "Authorization: Bearer YOUR_TOKEN" "http://localhost:5000/proxies_status?limit=500"'
  },
  {
    method: 'GET',
    path: '/fetchers_status',
    description: '获取爬取器状态和统计信息（需要认证）',
    note: '⚠️ 此接口需要认证。请在请求头中添加 Authorization: Bearer YOUR_TOKEN',
    example: 'curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/fetchers_status'
  },
  {
    method: 'POST',
    path: '/add_proxy',
    description: '手动添加代理到数据库（需要认证）',
    body: {
      fetcher_name: '手动添加',
      protocol: 'http',
      ip: '127.0.0.1',
      port: 8080,
      username: '可选',
      password: '可选',
      country: '可选',
      address: '可选'
    },
    note: '⚠️ 此接口需要认证。请在请求头中添加 Authorization: Bearer YOUR_TOKEN',
    example: 'curl -X POST -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" http://localhost:5000/add_proxy -d \'{"fetcher_name":"手动添加","protocol":"http","ip":"127.0.0.1","port":8080}\''
  },
  {
    method: 'GET',
    path: '/fetcher_enable',
    description: '启用或禁用指定爬取器（需要认证）',
    params: ['name (必填) - 爬取器名称', 'enable (必填) - 0=禁用, 1=启用'],
    note: '⚠️ 此接口需要认证。请在请求头中添加 Authorization: Bearer YOUR_TOKEN',
    example: 'curl -H "Authorization: Bearer YOUR_TOKEN" "http://localhost:5000/fetcher_enable?name=KuaidailiFetcher&enable=1"'
  },
  {
    method: 'GET',
    path: '/clear_fetchers_status',
    description: '清空所有爬取器的统计信息（需要认证）',
    note: '⚠️ 此接口需要认证。请在请求头中添加 Authorization: Bearer YOUR_TOKEN',
    example: 'curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/clear_fetchers_status'
  }
]

// 统计
const totalApis = computed(() => authApis.length + proxyApis.length + clashApis.length + v2rayApis.length + subscriptionApis.length + managementApis.length)
const getApis = computed(() => [...authApis, ...proxyApis, ...clashApis, ...v2rayApis, ...subscriptionApis, ...managementApis].filter(api => api.method === 'GET').length)
const postApis = computed(() => [...authApis, ...subscriptionApis, ...managementApis].filter(api => api.method === 'POST').length)

// API管理相关计算属性
const filteredApiList = computed(() => {
  if (!apiSearchText.value) {
    return apiList.value
  }
  return apiList.value.filter(api => 
    api.path.toLowerCase().includes(apiSearchText.value.toLowerCase()) ||
    api.category.toLowerCase().includes(apiSearchText.value.toLowerCase())
  )
})

// 方法颜色
const getMethodColor = (method: string) => {
  const colors: Record<string, string> = {
    'GET': 'blue',
    'POST': 'green',
    'PUT': 'orange',
    'DELETE': 'red'
  }
  return colors[method] || 'default'
}

// 获取完整 URL
const getFullUrl = (path: string) => {
  return `http://localhost:5000${path}`
}

// 后端状态检测现在由 useBackendStatus composable 提供

// 复制到剪贴板
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    message.success('已复制到剪贴板')
  } catch (err) {
    message.error('复制失败')
  }
}

// 测试 API
const testApi = (api: ApiItem) => {
  const url = getFullUrl(api.path)
  window.open(url, '_blank')
  message.info('已在新标签页打开')
}

// 生成订阅链接
const generateSubscription = async (type: 'clash' | 'v2ray' | 'both') => {
  try {
    generating.value = true
    subscriptionLinks.value = null
    
    const token = localStorage.getItem('token')
    if (!token) {
      message.error('请先登录')
      return
    }
    
    const response = await fetch('/generate_subscription_links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        type: type,
        permanent: permanentSubscription.value,
        params: {
          limit: 100
        }
      })
    })
    
    const data = await response.json()
    
    if (data.success) {
      subscriptionLinks.value = data.links
      message.success('订阅链接生成成功')
    } else {
      message.error(data.message || '生成订阅链接失败')
    }
  } catch (error) {
    console.error('生成订阅链接失败:', error)
    message.error('生成订阅链接失败')
  } finally {
    generating.value = false
  }
}

// 生成订阅链接（API文档中的按钮）
const generateSubscriptionLinks = async (api: ApiItem) => {
  if (api.path === '/generate_subscription_links') {
    await generateSubscription('both')
  }
}

// API管理相关函数
const loadApiStatus = async () => {
  try {
    loadingApiStatus.value = true
    const token = localStorage.getItem('token')
    if (!token) {
      message.error('请先登录')
      return
    }

    const config = useRuntimeConfig()
    const baseURL = config.public.apiBase as string
    const response = await fetch(`${baseURL}/api_status`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    if (data.success) {
      apiList.value = data.apis.map((api: any) => ({
        ...api,
        toggling: false
      }))
    } else {
      message.error(data.message || '获取API状态失败')
    }
  } catch (error: any) {
    console.error('加载API状态失败:', error)
    if (error.code === 'ERR_NETWORK') {
      message.error('无法连接到后端服务，请检查服务是否启动')
    } else if (error.code === 'ECONNABORTED') {
      message.error('请求超时，后端服务可能响应缓慢')
    } else {
      message.error('加载API状态失败')
    }
  } finally {
    loadingApiStatus.value = false
  }
}

const toggleApiStatus = async (record: any) => {
  try {
    record.toggling = true
    const token = localStorage.getItem('token')
    if (!token) {
      message.error('请先登录')
      return
    }

    const config = useRuntimeConfig()
    const baseURL = config.public.apiBase as string
    const response = await fetch(`${baseURL}/api_toggle${record.path}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    if (data.success) {
      record.enabled = data.enabled
      message.success(data.message)
    } else {
      message.error(data.message || '切换API状态失败')
    }
  } catch (error) {
    console.error('切换API状态失败:', error)
    message.error('切换API状态失败')
  } finally {
    record.toggling = false
  }
}

const enableAllApis = async () => {
  try {
    bulkOperation.value = true
    const token = localStorage.getItem('token')
    if (!token) {
      message.error('请先登录')
      return
    }

    const config = useRuntimeConfig()
    const baseURL = config.public.apiBase as string
    
    // 批量启用所有API
    const promises = apiList.value.map(api => 
      fetch(`${baseURL}/api_toggle${api.path}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }).then(res => res.json())
    )

    await Promise.all(promises)
    await loadApiStatus()
    message.success('所有API已启用')
  } catch (error) {
    console.error('批量启用API失败:', error)
    message.error('批量启用API失败')
  } finally {
    bulkOperation.value = false
  }
}

const disableAllApis = async () => {
  try {
    bulkOperation.value = true
    const token = localStorage.getItem('token')
    if (!token) {
      message.error('请先登录')
      return
    }

    const config = useRuntimeConfig()
    const baseURL = config.public.apiBase as string
    
    // 批量禁用所有API
    const promises = apiList.value.map(api => 
      fetch(`${baseURL}/api_toggle${api.path}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }).then(res => res.json())
    )

    await Promise.all(promises)
    await loadApiStatus()
    message.success('所有API已禁用')
  } catch (error) {
    console.error('批量禁用API失败:', error)
    message.error('批量禁用API失败')
  } finally {
    bulkOperation.value = false
  }
}

const filterApis = () => {
  // 搜索功能由计算属性处理
}

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    'auth': 'red',
    'proxy': 'blue',
    'clash': 'purple',
    'v2ray': 'orange',
    'subscription': 'green',
    'management': 'cyan'
  }
  return colors[category] || 'default'
}

const getCategoryName = (category: string) => {
  const names: Record<string, string> = {
    'auth': '认证',
    'proxy': '代理',
    'clash': 'Clash',
    'v2ray': 'V2Ray',
    'subscription': '订阅',
    'management': '管理'
  }
  return names[category] || category
}

// 页面加载时获取API状态
onMounted(() => {
  // 获取API基础URL并启动定期状态检测
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase as string
  startPeriodicCheck(30, baseURL)
  loadApiStatus()
})
</script>

<style scoped>
.api-page {
  max-width: 1400px;
  margin: 0 auto;
  background: var(--bg-primary);
  min-height: 100vh;
  padding: 24px;
  transition: all var(--transition-normal);
}

/* 深色模式API页面 */
.dark .api-page {
  background: var(--bg-primary);
}

/* 页面标题 */
.page-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
  transition: all var(--transition-normal);
}

/* 深色模式页面标题 */
.dark .page-header {
  border-bottom: 2px solid var(--border-color);
}

.page-title {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
  color: rgba(0, 0, 0, 0.85);
  transition: all var(--transition-normal);
}

/* 深色模式页面标题文字 */
.dark .page-title {
  color: var(--text-primary);
}

.page-description {
  margin: 0;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.45);
  transition: all var(--transition-normal);
}

/* 深色模式页面描述 */
.dark .page-description {
  color: var(--text-secondary);
}

/* 统计卡片 */
.stats-row {
  margin-bottom: 24px;
}

/* 深色模式统计卡片 */
.dark .stat-card {
  background: var(--bg-card) !important;
  border: 1px solid var(--border-color) !important;
  color: var(--text-primary) !important;
}

.dark .stat-label {
  color: var(--text-secondary) !important;
}

.dark .stat-value {
  color: var(--text-primary) !important;
}

.stat-card {
  padding: 20px;
  border-radius: 12px;
  color: white;
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 100px;
}

.stat-icon {
  font-size: 32px;
  opacity: 0.9;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 10px;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 12px;
  opacity: 0.9;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  line-height: 1;
}

.stat-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 12px;
}

.gradient-bg-blue {
  background: linear-gradient(135deg, #667eea 0%, #1890ff 100%);
}

.gradient-bg-green {
  background: linear-gradient(135deg, #52c41a 0%, #95de64 100%);
}

.gradient-bg-orange {
  background: linear-gradient(135deg, #faad14 0%, #ffc53d 100%);
}

.gradient-bg-purple {
  background: linear-gradient(135deg, #722ed1 0%, #9254de 100%);
}

/* API 折叠面板 */
.api-collapse {
  background: #fff;
  border-radius: 12px;
  margin-bottom: 24px;
  transition: all var(--transition-normal);
}

/* 深色模式API折叠面板 */
.dark .api-collapse {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
}

.api-collapse :deep(.ant-collapse-item) {
  border-bottom: 1px solid #f0f0f0;
  transition: all var(--transition-normal);
}

/* 深色模式折叠面板项 */
.dark .api-collapse :deep(.ant-collapse-item) {
  border-bottom: 1px solid var(--border-color);
}

.api-collapse :deep(.ant-collapse-item:last-child) {
  border-bottom: none;
}

/* 深色模式折叠面板头部 */
.dark .api-collapse :deep(.ant-collapse-header) {
  background: var(--bg-card) !important;
  color: var(--text-primary) !important;
  border-bottom: 1px solid var(--border-color) !important;
}

.dark .api-collapse :deep(.ant-collapse-content) {
  background: var(--bg-card) !important;
  color: var(--text-primary) !important;
}

.dark .api-collapse :deep(.ant-collapse-content-box) {
  background: var(--bg-card) !important;
  color: var(--text-primary) !important;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  font-size: 16px;
  transition: all var(--transition-normal);
}

/* 深色模式面板头部 */
.dark .panel-header {
  color: var(--text-primary);
}

.panel-icon {
  font-size: 20px;
  color: #1890ff;
  transition: all var(--transition-normal);
}

/* 深色模式面板图标 */
.dark .panel-icon {
  color: #1890ff !important;
}

.panel-title {
  flex: 1;
  transition: all var(--transition-normal);
}

/* 深色模式面板标题 */
.dark .panel-title {
  color: var(--text-primary) !important;
}

/* API 项目 */
.api-item {
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  margin-bottom: 16px;
  transition: all var(--transition-normal);
}

/* 深色模式API项目 */
.dark .api-item {
  background: var(--bg-secondary);
}

.api-item:last-child {
  margin-bottom: 0;
}

.api-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  transition: all var(--transition-normal);
}

/* 深色模式API头部 */
.dark .api-header {
  color: var(--text-primary);
}

.dark .api-path {
  color: var(--text-primary) !important;
  background: var(--bg-card) !important;
  border: 1px solid var(--border-color) !important;
}

.api-path {
  flex: 1;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  background: #fff;
  padding: 4px 12px;
  border-radius: 4px;
  border: 1px solid #d9d9d9;
  transition: all var(--transition-normal);
}

/* 深色模式API路径 */
.dark .api-path {
  background: var(--bg-card) !important;
  border: 1px solid var(--border-color) !important;
  color: var(--text-primary) !important;
}

.api-desc {
  margin-bottom: 8px;
  color: rgba(0, 0, 0, 0.65);
  transition: all var(--transition-normal);
}

/* 深色模式API描述 */
.dark .api-desc {
  color: var(--text-secondary) !important;
}

.api-params,
.api-body,
.api-note {
  margin: 8px 0;
  font-size: 13px;
  transition: all var(--transition-normal);
}

/* 深色模式API参数和内容 */
.dark .api-params,
.dark .api-body,
.dark .api-note {
  color: var(--text-primary) !important;
}

.dark .api-params strong,
.dark .api-body strong,
.dark .api-note strong {
  color: var(--text-primary) !important;
}

.api-params code,
.api-body code {
  background: #fff;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  color: #d4380d;
  transition: all var(--transition-normal);
}

/* 深色模式代码块 */
.dark .api-params code,
.dark .api-body code {
  background: var(--bg-card) !important;
  border: 1px solid var(--border-color) !important;
  color: #ff7875 !important;
}

.api-note {
  padding: 8px 12px;
  background: #e6f7ff;
  border-left: 3px solid #1890ff;
  border-radius: 4px;
  color: rgba(0, 0, 0, 0.65);
  transition: all var(--transition-normal);
}

/* 深色模式API注释 */
.dark .api-note {
  background: rgba(24, 144, 255, 0.1) !important;
  border-left: 3px solid #1890ff !important;
  color: var(--text-primary) !important;
}

.api-example {
  margin: 8px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all var(--transition-normal);
}

/* 深色模式API示例 */
.dark .api-example {
  color: var(--text-primary) !important;
}

.dark .api-example strong {
  color: var(--text-primary) !important;
}

.example-code {
  flex: 1;
  background: #fff;
  padding: 8px 12px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  overflow-x: auto;
  border: 1px solid #d9d9d9;
  transition: all var(--transition-normal);
}

/* 深色模式示例代码 */
.dark .example-code {
  background: var(--bg-card) !important;
  border: 1px solid var(--border-color) !important;
  color: var(--text-primary) !important;
}

.api-response {
  margin-top: 8px;
  transition: all var(--transition-normal);
}

/* 深色模式API响应 */
.dark .api-response {
  color: var(--text-primary) !important;
}

.dark .api-response strong {
  color: var(--text-primary) !important;
}

.response-code {
  background: #fff;
  padding: 12px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  overflow-x: auto;
  margin: 4px 0 0 0;
  border: 1px solid #d9d9d9;
  transition: all var(--transition-normal);
}

/* 深色模式响应代码 */
.dark .response-code {
  background: var(--bg-card) !important;
  border: 1px solid var(--border-color) !important;
  color: var(--text-primary) !important;
}

.body-code {
  background: #fff;
  padding: 12px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  overflow-x: auto;
  margin: 4px 0 0 0;
  border: 1px solid #d9d9d9;
  transition: all var(--transition-normal);
}

/* 深色模式请求体代码 */
.dark .body-code {
  background: var(--bg-card) !important;
  border: 1px solid var(--border-color) !important;
  color: var(--text-primary) !important;
}

/* 认证说明 */
.auth-notice {
  margin-bottom: 24px;
  border-radius: 12px;
  transition: all var(--transition-normal);
}

/* 深色模式认证说明 */
.dark .auth-notice {
  background: var(--bg-card) !important;
  border: 1px solid var(--border-color) !important;
}

.auth-desc {
  margin-top: 8px;
  transition: all var(--transition-normal);
}

/* 深色模式认证描述 */
.dark .auth-desc {
  color: var(--text-primary) !important;
}

.auth-desc p {
  margin: 8px 0;
  line-height: 1.6;
  transition: all var(--transition-normal);
}

/* 深色模式认证描述段落 */
.dark .auth-desc p {
  color: var(--text-primary) !important;
}

.auth-desc code {
  background: rgba(0, 0, 0, 0.06);
  padding: 2px 8px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #d4380d;
  transition: all var(--transition-normal);
}

/* 深色模式认证描述代码 */
.dark .auth-desc code {
  background: var(--bg-secondary) !important;
  color: #ff7875 !important;
}

/* 深色模式请求方式标签 */
.dark .api-header :deep(.ant-tag) {
  background: var(--bg-card) !important;
  color: var(--text-primary) !important;
  border: 1px solid var(--border-color) !important;
}

.dark .api-header :deep(.ant-tag-blue) {
  background: #1890ff !important;
  color: #fff !important;
  border: 1px solid #1890ff !important;
}

.dark .api-header :deep(.ant-tag-green) {
  background: #52c41a !important;
  color: #fff !important;
  border: 1px solid #52c41a !important;
}

.dark .api-header :deep(.ant-tag-orange) {
  background: #fa8c16 !important;
  color: #fff !important;
  border: 1px solid #fa8c16 !important;
}

.dark .api-header :deep(.ant-tag-red) {
  background: #ff4d4f !important;
  color: #fff !important;
  border: 1px solid #ff4d4f !important;
}

/* 深色模式面板标题中的接口数标签 */
.dark .panel-header :deep(.ant-tag) {
  background: var(--bg-card) !important;
  color: var(--text-primary) !important;
  border: 1px solid var(--border-color) !important;
}

.dark .panel-header :deep(.ant-tag-red) {
  background: #ff4d4f !important;
  color: #fff !important;
  border: 1px solid #ff4d4f !important;
}

.dark .panel-header :deep(.ant-tag-blue) {
  background: #1890ff !important;
  color: #fff !important;
  border: 1px solid #1890ff !important;
}

.dark .panel-header :deep(.ant-tag-purple) {
  background: #722ed1 !important;
  color: #fff !important;
  border: 1px solid #722ed1 !important;
}

.dark .panel-header :deep(.ant-tag-orange) {
  background: #fa8c16 !important;
  color: #fff !important;
  border: 1px solid #fa8c16 !important;
}

.dark .panel-header :deep(.ant-tag-green) {
  background: #52c41a !important;
  color: #fff !important;
  border: 1px solid #52c41a !important;
}

/* 深色模式API操作按钮 */
.dark .api-header :deep(.ant-btn) {
  background: var(--bg-card) !important;
  color: var(--text-primary) !important;
  border: 1px solid var(--border-color) !important;
}

.dark .api-header :deep(.ant-btn:hover) {
  background: var(--bg-secondary) !important;
  color: var(--text-primary) !important;
  border: 1px solid var(--border-color) !important;
}

.dark .api-header :deep(.ant-btn-link) {
  background: transparent !important;
  color: #1890ff !important;
  border: none !important;
}

.dark .api-header :deep(.ant-btn-link:hover) {
  background: rgba(24, 144, 255, 0.1) !important;
  color: #40a9ff !important;
  border: none !important;
}

/* 深色模式API管理表格 */
.dark .api-management-table :deep(.ant-table) {
  background: var(--bg-card) !important;
  color: var(--text-primary) !important;
}

.dark .api-management-table :deep(.ant-table-thead > tr > th) {
  background: #2d2d2d !important;
  color: var(--text-primary) !important;
  border-bottom: 1px solid var(--border-color) !important;
}

.dark .api-management-table :deep(.ant-table-tbody > tr) {
  background: var(--bg-card) !important;
}

.dark .api-management-table :deep(.ant-table-tbody > tr:hover) {
  background: #2d2d2d !important;
}

.dark .api-management-table :deep(.ant-table-tbody > tr > td) {
  background: var(--bg-card) !important;
  color: var(--text-primary) !important;
  border-bottom: 1px solid var(--border-color) !important;
}

/* 深色模式表格中的开关 */
.dark .api-management-table :deep(.ant-switch) {
  background: var(--bg-secondary) !important;
}

.dark .api-management-table :deep(.ant-switch-checked) {
  background: #1890ff !important;
}

/* 深色模式表格中的标签 */
.dark .api-management-table :deep(.ant-tag) {
  background: var(--bg-secondary) !important;
  color: var(--text-primary) !important;
  border: 1px solid var(--border-color) !important;
}

.dark .api-management-table :deep(.ant-tag-blue) {
  background: #1890ff !important;
  color: #fff !important;
  border: 1px solid #1890ff !important;
}

.dark .api-management-table :deep(.ant-tag-red) {
  background: #ff4d4f !important;
  color: #fff !important;
  border: 1px solid #ff4d4f !important;
}

/* 动画 */
.fade-in {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 状态指示器 */
.status-indicator {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
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

.status-error {
  font-size: 12px;
  color: #ff4d4f;
  margin-top: 4px;
  word-break: break-all;
}

/* 深色模式状态错误 */
.dark .status-error {
  color: #ff7875;
}

/* 离线消息样式 */
.offline-message {
  padding: 40px 20px;
  text-align: center;
  background: var(--bg-card);
  border-radius: 8px;
  margin: 20px 0;
}

.checking-message {
  padding: 40px 20px;
  text-align: center;
  background: var(--bg-card);
  border-radius: 8px;
  margin: 20px 0;
}

.checking-content {
  color: var(--text-secondary);
}

/* 深色模式离线消息 */
.dark .offline-message {
  background: var(--bg-card);
}

.dark .checking-message {
  background: var(--bg-card);
}

.dark .checking-content {
  color: var(--text-secondary);
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* 订阅按钮区域 */
.subscription-buttons {
  margin-top: 24px;
  padding: 20px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

/* API管理样式 */
.api-management-content {
  padding: 20px 0;
}

.management-notice {
  margin-bottom: 20px;
}

.api-controls {
  margin-bottom: 20px;
}

.api-management-table {
  margin-top: 16px;
}

.api-management-table .ant-table-tbody > tr > td {
  vertical-align: middle;
}

.api-management-table .ant-switch {
  margin: 0;
}

/* 订阅选项 */
.subscription-options {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  padding: 12px 16px;
  background: #fff;
  border-radius: 6px;
  border: 1px solid #e8e8e8;
}

.permanent-checkbox {
  margin: 0;
}

.option-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
}

.help-icon {
  color: #8c8c8c;
  cursor: help;
}

.help-icon:hover {
  color: #1890ff;
}

.button-group {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.button-group .ant-btn {
  min-width: 120px;
  height: 48px;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* 订阅链接显示区域 */
.subscription-links {
  margin-top: 24px;
}

/* 链接类型标识 */
.link-type-badge {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: #fff;
  border-radius: 6px;
  border: 1px solid #e8e8e8;
}

.type-tag {
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.expire-info {
  color: #8c8c8c;
  font-size: 13px;
}

.link-item {
  margin-bottom: 16px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
}

.link-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.link-icon {
  font-size: 16px;
  color: #1890ff;
}

.link-title {
  font-weight: 600;
  color: rgba(0, 0, 0, 0.85);
  flex: 1;
}

.link-url {
  display: block;
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  word-break: break-all;
  border: 1px solid #d9d9d9;
  color: #262626;
}

.link-info {
  margin-top: 16px;
}

.link-info ul {
  margin: 8px 0 0 0;
  padding-left: 20px;
}

.link-info li {
  margin-bottom: 4px;
  color: rgba(0, 0, 0, 0.65);
}
</style>
