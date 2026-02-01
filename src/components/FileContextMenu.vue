<template>
  <div class="file-context-menu" :style="{ left: contextMenuX + 'px', top: contextMenuY + 'px' }">
    <div class="context-menu-item" @click="openFile(selectedFile)">
      <img src="@/assets/icons/system/preview.png" alt="打开" class="context-menu-icon" />
      <span>打开</span>
    </div>
    <div class="context-menu-item" @click="renameFile(selectedFile)">
      <img src="@/assets/icons/system/rename.png" alt="重命名" class="context-menu-icon" />
      <span>重命名</span>
    </div>
    <div class="context-menu-separator"></div>
    <div class="context-menu-item" @click="deleteFile(selectedFile)">
      <img src="@/assets/icons/system/delete.png" alt="移到废纸篓" class="context-menu-icon" />
      <span>移到废纸篓</span>
    </div>
  </div>
</template>

<script setup>
import { useDesktopStore } from '../stores/desktopStore'

// Props
const props = defineProps({
  selectedFile: {
    type: Object,
    required: true
  },
  contextMenuX: {
    type: Number,
    default: 0
  },
  contextMenuY: {
    type: Number,
    default: 0
  }
})

// Emits
const emit = defineEmits([
  'fileOpen',
  'fileRename',
  'fileDelete',
  'menuClose'
])

// Stores
const desktopStore = useDesktopStore()

// Methods
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

const renameFile = (file) => {
  // 模拟重命名文件
  console.log('Renaming file:', file.name)
  // 这里可以实现重命名功能，比如显示一个输入框
}

const deleteFile = (file) => {
  // 模拟删除文件
  console.log('Deleting file:', file.name)
  desktopStore.removeFile('desktop', file.id)
}
</script>
