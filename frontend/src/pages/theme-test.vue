<template>
  <div class="theme-test-page">
    <a-card title="主题切换测试页面" class="test-card enhanced-card">
      <div class="test-content">
        <div class="theme-header">
          <h2>当前主题模式：{{ themeMode }}</h2>
          <div class="theme-indicator">
            <div class="indicator-dot" :class="themeMode"></div>
            <span>{{ themeLabel }}</span>
          </div>
        </div>
        <p>这是一个用于测试主题切换效果的页面，展示了不同主题下的视觉美化效果。</p>
        
        <div class="test-sections">
          <a-card title="颜色测试" class="section-card enhanced-card">
            <div class="color-grid">
              <div class="color-item primary">
                <div class="color-preview"></div>
                <span>主色调</span>
              </div>
              <div class="color-item success">
                <div class="color-preview"></div>
                <span>成功色</span>
              </div>
              <div class="color-item warning">
                <div class="color-preview"></div>
                <span>警告色</span>
              </div>
              <div class="color-item error">
                <div class="color-preview"></div>
                <span>错误色</span>
              </div>
            </div>
          </a-card>
          
          <a-card title="组件测试" class="section-card enhanced-card">
            <div class="component-test">
              <a-button type="primary" class="enhanced-button">主要按钮</a-button>
              <a-button class="enhanced-button">默认按钮</a-button>
              <a-button type="dashed" class="enhanced-button">虚线按钮</a-button>
              <a-button type="link" class="enhanced-button">链接按钮</a-button>
            </div>
            
            <div class="form-test">
              <a-input placeholder="输入框测试" class="enhanced-input" />
              <a-select placeholder="选择器测试" class="enhanced-select" style="width: 200px">
                <a-select-option value="option1">选项1</a-select-option>
                <a-select-option value="option2">选项2</a-select-option>
              </a-select>
            </div>
          </a-card>
          
          <a-card title="文本测试" class="section-card enhanced-card">
            <div class="text-test">
              <h1>标题1</h1>
              <h2>标题2</h2>
              <h3>标题3</h3>
              <p>这是一段普通文本，用于测试在不同主题下的显示效果。</p>
              <p class="text-secondary">这是次要文本。</p>
              <p class="text-disabled">这是禁用文本。</p>
            </div>
          </a-card>
          
          <a-card title="特殊效果测试" class="section-card enhanced-card">
            <div class="effects-test">
              <div class="gradient-box">
                <h4>渐变背景</h4>
                <p>展示主题特定的渐变效果</p>
              </div>
              <div class="glass-effect">
                <h4>玻璃态效果</h4>
                <p>毛玻璃背景效果</p>
              </div>
              <div class="neon-effect">
                <h4>霓虹效果</h4>
                <p>发光边框效果</p>
              </div>
            </div>
          </a-card>
        </div>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { useTheme } from '~/composables/useTheme'

const { themeMode, themeLabel } = useTheme()
</script>

<style scoped>
.theme-test-page {
  padding: 24px;
  min-height: 100vh;
  background: var(--bg-primary);
  transition: all var(--transition-normal);
  position: relative;
}

.test-card {
  max-width: 1200px;
  margin: 0 auto;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  box-shadow: var(--box-shadow);
  transition: all var(--transition-normal);
}

.theme-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 16px;
  background: var(--accent-light);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
}

.theme-header h2 {
  color: var(--text-primary);
  margin: 0;
  transition: color var(--transition-normal);
}

.theme-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
}

.indicator-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  transition: all var(--transition-normal);
}

.indicator-dot.light {
  background: #faad14;
  box-shadow: 0 0 8px rgba(250, 173, 20, 0.5);
}

.indicator-dot.dark {
  background: #722ed1;
  box-shadow: 0 0 8px rgba(114, 46, 209, 0.5);
}


.test-content p {
  color: var(--text-secondary);
  margin-bottom: 24px;
  transition: color var(--transition-normal);
}

.test-sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-top: 24px;
}

.section-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  transition: all var(--transition-normal);
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.color-item {
  padding: 16px;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
  color: white;
  transition: all var(--transition-normal);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.color-preview {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.color-item.primary {
  background: var(--primary-color);
}

.color-item.primary .color-preview {
  background: var(--primary-color);
}

.color-item.success {
  background: var(--success-color);
}

.color-item.success .color-preview {
  background: var(--success-color);
}

.color-item.warning {
  background: var(--warning-color);
}

.color-item.warning .color-preview {
  background: var(--warning-color);
}

.color-item.error {
  background: var(--error-color);
}

.color-item.error .color-preview {
  background: var(--error-color);
}

.component-test {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.form-test {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.enhanced-input,
.enhanced-select {
  border-radius: var(--border-radius);
  transition: all var(--transition-normal);
}

.enhanced-input:focus,
.enhanced-select:focus {
  box-shadow: 0 0 0 2px var(--accent-color);
}

.text-test h1,
.text-test h2,
.text-test h3 {
  color: var(--text-primary);
  margin: 16px 0 8px 0;
  transition: color var(--transition-normal);
}

.text-test p {
  color: var(--text-primary);
  margin: 8px 0;
  transition: color var(--transition-normal);
}

.text-test .text-secondary {
  color: var(--text-secondary);
}

.text-test .text-disabled {
  color: var(--text-disabled);
}

/* 特殊效果测试 */
.effects-test {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.gradient-box {
  padding: 20px;
  border-radius: var(--border-radius);
  background: var(--gradient-primary);
  color: white;
  text-align: center;
  transition: all var(--transition-normal);
}

.gradient-box:hover {
  transform: translateY(-2px);
  box-shadow: var(--box-shadow-hover);
}

.glass-effect {
  padding: 20px;
  border-radius: var(--border-radius);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--text-primary);
  text-align: center;
  transition: all var(--transition-normal);
}

.glass-effect:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.neon-effect {
  padding: 20px;
  border-radius: var(--border-radius);
  background: var(--bg-card);
  border: 2px solid var(--accent-color);
  color: var(--text-primary);
  text-align: center;
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.neon-effect::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, var(--accent-color), transparent);
  transition: left 0.6s ease;
}

.neon-effect:hover::before {
  left: 100%;
}

.neon-effect:hover {
  box-shadow: 0 0 20px var(--accent-color);
  transform: translateY(-2px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .theme-test-page {
    padding: 16px;
  }
  
  .test-sections {
    grid-template-columns: 1fr;
  }
  
  .component-test,
  .form-test {
    flex-direction: column;
  }
  
  .theme-header {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
  
  .effects-test {
    grid-template-columns: 1fr;
  }
}
</style>
