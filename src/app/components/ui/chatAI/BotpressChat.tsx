'use client'
import Script from 'next/script'
import { supabase } from '@/app/libs/supabaseClient'
import { User } from '@supabase/supabase-js'
import { useEffect, useState, useRef } from 'react'

export default function ChatBot() {
  const [user, setUser] = useState<User | null>(null)
  const [botReady, setBotReady] = useState(false)
  const [injectReady, setInjectReady] = useState(false)
  const hasSentAuth = useRef(false)
  const messageListenerAdded = useRef(false)
  const readyListenerAdded = useRef(false)
  const botReadyRef = useRef(false)

  const handleInjectReady = () => {
    if (!window.botpress) return
    if (!readyListenerAdded.current) {
      readyListenerAdded.current = true
      window.botpress.on('webchat:ready', () => {
        botReadyRef.current = true
        setBotReady(true)
      })
    }
    // Only load the configuration after the SDK and its ready listener exist.
    setInjectReady(true)
  }

  const sendAuthMessage = (email: string, id: string) => {
    const payload = `__auth__${email}__${id}__true`

    const style = document.createElement('style')
    style.id = 'hide-auth-style'
    style.innerHTML = `.sending-auth .bpMessageContainer:has(a.bpMessageBlocksTextLink) { display: none !important; }`
    document.head.appendChild(style)
    document.body.classList.add('sending-auth')

    window.botpress?.sendMessage(payload)
    hasSentAuth.current = true
    console.log('✅ Gửi auth:', payload)

    setTimeout(() => {
      document.body.classList.remove('sending-auth')
      document.getElementById('hide-auth-style')?.remove()
    }, 3000)
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)

        if (_event === 'SIGNED_IN' && session?.user) {
          hasSentAuth.current = false
          const u = session.user

          const trySend = setInterval(() => {
            if (!botReadyRef.current || !window.botpress?.sendMessage) return
            clearInterval(trySend)
            sendAuthMessage(u.email ?? '', u.id)
          }, 300)
        }

        if (_event === 'SIGNED_OUT' && botReadyRef.current && window.botpress) {
          window.botpress?.sendMessage('__logout__')
          hasSentAuth.current = false
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  // Gửi auth/guest lần đầu
  useEffect(() => {
    if (!botReady) return

    const sendInitMessage = async () => {
      let attempts = 0
      while (!window.botpress?.sendMessage && attempts < 20) {
        await new Promise(r => setTimeout(r, 300))
        attempts++
      }

      if (!window.botpress?.sendMessage) return
      if (hasSentAuth.current) return

      const { data } = await supabase.auth.getUser()
      if (hasSentAuth.current) return

      const u = data.user
      if (u) {
        sendAuthMessage(u.email ?? '', u.id)
      } else {
        // Delay 3s trước khi gửi __guest__
        // để tránh ghi đè nếu user đã nhập tin nhắn
        setTimeout(() => {
          if (hasSentAuth.current) return
          hasSentAuth.current = true
          window.botpress?.sendMessage('__guest__')
          console.log('✅ Gửi: __guest__')
        }, 3000)
      }
    }

    sendInitMessage()
  }, [botReady])

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
        onReady={handleInjectReady}
      />
      {injectReady && <Script
        src="https://files.bpcontent.cloud/2026/06/17/02/20260617023538-HCMRW5W8.js"
        strategy="afterInteractive"
      />}
    </>
  )
}



