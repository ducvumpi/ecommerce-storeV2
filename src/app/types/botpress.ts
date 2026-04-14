// types/botpress.ts

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
    // types/botpress.d.ts
    interface Window {
        botpressWebChat: {
            init: (config: Record<string, unknown>) => void
            sendEvent: (event: {
                type: string
                payload?: Record<string, unknown>
            }) => void
            mergeConfig: (config: Record<string, unknown>) => void  // ✅ thêm dòng này
            open: () => void
            close: () => void
            isOpen: () => boolean
        }
    }
}
