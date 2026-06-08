export interface BotpressUserData {
  userId: string | null
  userToken: string | null
  email: string | null
  fullName: string | null
  isLoggedIn: boolean
}

export interface BotpressConfig {
  botId: string
  clientId: string
  userData?: BotpressUserData
}

declare global {
  interface Window {
  botpress?: {
    on: (event: string, callback: (data?: any) => void) => void
    sendEvent: (event: { type: string; payload?: Record<string, any> }) => void
    sendMessage: (message: string) => void  // ← thêm dòng này
    mergeConfig: (config: Record<string, unknown>) => void
    open: () => void
    close: () => void
    isOpen: () => boolean
  }
    // giữ lại nếu vẫn dùng webchat v2
    botpressWebChat?: {
      init: (config: Record<string, unknown>) => void
      sendEvent: (event: {
        type: string
        payload?: Record<string, unknown>
      }) => void
      mergeConfig: (config: Record<string, unknown>) => void
      open: () => void
      close: () => void
      isOpen: () => boolean
    }
  }
  
}