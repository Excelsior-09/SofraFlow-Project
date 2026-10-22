/*
 * SofraFlow Menu Template Interactions
 *
 * Works with the standalone templates in this folder without requiring React.
 * Include once before </body>:
 *   <script src="./template-interactions.js" defer></script>
 *
 * Optional dashboard API:
 *   window.SofraFlowMenu.init({
 *     root: document.querySelector('[data-sofraflow-menu]'),
 *     locale: 'en',
 *     persistCart: true,
 *     onCartChange: (cart) => console.log(cart),
 *     onCheckout: (cart) => console.log(cart)
 *   })
 */
(function (window, document) {
  'use strict'

  var DEFAULTS = {
    locale: 'en',
    persistCart: true,
    currency: 'MAD',
    storagePrefix: 'sofraflow-menu-cart',
  }

  var stateByRoot = new WeakMap()

  function merge(base, extra) {
    var result = {}
    Object.keys(base).forEach(function (key) { result[key] = base[key] })
    Object.keys(extra || {}).forEach(function (key) { result[key] = extra[key] })
    return result
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }

  function slug(value) {
    return String(value || 'item').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  function money(value, currency) {
    return String(value) + ' ' + currency
  }

  function getTemplateId(root) {
    var explicit = root.getAttribute('data-template-id')
    if (explicit) return explicit
    var path = window.location.pathname.split('/').filter(Boolean).pop() || 'menu'
    return path.replace(/\.html$/, '')
  }

  function getImage(item) {
    var image = item.querySelector('img')
    return image ? image.getAttribute('src') || '' : ''
  }

  function collectItems(root) {
    return Array.prototype.slice.call(root.querySelectorAll('.item')).map(function (element, index) {
      var title = element.querySelector('h3')
      var price = element.querySelector('.price')
      var description = element.querySelector('p')
      var category = element.closest('.category')
      var categoryTitle = category && category.querySelector('h2')
      var rawPrice = price ? (price.textContent || '').match(/[0-9]+(?:[.,][0-9]+)?/) : null
      var name = title ? title.textContent.trim() : 'Menu item'
      return {
        id: element.getAttribute('data-item-id') || slug(name) + '-' + index,
        name: name,
        description: description ? description.textContent.trim() : '',
        price: rawPrice ? Number(rawPrice[0].replace(',', '.')) : 0,
        priceLabel: price ? price.textContent.trim() : '',
        category: categoryTitle ? categoryTitle.textContent.trim() : '',
        imageUrl: getImage(element),
        element: element,
      }
    })
  }

  function readCart(storageKey, enabled) {
    if (!enabled) return []
    try {
      var saved = window.localStorage.getItem(storageKey)
      return saved ? JSON.parse(saved) : []
    } catch (error) {
      return []
    }
  }

  function saveCart(state) {
    if (state.options.persistCart) {
      try { window.localStorage.setItem(state.storageKey, JSON.stringify(state.cart)) } catch (error) { /* storage is optional */ }
    }
    if (typeof state.options.onCartChange === 'function') state.options.onCartChange(state.cart.slice())
  }

  function addToCart(state, item, quantity) {
    var existing = state.cart.find(function (line) { return line.id === item.id })
    if (existing) existing.quantity += quantity || 1
    else state.cart.push({ id: item.id, name: item.name, price: item.price, imageUrl: item.imageUrl, quantity: quantity || 1 })
    saveCart(state)
    renderCart(state)
    openCart(state)
  }

  function changeQuantity(state, id, delta) {
    var line = state.cart.find(function (item) { return item.id === id })
    if (!line) return
    line.quantity += delta
    if (line.quantity <= 0) state.cart = state.cart.filter(function (item) { return item.id !== id })
    saveCart(state)
    renderCart(state)
  }

  function cartCount(state) {
    return state.cart.reduce(function (sum, item) { return sum + item.quantity }, 0)
  }

  function cartSubtotal(state) {
    return state.cart.reduce(function (sum, item) { return sum + item.price * item.quantity }, 0)
  }

  function labels(locale) {
    if (locale === 'fr') return { search: 'Rechercher un plat', all: 'Tout', cart: 'Votre commande', empty: 'Votre panier est vide.', subtotal: 'Sous-total', add: 'Ajouter', close: 'Fermer', order: 'Continuer la commande', noResults: 'Aucun plat trouvé.', popular: 'Populaire' }
    if (locale === 'ar') return { search: 'ابحث عن طبق', all: 'الكل', cart: 'طلبك', empty: 'سلة الطلب فارغة.', subtotal: 'المجموع الفرعي', add: 'أضف إلى الطلب', close: 'إغلاق', order: 'متابعة الطلب', noResults: 'لم يتم العثور على أطباق.', popular: 'الأكثر طلباً' }
    return { search: 'Search the menu', all: 'All', cart: 'Your order', empty: 'Your cart is empty.', subtotal: 'Subtotal', add: 'Add to order', close: 'Close', order: 'Continue to order', noResults: 'No dishes found.', popular: 'Popular' }
  }

  function buildToolbar(state) {
    var body = state.root.querySelector('.menu-body')
    if (!body || body.querySelector('.sf-menu-toolbar')) return
    var toolbar = document.createElement('div')
    toolbar.className = 'sf-menu-toolbar'
    toolbar.innerHTML = '<div class="sf-toolbar-top"><label class="sf-search"><span class="sf-visually-hidden"></span><input type="search" data-sf-search></label><button type="button" class="sf-cart-button" data-sf-open-cart><span class="sf-cart-label"></span><b data-sf-cart-count>0</b></button></div><div class="sf-category-nav" data-sf-category-nav></div><div class="sf-toolbar-bottom"><div class="sf-locale-switcher" role="group" aria-label="Language"><button type="button" data-sf-locale="en">EN</button><button type="button" data-sf-locale="fr">FR</button><button type="button" data-sf-locale="ar">عربي</button></div><span class="sf-demo-note">Interactive menu preview</span></div>'
    body.insertBefore(toolbar, body.firstChild)
    toolbar.querySelector('[data-sf-search]').addEventListener('input', function (event) { state.query = event.target.value.toLowerCase().trim(); filterItems(state) })
    toolbar.querySelector('[data-sf-open-cart]').addEventListener('click', function () { openCart(state) })
    toolbar.querySelectorAll('[data-sf-locale]').forEach(function (button) { button.addEventListener('click', function () { setLocale(state, button.getAttribute('data-sf-locale')) }) })
  }

  function buildCategoryNav(state) {
    var nav = state.root.querySelector('[data-sf-category-nav]')
    if (!nav) return
    var categories = ['all'].concat(state.items.map(function (item) { return item.category }).filter(function (name, index, list) { return name && list.indexOf(name) === index }))
    nav.innerHTML = categories.map(function (category, index) { return '<button type="button" class="' + (index === 0 ? 'is-active' : '') + '" data-sf-category="' + escapeHtml(category) + '">' + escapeHtml(index === 0 ? labels(state.options.locale).all : category) + '</button>' }).join('')
    nav.addEventListener('click', function (event) {
      var button = event.target.closest('[data-sf-category]')
      if (!button) return
      state.category = button.getAttribute('data-sf-category')
      nav.querySelectorAll('button').forEach(function (element) { element.classList.toggle('is-active', element === button) })
      filterItems(state)
    })
  }

  function addCardButtons(state) {
    state.items.forEach(function (item) {
      if (item.element.querySelector('[data-sf-add]')) return
      item.element.setAttribute('data-item-id', item.id)
      var button = document.createElement('button')
      button.type = 'button'
      button.className = 'sf-add-button'
      button.setAttribute('data-sf-add', item.id)
      button.textContent = labels(state.options.locale).add
      button.addEventListener('click', function (event) { event.stopPropagation(); addToCart(state, item, 1) })
      item.element.appendChild(button)
      item.element.setAttribute('tabindex', '0')
      item.element.addEventListener('keydown', function (event) { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); addToCart(state, item, 1) } })
      item.element.addEventListener('click', function (event) { if (event.target.closest('button')) return; openItem(state, item) })
    })
  }

  function filterItems(state) {
    var visible = 0
    state.items.forEach(function (item) {
      var haystack = [item.name, item.description, item.category].join(' ').toLowerCase()
      var matchesQuery = !state.query || haystack.indexOf(state.query) >= 0
      var matchesCategory = state.category === 'all' || !state.category || item.category === state.category
      var shown = matchesQuery && matchesCategory
      item.element.hidden = !shown
      if (shown) visible += 1
    })
    var empty = state.root.querySelector('.sf-empty-results')
    if (!empty) { empty = document.createElement('p'); empty.className = 'sf-empty-results'; state.root.querySelector('.menu-body').appendChild(empty) }
    empty.textContent = labels(state.options.locale).noResults
    empty.hidden = visible !== 0
  }

  function openItem(state, item) {
    closeModal(state)
    var modal = document.createElement('div')
    modal.className = 'sf-modal-backdrop'
    modal.setAttribute('role', 'dialog')
    modal.setAttribute('aria-modal', 'true')
    modal.innerHTML = '<div class="sf-item-modal"><button type="button" class="sf-modal-close" data-sf-close>×</button>' + (item.imageUrl ? '<img src="' + escapeHtml(item.imageUrl) + '" alt="' + escapeHtml(item.name) + '">' : '') + '<div class="sf-modal-content"><span class="sf-modal-category">' + escapeHtml(item.category) + '</span><h2>' + escapeHtml(item.name) + '</h2><p>' + escapeHtml(item.description) + '</p><strong>' + escapeHtml(item.priceLabel || money(item.price, state.options.currency)) + '</strong><button type="button" class="sf-modal-add" data-sf-modal-add>' + escapeHtml(labels(state.options.locale).add) + '</button></div></div>'
    state.root.appendChild(modal)
    modal.querySelector('[data-sf-close]').addEventListener('click', function () { closeModal(state) })
    modal.addEventListener('click', function (event) { if (event.target === modal) closeModal(state) })
    modal.querySelector('[data-sf-modal-add]').addEventListener('click', function () { addToCart(state, item, 1); closeModal(state) })
    state.modal = modal
  }

  function closeModal(state) {
    if (state.modal) { state.modal.remove(); state.modal = null }
  }

  function openCart(state) {
    var drawer = state.root.querySelector('.sf-cart-drawer')
    if (!drawer) return
    drawer.classList.add('is-open')
    drawer.setAttribute('aria-hidden', 'false')
  }

  function closeCart(state) {
    var drawer = state.root.querySelector('.sf-cart-drawer')
    if (!drawer) return
    drawer.classList.remove('is-open')
    drawer.setAttribute('aria-hidden', 'true')
  }

  function renderCart(state) {
    var drawer = state.root.querySelector('.sf-cart-drawer')
    var count = state.root.querySelector('[data-sf-cart-count]')
    if (count) count.textContent = cartCount(state)
    if (!drawer) {
      drawer = document.createElement('aside')
      drawer.className = 'sf-cart-drawer'
      drawer.setAttribute('aria-hidden', 'true')
      state.root.appendChild(drawer)
    }
    var copy = labels(state.options.locale)
    drawer.innerHTML = '<div class="sf-cart-head"><h2>' + escapeHtml(copy.cart) + '</h2><button type="button" data-sf-close-cart aria-label="' + escapeHtml(copy.close) + '">×</button></div><div class="sf-cart-lines">' + (state.cart.length ? state.cart.map(function (line) { return '<div class="sf-cart-line"><div><strong>' + escapeHtml(line.name) + '</strong><span>' + money(line.price, state.options.currency) + '</span></div><div class="sf-qty"><button type="button" data-sf-qty="-1" data-sf-id="' + escapeHtml(line.id) + '">−</button><b>' + line.quantity + '</b><button type="button" data-sf-qty="1" data-sf-id="' + escapeHtml(line.id) + '">+</button></div></div>' }).join('') : '<p class="sf-cart-empty">' + escapeHtml(copy.empty) + '</p>') + '</div><div class="sf-cart-foot"><div><span>' + escapeHtml(copy.subtotal) + '</span><strong>' + money(cartSubtotal(state), state.options.currency) + '</strong></div><button type="button" class="sf-order-button" data-sf-checkout>' + escapeHtml(copy.order) + '</button><small>Demo only — connect this event to your existing order flow.</small></div>'
    drawer.querySelector('[data-sf-close-cart]').addEventListener('click', function () { closeCart(state) })
    drawer.querySelectorAll('[data-sf-qty]').forEach(function (button) { button.addEventListener('click', function () { changeQuantity(state, button.getAttribute('data-sf-id'), Number(button.getAttribute('data-sf-qty'))) }) })
    drawer.querySelector('[data-sf-checkout]').addEventListener('click', function () { if (typeof state.options.onCheckout === 'function') state.options.onCheckout(state.cart.slice()); else window.dispatchEvent(new CustomEvent('sofraflow:checkout', { detail: state.cart.slice() })) })
    updateToolbarLabels(state)
  }

  function updateToolbarLabels(state) {
    var search = state.root.querySelector('[data-sf-search]')
    var cart = state.root.querySelector('.sf-cart-label')
    if (search) search.setAttribute('placeholder', labels(state.options.locale).search)
    if (cart) cart.textContent = labels(state.options.locale).cart
    state.root.querySelectorAll('.sf-add-button').forEach(function (button) { button.textContent = labels(state.options.locale).add })
    state.root.querySelectorAll('[data-sf-locale]').forEach(function (button) { button.classList.toggle('is-active', button.getAttribute('data-sf-locale') === state.options.locale) })
  }

  function setLocale(state, locale) {
    state.options.locale = locale || 'en'
    state.root.setAttribute('lang', state.options.locale)
    state.root.setAttribute('dir', state.options.locale === 'ar' ? 'rtl' : 'ltr')
    updateToolbarLabels(state)
    renderCart(state)
    var categoryButtons = state.root.querySelectorAll('[data-sf-category]')
    if (categoryButtons[0]) categoryButtons[0].textContent = labels(state.options.locale).all
    applyDataAttributes(state)
    filterItems(state)
  }

  function applyDataAttributes(state) {
    state.root.querySelectorAll('[data-en],[data-fr],[data-ar]').forEach(function (element) {
      var value = element.getAttribute('data-' + state.options.locale) || element.getAttribute('data-en')
      if (value) element.textContent = value
    })
  }

  function injectStyles(root) {
    if (root.querySelector('style[data-sf-interactions]')) return
    var style = document.createElement('style')
    style.setAttribute('data-sf-interactions', '')
    style.textContent = '.sf-visually-hidden{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}.sf-menu-toolbar{margin:0 0 28px;padding:14px;border:1px solid color-mix(in srgb,var(--line) 85%,transparent);border-radius:12px;background:color-mix(in srgb,var(--paper) 84%,var(--surface))}.sf-toolbar-top{display:flex;gap:10px}.sf-search{display:flex;align-items:center;flex:1}.sf-search input{width:100%;min-height:40px;padding:0 12px;border:1px solid var(--line);border-radius:8px;background:var(--surface);color:var(--ink);font:inherit;font-size:12px}.sf-cart-button{display:flex;align-items:center;gap:8px;min-height:40px;padding:0 12px;border:1px solid var(--accent);border-radius:8px;background:var(--primary);color:#fff;font:inherit;font-size:11px;font-weight:700}.sf-cart-button b{display:grid;place-items:center;min-width:19px;height:19px;border-radius:50%;background:var(--accent);color:var(--primary);font-size:10px}.sf-category-nav{display:flex;gap:8px;overflow:auto;margin-top:12px;padding-bottom:3px}.sf-category-nav button,.sf-locale-switcher button{flex:0 0 auto;padding:7px 9px;border:1px solid var(--line);border-radius:99px;background:transparent;color:var(--muted);font:inherit;font-size:10px}.sf-category-nav button.is-active,.sf-locale-switcher button.is-active{border-color:var(--accent);background:color-mix(in srgb,var(--accent) 17%,var(--paper));color:var(--primary);font-weight:700}.sf-toolbar-bottom{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:11px}.sf-locale-switcher{display:flex;gap:5px}.sf-demo-note{color:var(--muted);font-size:9px}.item{position:relative;cursor:pointer;transition:transform .18s ease,box-shadow .18s ease}.item:hover,.item:focus-visible{transform:translateY(-2px);box-shadow:0 8px 22px rgba(0,0,0,.08)}.sf-add-button{display:inline-flex;align-items:center;justify-content:center;margin-top:9px;padding:6px 8px;border:1px solid var(--accent);border-radius:5px;background:transparent;color:var(--primary);font:inherit;font-size:9px;font-weight:800}.sf-add-button:hover{background:var(--accent);color:var(--primary)}.sf-empty-results{padding:24px 0;color:var(--muted);font-size:12px;text-align:center}.sf-cart-drawer{position:fixed;z-index:1000;top:0;right:0;bottom:0;width:min(390px,100vw);display:flex;flex-direction:column;padding:22px;background:var(--surface);box-shadow:-20px 0 55px rgba(0,0,0,.2);transform:translateX(105%);transition:transform .24s ease;color:var(--ink)}.sf-cart-drawer.is-open{transform:translateX(0)}.sf-cart-head{display:flex;align-items:center;justify-content:space-between;padding-bottom:17px;border-bottom:1px solid var(--line)}.sf-cart-head h2{margin:0;font:400 26px Georgia,serif}.sf-cart-head button,.sf-modal-close{width:30px;height:30px;border:1px solid var(--line);border-radius:50%;background:transparent;color:var(--ink);font-size:19px}.sf-cart-lines{flex:1;overflow:auto;padding:13px 0}.sf-cart-line{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 0;border-bottom:1px solid var(--line)}.sf-cart-line>div:first-child{display:grid;gap:3px;min-width:0}.sf-cart-line strong{font-size:12px}.sf-cart-line span{color:var(--muted);font-size:10px}.sf-qty{display:flex;align-items:center;gap:8px}.sf-qty button{width:24px;height:24px;border:1px solid var(--line);border-radius:50%;background:transparent;color:var(--ink)}.sf-qty b{font-size:11px}.sf-cart-empty{color:var(--muted);font-size:12px;text-align:center}.sf-cart-foot{padding-top:17px;border-top:1px solid var(--line)}.sf-cart-foot>div{display:flex;justify-content:space-between;margin-bottom:14px}.sf-cart-foot span{color:var(--muted);font-size:11px}.sf-cart-foot strong{font-size:16px}.sf-order-button{width:100%;min-height:42px;border:0;border-radius:8px;background:var(--primary);color:#fff;font:inherit;font-size:12px;font-weight:800}.sf-cart-foot small{display:block;margin-top:9px;color:var(--muted);font-size:9px;text-align:center}.sf-modal-backdrop{position:fixed;z-index:1100;inset:0;display:grid;place-items:center;padding:18px;background:rgba(0,0,0,.56)}.sf-item-modal{position:relative;overflow:hidden;width:min(520px,100%);border-radius:14px;background:var(--surface);color:var(--ink);box-shadow:0 25px 80px rgba(0,0,0,.3)}.sf-item-modal>img{display:block;width:100%;height:220px;object-fit:cover}.sf-modal-close{position:absolute;top:12px;right:12px;z-index:1;border-color:rgba(255,255,255,.65);background:rgba(0,0,0,.34);color:#fff}.sf-modal-content{padding:24px}.sf-modal-category{color:var(--accent);font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase}.sf-modal-content h2{margin:7px 0;font:400 31px Georgia,serif}.sf-modal-content p{margin:0 0 12px;color:var(--muted);font-size:12px;line-height:1.55}.sf-modal-content>strong{display:block;color:var(--accent);font-size:14px}.sf-modal-add{width:100%;margin-top:17px;min-height:42px;border:0;border-radius:8px;background:var(--primary);color:#fff;font:inherit;font-size:12px;font-weight:800}@media(max-width:700px){.sf-toolbar-top{align-items:stretch;flex-direction:column}.sf-cart-button{justify-content:center}.sf-toolbar-bottom{align-items:flex-start;flex-direction:column}.sf-demo-note{display:none}.sf-cart-drawer{width:100%}}@media(prefers-reduced-motion:reduce){.item,.sf-cart-drawer{transition:none!important}}'
    root.appendChild(style)
  }

  function init(options) {
    options = merge(DEFAULTS, options || {})
    var root = options.root || document.querySelector('[data-sofraflow-menu]') || document.querySelector('.menu-shell')
    if (!root) return null
    if (root.classList.contains('menu-shell')) root = root.parentElement || root
    if (stateByRoot.has(root)) return stateByRoot.get(root)
    var shell = root.querySelector('.menu-shell') || (root.classList.contains('menu-shell') ? root : null)
    if (!shell) return null
    var state = { root: root, shell: shell, options: options, items: [], cart: [], query: '', category: 'all', modal: null, storageKey: options.storagePrefix + ':' + getTemplateId(root) }
    state.items = collectItems(shell)
    state.cart = readCart(state.storageKey, options.persistCart)
    stateByRoot.set(root, state)
    injectStyles(root)
    buildToolbar(state)
    buildCategoryNav(state)
    addCardButtons(state)
    renderCart(state)
    setLocale(state, options.locale)
    return state
  }

  function autoInit() {
    var roots = document.querySelectorAll('[data-sofraflow-menu], .menu-shell')
    if (!roots.length) return
    roots.forEach(function (root) { init({ root: root }) })
  }

  window.SofraFlowMenu = { init: init, autoInit: autoInit, version: '1.0.0' }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', autoInit)
  else autoInit()
})(window, document)
