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
  const sentGuestEvents = useRef(new Set<string>())
  const pendingIdentities = useRef(new Set<string>())
  const productLinkCache = useRef(new Map<string, string | null>())
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
    if (!botReady || !window.botpress) return
    if (messageListenerAdded.current) return

    messageListenerAdded.current = true

    const productUrlFor = async (productName: string) => {
      let productUrl = productLinkCache.current.get(productName)
      if (productUrl === undefined) {
        const { data, error } = await supabase
          .from('products')
          .select('slug, gender_id')
          .eq('name', productName)
          .maybeSingle()

        productUrl = !error && data?.slug && (data.gender_id === 1 || data.gender_id === 2)
          ? `/${data.gender_id === 1 ? 'men' : 'women'}/${encodeURIComponent(data.slug)}`
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
        const productName = itemText
          .split(/\s+[\u2014\u2013-]\s+/)[0]
          ?.replace(/^\s*\d+[.)]\s*/, '')
          .replace(/[`*_]/g, '')
          .trim()
        if (!productName) return
        item.dataset.productLinkRepair = 'pending'
        const productUrl = await productUrlFor(productName)
        if (!productUrl) {
          delete item.dataset.productLinkRepair
          return
        }

        const cta = Array.from(item.querySelectorAll<HTMLAnchorElement>('a'))
          .find((anchor) => normalizeText(anchor.textContent ?? '').includes('xem san pham'))
        if (cta) {
          cta.href = productUrl
          cta.target = '_blank'
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
            link.target = '_blank'
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
          link.textContent = 'Xem san pham'
          link.href = productUrl
          link.target = '_blank'
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

    window.botpress?.on('message', (data: any) => {
      const blocks = data?.block?.blocks ?? []
      blocks.forEach((col: any) => {
        col?.blocks?.forEach((block: any) => {
          block?.blocks?.forEach((btn: any) => {
            if (!btn?.buttonValue) return

            if (btn.buttonValue.startsWith('category_')) {
              const slug = btn.buttonValue.replace('category_', '')
              const url = new URL(`/collections/${slug}`, window.location.origin).toString()
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
        src="https://files.bpcontent.cloud/2026/10/15/01/20261015013058-XZTWHIPM.js"
        strategy="afterInteractive"
      />}
    </>
  )
}



