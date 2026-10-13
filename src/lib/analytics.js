// Analytics helpers: the Umami call, the click classification and the UTM
// parameters of the links to the app. No import and no DOM access at module
// level, so tests/doc-analytics.test.mjs can load this file in Node.

// Every event the docs send. The app shares the same Umami website, hence the
// `doc-` prefix. Umami cuts names at 50 characters.
export const EVENTS = [
	'doc-nav-click',
	'doc-nav-pager-click',
	'doc-outbound-app',
	'doc-outbound-wporg',
	'doc-outbound-social',
	'doc-outbound-other',
	'doc-auth-signup-click',
	'doc-pricing-pack-click',
	'doc-playground-launch-click',
	'doc-tokens-manage-click',
	'doc-search-open',
	'doc-search-result-select',
	'doc-search-no-result',
	'doc-code-copy',
	'doc-code-tab-change',
]

const APP_HOSTS = ['forvoyez.com', 'www.forvoyez.com']
// docs.forvoyez.com is an alias of doc.forvoyez.com
const DOC_HOSTS = ['doc.forvoyez.com', 'docs.forvoyez.com']
const SOCIAL_HOSTS = [
	'discord.com',
	'discord.gg',
	'facebook.com',
	'github.com',
	'instagram.com',
	'linkedin.com',
	'twitter.com',
	'x.com',
	'youtube.com',
]

// Sends a custom event to Umami. The tracker only runs on the hosts listed in
// `data-domains` (src/app/layout.jsx): anywhere else, and on the server, this
// does nothing. It never throws.
export function track(name, data) {
	try {
		if (typeof window !== 'undefined') {
			window.umami?.track(name, data)
		}
	} catch {
		// analytics must never break the page
	}
}

export function slug(text) {
	return String(text ?? '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.slice(0, 40)
		.replace(/^-+|-+$/g, '')
}

// '/' -> 'home', '/pricing' -> 'pricing'
export function pageSlug(pathname) {
	return slug(pathname) || 'home'
}

// Search queries are never sent, only how long they were
export function lengthBucket(length) {
	if (length <= 0) return '0'
	if (length <= 2) return '1-2'
	if (length <= 5) return '3-5'
	if (length <= 10) return '6-10'
	if (length <= 20) return '11-20'
	return '21+'
}

// Text of a link's React children, '' when it has none (a logo, an icon)
export function textOf(node) {
	if (typeof node === 'string' || typeof node === 'number') {
		return String(node)
	}
	if (Array.isArray(node)) {
		return node.map(textOf).join(' ')
	}
	return node?.props?.children == null ? '' : textOf(node.props.children)
}

// Adds the UTM parameters to a link to the app (forvoyez.com), so the app can
// tell which doc page and which link sent the visitor: the referrer only
// carries the origin. Other links are returned unchanged. The existing query
// and hash are kept, and a UTM parameter already in the link wins.
export function withUtm(href, { campaign, content }) {
	if (typeof href !== 'string') {
		return href
	}

	let url
	try {
		url = new URL(href)
	} catch {
		// relative link: another page of the docs
		return href
	}

	if (
		!/^https?:$/.test(url.protocol) ||
		!APP_HOSTS.includes(url.hostname) ||
		// API endpoints are not pages
		url.pathname.startsWith('/api/')
	) {
		return href
	}

	let utm = {
		utm_source: 'doc',
		utm_medium: 'referral',
		utm_campaign: campaign || 'other',
		utm_content: content || slug(url.pathname) || 'home',
	}
	for (let [key, value] of Object.entries(utm)) {
		if (!url.searchParams.has(key)) {
			url.searchParams.set(key, value)
		}
	}

	return url.toString()
}

// Event for a click on a link that has no `data-fv-event`: classified by
// host. `target` is a path, never a query string nor an email address.
export function linkEvent(href, location) {
	let url
	try {
		url = new URL(href, location.href)
	} catch {
		return null
	}

	if (!/^https?:$/.test(url.protocol)) {
		// mailto:, tel:
		return {
			name: 'doc-outbound-other',
			data: { target: url.protocol.replace(':', '') },
		}
	}

	if (url.hostname === location.hostname || DOC_HOSTS.includes(url.hostname)) {
		let data = { target: url.pathname }
		if (url.hash.length > 1) {
			data.anchor = url.hash.slice(1)
		}
		return { name: 'doc-nav-click', data }
	}

	let host = url.hostname.replace(/^www\./, '')

	if (APP_HOSTS.includes(host)) {
		let isSignUp = url.pathname.replace(/\/$/, '') === '/sign-up'
		return {
			name: isSignUp ? 'doc-auth-signup-click' : 'doc-outbound-app',
			data: { target: url.pathname },
		}
	}

	if (host === 'wordpress.org' || host.endsWith('.wordpress.org')) {
		return { name: 'doc-outbound-wporg', data: { target: url.pathname } }
	}

	return {
		name: SOCIAL_HOSTS.includes(host)
			? 'doc-outbound-social'
			: 'doc-outbound-other',
		data: { target: host + url.pathname },
	}
}

// `data-fv-event-<key>="<value>"` attributes of an element, as { key: value }
function eventProps(element) {
	let prefix = 'data-fv-event-'
	let props = {}
	for (let { name, value } of Array.from(element.attributes ?? [])) {
		if (name.startsWith(prefix)) {
			props[name.slice(prefix.length)] = value
		}
	}
	return props
}

// Event for a click on `target`, or null. The closest element with
// `data-fv-event` names the event; without one, the closest link is
// classified by host. `zone` comes from the closest `data-zone` (header,
// sidebar, main, footer).
export function clickEvent(target, location) {
	if (typeof target?.closest !== 'function') {
		return null
	}

	let explicit = target.closest('[data-fv-event]')
	let link = target.closest('a[href]')
	let auto = link ? linkEvent(link.getAttribute('href'), location) : null

	if (!explicit && !auto) {
		return null
	}

	let zone = target.closest('[data-zone]')?.getAttribute('data-zone')

	return {
		name: explicit ? explicit.getAttribute('data-fv-event') : auto.name,
		data: {
			...(zone && { zone }),
			page: location.pathname,
			...auto?.data,
			...(explicit && eventProps(explicit)),
		},
	}
}
