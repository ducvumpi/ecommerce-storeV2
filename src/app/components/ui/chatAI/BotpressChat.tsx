'use client'
import Script from 'next/script'
import { supabase } from '@/app/libs/supabaseClient'
import type { User } from '@supabase/supabase-js'
import { useEffect, useState, useRef } from 'react'
import './botpress-launcher.css'

const IDENTITY_STORAGE_KEY = 'store:botpress:last-sent-identity:v1'

function readStoredIdentity() {
  try {
    const identity = window.localStorage.getItem(IDENTITY_STORAGE_KEY)
    return identity === 'guest' || identity?.startsWith('auth:') ? identity : null
  } catch {
    return null
  }
}

export default function ChatBot() {
  const [user, setUser] = useState<User | null | undefined>(undefined)
  const [botReady, setBotReady] = useState(false)
  const [injectReady, setInjectReady] = useState(false)
  const [botInitialized, setBotInitialized] = useState(false)
  const lastIdentity = useRef<string | null>(null)
  const wasAuthenticated = useRef(false)
  const messageListenerAdded = useRef(false)
  const readyListenerAdded = useRef(false)

  // localStorage shares successful sends across reloads and tabs.
  useEffect(() => {
    const restoreIdentity = () => {
      const identity = readStoredIdentity()
      lastIdentity.current = identity
      wasAuthenticated.current = identity?.startsWith('auth:') ?? false
    }
    restoreIdentity()
    const handleStorage = (event: StorageEvent) => {
      if (event.key === IDENTITY_STORAGE_KEY || event.key === null) restoreIdentity()
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const handleInjectReady = () => {
    if (!window.botpress) return
    if (!readyListenerAdded.current) {
      readyListenerAdded.current = true
      window.botpress.on('webchat:initialized', () => {
        setBotInitialized(true)
      })
      window.botpress.on('webchat:ready', () => {
        setBotReady(true)
      })
    }
    // Only load the configuration after the SDK and its ready listener exist.
    setInjectReady(true)
  }

  useEffect(() => {
    let active = true
    let authChanged = false
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        authChanged = true
        if (active) setUser(session?.user ?? null)
      }
    )
    void supabase.auth.getUser().then(({ data, error }) => {
      if (!active || authChanged) return
      if (error && error.name !== 'AuthSessionMissingError') {
        console.error('Failed to read chat user:', error)
        return
      }
      setUser(data.user)
    })
    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  // The SDK cannot send events until Webchat has been opened once.
  useEffect(() => {
    if (user === undefined) return
    const identity = user ? `auth:${user.id}:${user.email ?? ''}` : 'guest'
    if (botInitialized && !botReady && lastIdentity.current !== identity && readStoredIdentity() !== identity) {
      window.botpress?.open()
    }
  }, [botInitialized, botReady, user])

  // Synchronize identity once, including repeated SIGNED_IN notifications.
  useEffect(() => {
    if (!botReady || user === undefined || !window.botpress?.sendEvent) return
    const identity = user ? `auth:${user.id}:${user.email ?? ''}` : 'guest'
    if (lastIdentity.current === identity) return
    const previousIdentity = lastIdentity.current
    const previousAuth = wasAuthenticated.current
    lastIdentity.current = identity
    wasAuthenticated.current = !!user

    const sendIdentity = async () => {
      // A different tab may have finished sending while this tab waited.
      const storedIdentity = readStoredIdentity()
      if (storedIdentity === identity) return
      const previouslyAuthenticated = storedIdentity?.startsWith('auth:') ?? previousAuth
      const type = user ? 'auth' : previouslyAuthenticated ? 'logout' : 'guest'
      const payload = user
      ? {
        type,
        text: `__auth__${user.email ?? ''}__${user.id}__true`,
        email: user.email ?? '',
        userId: user.id,
        isLoggedIn: true,
      }
      : {
        type,
        text: type === 'logout' ? '__logout__' : '__guest__',
        email: null,
        userId: null,
        isLoggedIn: false,
      }
      await window.botpress!.sendEvent(payload)
      try {
        window.localStorage.setItem(IDENTITY_STORAGE_KEY, identity)
      } catch {
        // The event was sent even if browser storage is unavailable.
      }
      console.info('[Botpress] Identity event sent:', type)
    }

    // Serialize sends across tabs on browsers supporting Web Locks.
    const sending = navigator.locks
      ? navigator.locks.request(IDENTITY_STORAGE_KEY, sendIdentity)
      : sendIdentity()
    void sending.catch((error: unknown) => {
      if (lastIdentity.current === identity) {
        lastIdentity.current = previousIdentity
        wasAuthenticated.current = previousAuth
      }
      console.error('Failed to synchronize Botpress identity:', error)
    })
  }, [botReady, user])

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
        src="https://cdn.botpress.cloud/webchat/v3.7/inject.js"
        strategy="afterInteractive"
        onReady={handleInjectReady}
      />
      {injectReady && <Script
        src="https://files.bpcontent.cloud/2026/10/15/01/20261015013058-XZTWHIPM.js"
        strategy="afterInteractive"
      />}
    </>
  )
}



