<template>
  <div class="config-panel">
    <div class="config-content">
      <div class="config-sidebar">
        <div 
          v-for="category in categories" 
          :key="category.id"
          class="sidebar-item"
          :class="{ active: activeCategory === category.id }"
          @click="activeCategory = category.id"
        >
          <img :src="category.icon" :alt="category.name" class="sidebar-icon" />
          <span>{{ category.name }}</span>
        </div>
      </div>
      
      <div class="config-main">
        <!-- 外观设置 -->
        <div v-if="activeCategory === 'appearance'" class="config-section">
          <h3>外观</h3>
          
          <div class="config-group">
            <label>主题模式</label>
            <div class="theme-options">
              <div 
                class="theme-option"
                :class="{ active: theme.mode === 'light' }"
                @click="setThemeMode('light')"
              >
                <div class="theme-preview light-theme"></div>
                <span>浅色</span>
              </div>
              <div 
                class="theme-option"
                :class="{ active: theme.mode === 'dark' }"
                @click="setThemeMode('dark')"
              >
                <div class="theme-preview dark-theme"></div>
                <span>深色</span>
              </div>
              <div 
                class="theme-option"
                :class="{ active: theme.mode === 'blue' }"
                @click="setThemeMode('blue')"
              >
                <div class="theme-preview blue-theme"></div>
                <span>蓝色</span>
              </div>
              <div 
                class="theme-option"
                :class="{ active: theme.mode === 'green' }"
                @click="setThemeMode('green')"
              >
                <div class="theme-preview green-theme"></div>
                <span>绿色</span>
              </div>
              <div 
                class="theme-option"
                :class="{ active: theme.mode === 'purple' }"
                @click="setThemeMode('purple')"
              >
                <div class="theme-preview purple-theme"></div>
                <span>紫色</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 桌面设置 -->
        <div v-if="activeCategory === 'desktop'" class="config-section">
          <h3>桌面</h3>
          
          <div class="config-group">
            <label>桌面背景</label>
            <div class="background-options">
              <div 
                v-for="(bg, index) in backgroundOptions" 
                :key="index"
                class="background-option"
                :class="{ active: desktopConfig.background === bg }"
                @click="setDesktopBackground(bg)"
              >
                <div class="background-preview" :style="{ background: bg }"></div>
              </div>
            </div>
          </div>
          
          <div class="config-group">
            <label>图标设置</label>
            <div class="icon-settings">
              <div class="setting-item">
                <label>图标大小: {{ desktopConfig.iconSize }}px</label>
                <input 
                  type="range" 
                  min="32" 
                  max="96" 
                  step="4"
                  v-model.number="desktopConfig.iconSize"
                  @input="updateDesktopSettings"
                />
              </div>
              <div class="setting-item">
                <label>图标间距: {{ desktopConfig.iconSpacing }}px</label>
                <input 
                  type="range" 
                  min="5" 
                  max="30" 
                  step="1"
                  v-model.number="desktopConfig.iconSpacing"
                  @input="updateDesktopSettings"
                />
              </div>
              <div class="setting-item">
                <label>自动排列图标</label>
                <input 
                  type="checkbox"
                  v-model="desktopConfig.autoArrangeIcons"
                  @change="updateDesktopSettings"
                />
              </div>
            </div>
          </div>
        </div>
        
        <!-- Dock设置 -->
        <div v-if="activeCategory === 'dock'" class="config-section">
          <h3>Dock</h3>
          
          <div class="config-group">
            <label>位置</label>
            <div class="position-options">
              <button 
                class="position-btn"
                :class="{ active: dockConfig.position === 'bottom' }"
                @click="updateDockConfig({ position: 'bottom' })"
              >
                底部
              </button>
              <button 
                class="position-btn"
                :class="{ active: dockConfig.position === 'left' }"
                @click="updateDockConfig({ position: 'left' })"
              >
                左侧
              </button>
              <button 
                class="position-btn"
                :class="{ active: dockConfig.position === 'right' }"
                @click="updateDockConfig({ position: 'right' })"
              >
                右侧
              </button>
            </div>
          </div>
          
          <div class="config-group">
            <label>大小设置</label>
            <div class="size-settings">
              <div class="setting-item">
                <label>Dock大小: {{ dockConfig.size }}px</label>
                <input 
                  type="range" 
                  min="40" 
                  max="80" 
                  step="2"
                  v-model.number="dockConfig.size"
                  @input="updateDockConfig"
                />
              </div>
              <div class="setting-item">
                <label>图标大小: {{ dockConfig.iconSize }}px</label>
                <input 
                  type="range" 
                  min="24" 
                  max="48" 
                  step="2"
                  v-model.number="dockConfig.iconSize"
                  @input="updateDockConfig"
                />
              </div>
              <div class="setting-item">
                <label>启用 magnification</label>
                <input 
                  type="checkbox"
                  v-model="dockConfig.magnification"
                  @change="updateDockConfig"
                />
              </div>
              <div v-if="dockConfig.magnification" class="setting-item">
                <label>Magnification大小: {{ dockConfig.magnificationSize }}px</label>
                <input 
                  type="range" 
                  min="40" 
                  max="64" 
                  step="2"
                  v-model.number="dockConfig.magnificationSize"
                  @input="updateDockConfig"
                />
              </div>
            </div>
          </div>
        </div>
        
        <!-- 快捷键设置 -->
        <div v-if="activeCategory === 'shortcuts'" class="config-section">
          <h3>键盘快捷键</h3>
          
          <div class="config-group">
            <div class="shortcut-list">
              <div 
                v-for="(shortcut, action) in shortcuts" 
                :key="action"
                class="shortcut-item"
              >
                <span class="shortcut-action">{{ getActionName(action) }}</span>
                <span class="shortcut-key">{{ shortcut }}</span>
                <button class="edit-btn" @click="editShortcut(action)">
                  编辑
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 系统设置 -->
        <div v-if="activeCategory === 'system'" class="config-section">
          <h3>系统</h3>
          
          <div class="config-group">
            <label>视觉效果</label>
            <div class="system-options">
              <div class="setting-item">
                <label>启用动画</label>
                <input 
                  type="checkbox"
                  v-model="systemConfig.animations"
                  @change="updateSystemConfig"
                />
              </div>
              <div class="setting-item">
                <label>启用透明度</label>
                <input 
                  type="checkbox"
                  v-model="systemConfig.transparency"
                  @change="updateSystemConfig"
                />
              </div>
              <div class="setting-item">
                <label>启用模糊效果</label>
                <input 
                  type="checkbox"
                  v-model="systemConfig.blurEffect"
                  @change="updateSystemConfig"
                />
              </div>
            </div>
          </div>
          
          <div class="config-group">
            <label>功能开关</label>
            <div class="feature-options">
              <div 
                v-for="(enabled, feature) in features" 
                :key="feature"
                class="setting-item"
              >
                <label>{{ getFeatureName(feature) }}</label>
                <input 
                  type="checkbox"
                  :checked="enabled"
                  @change="toggleFeature(feature, $event.target.checked)"
                />
              </div>
            </div>
          </div>
        </div>
        
        <!-- 配置管理 -->
        <div v-if="activeCategory === 'config'" class="config-section">
          <h3>配置管理</h3>
          
          <div class="config-group">
            <button class="config-btn export-btn" @click="exportConfig">
              导出配置
            </button>
            <button class="config-btn import-btn" @click="importConfig">
              导入配置
            </button>
            <button class="config-btn reset-btn" @click="resetConfig">
              恢复默认设置
            </button>
          </div>
          
          <div class="config-info">
            <p>配置文件会自动保存到本地存储中，确保您的设置在重启应用后仍然保留。</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useConfigStore } from '../stores/configStore'

const configStore = useConfigStore()

// Props
const emit = defineEmits(['close'])

// 响应式状态
const activeCategory = ref('appearance')

// 计算属性
const theme = computed(() => configStore.theme)
const desktopConfig = computed(() => configStore.desktop)
const dockConfig = computed(() => configStore.dock)
const shortcuts = computed(() => configStore.shortcuts)
const systemConfig = computed(() => configStore.system)
const features = computed(() => configStore.features)

// 配置分类
const categories = [
  {
    id: 'appearance',
    name: '外观',
    icon: '/src/assets/icons/system/appearance.png'
  },
  {
    id: 'desktop',
    name: '桌面',
    icon: '/src/assets/icons/system/desktop.png'
  },
  {
    id: 'dock',
    name: 'Dock',
    icon: '/src/assets/icons/system/dock.png'
  },
  {
    id: 'shortcuts',
    name: '键盘',
    icon: '/src/assets/icons/system/xcode.png'
  },
  {
    id: 'system',
    name: '系统',
    icon: '/src/assets/icons/system/system.png'
  },
  {
    id: 'config',
    name: '配置管理',
    icon: '/src/assets/icons/system/export.png'
  }
]

// 背景选项
const backgroundOptions = [
  'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
]

// 方法
const close = () => {
  emit('close')
}

const setThemeMode = (mode) => {
  configStore.setThemeMode(mode)
}

const setDesktopBackground = (background) => {
  configStore.setDesktopBackground(background)
}

const updateDesktopSettings = () => {
  configStore.setDesktopIconSettings(desktopConfig.value)
}

const updateDockConfig = (config) => {
  configStore.setDockConfig(config || dockConfig.value)
}

const updateSystemConfig = () => {
  configStore.updateSystemConfig(systemConfig.value)
}

const toggleFeature = (feature, enabled) => {
  configStore.toggleFeature(feature, enabled)
}

const exportConfig = () => {
  const config = configStore.exportConfig()
  const blob = new Blob([config], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'desktop-config.json'
  a.click()
  URL.revokeObjectURL(url)
}

const importConfig = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const config = JSON.parse(event.target.result)
          configStore.importConfig(config)
          alert('配置导入成功！')
        } catch (error) {
          alert('配置文件格式错误！')
        }
      }
      reader.readAsText(file)
    }
  }
  input.click()
}

const resetConfig = () => {
  if (confirm('确定要恢复默认设置吗？')) {
    configStore.resetToDefault()
    alert('已恢复默认设置！')
  }
}

const editShortcut = (action) => {
  const newShortcut = prompt('请输入新的快捷键组合（例如：Cmd+D）：')
  if (newShortcut) {
    configStore.updateShortcut(action, newShortcut)
  }
}

const getActionName = (action) => {
  const names = {
    showDesktop: '显示桌面',
    showMissionControl: '显示Mission Control',
    showAppExposé: '显示App Exposé',
    newWindow: '新建窗口',
    closeWindow: '关闭窗口',
    minimizeWindow: '最小化窗口',
    maximizeWindow: '最大化窗口',
    switchWindow: '切换窗口'
  }
  return names[action] || action
}

const getFeatureName = (feature) => {
  const names = {
    notificationCenter: '通知中心',
    systemTray: '系统托盘',
    multipleDesktops: '多桌面',
    fileSystem: '文件系统',
    appStore: '应用商店'
  }
  return names[feature] || feature
}
</script>

<style scoped>
.config-panel {
  width: 100%;
  height: 100%;
  background-color: var(--surface-color);
  background-opacity: var(--surface-opacity);
  backdrop-filter: blur(5px);
  border-radius: 0;
  box-shadow: none;
  z-index: 1;
  display: flex;
  flex-direction: column;
  border: none;
}



.config-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.config-sidebar {
  width: 180px;
  border-right: 1px solid var(--border-color);
  padding: 16px 0;
  overflow-y: auto;
}

.sidebar-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 0 8px 8px 0;
  margin-right: 8px;
  color: var(--text-color);
}

.sidebar-item:hover {
  background-color: var(--hover-color);
}

.sidebar-item.active {
  background-color: var(--hover-color);
  color: var(--primary-color);
}

.sidebar-icon {
  width: 24px;
  height: 24px;
  margin-right: 12px;
}

.config-main {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.config-section {
  width: 100%;
}

.config-section h3 {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-color);
  margin: 0 0 24px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
}

.config-group {
  margin-bottom: 32px;
}

.config-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color);
  margin-bottom: 12px;
}

/* Theme options */
.theme-options {
  display: flex;
  gap: 16px;
}

.theme-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
  width: 100px;
  color: var(--text-color);
}

.theme-option:hover {
  background-color: var(--hover-color);
}

.theme-option.active {
  background-color: var(--hover-color);
  border: 1px solid var(--primary-color);
}

.theme-preview {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.light-theme {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.dark-theme {
  background: linear-gradient(135deg, #1c1c1e 0%, #2c2c2e 100%);
}

.blue-theme {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.green-theme {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}

.purple-theme {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Color pickers */
.color-pickers {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.color-picker-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.color-picker-item label {
  font-size: 13px;
  color: var(--secondary-text-color);
  margin: 0;
}

.color-picker-item input[type="color"] {
  width: 100%;
  height: 40px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
}

/* Background options */
.background-options {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}

.background-option {
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.background-option:hover {
  transform: scale(1.05);
}

.background-option.active {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.2);
}

.background-preview {
  width: 100%;
  height: 80px;
  border-radius: 6px;
}

/* Icon settings */
.icon-settings {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Position options */
.position-options {
  display: flex;
  gap: 8px;
}

.position-btn {
  padding: 8px 16px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: var(--surface-color);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  color: var(--text-color);
}

.position-btn:hover {
  background-color: var(--hover-color);
}

.position-btn.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

/* Size settings */
.size-settings {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Setting item */
.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
}

.setting-item label {
  margin: 0;
  font-size: 14px;
  color: var(--text-color);
}

.setting-item input[type="range"] {
  flex: 1;
  margin: 0 16px;
}

.setting-item input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

/* Shortcut list */
.shortcut-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.shortcut-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: var(--hover-color);
  border-radius: 6px;
}

.shortcut-action {
  flex: 1;
  font-size: 14px;
  color: var(--text-color);
}

.shortcut-key {
  font-size: 13px;
  color: var(--secondary-text-color);
  font-family: 'Courier New', monospace;
  padding: 4px 8px;
  background-color: var(--hover-hover-color);
  border-radius: 4px;
  margin: 0 16px;
}

.edit-btn {
  padding: 4px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--surface-color);
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
  color: var(--text-color);
}

.edit-btn:hover {
  background-color: var(--hover-color);
}

/* System options */
.system-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Feature options */
.feature-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

/* Config buttons */
.config-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  margin-right: 12px;
  margin-bottom: 12px;
}

.export-btn {
  background-color: var(--primary-color);
  color: white;
}

.export-btn:hover {
  opacity: 0.9;
}

.import-btn {
  background-color: #34c759;
  color: white;
}

.import-btn:hover {
  opacity: 0.9;
}

.reset-btn {
  background-color: #ff3b30;
  color: white;
}

.reset-btn:hover {
  opacity: 0.9;
}

/* Config info */
.config-info {
  margin-top: 24px;
  padding: 16px;
  background-color: rgba(0, 122, 255, 0.05);
  border-radius: 6px;
  border-left: 4px solid var(--primary-color);
}

.config-info p {
  margin: 0;
  font-size: 13px;
  color: var(--text-color);
  line-height: 1.4;
}

/* Responsive */
@media (max-width: 768px) {
  .config-panel {
    width: 90vw;
    height: 80vh;
  }
  
  .config-content {
    flex-direction: column;
  }
  
  .config-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--border-color);
    padding: 12px 0;
    overflow-x: auto;
    overflow-y: hidden;
  }
  
  .sidebar-item {
    margin-right: 0;
    border-radius: 6px;
  }
  
  .color-pickers {
    grid-template-columns: 1fr;
  }
  
  .background-options {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .feature-options {
    grid-template-columns: 1fr;
  }
  
  .config-btn {
    margin-right: 0;
    width: 100%;
  }
}
</style>
