'use client'
import Script from 'next/script'
import { supabase } from '@/app/libs/supabaseClient'
import type { User } from '@supabase/supabase-js'
import { useEffect, useState, useRef } from 'react'
import './botpress-launcher.css'

const IDENTITY_STORAGE_PREFIX = 'store:botpress:identity:v2'
const CHAT_ACTIVITY_STORAGE_PREFIX = 'store:botpress:last-activity:v1'
const CONVERSATION_IDLE_TIMEOUT_MS = 30 * 60 * 1000

function identityStorageKey(conversationId: string) {
  const botId = window.botpress?.botId || window.botpress?.clientId || 'store'
  return `${IDENTITY_STORAGE_PREFIX}:${botId}:${conversationId}`
}

function chatActivityStorageKey(conversationId: string) {
  const botId = window.botpress?.botId || window.botpress?.clientId || 'store'
  return `${CHAT_ACTIVITY_STORAGE_PREFIX}:${botId}:${conversationId}`
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
  const sentGuestEvents = useRef(new Set<string>())
  const pendingIdentities = useRef(new Set<string>())
  const productLinkCache = useRef(new Map<string, string | null>())
  const desiredIdentity = useRef<string | null>(null)
  const messageListenerAdded = useRef(false)
  const readyListenerAdded = useRef(false)
  const chatActivity = useRef(new Map<string, number>())

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
    // Older builds cached "guest" without actually sending the event. Keep a
    // separate marker so those existing sessions can emit it once after update.
    const guestEventSentKey = `${key}:guest-event:v1`
    const guestEventWasSent = sentGuestEvents.current.has(key) || (() => {
      try {
        return window.localStorage.getItem(guestEventSentKey) === 'sent'
      } catch {
        return false
      }
    })()
    // A pending auth send may still replace the stored guest state.
    if (previousIdentity === identity && pendingIdentities.current.size === 0 && (user || guestEventWasSent)) return
    pendingIdentities.current.add(pendingKey)

    const sendIdentity = async () => {
      // Do not send a queued event to a different conversation after a reset.
      if (window.botpress?.conversationId !== conversationId) return
      if (desiredIdentity.current !== identity) return
      // A different tab may have finished sending while this tab waited.
      const storedIdentity = readStoredIdentity(key) ?? sentIdentities.current.get(key)
      if (storedIdentity === identity && (user || guestEventWasSent)) return
      const previouslyAuthenticated = storedIdentity?.startsWith('auth:') ?? false
      // Send guest identity on first visit as well as on logout so Botpress can
      // run its guest trigger and record the event in the conversation logs.
      const type = user ? 'auth' : 'guest'
      let payload
      if (user) {
        // The server verifies the Supabase session, then reads only the user's
        // profile under the own-row RLS rule.
        const { data: { session } } = await supabase.auth.getSession()
        const profileResponse = await fetch('/api/chat/profile', {
          method: 'POST',
          cache: 'no-store',
          headers: session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : undefined,
        })
        if (!profileResponse.ok) {
          throw new Error(`Profile verification failed (${profileResponse.status}).`)
        }

        const { profile, chatOrderToken } = await profileResponse.json()
        payload = {
          type,
          text: `__auth__${profile.email}__${profile.id}__true`,
          email: profile.email,
          userId: profile.id,
          profile,
          chatOrderToken,
          isLoggedIn: true,
        }
      } else {
        payload = {
          type,
          text: '__guest__',
          reason: previouslyAuthenticated ? 'logout' : 'guest',
          email: null,
          userId: null,
          isLoggedIn: false,
        }
      }
      await window.botpress!.sendEvent(payload)
      sentIdentities.current.set(key, identity)
      if (!user) sentGuestEvents.current.add(key)
      try {
        window.localStorage.setItem(key, identity)
        if (!user) window.localStorage.setItem(guestEventSentKey, 'sent')
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
    const webchat = window.botpress
    if (!botReady || !conversationId || !webchat) return

    const activityKey = chatActivityStorageKey(conversationId)
    let idleTimer: ReturnType<typeof setTimeout> | null = null
    let resetInProgress = false
    let active = true

    const getLastActivity = () => {
      try {
        const stored = Number(window.localStorage.getItem(activityKey))
        if (Number.isFinite(stored) && stored > 0) {
          chatActivity.current.set(activityKey, stored)
          return stored
        }
      } catch {
        // Fall back to the in-memory timestamp when browser storage is unavailable.
      }
      return chatActivity.current.get(activityKey) ?? null
    }

    const setLastActivity = (timestamp: number) => {
      chatActivity.current.set(activityKey, timestamp)
      try {
        window.localStorage.setItem(activityKey, String(timestamp))
      } catch {
        // The idle timer still works for this page when browser storage is unavailable.
      }
    }

    const scheduleIdleReset = () => {
      if (idleTimer) clearTimeout(idleTimer)
      const lastActivity = getLastActivity()
      if (lastActivity === null) return
      const delay = Math.max(0, CONVERSATION_IDLE_TIMEOUT_MS - (Date.now() - lastActivity))
      idleTimer = setTimeout(() => {
        void resetIfIdle()
      }, delay)
    }

    const resetIfIdle = async () => {
      if (!active || resetInProgress || window.botpress?.conversationId !== conversationId) return
      const lastActivity = getLastActivity()
      if (lastActivity === null) return
      const remaining = CONVERSATION_IDLE_TIMEOUT_MS - (Date.now() - lastActivity)
      if (remaining > 0) {
        scheduleIdleReset()
        return
      }

      resetInProgress = true
      const startNewConversation = async () => {
        if (!active || window.botpress?.conversationId !== conversationId) return
        const latestActivity = getLastActivity()
        if (latestActivity === null || Date.now() - latestActivity < CONVERSATION_IDLE_TIMEOUT_MS) {
          scheduleIdleReset()
          return
        }

        try {
          let unsubscribeConversation: (() => void) | undefined
          let conversationTimeout: ReturnType<typeof setTimeout> | undefined
          const conversationChanged = new Promise<string>((resolve) => {
            unsubscribeConversation = webchat.on('conversation', (nextId) => {
              if (typeof nextId === 'string' && nextId !== conversationId) resolve(nextId)
            }) ?? undefined
          })

          try {
            await webchat.restartConversation()
            const nextConversationId = webchat.conversationId
            const confirmedConversationId = nextConversationId && nextConversationId !== conversationId
              ? nextConversationId
              : await Promise.race([
                conversationChanged,
                new Promise<string>((_, reject) => {
                  conversationTimeout = setTimeout(() => {
                    reject(new Error('Botpress did not confirm the new conversation.'))
                  }, 10_000)
                }),
              ])
            setConversationId(confirmedConversationId)
          } finally {
            if (conversationTimeout) clearTimeout(conversationTimeout)
            unsubscribeConversation?.()
          }
        } catch (error) {
          console.error('Failed to start a new Botpress conversation after inactivity:', error)
          idleTimer = setTimeout(() => {
            void resetIfIdle()
          }, 30_000)
        }
      }

      try {
        if (navigator.locks) {
          await navigator.locks.request(`botpress-idle-reset:${activityKey}`, startNewConversation)
        } else {
          await startNewConversation()
        }
      } catch (error) {
        console.error('Failed to acquire the Botpress conversation reset lock:', error)
        idleTimer = setTimeout(() => {
          void resetIfIdle()
        }, 30_000)
      } finally {
        resetInProgress = false
      }
    }

    const recordChatActivity = () => {
      if (!active || window.botpress?.conversationId !== conversationId) return
      const now = Date.now()
      const lastActivity = getLastActivity()
      if (lastActivity !== null && now - lastActivity >= CONVERSATION_IDLE_TIMEOUT_MS) {
        void resetIfIdle()
        return
      }
      setLastActivity(now)
      scheduleIdleReset()
    }

    const handleChatInteraction = (event: Event) => {
      const target = event.target
      if (!(target instanceof Element) || !target.closest('.bpWebchat, .bpChatContainer')) return
      recordChatActivity()
    }

    const checkIdleOnReturn = () => {
      if (document.visibilityState === 'visible') void resetIfIdle()
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === activityKey) scheduleIdleReset()
    }

    const unsubscribeMessageSent = webchat.on('messageSent', recordChatActivity)
    const unsubscribeOpened = webchat.on('webchat:opened', recordChatActivity)
    document.addEventListener('pointerdown', handleChatInteraction, true)
    document.addEventListener('keydown', handleChatInteraction, true)
    document.addEventListener('input', handleChatInteraction, true)
    document.addEventListener('visibilitychange', checkIdleOnReturn)
    window.addEventListener('focus', checkIdleOnReturn)
    window.addEventListener('storage', handleStorageChange)

    const initializeIdleTimer = () => {
      if (getLastActivity() === null) setLastActivity(Date.now())
      scheduleIdleReset()
    }

    initializeIdleTimer()

    return () => {
      active = false
      if (idleTimer) clearTimeout(idleTimer)
      if (typeof unsubscribeMessageSent === 'function') unsubscribeMessageSent()
      if (typeof unsubscribeOpened === 'function') unsubscribeOpened()
      document.removeEventListener('pointerdown', handleChatInteraction, true)
      document.removeEventListener('keydown', handleChatInteraction, true)
      document.removeEventListener('input', handleChatInteraction, true)
      document.removeEventListener('visibilitychange', checkIdleOnReturn)
      window.removeEventListener('focus', checkIdleOnReturn)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [botReady, conversationId])

  useEffect(() => {
    if (!botReady || !window.botpress) return
    if (messageListenerAdded.current) return

    messageListenerAdded.current = true

    let productCatalogPromise: Promise<Array<{ name: string; slug: string; gender_id: number }> | null> | null = null

    const productUrlFor = async (productName: string) => {
      let productUrl = productLinkCache.current.get(productName)
      if (productUrl === undefined) {
        productCatalogPromise ??= Promise.resolve(
          supabase.from('products').select('name, slug, gender_id')
        ).then(({ data, error }) => error ? null : data)

        const normalize = (value: string) => value
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLocaleLowerCase('vi')
          .replace(/\s+/g, ' ')
          .trim()
        const products = await productCatalogPromise
        const product = products
          ?.find((entry) => normalize(entry.name) === normalize(productName))

        productUrl = product?.slug && (product.gender_id === 1 || product.gender_id === 2)
          ? `/${product.gender_id === 1 ? 'men' : 'women'}/${encodeURIComponent(product.slug)}`
          : null
        productLinkCache.current.set(productName, productUrl)
      }
      return productUrl
    }

    const normalizeText = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

    const repairProductLinks = async () => {
      const items = document.querySelectorAll<HTMLElement>('.bpWebchat li')
      await Promise.all(Array.from(items).map(async (item) => {
        if (item.dataset.productLinkRepair) return
        const itemText = item.textContent?.trim() ?? ''

        // Botpress can render the CTA as plain text or as an anchor without href.
        const anchor = Array.from(item.querySelectorAll<HTMLAnchorElement>('a'))
          .find((link) => normalizeText(link.textContent ?? '').startsWith('xem '))
        const anchorProductName = anchor?.textContent
          ?.replace(/^\s*(?:xem san pham|chi tiet san pham|xem)\s*/i, '')
          .trim()
        const productName = (anchorProductName || itemText)
          .split(/\s+[\u2014\u2013-]\s+/)[0]
          ?.replace(/^\s*\d+[.)]\s*/, '')
          .replace(/[`*_]/g, '')
          .replace(/\s*[|·].*$/, '')
          .trim()
        if (!productName) return
        item.dataset.productLinkRepair = 'pending'
        const productUrl = await productUrlFor(productName)
        if (!productUrl) {
          delete item.dataset.productLinkRepair
          return
        }

        const cta = anchor ?? Array.from(item.querySelectorAll<HTMLAnchorElement>('a'))
          .find((link) => normalizeText(link.textContent ?? '').includes('xem san pham'))
        if (cta) {
          cta.href = productUrl
          cta.target = '_self'
          cta.rel = 'noopener noreferrer'
        } else {
          const walker = document.createTreeWalker(item, NodeFilter.SHOW_TEXT)
          let node: Node | null
          while ((node = walker.nextNode())) {
            const text = node.textContent ?? ''
            const normalized = normalizeText(text)
            const index = normalized.indexOf('xem san pham')
            if (index < 0 || !node.parentNode) continue
            const phraseLength = 'xem san pham'.length
            // Match the original accented text while locating its normalized range.
            const startOffset = Array.from(text).slice(0, index).join('').length
            const endOffset = Array.from(text).slice(0, index + phraseLength).join('').length
            const fragment = document.createDocumentFragment()
            if (startOffset > 0) fragment.append(text.slice(0, startOffset))
            const link = document.createElement('a')
            link.textContent = text.slice(startOffset, endOffset)
            link.href = productUrl
            link.target = '_self'
            link.rel = 'noopener noreferrer'
            fragment.append(link)
            const after = text.slice(endOffset)
            if (after) fragment.append(after)
            node.parentNode.replaceChild(fragment, node)
            break
          }
        }
        if (!cta && !normalizeText(itemText).includes('xem san pham')) {
          const link = document.createElement('a')
          link.textContent = 'Xem sản phẩm'
          link.href = productUrl
          link.target = '_self'
          link.rel = 'noopener noreferrer'
          link.style.marginLeft = '0.35em'
          item.append(' ', link)
        }
        item.dataset.productLinkRepair = 'done'
      }))
    }
    const linkObserver = new MutationObserver(() => {
      void repairProductLinks()
    })
    linkObserver.observe(document.body, { childList: true, subtree: true })
    void repairProductLinks()

    return () => linkObserver.disconnect()
  }, [botReady])

  return (
    <>
      <Script
        src="https://cdn.botpress.cloud/webchat/v3.7/inject.js"
        strategy="afterInteractive"
        onReady={handleInjectReady}
      />
      {injectReady && <Script
        src="https://files.bpcontent.cloud/2026/11/04/10/20261104104139-YKEB1I3J.js"
        strategy="afterInteractive"
      />}
    </>
  )
}
