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





  useEffect(() => {
  if (!botReady || !window.botpress) return
  if (hasSentAuth.current) return

  supabase.auth.getUser().then(({ data }) => {
    if (!data.user) return
    if (hasSentAuth.current) return

    hasSentAuth.current = true
    const u = data.user
    const payload = `__auth__${u.email}__${u.id}__true`
    console.log('🤖 Gửi auth:', payload)

    // Ẩn bằng CSS ngay lập tức
    const style = document.createElement('style')
    style.id = 'hide-auth-style'
    style.innerHTML = `
      .bpMessageContainer:has(a.bpMessageBlocksTextLink) {
        display: none !important;
      }
    `
    document.head.appendChild(style)

    // Setup MutationObserver
    const hideAuth = () => {
      document.querySelectorAll('*').forEach((el) => {
        if (el.shadowRoot) {
          el.shadowRoot.querySelectorAll('.bpMessageContainer').forEach((container) => {
            if (container.textContent?.includes('__auth__')) {
              (container as HTMLElement).style.display = 'none'
            }
          })
        }
      })
    }
    const observer = new MutationObserver(hideAuth)
    observer.observe(document.body, { childList: true, subtree: true })

    // Gửi auth — CHỈ 1 LẦN
 // Thêm class vào body để CSS target
document.body.classList.add('sending-auth')

window.botpress?.sendMessage(payload)

setTimeout(() => {
  document.body.classList.remove('sending-auth')
}, 2000)
  })

}, [botReady])

//   // Ẩn auth message trong DOM
// useEffect(() => {
//   const hideAuthMessage = () => {
//     const allElements = document.querySelectorAll('*')
//     allElements.forEach((el) => {
//       if (el.shadowRoot) {
//         const bubbles = el.shadowRoot.querySelectorAll('.bpMessageBlocksBubble')
//         bubbles.forEach((bubble) => {
//           if (bubble.textContent?.includes('__auth__')) {
//             // Ẩn div cha bpMessageContainer
//             const container = bubble.closest('.bpMessageContainer') as HTMLElement
//             if (container) container.style.display = 'none'
//           }
//         })
//       }
//     })
//   }

//   const observer = new MutationObserver(hideAuthMessage)
//   observer.observe(document.body, { childList: true, subtree: true })

//   return () => observer.disconnect()
// }, [])
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
        src="https://files.bpcontent.cloud/2026/06/17/02/20260617023538-HCMRW5W8.js"
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