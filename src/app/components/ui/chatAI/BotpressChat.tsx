'use client'
import Script from 'next/script'
import { supabase } from '@/app/libs/supabaseClient'
import type { User } from '@supabase/supabase-js'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import './botpress-launcher.css'

const IDENTITY_STORAGE_PREFIX = 'store:botpress:identity:v2'
const CHAT_ORDER_TOKEN_REFRESH_INTERVAL_MS = 5 * 60 * 1000
const BOTPRESS_INIT_CONFIG = {
  botId: '43725cc2-1a63-4330-bff8-cfe6d9772a82',
  clientId: '33f591b6-229d-4873-91f1-7f8d7b1e542f',
  configuration: {
    version: 'v2',
    composerPlaceholder: '"Tôi có thể giúp gì cho bạn hôm nay?"',
    botName: 'Trợ lý Nai Tiệm Mùa Chậm.',
    botAvatar: 'https://files.bpcontent.cloud/2026/11/18/09/20261118090953-TVLI9WXB.png',
    botDescription: 'Mua sắm tự động giúp người dùng duyệt sản phẩm, xem chi tiết, tra cứu giá và nhận tư vấn nhanh chóng trong quá trình mua hàng.',
    website: { title: 'https://tiem-mua-cham-store.vercel.app/', link: 'https://tiem-mua-cham-store.vercel.app/' },
    email: { title: 'tiemmuacham@gmail.com', link: 'tiemmuacham@gmail.com' },
    phone: { title: '+84 38 8999 699', link: '+84 38 8999 699' },
    termsOfService: { title: 'Terms of service', link: 'https://tiem-mua-cham-store.vercel.app/' },
    privacyPolicy: { title: 'Privacy policy', link: 'https://tiem-mua-cham-store.vercel.app/' },
    color: '#ccbc96',
    variant: 'solid',
    headerVariant: 'glass',
    themeMode: 'light',
    fontFamily: 'inter',
    radius: 4,
    feedbackEnabled: true,
    footer: '[⚡ by Botpress](https://botpress.com/?from=webchat)',
    allowFileUpload: true,
    soundEnabled: true,
    proactiveMessageEnabled: false,
    proactiveBubbleMessage: 'Hi! 👋 Need help?',
    proactiveBubbleTriggerType: 'afterDelay',
    proactiveBubbleDelayTime: 10,
    conversationHistory: true,
    homePageEnabled: false,
    mainCardEnabled: false,
    conversationStartersEnabled: false,
    conversationStarters: [],
    conversationStartersDisplayStyle: 'cards',
  },
}
const GUEST_GREETING_TEXT =
  'Xin chào! Tôi có thể giúp tìm hoặc tư vấn sản phẩm. Nếu muốn tra cứu đơn hàng, vui lòng đăng nhập tài khoản trước nhé.'
const AUTH_GREETING_TEXT = 'Xin ch\u00e0o! T\u00f4i c\u00f3 th\u1ec3 gi\u00fap g\u00ec cho b\u1ea1n?'

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
  const handledCartRequests = useRef(new Set<string>())
  const pendingIdentities = useRef(new Set<string>())
  const productLinkCache = useRef(new Map<string, string | null>())
  const desiredIdentity = useRef<string | null>(null)
  const authenticatedSessionSeen = useRef(false)
  const logoutResetSourceConversation = useRef<string | null>(null)
  const logoutResetConversations = useRef(new Set<string>())
  const messageListenerAdded = useRef(false)
  const readyListenerAdded = useRef(false)
  const brandingObserver = useRef<MutationObserver | null>(null)
  const brandingShadowObservers = useRef(new Map<ShadowRoot, MutationObserver>())
  const chatOrderTokenRefresh = useRef(new Map<string, number>())

  const hideBotpressBranding = useCallback(() => {
    // Botpress renders the webchat in a Shadow DOM, so app-level CSS cannot
    // reach the composer footer or individual messages.
    const applyToRoot = (root: ShadowRoot) => {
      if (root.querySelector('[data-hide-botpress-branding]')) return
      const style = document.createElement('style')
      style.dataset.hideBotpressBranding = 'true'
      style.textContent =
        '.bpComposerFooter { margin-top: 20px !important; } .bpComposerFooter p { display: none !important; } [data-hide-guest-greeting="true"], [data-hide-auth-greeting="true"] { display: none !important; }'
      root.appendChild(style)
    }

    const updateGreetingVisibility = (node: ParentNode) => {
      node.querySelectorAll<HTMLElement>('.bpMessageBlocksTextText').forEach((message) => {
        const text = message.textContent?.trim() ?? ''
        const isGuestGreeting = text.startsWith(GUEST_GREETING_TEXT)
        const isAuthGreeting = text.startsWith(AUTH_GREETING_TEXT)
        if (!isGuestGreeting && !isAuthGreeting) return
        const container = message.closest<HTMLElement>('.bpMessageContainer')
        if (!container) return

        const isAuthenticated = document.documentElement.dataset.chatAuthenticated === 'true'
        if (isGuestGreeting) {
          if (isAuthenticated) container.dataset.hideGuestGreeting = 'true'
          else delete container.dataset.hideGuestGreeting
        }
        if (isAuthGreeting) {
          if (!isAuthenticated) container.dataset.hideAuthGreeting = 'true'
          else delete container.dataset.hideAuthGreeting
        }
      })
    }

    const observeShadowRoot = (root: ShadowRoot) => {
      if (brandingShadowObservers.current.has(root)) return
      const observer = new MutationObserver(() => updateGreetingVisibility(root))
      observer.observe(root, { childList: true, subtree: true })
      brandingShadowObservers.current.set(root, observer)
    }

    const visit = (node: ParentNode) => {
      updateGreetingVisibility(node)
      node.querySelectorAll('*').forEach((element) => {
        if (element.shadowRoot) {
          applyToRoot(element.shadowRoot)
          observeShadowRoot(element.shadowRoot)
          visit(element.shadowRoot)
        }
      })
      if (node instanceof Element && node.shadowRoot) {
        applyToRoot(node.shadowRoot)
        observeShadowRoot(node.shadowRoot)
        visit(node.shadowRoot)
      }
    }

    visit(document)
    if (brandingObserver.current) return
    brandingObserver.current = new MutationObserver((records) => {
      records.forEach((record) => record.addedNodes.forEach((node) => {
        if (node instanceof Element) visit(node)
      }))
    })
    brandingObserver.current.observe(document.body, { childList: true, subtree: true })
  }, [])

  useEffect(() => () => {
    brandingObserver.current?.disconnect()
    brandingObserver.current = null
    brandingShadowObservers.current.forEach((observer) => observer.disconnect())
    brandingShadowObservers.current.clear()
  }, [])

  const handleInjectReady = () => {
    if (!window.botpress) return
    if (!readyListenerAdded.current) {
      readyListenerAdded.current = true
      const syncConversation = (id?: unknown) => {
        const currentId = typeof id === 'string' ? id : window.botpress?.conversationId
        if (currentId) {
          if (logoutResetSourceConversation.current && currentId !== logoutResetSourceConversation.current) {
            logoutResetConversations.current.add(currentId)
            logoutResetSourceConversation.current = null
          }
          setConversationId(currentId)
        }
      }
      window.botpress.on('webchat:initialized', () => {
        syncConversation()
        setBotInitialized(true)
      })
      window.botpress.on('webchat:ready', () => {
        syncConversation()
        setBotReady(true)
        hideBotpressBranding()
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

  useEffect(() => {
    if (user === undefined) return
    document.documentElement.dataset.chatAuthenticated = user ? 'true' : 'false'
    hideBotpressBranding()
  }, [botReady, hideBotpressBranding, user])

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
    if (user) authenticatedSessionSeen.current = true
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
    if (
      previousIdentity === identity && pendingIdentities.current.size === 0 &&
      (user || (!authenticatedSessionSeen.current && guestEventWasSent))
    ) return
    pendingIdentities.current.add(pendingKey)

    const sendIdentity = async () => {
      // Do not send a queued event to a different conversation after a reset.
      if (window.botpress?.conversationId !== conversationId) return
      if (desiredIdentity.current !== identity) return
      // A different tab may have finished sending while this tab waited.
      const storedIdentity = readStoredIdentity(key) ?? sentIdentities.current.get(key)
      if (storedIdentity === identity && (user || (!authenticatedSessionSeen.current && guestEventWasSent))) return
      const previouslyAuthenticated =
        (storedIdentity?.startsWith('auth:') ?? false) || authenticatedSessionSeen.current

      // Keep shopping context during idle periods, but start a clean guest
      // conversation when an authenticated session ends so order details and
      // authenticated greetings do not remain in the transcript.
      if (!user && previouslyAuthenticated) {
        const webchat = window.botpress
        if (webchat?.restartConversation && webchat.conversationId === conversationId) {
          logoutResetSourceConversation.current = conversationId
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
                    reject(new Error('Botpress did not confirm the guest conversation after logout.'))
                  }, 10_000)
                }),
              ])
            logoutResetConversations.current.add(confirmedConversationId)
            logoutResetSourceConversation.current = null
            authenticatedSessionSeen.current = false
            chatOrderTokenRefresh.current.delete(conversationId)
            setConversationId(confirmedConversationId)
            return
          } catch (error) {
            logoutResetSourceConversation.current = null
            const nextConversationId = webchat.conversationId
            if (nextConversationId && nextConversationId !== conversationId) {
              logoutResetConversations.current.add(nextConversationId)
              authenticatedSessionSeen.current = false
              chatOrderTokenRefresh.current.delete(conversationId)
              setConversationId(nextConversationId)
              return
            }
            console.error('Failed to restart the Botpress conversation after logout:', error)
          } finally {
            if (conversationTimeout) clearTimeout(conversationTimeout)
            unsubscribeConversation?.()
          }
        }
      }

      if (desiredIdentity.current !== identity) return
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
          reason: previouslyAuthenticated || logoutResetConversations.current.has(conversationId) ? 'logout' : 'guest',
          email: null,
          userId: null,
          isLoggedIn: false,
        }
      }
      await window.botpress!.sendEvent(payload)
      sentIdentities.current.set(key, identity)
      if (user) chatOrderTokenRefresh.current.set(conversationId, Date.now())
      else chatOrderTokenRefresh.current.delete(conversationId)
      if (!user) {
        sentGuestEvents.current.add(key)
        logoutResetConversations.current.delete(conversationId)
        authenticatedSessionSeen.current = false
      }
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

  // The order capability expires after 15 minutes. Refresh it from the
  // authenticated Supabase session while the same Botpress conversation is
  // open, without restarting the conversation or showing the greeting again.
  useEffect(() => {
    const webchat = window.botpress
    if (!user || !botReady || !conversationId || !webchat?.sendEvent) return

    const identity = `auth:${user.id}:${user.email ?? ''}`
    const identityKey = identityStorageKey(conversationId)
    const pendingIdentityKey = `${identityKey}:${identity}`
    let active = true
    let refreshing = false

    const refreshTokenIfNeeded = async () => {
      if (
        !active || refreshing ||
        window.botpress?.conversationId !== conversationId ||
        desiredIdentity.current !== identity ||
        pendingIdentities.current.has(pendingIdentityKey)
      ) return

      const lastRefresh = chatOrderTokenRefresh.current.get(conversationId) ?? 0
      if (Date.now() - lastRefresh < CHAT_ORDER_TOKEN_REFRESH_INTERVAL_MS) return

      refreshing = true
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error || !session?.access_token) return

        const profileResponse = await fetch('/api/chat/profile', {
          method: 'POST',
          cache: 'no-store',
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
        if (!profileResponse.ok) return

        const { profile, chatOrderToken } = await profileResponse.json()
        if (
          !chatOrderToken || profile?.id !== user.id || !active ||
          desiredIdentity.current !== identity ||
          window.botpress?.conversationId !== conversationId
        ) return

        await webchat.sendEvent({
          type: 'auth',
          text: `__auth__${profile.email}__${profile.id}__true`,
          email: profile.email,
          userId: profile.id,
          profile,
          chatOrderToken,
          tokenRefreshOnly: true,
        })
        chatOrderTokenRefresh.current.set(conversationId, Date.now())
      } catch (error) {
        console.error('Failed to refresh the Botpress order token:', error)
      } finally {
        refreshing = false
      }
    }

    const interval = setInterval(() => void refreshTokenIfNeeded(), 60_000)
    const handleFocus = () => void refreshTokenIfNeeded()
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') void refreshTokenIfNeeded()
    }
    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibility)
    void refreshTokenIfNeeded()

    return () => {
      active = false
      clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [botReady, conversationId, user])


  useEffect(() => {
    if (!botReady || !window.botpress) return
    if (messageListenerAdded.current) return

    messageListenerAdded.current = true

    let productCatalogPromise: Promise<Array<{ name: string; slug: string; gender_id: number }> | null> | null = null

    const handleCartAddEvent = async (event?: any) => {
      const payload = event?.action ? event : event?.payload
      if (payload?.action !== 'cart.add') return

      const requestId = String(payload.requestId ?? '').trim()
      const productId = String(payload.productId ?? '').trim()
      const variantId = String(payload.variantId ?? '').trim()
      const quantity = Number(payload.quantity)
      if (!requestId || !productId || !variantId || !Number.isSafeInteger(quantity) || quantity < 1) {
        toast.error('Không thể thêm sản phẩm: thông tin sản phẩm chưa đầy đủ.')
        return
      }
      if (handledCartRequests.current.has(requestId)) return
      handledCartRequests.current.add(requestId)
      if (handledCartRequests.current.size > 100) {
        const oldestRequest = handledCartRequests.current.values().next().value
        if (oldestRequest) handledCartRequests.current.delete(oldestRequest)
      }

      try {
        const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()
        if (authError || !currentUser) {
          toast.error('Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng.')
          return
        }

        const [{ data: variant, error: variantError }, { data: product, error: productError }] = await Promise.all([
          supabase.from('product_variants')
            .select('id, product_id, size, color, price, stock')
            .eq('id', variantId)
            .eq('product_id', productId)
            .maybeSingle(),
          supabase.from('products')
            .select('id, name, description, image_url')
            .eq('id', productId)
            .maybeSingle(),
        ])

        if (variantError || productError || !variant || !product) {
          toast.error('Không tìm thấy đúng sản phẩm hoặc biến thể để thêm vào giỏ.')
          return
        }
        const availableStock = Number(variant.stock ?? 0)
        if (availableStock < quantity) {
          toast.error(availableStock > 0
            ? `Mẫu này chỉ còn ${availableStock} sản phẩm.`
            : 'Biến thể này hiện đã hết hàng.')
          return
        }

        let { data: cart, error: cartError } = await supabase
          .from('cart')
          .select('id')
          .eq('user_id', currentUser.id)
          .maybeSingle()
        if (cartError) throw cartError
        if (!cart) {
          const created = await supabase
            .from('cart')
            .insert({ user_id: currentUser.id })
            .select('id')
            .single()
          if (created.error) throw created.error
          cart = created.data
        }

        const { data: existingItem, error: existingError } = await supabase
          .from('cart_items')
          .select('id, quantity')
          .eq('cart_id', cart.id)
          .eq('variant_id', variantId)
          .maybeSingle()
        if (existingError) throw existingError

        const newQuantity = Number(existingItem?.quantity ?? 0) + quantity
        if (newQuantity > availableStock) {
          toast.error(`Trong kho chỉ còn ${availableStock} sản phẩm của mẫu này.`)
          return
        }

        const saveResult = existingItem
          ? await supabase.from('cart_items').update({ quantity: newQuantity }).eq('id', existingItem.id)
          : await supabase.from('cart_items').insert({ cart_id: cart.id, variant_id: variantId, quantity })
        if (saveResult.error) throw saveResult.error

        toast.success(`Đã thêm ${quantity} ${product.name} (${variant.color}, size ${variant.size}) vào giỏ hàng.`)
      } catch (error) {
        console.error('[Botpress] Could not add requested item to cart:', error)
        toast.error('Chưa thể thêm sản phẩm vào giỏ. Vui lòng thử lại sau.')
      }
    }

    const unsubscribeCartAdd = window.botpress.on('customEvent', handleCartAddEvent)

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

    return () => {
      linkObserver.disconnect()
      if (typeof unsubscribeCartAdd === 'function') unsubscribeCartAdd()
    }
  }, [botReady])

  return (
    <>
      <Script
        src="https://cdn.botpress.cloud/webchat/v3.7/inject.js"
        strategy="afterInteractive"
        onReady={handleInjectReady}
      />
      {injectReady && <Script id="botpress-init-config" strategy="afterInteractive">
        `window.botpress.init(${JSON.stringify(BOTPRESS_INIT_CONFIG)})`
      </Script>}
    </>
  )
}

