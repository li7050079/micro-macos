<template>
  <div class="file-system">
    <div class="file-system-nav">
      <div class="file-system-nav-item" :class="{ active: currentFileSystemPath === 'desktop' }" @click="currentFileSystemPath = 'desktop'">
        <img src="/src/assets/icons/system/desktop.png" alt="桌面" class="nav-item-icon" />
        <span>桌面</span>
      </div>
      <div class="file-system-nav-item" :class="{ active: currentFileSystemPath === 'documents' }" @click="currentFileSystemPath = 'documents'">
        <img src="/src/assets/icons/folders/files.png" alt="文稿" class="nav-item-icon" />
        <span>文稿</span>
      </div>
      <div class="file-system-nav-item" :class="{ active: currentFileSystemPath === 'downloads' }" @click="currentFileSystemPath = 'downloads'">
        <img src="/src/assets/icons/folders/download.png" alt="下载" class="nav-item-icon" />
        <span>下载</span>
      </div>
      <div class="file-system-nav-item" :class="{ active: currentFileSystemPath === 'pictures' }" @click="currentFileSystemPath = 'pictures'">
        <img src="/src/assets/icons/system/video.png" alt="图片" class="nav-item-icon" />
        <span>图片</span>
      </div>
    </div>
    <div class="file-system-toolbar">
      <div class="file-system-toolbar-left">
        <button class="toolbar-button" @click="refreshFiles" title="刷新">
          <img src="/src/assets/icons/toolbar/refresh.png" alt="刷新" class="toolbar-icon" />
        </button>
        <button class="toolbar-button" @click="createNewFolder" title="新建文件夹">
          <img src="/src/assets/icons/folders/files.png" alt="新建文件夹" class="toolbar-icon" />
        </button>
      </div>
      <div class="file-system-toolbar-right">
        <div class="view-options">
          <button class="view-button" :class="{ active: viewMode === 'grid' }" title="图标视图" @click="switchViewMode('grid')">
            <img src="/src/assets/icons/toolbar/grid-view.svg" alt="图标视图" class="view-icon" />
          </button>
          <button class="view-button" :class="{ active: viewMode === 'list' }" title="列表视图" @click="switchViewMode('list')">
            <img src="/src/assets/icons/toolbar/list-view.svg" alt="列表视图" class="view-icon" />
          </button>
        </div>
      </div>
    </div>
    <div class="file-system-content-container">
      <!-- 图标视图 -->
      <div v-if="viewMode === 'grid'" class="file-system-content grid-view">
        <div 
          v-for="file in currentFileSystemFiles" 
          :key="file.id"
          class="file-item"
          @click="openFile(file)"
          @contextmenu="showFileContextMenu($event, file)"
        >
          <div class="file-item-icon-wrapper">
            <img :src="file.icon" :alt="file.name" class="file-icon" />
          </div>
          <div class="file-item-info">
            <div class="file-name">{{ file.name }}</div>
            <div class="file-details">
              <span class="file-size">{{ file.size }}</span>
              <span class="file-date">{{ file.date }}</span>
            </div>
          </div>
        </div>
        <div v-if="currentFileSystemFiles.length === 0" class="file-system-empty">
          <img src="/src/assets/icons/folders/files.png" alt="空文件夹" class="empty-icon" />
          <p>此文件夹为空</p>
        </div>
      </div>
      
      <!-- 列表视图 -->
      <div v-else-if="viewMode === 'list'" class="file-system-content list-view">
        <div class="list-header">
          <div class="list-column name-column">名称</div>
          <div class="list-column size-column">大小</div>
          <div class="list-column date-column">修改日期</div>
        </div>
        <div 
          v-for="file in currentFileSystemFiles" 
          :key="file.id"
          class="list-item"
          @click="openFile(file)"
          @contextmenu="showFileContextMenu($event, file)"
        >
          <div class="list-column name-column">
            <div class="list-item-icon">
              <img :src="file.icon" :alt="file.name" class="list-file-icon" />
            </div>
            <div class="list-item-name">{{ file.name }}</div>
          </div>
          <div class="list-column size-column">{{ file.size }}</div>
          <div class="list-column date-column">{{ file.date }}</div>
        </div>
        <div v-if="currentFileSystemFiles.length === 0" class="file-system-empty">
          <img src="/src/assets/icons/folders/files.png" alt="空文件夹" class="empty-icon" />
          <p>此文件夹为空</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDesktopStore } from '../stores/desktopStore'
import { useWindowStore } from '../stores/windowStore'

// Props
const props = defineProps({})

// Emits
const emit = defineEmits([
  'fileSystemToggle',
  'fileOpen',
  'fileContextMenu',
  'fileRefresh',
  'folderCreate'
])

// Stores
const desktopStore = useDesktopStore()
const windowStore = useWindowStore()

// Reactive state
const currentFileSystemPath = ref('desktop')
const viewMode = ref('grid') // 'grid' or 'list'

// Computed properties
const currentFileSystemFiles = computed(() => {
  return desktopStore.fileSystem[currentFileSystemPath.value] || []
})

// Methods
const toggleFileSystem = () => {
  // 文件系统现在通过Window组件直接显示
  console.log('文件系统窗口控制')
}

const minimizeWindow = () => {
  // 最小化窗口逻辑
  console.log('Minimizing file system window')
}

const closeWindow = () => {
  // 关闭窗口逻辑
  console.log('Closing file system window')
}

const openFile = (file) => {
  // 模拟打开文件
  console.log('Opening file:', file.name)
  // 可以根据文件类型执行不同的操作
  if (file.type === 'folder') {
    // 如果是文件夹，可以打开新的文件系统视图
    console.log('Opening folder:', file.name)
  } else {
    // 如果是文件，可以模拟打开文件编辑器
    console.log('Opening file:', file.name)
  }
}

const showFileContextMenu = (event, file) => {
  event.preventDefault()
  event.stopPropagation()
  // 直接在组件内部处理文件右键菜单
  console.log('Showing file context menu:', file.name)
}

const refreshFiles = () => {
  // 模拟刷新文件列表
  console.log('Refreshing files...')
  // 这里可以添加刷新动画或重新加载文件列表的逻辑
}

const createNewFolder = () => {
  // 模拟创建新文件夹
  console.log('Creating new folder...')
  desktopStore.addFile(currentFileSystemPath.value, {
    name: '新建文件夹',
    type: 'folder',
    size: '',
    date: new Date().toLocaleDateString(),
    icon: '/src/assets/icons/folders/files.png'
  })
}

const switchViewMode = (mode) => {
  viewMode.value = mode
  // 这里可以实现不同视图模式的切换逻辑
  console.log('Switching to view mode:', mode)
}
</script>
