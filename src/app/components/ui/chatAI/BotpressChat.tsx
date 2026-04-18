'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/app/store/isLoggedIn'
import { supabase } from '@/app/libs/supabaseClient'

export default function BotpressChat() {
    const { isLoggedIn } = useAuthStore()

    useEffect(() => {
        const loadScript = (src: string): Promise<void> => {
            return new Promise((resolve, reject) => {
                if (document.querySelector(`script[src="${src}"]`)) {
                    console.log('Script already exists:', src)
                    resolve()
                    return
                }
                const script = document.createElement('script')
                script.src = src
                script.async = true
                script.onload = () => {
                    console.log('✅ Loaded:', src)
                    resolve()
                }
                script.onerror = () => {
                    console.log('❌ Failed:', src)
                    reject()
                }
                document.body.appendChild(script)
            })
        }

        const init = async () => {
            await loadScript('https://cdn.botpress.cloud/webchat/v3.6/inject.js')
            await loadScript('https://files.bpcontent.cloud/2025/12/11/08/20251211081314-GCM8M5CS.js')

            setTimeout(() => {
                console.log('botpressWebChat:', window.botpressWebChat)
            }, 2000)
        }

        init()
    }, [])

    useEffect(() => {
        const syncUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            const user = session?.user

            const trySync = setInterval(() => {
                if (!window.botpressWebChat) return

                window.botpressWebChat.sendEvent({
                    type: 'updateUser',
                    payload: {
                        userId: user?.id ?? null,
                        email: user?.email ?? null,
                        isLoggedIn: !!user,
                    }
                })

                clearInterval(trySync)
            }, 800)

            return () => clearInterval(trySync)
        }

        syncUser()
    }, [isLoggedIn])

    return null
}