'use client'
import Script from 'next/script'
import { supabase } from '@/app/libs/supabaseClient'
import type { User } from '@supabase/supabase-js'
import { useEffect, useState, useRef } from 'react'
import './botpress-launcher.css'

const IDENTITY_STORAGE_PREFIX = 'store:botpress:identity:v2'

function identityStorageKey(conversationId: string) {
  const botId = window.botpress?.botId || window.botpress?.clientId || 'store'
  return `${IDENTITY_STORAGE_PREFIX}:${botId}:${conversationId}`
}

function readStoredIdentity(key: string) {
  try {
    const identity = window.localStorage.getItem(key)
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
  const [conversationId, setConversationId] = useState<string | null>(null)
  const sentIdentities = useRef(new Map<string, string>())
  const pendingIdentities = useRef(new Set<string>())
  const desiredIdentity = useRef<string | null>(null)
  const messageListenerAdded = useRef(false)
  const readyListenerAdded = useRef(false)

  const handleInjectReady = () => {
    if (!window.botpress) return
    if (!readyListenerAdded.current) {
      readyListenerAdded.current = true
      const syncConversation = (id?: unknown) => {
        const currentId = typeof id === 'string' ? id : window.botpress?.conversationId
        if (currentId) setConversationId(currentId)
      }
      window.botpress.on('webchat:initialized', () => {
        syncConversation()
        setBotInitialized(true)
      })
      window.botpress.on('webchat:ready', () => {
        syncConversation()
        setBotReady(true)
      })
      window.botpress.on('conversation', syncConversation)
      window.botpress.on('webchat:opened', () => syncConversation())
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
    const currentId = window.botpress?.conversationId
    const key = currentId ? identityStorageKey(currentId) : null
    const previousIdentity = key
      ? readStoredIdentity(key) ?? sentIdentities.current.get(key)
      : null
    if (botInitialized && !botReady && previousIdentity !== identity) {
      window.botpress?.open()
    }
  }, [botInitialized, botReady, conversationId, user])

  // Synchronize identity once, including repeated SIGNED_IN notifications.
  useEffect(() => {
    if (user === undefined) return
    const identity = user ? `auth:${user.id}:${user.email ?? ''}` : 'guest'
    desiredIdentity.current = identity
    if (!botReady || !conversationId || !window.botpress?.sendEvent) return
    const key = identityStorageKey(conversationId)
    const previousIdentity = readStoredIdentity(key) ?? sentIdentities.current.get(key)
    const pendingKey = `${key}:${identity}`
    if (pendingIdentities.current.has(pendingKey)) return
    // A pending auth send may still replace the stored guest state.
    if (previousIdentity === identity && pendingIdentities.current.size === 0) return
    pendingIdentities.current.add(pendingKey)

    const sendIdentity = async () => {
      // Do not send a queued event to a different conversation after a reset.
      if (window.botpress?.conversationId !== conversationId) return
      if (desiredIdentity.current !== identity) return
      // A different tab may have finished sending while this tab waited.
      const storedIdentity = readStoredIdentity(key) ?? sentIdentities.current.get(key)
      if (storedIdentity === identity) return
      const previouslyAuthenticated = storedIdentity?.startsWith('auth:') ?? false
      // The bot has auth/guest triggers, so logout must enter the guest trigger.
      const type = user ? 'auth' : 'guest'
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
        text: '__guest__',
        reason: previouslyAuthenticated ? 'logout' : 'guest',
        email: null,
        userId: null,
        isLoggedIn: false,
      }
      await window.botpress!.sendEvent(payload)
      sentIdentities.current.set(key, identity)
      try {
        window.localStorage.setItem(key, identity)
      } catch {
        // The event was sent even if browser storage is unavailable.
      }
      console.info('[Botpress] Identity event sent:', type, '| conversation:', conversationId)
    }

    // Serialize sends across tabs on browsers supporting Web Locks.
    const sending = navigator.locks
      ? navigator.locks.request(key, sendIdentity)
      : sendIdentity()
    void sending.catch((error: unknown) => {
      console.error('Failed to synchronize Botpress identity:', error)
    }).finally(() => {
      pendingIdentities.current.delete(pendingKey)
    })
  }, [botReady, conversationId, user])

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



