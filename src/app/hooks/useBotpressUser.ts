// hooks/useBotpressUser.ts
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/app/libs/supabaseClient'
import type { BotpressUserData } from '@/app/types/botpress'

export function useBotpressUser() {
    const [userData, setUserData] = useState<BotpressUserData>({
        userId: null,
        userToken: null,
        email: null,
        fullName: null,
        isLoggedIn: false,
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Lấy session hiện tại khi component mount
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()

            if (session?.user) {
                setUserData({
                    userId: session.user.id,
                    userToken: session.access_token,
                    email: session.user.email ?? null,
                    fullName: session.user.user_metadata?.full_name ?? null,
                    isLoggedIn: true,
                })
            } else {
                setUserData({
                    userId: null,
                    userToken: null,
                    email: null,
                    fullName: null,
                    isLoggedIn: false,
                })
            }
            setLoading(false)
        }

        getSession()

        // Lắng nghe thay đổi auth state (login / logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                if (session?.user) {
                    setUserData({
                        userId: session.user.id,
                        userToken: session.access_token,
                        email: session.user.email ?? null,
                        fullName: session.user.user_metadata?.full_name ?? null,
                        isLoggedIn: true,
                    })
                } else {
                    setUserData({
                        userId: null,
                        userToken: null,
                        email: null,
                        fullName: null,
                        isLoggedIn: false,
                    })
                }
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    return { userData, loading }
}
