// 拖拽管理工具类 - 提供现代化的拖拽体验
class DragManager {
  constructor() {
    // 拖拽状态
    this.dragState = null
    this.animationFrameId = null
    
    // 配置参数
    this.config = {
      longPressThreshold: 500, // 长按阈值（毫秒）
      dragThreshold: 5, // 拖拽触发阈值（像素）
      animationDuration: 200, // 动画持续时间（毫秒）
      shakeDuration: 300, // 抖动动画持续时间（毫秒）
      shakeIntensity: 4, // 抖动强度（像素）
    }

    // 抖动动画状态
    this.shakeAnimationFrameId = null
    this.currentShakeTime = 0
  }

  /**
   * 初始化拖拽管理
   * @param {HTMLElement} container - 拖拽容器
   * @param {Function} onDragStart - 拖拽开始回调
   * @param {Function} onDragEnd - 拖拽结束回调
   * @param {Function} onDragMove - 拖拽移动回调
   */
  initialize(container, onDragStart, onDragEnd, onDragMove) {
    this.container = container
    this.onDragStart = onDragStart
    this.onDragEnd = onDragEnd
    this.onDragMove = onDragMove

    // 添加全局鼠标事件监听
    document.addEventListener('mousemove', this.handleGlobalMouseMove.bind(this))
    document.addEventListener('mouseup', this.handleGlobalMouseUp.bind(this))
  }

  /**
   * 开始监听元素拖拽
   * @param {HTMLElement} element - 要拖拽的元素
   * @param {Object} data - 元素相关数据
   * @param {Event} event - 鼠标事件
   */
  startDrag(element, data, event) {
    // 只处理左键点击
    if (event.button !== 0) return

    // 保存初始状态
    const rect = element.getBoundingClientRect()
    this.dragState = {
      element,
      data,
      startX: event.clientX,
      startY: event.clientY,
      elementRect: rect,
      isDragging: true, // 立即进入拖拽状态
      startTime: Date.now(),
    }

    // 禁用元素的过渡效果，避免拖拽时的卡顿
    this.dragState.originalTransition = element.style.transition
    element.style.transition = 'none'

    // 添加视觉反馈：轻微放大和阴影变化
    element.style.transform = 'scale(1.05)'
    element.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)'

    // 立即触发拖拽开始回调，确保状态更新
    if (this.onDragStart) {
      this.onDragStart(data, event)
    }

    console.log('🎯 开始监听拖拽，添加视觉反馈:', data)
  }

  /**
   * 处理全局鼠标移动
   * @param {Event} event - 鼠标事件
   */
  handleGlobalMouseMove(event) {
    if (!this.dragState) return

    const { startX, startY, element, data } = this.dragState
    const deltaX = event.clientX - startX
    const deltaY = event.clientY - startY

    // 处理拖拽中的移动
    if (this.dragState.isDragging) {
      // 计算新的偏移量
      this.dragState.offsetX = deltaX
      this.dragState.offsetY = deltaY

      // 应用拖拽样式
      this.applyDragStyles(element, deltaX, deltaY)

      // 触发拖拽移动回调
      if (this.onDragMove) {
        this.onDragMove(data, event, deltaX, deltaY)
      }
    }
  }

  /**
   * 处理全局鼠标释放
   * @param {Event} event - 鼠标事件
   */
  handleGlobalMouseUp(event) {
    if (!this.dragState) return

    const { element, data, isDragging } = this.dragState

    // 恢复元素样式
    this.resetElementStyles(element)

    // 触发拖拽结束回调
    if (isDragging && this.onDragEnd) {
      this.onDragEnd(data, event)
    }

    // 重置拖拽状态
    this.dragState = null

    console.log('🎯 结束拖拽:', data)
  }

  /**
   * 应用拖拽样式
   * @param {HTMLElement} element - 拖拽元素
   * @param {number} deltaX - X轴偏移
   * @param {number} deltaY - Y轴偏移
   */
  applyDragStyles(element, deltaX, deltaY) {
    element.style.transform = `translate(${deltaX}px, ${deltaY}px)`
    element.style.zIndex = '1000'
    element.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.15)'
    element.style.opacity = '0.9'
    element.style.cursor = 'grabbing'
  }

  /**
   * 重置元素样式
   * @param {HTMLElement} element - 元素
   */
  resetElementStyles(element) {
    if (element) {
      element.style.transform = ''
      element.style.zIndex = ''
      element.style.boxShadow = ''
      element.style.opacity = ''
      element.style.cursor = ''
      element.style.transition = this.dragState?.originalTransition || ''
      console.log('🎯 重置元素样式')
    }
  }

  /**
   * 计算目标位置
   * @param {Array} elements - 所有元素
   * @param {number} draggedIndex - 拖拽元素索引
   * @param {number} clientX - 鼠标X坐标
   * @param {number} clientY - 鼠标Y坐标
   * @returns {number} 目标索引
   */
  calculateTargetIndex(elements, draggedIndex, clientX, clientY) {
    // 获取拖拽元素的位置
    const draggedElement = elements[draggedIndex]
    if (!draggedElement) return draggedIndex
    
    const draggedRect = draggedElement.getBoundingClientRect()
    
    // 初始化目标索引
    let targetIndex = draggedIndex
    let minDistance = Infinity
    
    // 计算每个元素与鼠标的距离
    elements.forEach((element, index) => {
      if (index !== draggedIndex) {
        const rect = element.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        const distance = Math.sqrt(Math.pow(centerX - clientX, 2) + Math.pow(centerY - clientY, 2))
        
        if (distance < minDistance) {
          minDistance = distance
          targetIndex = index
        }
      }
    })
    
    // 确保目标索引的计算与位置指示线的显示逻辑一致
    if (targetIndex !== draggedIndex) {
      const targetElement = elements[targetIndex]
      const targetRect = targetElement.getBoundingClientRect()
      
      // 根据拖拽方向调整目标索引
      // 如果拖拽元素在目标元素上方，且鼠标位置在目标元素上方，目标索引不变
      // 如果拖拽元素在目标元素下方，且鼠标位置在目标元素下方，目标索引不变
      // 否则，调整目标索引
      if (draggedRect.top < targetRect.top && clientY < targetRect.top) {
        // 拖拽元素在目标元素上方，鼠标也在目标元素上方，目标索引不变
      } else if (draggedRect.top > targetRect.top && clientY > targetRect.bottom) {
        // 拖拽元素在目标元素下方，鼠标也在目标元素下方，目标索引不变
      } else if (draggedRect.top < targetRect.top && clientY > targetRect.top) {
        // 拖拽元素在目标元素上方，鼠标在目标元素下方，目标索引+1
        targetIndex = Math.min(targetIndex + 1, elements.length - 1)
      } else if (draggedRect.top > targetRect.top && clientY < targetRect.bottom) {
        // 拖拽元素在目标元素下方，鼠标在目标元素上方，目标索引-1
        targetIndex = Math.max(targetIndex - 1, 0)
      }
    }
    
    return targetIndex
  }

  /**
   * 执行抖动动画
   * @param {HTMLElement} element - 要抖动的元素
   */
  startShakeAnimation(element) {
    if (!element) return

    // 清除之前的动画
    if (this.shakeAnimationFrameId) {
      cancelAnimationFrame(this.shakeAnimationFrameId)
    }

    this.currentShakeTime = 0
    const startTime = Date.now()

    const shake = () => {
      this.currentShakeTime = Date.now() - startTime
      
      if (this.currentShakeTime < this.config.shakeDuration) {
        // 计算抖动偏移量（使用正弦函数）
        const offsetX = Math.sin(this.currentShakeTime * 0.02) * this.config.shakeIntensity
        const offsetY = Math.sin(this.currentShakeTime * 0.02 + Math.PI / 2) * this.config.shakeIntensity
        
        // 应用抖动效果
        element.style.transform = `translate(${offsetX}px, ${offsetY}px)`
        
        // 继续动画
        this.shakeAnimationFrameId = requestAnimationFrame(shake)
      } else {
        // 动画结束，重置位置
        element.style.transform = ''
        this.shakeAnimationFrameId = null
      }
    }

    // 开始抖动动画
    shake()
  }

  /**
   * 创建位置指示线
   * @param {HTMLElement} container - 容器元素
   * @param {HTMLElement} targetElement - 目标元素
   * @param {string} position - 位置：'before' 或 'after'
   * @param {number} containerHeight - 容器高度
   * @param {boolean} isTopEdge - 是否在容器顶部边缘
   * @param {boolean} isBottomEdge - 是否在容器底部边缘
   */
  createPositionIndicator(container, targetElement, position, containerHeight, isTopEdge = false, isBottomEdge = false) {
    // 移除之前的指示线
    this.removePositionIndicator()

    if (!container) return

    // 创建指示线元素
    const indicator = document.createElement('div')
    indicator.className = 'position-indicator'
    indicator.style.cssText = `
      position: absolute;
      background-color: var(--primary-color);
      border-radius: 2px;
      z-index: 13;
      transition: all 0.2s ease;
    `

    // 获取容器位置
    const containerRect = container.getBoundingClientRect()
    
    if (isTopEdge) {
      // 在容器顶部边缘显示指示线
      indicator.style.top = '0px'
      indicator.style.left = '0px'
      indicator.style.width = '100%'
      indicator.style.height = '4px'
    } else if (isBottomEdge) {
      // 在容器底部边缘显示指示线
      indicator.style.top = `${containerRect.height - 4}px`
      indicator.style.left = '0px'
      indicator.style.width = '100%'
      indicator.style.height = '4px'
    } else if (targetElement) {
      // 获取目标元素位置
      const rect = targetElement.getBoundingClientRect()

      // 根据位置设置指示线样式
      if (position === 'before') {
        indicator.style.top = `${rect.top - containerRect.top}px`
        indicator.style.left = `${rect.left - containerRect.left}px`
        indicator.style.width = `${rect.width}px`
        indicator.style.height = '4px'
      } else if (position === 'after') {
        indicator.style.top = `${rect.bottom - containerRect.top - 4}px`
        indicator.style.left = `${rect.left - containerRect.left}px`
        indicator.style.width = `${rect.width}px`
        indicator.style.height = '4px'
      }
    }

    // 添加到容器
    container.appendChild(indicator)
    this.positionIndicator = indicator

    // 添加动画效果
    setTimeout(() => {
      indicator.style.opacity = '0.8'
      indicator.style.transform = 'scaleY(1.5)'
    }, 10)
  }

  /**
   * 移除位置指示线
   */
  removePositionIndicator() {
    if (this.positionIndicator && this.positionIndicator.parentNode) {
      this.positionIndicator.parentNode.removeChild(this.positionIndicator)
      this.positionIndicator = null
    }
  }

  /**
   * 销毁拖拽管理
   */
  destroy() {
    document.removeEventListener('mousemove', this.handleGlobalMouseMove.bind(this))
    document.removeEventListener('mouseup', this.handleGlobalMouseUp.bind(this))
    this.container = null
    this.dragState = null
  }
}

// 导出单例实例
export default new DragManager()