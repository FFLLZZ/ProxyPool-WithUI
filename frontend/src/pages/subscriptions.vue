<template>
  <div class="subscriptions-page">
    <a-card title="订阅链接管理" class="main-card">
      <template #extra>
        <a-button type="primary" @click="refreshLinks">
          <template #icon>
            <ReloadOutlined />
          </template>
          刷新
        </a-button>
      </template>

      <!-- 统计信息 -->
      <a-row :gutter="16" class="stats-row">
        <a-col :span="6">
          <a-statistic title="总订阅数" :value="subscriptionStats.total" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="Clash订阅" :value="subscriptionStats.clash" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="V2Ray订阅" :value="subscriptionStats.v2ray" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="永久链接" :value="subscriptionStats.permanent" />
        </a-col>
      </a-row>

      <!-- 筛选和搜索 -->
      <div class="filter-section">
        <a-row :gutter="16" align="middle">
          <a-col :span="6">
            <a-select
              v-model:value="filters.type"
              placeholder="选择类型"
              allow-clear
              style="width: 100%"
            >
              <a-select-option value="">全部类型</a-select-option>
              <a-select-option value="clash">Clash</a-select-option>
              <a-select-option value="v2ray">V2Ray</a-select-option>
            </a-select>
          </a-col>
          <a-col :span="6">
            <a-select
              v-model:value="filters.permanent"
              placeholder="链接类型"
              allow-clear
              style="width: 100%"
            >
              <a-select-option value="">全部</a-select-option>
              <a-select-option :value="true">永久链接</a-select-option>
              <a-select-option :value="false">临时链接</a-select-option>
            </a-select>
          </a-col>
          <a-col :span="8">
            <a-input-search
              v-model:value="filters.search"
              placeholder="搜索链接或参数"
              enter-button
              @search="handleSearch"
            />
          </a-col>
          <a-col :span="4">
            <a-button @click="clearFilters">清除筛选</a-button>
          </a-col>
        </a-row>
      </div>

      <!-- 订阅链接列表 -->
      <a-table
        :columns="columns"
        :data-source="filteredLinks"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        class="subscription-table"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'type'">
            <a-tag :color="record.type === 'clash' ? 'blue' : 'green'">
              {{ record.type === 'clash' ? 'Clash' : 'V2Ray' }}
            </a-tag>
          </template>

          <template v-if="column.key === 'permanent'">
            <a-tag :color="record.permanent ? 'green' : 'orange'">
              {{ record.permanent ? '永久' : '临时' }}
            </a-tag>
          </template>

          <template v-if="column.key === 'url'">
            <div class="url-cell">
              <a-input
                :value="record.url"
                readonly
                class="url-input"
              />
              <a-button
                type="link"
                size="small"
                @click="copyUrl(record.url)"
              >
                <template #icon>
                  <CopyOutlined />
                </template>
              </a-button>
            </div>
          </template>

          <template v-if="column.key === 'params'">
            <div v-if="record.params && Object.keys(record.params).length > 0">
              <a-tag v-for="(value, key) in record.params" :key="key" size="small">
                {{ key }}: {{ value }}
              </a-tag>
            </div>
            <span v-else class="text-muted">无参数</span>
          </template>

          <template v-if="column.key === 'expires_at'">
            <span v-if="record.permanent" class="text-success">永不过期</span>
            <span v-else-if="record.expires_at">
              {{ formatDate(record.expires_at) }}
            </span>
            <span v-else class="text-muted">-</span>
          </template>

          <template v-if="column.key === 'status'">
            <a-tag
              :color="getStatusColor(record)"
              :class="{ 'blink': isExpiringSoon(record) }"
            >
              {{ getStatusText(record) }}
            </a-tag>
          </template>

          <template v-if="column.key === 'actions'">
            <a-space>
              <a-button
                type="link"
                size="small"
                @click="copyUrl(record.url)"
              >
                <template #icon>
                  <CopyOutlined />
                </template>
                复制
              </a-button>
              
              <a-button
                type="link"
                size="small"
                @click="refreshLink(record)"
                :loading="record.refreshing"
              >
                <template #icon>
                  <ReloadOutlined />
                </template>
                刷新
              </a-button>
              
              <a-popconfirm
                title="确定要删除这个订阅链接吗？"
                @confirm="deleteLink(record)"
                ok-text="确定"
                cancel-text="取消"
              >
                <a-button
                  type="link"
                  size="small"
                  danger
                >
                  <template #icon>
                    <DeleteOutlined />
                  </template>
                  删除
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>

      <!-- 空状态 -->
      <a-empty
        v-if="!loading && filteredLinks.length === 0"
        description="暂无订阅链接"
        class="empty-state"
      >
        <template #image>
          <LinkOutlined style="font-size: 64px; color: #d9d9d9;" />
        </template>
        <a-button type="primary" @click="$router.push('/')">
          去生成订阅链接
        </a-button>
      </a-empty>
    </a-card>

    <!-- 批量操作 -->
    <a-card v-if="selectedRowKeys.length > 0" class="batch-actions-card">
      <div class="batch-actions">
        <span>已选择 {{ selectedRowKeys.length }} 项</span>
        <a-space>
          <a-button @click="batchCopy">
            <template #icon>
              <CopyOutlined />
            </template>
            批量复制
          </a-button>
          <a-button @click="batchRefresh" :loading="batchRefreshing">
            <template #icon>
              <ReloadOutlined />
            </template>
            批量刷新
          </a-button>
          <a-popconfirm
            title="确定要删除选中的订阅链接吗？"
            @confirm="batchDelete"
            ok-text="确定"
            cancel-text="取消"
          >
            <a-button danger>
              <template #icon>
                <DeleteOutlined />
              </template>
              批量删除
            </a-button>
          </a-popconfirm>
        </a-space>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { useTheme } from '~/composables/useTheme'
import {
  ReloadOutlined,
  CopyOutlined,
  DeleteOutlined,
  LinkOutlined
} from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 主题管理
const { themeMode } = useTheme()

// 响应式数据
const loading = ref(false)
const batchRefreshing = ref(false)
const selectedRowKeys = ref<string[]>([])

// 订阅链接数据
const subscriptionLinks = ref<any[]>([])

// 筛选条件
const filters = reactive({
  type: '',
  permanent: '',
  search: ''
})

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number, range: [number, number]) => 
    `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
})

// 表格列配置
const columns = [
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type',
    width: 80,
    align: 'center'
  },
  {
    title: '链接类型',
    dataIndex: 'permanent',
    key: 'permanent',
    width: 100,
    align: 'center'
  },
  {
    title: '订阅链接',
    dataIndex: 'url',
    key: 'url',
    ellipsis: true
  },
  {
    title: '参数',
    dataIndex: 'params',
    key: 'params',
    width: 200
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    key: 'created_at',
    width: 150,
    sorter: (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  },
  {
    title: '过期时间',
    dataIndex: 'expires_at',
    key: 'expires_at',
    width: 150
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    align: 'center'
  },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    align: 'center'
  }
]

// 计算属性
const filteredLinks = computed(() => {
  let result = subscriptionLinks.value

  // 类型筛选
  if (filters.type) {
    result = result.filter(link => link.type === filters.type)
  }

  // 链接类型筛选
  if (filters.permanent !== '') {
    result = result.filter(link => link.permanent === filters.permanent)
  }

  // 搜索筛选
  if (filters.search) {
    const search = filters.search.toLowerCase()
    result = result.filter(link => 
      link.url.toLowerCase().includes(search) ||
      JSON.stringify(link.params).toLowerCase().includes(search)
    )
  }

  return result
})

const subscriptionStats = computed(() => {
  const total = subscriptionLinks.value.length
  const clash = subscriptionLinks.value.filter(link => link.type === 'clash').length
  const v2ray = subscriptionLinks.value.filter(link => link.type === 'v2ray').length
  const permanent = subscriptionLinks.value.filter(link => link.permanent).length

  return { total, clash, v2ray, permanent }
})

// 方法
const loadSubscriptionLinks = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      message.error('请先登录')
      return
    }

    const config = useRuntimeConfig()
    const baseURL = config.public.apiBase as string
    const apiUrl = `${baseURL}/subscription_links`
    
    console.log('请求订阅链接API:', apiUrl)
    console.log('Token:', token ? '已获取' : '未获取')
    
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('响应状态:', response.status)
    console.log('响应头:', response.headers)

    if (!response.ok) {
      const responseText = await response.text()
      console.error('API错误响应:', responseText)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('API响应数据:', data)
    if (data.success) {
      subscriptionLinks.value = data.links.map((link: any) => ({
        ...link,
        refreshing: false
      }))
      pagination.total = data.links.length
    } else {
      message.error(data.message || '获取订阅链接失败')
    }
  } catch (error) {
    console.error('加载订阅链接失败:', error)
    message.error('加载订阅链接失败')
  } finally {
    loading.value = false
  }
}

const refreshLinks = () => {
  loadSubscriptionLinks()
}

const handleSearch = () => {
  // 搜索逻辑已在计算属性中处理
}

const clearFilters = () => {
  filters.type = ''
  filters.permanent = ''
  filters.search = ''
}

const copyUrl = async (url: string) => {
  try {
    await navigator.clipboard.writeText(url)
    message.success('链接已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    message.error('复制失败')
  }
}

const refreshLink = async (record: any) => {
  record.refreshing = true
  try {
    const token = localStorage.getItem('token')
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBase as string
    const response = await fetch(`${baseURL}/subscription_links/${record.id}/refresh`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()
    if (data.success) {
      record.url = data.new_url
      message.success('订阅链接刷新成功')
    } else {
      message.error(data.message || '刷新失败')
    }
  } catch (error) {
    console.error('刷新失败:', error)
    message.error('刷新失败')
  } finally {
    record.refreshing = false
  }
}

const deleteLink = async (record: any) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      message.error('请先登录')
      return
    }

    const config = useRuntimeConfig()
    const baseURL = config.public.apiBase as string
    const response = await fetch(`${baseURL}/subscription_links/${record.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()
    if (data.success) {
      message.success(data.message || '订阅链接删除成功')
      await loadSubscriptionLinks()
    } else {
      message.error(data.message || '删除失败')
    }
  } catch (error) {
    console.error('删除失败:', error)
    message.error('删除失败')
  }
}

const batchCopy = () => {
  const urls = selectedRowKeys.value
    .map(key => subscriptionLinks.value.find(link => link.id === key)?.url)
    .filter(Boolean)
    .join('\n')
  
  copyUrl(urls)
}

const batchRefresh = async () => {
  batchRefreshing.value = true
  try {
    const promises = selectedRowKeys.value.map(key => {
      const record = subscriptionLinks.value.find(link => link.id === key)
      return record ? refreshLink(record) : Promise.resolve()
    })
    
    await Promise.all(promises)
    message.success('批量刷新完成')
  } catch (error) {
    message.error('批量刷新失败')
  } finally {
    batchRefreshing.value = false
  }
}

const batchDelete = async () => {
  try {
    const promises = selectedRowKeys.value.map(key => {
      const record = subscriptionLinks.value.find(link => link.id === key)
      return record ? deleteLink(record) : Promise.resolve()
    })
    
    await Promise.all(promises)
    selectedRowKeys.value = []
    message.success('批量删除完成')
  } catch (error) {
    message.error('批量删除失败')
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const getStatusColor = (record: any) => {
  if (record.permanent) return 'green'
  if (isExpired(record)) return 'red'
  if (isExpiringSoon(record)) return 'orange'
  return 'blue'
}

const getStatusText = (record: any) => {
  if (record.permanent) return '有效'
  if (isExpired(record)) return '已过期'
  if (isExpiringSoon(record)) return '即将过期'
  return '有效'
}

const isExpired = (record: any) => {
  if (record.permanent || !record.expires_at) return false
  return new Date(record.expires_at) < new Date()
}

const isExpiringSoon = (record: any) => {
  if (record.permanent || !record.expires_at) return false
  const now = new Date()
  const expires = new Date(record.expires_at)
  const diff = expires.getTime() - now.getTime()
  return diff > 0 && diff < 30 * 60 * 1000 // 30分钟内过期
}

// 订阅链接现在保存到服务器的 sub.json 文件中

// 生命周期
onMounted(() => {
  loadSubscriptionLinks()
})
</script>

<style scoped>
.subscriptions-page {
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
  transition: all var(--transition-normal);
}

/* 深色模式订阅页面 */
.dark .subscriptions-page {
  background: var(--bg-primary);
}

.main-card {
  margin-bottom: 16px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  transition: all var(--transition-normal);
}

/* 深色模式主卡片 */
.dark .main-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
}

.stats-row {
  margin-bottom: 24px;
}

.filter-section {
  margin-bottom: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 6px;
  transition: all var(--transition-normal);
}

/* 深色模式筛选区域 */
.dark .filter-section {
  background: linear-gradient(135deg, #2d2d2d 0%, #3a3a3a 100%);
  border: 1px solid var(--border-color);
}

.subscription-table {
  margin-top: 16px;
}

/* 深色模式表格 */
.dark .subscription-table :deep(.ant-table) {
  background: var(--bg-card) !important;
  color: var(--text-primary) !important;
}

.dark .subscription-table :deep(.ant-table-thead > tr > th) {
  background: #2d2d2d !important;
  color: var(--text-primary) !important;
  border-bottom: 1px solid var(--border-color) !important;
}

.dark .subscription-table :deep(.ant-table-tbody > tr) {
  background: var(--bg-card) !important;
}

.dark .subscription-table :deep(.ant-table-tbody > tr:hover) {
  background: #2d2d2d !important;
}

.dark .subscription-table :deep(.ant-table-tbody > tr > td) {
  background: var(--bg-card) !important;
  color: var(--text-primary) !important;
  border-bottom: 1px solid var(--border-color) !important;
}

/* 深色模式选择框 */
.dark .filter-section :deep(.ant-select-selector) {
  background: var(--bg-card) !important;
  border: 1px solid var(--border-color) !important;
  color: var(--text-primary) !important;
}

.dark .filter-section :deep(.ant-select-selection-item) {
  color: var(--text-primary) !important;
}

.dark .filter-section :deep(.ant-select-selection-placeholder) {
  color: var(--text-secondary) !important;
}

/* 深色模式输入框 */
.dark .filter-section :deep(.ant-input) {
  background: var(--bg-card) !important;
  border: 1px solid var(--border-color) !important;
  color: var(--text-primary) !important;
}

.dark .filter-section :deep(.ant-input::placeholder) {
  color: var(--text-secondary) !important;
}

/* 深色模式按钮 */
.dark .filter-section :deep(.ant-btn) {
  background: var(--bg-card) !important;
  color: var(--text-primary) !important;
  border: 1px solid var(--border-color) !important;
}

.dark .filter-section :deep(.ant-btn:hover) {
  background: var(--bg-secondary) !important;
  color: var(--text-primary) !important;
  border: 1px solid var(--border-color) !important;
}

.dark .filter-section :deep(.ant-btn-primary) {
  background: #1890ff !important;
  color: #fff !important;
  border: 1px solid #1890ff !important;
}

.dark .filter-section :deep(.ant-btn-primary:hover) {
  background: #40a9ff !important;
  color: #fff !important;
  border: 1px solid #40a9ff !important;
}

/* 深色模式统计卡片 */
.dark .stats-row :deep(.ant-statistic-title) {
  color: var(--text-secondary) !important;
}

.dark .stats-row :deep(.ant-statistic-content) {
  color: var(--text-primary) !important;
}

.dark .stats-row :deep(.ant-statistic-content-value) {
  color: var(--text-primary) !important;
}

/* 深色模式主卡片标题 */
.dark .main-card :deep(.ant-card-head-title) {
  color: var(--text-primary) !important;
}

.dark .main-card :deep(.ant-card-extra) {
  color: var(--text-primary) !important;
}

/* 深色模式操作按钮 */
.dark .main-card :deep(.ant-btn) {
  background: var(--bg-card) !important;
  color: var(--text-primary) !important;
  border: 1px solid var(--border-color) !important;
}

.dark .main-card :deep(.ant-btn:hover) {
  background: var(--bg-secondary) !important;
  color: var(--text-primary) !important;
  border: 1px solid var(--border-color) !important;
}

.dark .main-card :deep(.ant-btn-primary) {
  background: #1890ff !important;
  color: #fff !important;
  border: 1px solid #1890ff !important;
}

.dark .main-card :deep(.ant-btn-primary:hover) {
  background: #40a9ff !important;
  color: #fff !important;
  border: 1px solid #40a9ff !important;
}

/* 深色模式表格操作按钮 */
.dark .subscription-table :deep(.ant-btn) {
  background: var(--bg-card) !important;
  color: var(--text-primary) !important;
  border: 1px solid var(--border-color) !important;
}

.dark .subscription-table :deep(.ant-btn:hover) {
  background: var(--bg-secondary) !important;
  color: var(--text-primary) !important;
  border: 1px solid var(--border-color) !important;
}

.dark .subscription-table :deep(.ant-btn-primary) {
  background: #1890ff !important;
  color: #fff !important;
  border: 1px solid #1890ff !important;
}

.dark .subscription-table :deep(.ant-btn-primary:hover) {
  background: #40a9ff !important;
  color: #fff !important;
  border: 1px solid #40a9ff !important;
}

/* 深色模式链接文本 */
.dark .url-cell {
  color: var(--text-primary) !important;
}

.dark .url-text {
  color: var(--text-primary) !important;
}

/* 深色模式标签 */
.dark .subscription-table :deep(.ant-tag) {
  background: var(--bg-secondary) !important;
  color: var(--text-primary) !important;
  border: 1px solid var(--border-color) !important;
}

.dark .subscription-table :deep(.ant-tag-blue) {
  background: #1890ff !important;
  color: #fff !important;
  border: 1px solid #1890ff !important;
}

.dark .subscription-table :deep(.ant-tag-green) {
  background: #52c41a !important;
  color: #fff !important;
  border: 1px solid #52c41a !important;
}

.dark .subscription-table :deep(.ant-tag-red) {
  background: #ff4d4f !important;
  color: #fff !important;
  border: 1px solid #ff4d4f !important;
}

.url-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.url-input {
  flex: 1;
}

.text-muted {
  color: #999;
}

.text-success {
  color: #52c41a;
}

.blink {
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.5; }
}

.empty-state {
  margin: 40px 0;
}

.batch-actions-card {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.batch-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.batch-actions span {
  font-weight: 500;
  color: #1890ff;
}
</style>
