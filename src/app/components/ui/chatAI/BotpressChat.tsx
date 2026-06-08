// 'use client'

// import { useEffect, useRef } from 'react'
// import { useAuthStore } from '@/app/store/isLoggedIn'
// import { supabase } from '@/app/libs/supabaseClient'

// export default function BotpressChat() {
//   const { isLoggedIn } = useAuthStore()
//   const scriptLoaded = useRef(false)
//   const userRef = useRef<any>(null)
//   const tokenRef = useRef<string | null>(null)

//   const loadScript = (src: string): Promise<void> => {
//     return new Promise((resolve, reject) => {
//       if (document.querySelector(`script[src="${src}"]`)) {
//         resolve()
//         return
//       }
//       const script = document.createElement('script')
//       script.src = src
//       script.async = true
//       script.onload = () => resolve()
//       script.onerror = () => reject()
//       document.body.appendChild(script)
//     })
//   }

//     useEffect(() => {
//       if (scriptLoaded.current) return
//       scriptLoaded.current = true

//       const init = async () => {
//         const { data: { session } } = await supabase.auth.getSession()
//         const user = session?.user

//         userRef.current = user

//         await loadScript('https://cdn.botpress.cloud/webchat/v3.6/inject.js')
//         await loadScript('https://files.bpcontent.cloud/2025/12/11/08/20251211081314-GCM8M5CS.js')

//         // Gửi ngay sau khi script load, trước khi user mở chat
//         const bp = (window as any).botpress
//         if (bp?.on) {
//     bp.on('webchat:ready', () => {
//   const user = userRef.current
  
//   // Thử format khác
//   bp.updateUser({
//     email: user?.email ?? null,
//     name: user?.user_metadata?.full_name ?? user?.email ?? null,
//     data: {
//       userId: user?.id ?? null,
//       email: user?.email ?? null,
//       isLoggedIn: !!user,
//     }
//   })
//   console.log('✅ updateUser fired with email:', user?.email)
// })
//         }
//       }

//       init()
//     }, [])

//   // Cập nhật localStorage khi login/logout
//   useEffect(() => {
//     const syncUser = async () => {
//       const { data: { session } } = await supabase.auth.getSession()
//       const user = session?.user
//       const token = session?.access_token ?? null

//       userRef.current = user
//       tokenRef.current = token

//       if (token) {
//         localStorage.setItem('bp_user_token', token)
//         localStorage.setItem('bp_user_email', user?.email ?? '')
//         localStorage.setItem('bp_user_id', user?.id ?? '')
//         localStorage.setItem('bp_is_logged_in', 'true')
//       } else {
//         localStorage.removeItem('bp_user_token')
//         localStorage.removeItem('bp_user_email')
//         localStorage.removeItem('bp_user_id')
//         localStorage.setItem('bp_is_logged_in', 'false')
//       }

//       console.log('👤 sync user:', user?.email, '| isLoggedIn:', !!user)
//     }

//     syncUser()
//   }, [isLoggedIn])

//   return null
// }
// components/ChatBot.jsx
// components/ChatBot.jsx
// components/ChatBot.tsx
'use client'
import Script from 'next/script'
import { supabase } from '@/app/libs/supabaseClient'
import { User } from '@supabase/supabase-js'
import { useEffect, useState, useRef } from 'react'

export default function ChatBot() {
  const [user, setUser] = useState<User | null>(null)
  const [botReady, setBotReady] = useState(false)
  const hasSentAuth = useRef(false)
  const messageListenerAdded = useRef(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  // Chờ botpress load xong
  useEffect(() => {
    const interval = setInterval(() => {
      if (window.botpress) {
        setBotReady(true)
        clearInterval(interval)
      }
    }, 300)
    return () => clearInterval(interval)
  }, [])

  // Gửi auth — chỉ 1 lần duy nhất
  useEffect(() => {
    if (!botReady || !window.botpress) return
    if (!user) return
    if (hasSentAuth.current) return  // ← chặn gửi lại

    hasSentAuth.current = true  // ← đánh dấu TRƯỚC khi gửi

    const payload = `__auth__${user.email}__${user.id}__true`
    console.log('🤖 Gửi auth:', payload)

    setTimeout(() => {
      window.botpress?.sendMessage(payload)
      console.log('✅ Đã gửi auth message')
    }, 1000)

  }, [botReady, user])

  // Lắng nghe event click — chỉ đăng ký 1 lần
 useEffect(() => {
  if (!botReady || !window.botpress) return
  if (messageListenerAdded.current) return

  messageListenerAdded.current = true

  window.botpress?.on('message', (data: any) => {
    const blocks = data?.block?.blocks ?? []

    blocks.forEach((col: any) => {
      col?.blocks?.forEach((block: any) => {
        block?.blocks?.forEach((btn: any) => {
          if (!btn?.buttonValue) return

          // Bấm "Xem sản phẩm" → mở thẳng trang collections
          if (btn.buttonValue.startsWith('category_')) {
              const slug = btn.buttonValue.replace('category_', '')
              const url = `http://localhost:3000/collections/${slug}`
              
              const a = document.createElement('a')
              a.href = url
              a.target = '_blank'
              a.rel = 'noopener noreferrer'
              document.body.appendChild(a)
              a.click()
              document.body.removeChild(a)
              return
            }
 
          // Bấm "Xem chi tiết" sản phẩm → mở link web
          if (btn.buttonValue.startsWith('https://')) {
            window.open(btn.buttonValue, '_blank')
            return
          }
        })
      })
    })
  })
}, [botReady])
  return (
    <>
      <Script
        src="https://cdn.botpress.cloud/webchat/v3.6/inject.js"
        strategy="afterInteractive"
      />
      <Script
        src="https://files.bpcontent.cloud/2026/06/04/09/20260604092933-NXPN19LJ.js"
        strategy="afterInteractive"
      />
    </>
  )
}








//  return (
//     <>
//       <Script
//         src="https://cdn.botpress.cloud/webchat/v3.6/inject.js"
//         strategy="afterInteractive"
//       />
//       <Script
//         src="https://files.bpcontent.cloud/2025/12/11/08/20251211081314-GCM8M5CS.js"
//         strategy="afterInteractive"
//       />
//     </>
//   )