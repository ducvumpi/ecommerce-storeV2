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
'use client'
import Script from 'next/script'
import { supabase } from '@/app/libs/supabaseClient'
import { User } from '@supabase/supabase-js'
import { useEffect, useState, useRef } from 'react'

export default function ChatBot() {
  const [botReady, setBotReady] = useState(false)
  const botReadyRef = useRef(false) // ✅ ref để tránh stale closure
  const hasSentAuth = useRef(false)
  const hasSentGuest = useRef(false)
  const messageListenerAdded = useRef(false)

  const sendAuth = (email: string, id: string) => {
    if (!window.botpress?.sendMessage) return
    hasSentAuth.current = true
    const payload = `__auth__${email}__${id}__true`
    const style = document.createElement('style')
    style.id = 'hide-auth-style'
    style.innerHTML = `.sending-auth .bpMessageContainer:has(a.bpMessageBlocksTextLink) { display: none !important; }`
    document.head.appendChild(style)
    document.body.classList.add('sending-auth')
    window.botpress.sendMessage(payload)
    console.log('✅ Sent auth:', email)
    setTimeout(() => {
      document.body.classList.remove('sending-auth')
      document.getElementById('hide-auth-style')?.remove()
    }, 3000)
  }

  // Lắng nghe auth state change
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (_event === 'SIGNED_IN' && session?.user) {
          // ✅ Dùng ref thay vì state
          if (hasSentAuth.current) return
          const u = session.user

          if (botReadyRef.current) {
            sendAuth(u.email!, u.id)
          } else {
            // Bot chưa ready → chờ
            const wait = setInterval(() => {
              if (!botReadyRef.current) return
              sendAuth(u.email!, u.id)
              clearInterval(wait)
            }, 300)
          }
        }

        if (_event === 'SIGNED_OUT') {
          window.botpress?.sendMessage('__logout__')
          hasSentAuth.current = false
          hasSentGuest.current = false
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  // Chờ bot ready
  useEffect(() => {
    const tryReady = () => {
      if (window.botpress) {
        setBotReady(true)
        botReadyRef.current = true
        return true
      }
      return false
    }
    if (tryReady()) return
    const interval = setInterval(() => {
      if (tryReady()) clearInterval(interval)
    }, 300)
    return () => clearInterval(interval)
  }, [])

  // Gửi auth/guest lần đầu khi bot ready
  useEffect(() => {
    if (!botReady) return

    supabase.auth.getUser().then(({ data }) => {
      const u = data.user
      if (u && !hasSentAuth.current) {
        sendAuth(u.email!, u.id)
      } else if (!u && !hasSentGuest.current) {
        hasSentGuest.current = true
        window.botpress?.sendMessage('__guest__')
      }
    })
  }, [botReady])

  // Lắng nghe message event
  useEffect(() => {
    if (!botReady || messageListenerAdded.current) return
    messageListenerAdded.current = true

    window.botpress?.on('message', (data: any) => {
      const blocks = data?.block?.blocks ?? []
      blocks.forEach((col: any) => {
        col?.blocks?.forEach((block: any) => {
          block?.blocks?.forEach((btn: any) => {
            if (!btn?.buttonValue) return
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
            if (btn.buttonValue.startsWith('https://')) {
              window.open(btn.buttonValue, '_blank')
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
        onLoad={() => { if (window.botpress) { setBotReady(true); botReadyRef.current = true } }}
      />
      <Script
        src="https://files.bpcontent.cloud/2026/06/17/02/20260617023538-HCMRW5W8.js"
        strategy="afterInteractive"
        onLoad={() => { if (window.botpress) { setBotReady(true); botReadyRef.current = true } }}
      />
    </>
  )
}

