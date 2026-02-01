// 子应用通信事件总线
class EventBus {
  constructor() {
    this.events = new Map()
  }

  // 订阅事件
  on(eventName, callback) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, [])
    }
    this.events.get(eventName).push(callback)
    return () => this.off(eventName, callback)
  }

  // 取消订阅
  off(eventName, callback) {
    if (this.events.has(eventName)) {
      const callbacks = this.events.get(eventName)
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  // 发布事件
  emit(eventName, data) {
    if (this.events.has(eventName)) {
      this.events.get(eventName).forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('Error emitting event:', error)
        }
      })
    }
  }

  // 订阅一次事件
  once(eventName, callback) {
    const onceCallback = (data) => {
      callback(data)
      this.off(eventName, onceCallback)
    }
    this.on(eventName, onceCallback)
    return () => this.off(eventName, onceCallback)
  }
}

// 创建全局事件总线实例
const eventBus = new EventBus()

// 导出事件总线
export default eventBus

// 导出通信方法
export const useMicroAppCommunication = () => {
  return {
    // 向主应用发送消息
    sendToMaster: (message) => {
      eventBus.emit('message:from:microapp', message)
    },
    
    // 接收来自主应用的消息
    onMasterMessage: (callback) => {
      return eventBus.on('message:from:master', callback)
    },
    
    // 向其他子应用发送消息
    sendToMicroApp: (appName, message) => {
      eventBus.emit(`message:to:${appName}`, message)
    },
    
    // 接收来自其他子应用的消息
    onMicroAppMessage: (callback) => {
      return eventBus.on('message:from:microapp', callback)
    },
    
    // 全局广播消息
    broadcast: (message) => {
      eventBus.emit('message:broadcast', message)
    },
    
    // 接收全局广播消息
    onBroadcast: (callback) => {
      return eventBus.on('message:broadcast', callback)
    }
  }
}
