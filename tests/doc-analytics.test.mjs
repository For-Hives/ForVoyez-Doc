// Guards for the analytics of the docs: the Umami setup, the event names, the
// click classification and the UTM parameters of the links to the app. The
// tracker only runs on the production hosts, so nothing here observes a real
// event: the helpers of src/lib/analytics.js are tested directly. Run with
// `pnpm test` (node:test, no dependencies).
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { afterEach, describe, test } from 'node:test'

const srcDir = path.join(import.meta.dirname, '..', 'src')

const sources = fs
	.readdirSync(srcDir, { recursive: true })
	.filter(file => /\.(js|jsx|mjs|mdx)$/.test(file))
	.map(file => ({
		name: file,
		source: fs.readFileSync(path.join(srcDir, file), 'utf8'),
	}))

function source(name) {
	const found = sources.find(file => file.name === name)
	assert.ok(found, `src/${name} not found`)
	return found.source
}

// src/lib/analytics.js is an ES module in a package without "type": "module"
// (its config files are CommonJS). A plain import works but logs a Node
// warning on every run, so the file is loaded from a data: URL instead.
const {
	clickEvent,
	EVENTS,
	lengthBucket,
	linkEvent,
	pageSlug,
	slug,
	textOf,
	track,
	withUtm,
} = await import(
	`data:text/javascript;base64,${Buffer.from(source('lib/analytics.js')).toString('base64')}`
)

const docLocation = new URL('https://doc.forvoyez.com/pricing')

describe('Umami setup', () => {
	test('no data-umami-event attribute anywhere in src', () => {
		// On <a data-umami-event>, the Umami script cancels the click and sets
		// location.href itself once its request is done: next/link then reloads
		// the whole page, and external links wait for the request. Button and
		// DocLink render links, so the attribute is banned everywhere:
		// data-fv-event is the one to use.
		for (const { name, source } of sources) {
			assert.ok(!source.includes('data-umami-event'), `src/${name}`)
		}
	})

	test('visitors are never identified', () => {
		for (const { name, source } of sources) {
			assert.doesNotMatch(source, /umami\??\.identify/, `src/${name}`)
		}
	})

	test('the tracker runs on doc.forvoyez.com and on its docs. alias', () => {
		assert.ok(
			source('app/layout.jsx').includes(
				"data-domains={'forvoyez.com,doc.forvoyez.com,docs.forvoyez.com'}"
			)
		)
	})

	test('every page names its doc.forvoyez.com URL as canonical', () => {
		const layout = source('app/layout.jsx')
		assert.ok(layout.includes("new URL('https://doc.forvoyez.com')"))
		assert.ok(layout.includes("canonical: './'"))
	})

	test('the click listener never cancels a click', () => {
		for (const name of ['components/Analytics.jsx', 'lib/analytics.js']) {
			assert.doesNotMatch(source(name), /preventDefault\(|stopPropagation\(/)
		}
		assert.match(
			source('components/Analytics.jsx'),
			/document\.addEventListener\('click', reportClick\)/
		)
		assert.ok(source('app/layout.jsx').includes('<Analytics />'))
	})
})

describe('event names', () => {
	// every quoted string that starts with doc- is an event name
	const used = sources.flatMap(({ name, source }) =>
		[...source.matchAll(/['"](doc-[\w-]*)['"]/g)].map(([, event]) => ({
			event,
			name,
		}))
	)

	test('are doc- prefixed, kebab-case and at most 50 characters long', () => {
		assert.ok(EVENTS.length > 0)
		assert.equal(new Set(EVENTS).size, EVENTS.length, 'duplicate event name')
		for (const event of EVENTS) {
			assert.match(event, /^doc-[a-z0-9]+(-[a-z0-9]+)*$/)
			assert.ok(event.length <= 50, `${event} is longer than 50 characters`)
		}
	})

	test('the components only send events listed in EVENTS', () => {
		assert.ok(used.some(({ name }) => name.endsWith('.mdx')))
		for (const { event, name } of used) {
			assert.ok(EVENTS.includes(event), `src/${name} sends unknown ${event}`)
		}
	})

	test('every event listed in EVENTS is sent somewhere', () => {
		for (const event of EVENTS) {
			// once in the EVENTS list itself, at least once where it is sent
			const count = used.filter(use => use.event === event).length
			assert.ok(count >= 2, `${event} is never sent`)
		}
	})

	test('explicit events use data-fv-event attributes with short keys', () => {
		for (const { name, source } of sources) {
			for (const [, key] of source.matchAll(/data-fv-event-([\w-]+)/g)) {
				assert.match(key, /^[a-z_]+$/, `src/${name}: data-fv-event-${key}`)
			}
		}
	})
})

describe('track', () => {
	afterEach(() => {
		delete globalThis.window
	})

	test('does nothing on the server', () => {
		assert.equal(typeof globalThis.window, 'undefined')
		assert.doesNotThrow(() => track('doc-code-copy', { language: 'php' }))
	})

	test('does nothing when the Umami script is not loaded', () => {
		globalThis.window = {}
		assert.doesNotThrow(() => track('doc-code-copy', { language: 'php' }))
	})

	test('sends the event name and its data to Umami', () => {
		const calls = []
		globalThis.window = { umami: { track: (...args) => calls.push(args) } }
		track('doc-code-copy', { language: 'php' })
		assert.deepEqual(calls, [['doc-code-copy', { language: 'php' }]])
	})

	test('never throws, even if Umami does', () => {
		globalThis.window = {
			umami: {
				track() {
					throw new Error('blocked')
				},
			},
		}
		assert.doesNotThrow(() => track('doc-code-copy'))
	})
})

describe('UTM parameters of the links to the app', () => {
	const utm = { campaign: 'pricing', content: 'buy-now' }

	test('are added to forvoyez.com links', () => {
		assert.equal(
			withUtm('https://forvoyez.com/app/plans', utm),
			'https://forvoyez.com/app/plans?utm_source=doc&utm_medium=referral&utm_campaign=pricing&utm_content=buy-now'
		)
		assert.equal(
			withUtm('https://www.forvoyez.com/contact', utm),
			'https://www.forvoyez.com/contact?utm_source=doc&utm_medium=referral&utm_campaign=pricing&utm_content=buy-now'
		)
	})

	test('keep the existing query and hash', () => {
		assert.equal(
			withUtm('https://forvoyez.com/app/plans?cycle=yearly#packs', utm),
			'https://forvoyez.com/app/plans?cycle=yearly&utm_source=doc&utm_medium=referral&utm_campaign=pricing&utm_content=buy-now#packs'
		)
		assert.equal(
			withUtm('https://forvoyez.com/#features', utm),
			'https://forvoyez.com/?utm_source=doc&utm_medium=referral&utm_campaign=pricing&utm_content=buy-now#features'
		)
	})

	test('do not replace a UTM parameter the link already has', () => {
		const url = new URL(
			withUtm('https://forvoyez.com/sign-up?utm_campaign=launch', utm)
		)
		assert.equal(url.searchParams.get('utm_campaign'), 'launch')
		assert.equal(url.searchParams.getAll('utm_campaign').length, 1)
		assert.equal(url.searchParams.get('utm_source'), 'doc')
	})

	test('fall back to the path of the link, then to home, for the content', () => {
		const content = href =>
			new URL(
				withUtm(href, { campaign: 'home', content: '' })
			).searchParams.get('utm_content')
		assert.equal(content('https://forvoyez.com/app/tokens'), 'app-tokens')
		assert.equal(content('https://forvoyez.com'), 'home')
	})

	test('leave every other link unchanged', () => {
		for (const href of [
			'/pricing',
			'/describe#request',
			'#authentication',
			'https://doc.forvoyez.com',
			'https://docs.forvoyez.com/pricing',
			'https://forvoyez.com/api/describe',
			'https://forvoyez.com.example.org/app',
			'https://notforvoyez.com/app',
			'https://wordpress.org/plugins/auto-alt-text-for-images/',
			'https://github.com/For-Hives/ForVoyez',
			'mailto:support@forvoyez.com',
		]) {
			assert.equal(withUtm(href, utm), href)
		}
		assert.equal(withUtm(undefined, utm), undefined)
	})

	test('are added at render time, not written in the MDX sources', () => {
		// tests/docs.test.mjs checks the exact app URLs of the pages
		for (const { name, source } of sources) {
			if (name.endsWith('.mdx')) {
				assert.ok(!source.includes('utm_'), `src/${name} has a UTM parameter`)
			}
		}
		assert.ok(source('components/mdx.jsx').includes('DocLink as a'))
		assert.ok(source('components/Button.jsx').includes('<DocLink'))
	})

	test('slugs are short and made of a-z, 0-9 and dashes', () => {
		assert.equal(slug('Manage your API keys'), 'manage-your-api-keys')
		assert.equal(slug('  Sign up → '), 'sign-up')
		assert.equal(slug(undefined), '')
		assert.match(slug('x'.repeat(39) + ' long label'), /^x{39}$/)
		assert.equal(pageSlug('/'), 'home')
		assert.equal(pageSlug('/wordpress-plugin'), 'wordpress-plugin')
	})

	test('the content comes from the text of the link', () => {
		assert.equal(textOf('Buy Now'), 'Buy Now')
		assert.equal(textOf(['Sign ', { props: { children: 'up' } }]), 'Sign  up')
		assert.equal(
			slug(textOf(['Sign ', { props: { children: 'up' } }])),
			'sign-up'
		)
		// a logo, an icon
		assert.equal(textOf({ props: { className: 'h-6' } }), '')
		assert.equal(textOf(null), '')
	})
})

describe('link classification', () => {
	test('links to the app', () => {
		assert.deepEqual(linkEvent('https://forvoyez.com/app/plans', docLocation), {
			name: 'doc-outbound-app',
			data: { target: '/app/plans' },
		})
		assert.equal(
			linkEvent('https://www.forvoyez.com/', docLocation).name,
			'doc-outbound-app'
		)
	})

	test('sign-up links have their own event', () => {
		assert.deepEqual(linkEvent('https://forvoyez.com/sign-up', docLocation), {
			name: 'doc-auth-signup-click',
			data: { target: '/sign-up' },
		})
	})

	test('the target is a path, without the query string', () => {
		assert.deepEqual(
			linkEvent(
				'https://forvoyez.com/app/plans?utm_source=doc&utm_content=buy-now',
				docLocation
			).data,
			{ target: '/app/plans' }
		)
	})

	test('links to wordpress.org', () => {
		assert.deepEqual(
			linkEvent(
				'https://wordpress.org/plugins/auto-alt-text-for-images/',
				docLocation
			),
			{
				name: 'doc-outbound-wporg',
				data: { target: '/plugins/auto-alt-text-for-images/' },
			}
		)
	})

	test('GitHub and social networks', () => {
		assert.deepEqual(
			linkEvent('https://github.com/For-Hives/ForVoyez', docLocation),
			{
				name: 'doc-outbound-social',
				data: { target: 'github.com/For-Hives/ForVoyez' },
			}
		)
		for (const href of [
			'https://www.facebook.com/forvoyez',
			'https://www.instagram.com/forvoyez',
			'https://www.linkedin.com/company/forvoyez',
		]) {
			assert.equal(linkEvent(href, docLocation).name, 'doc-outbound-social')
		}
	})

	test('other external links', () => {
		assert.deepEqual(linkEvent('https://example.org/a?b=c', docLocation), {
			name: 'doc-outbound-other',
			data: { target: 'example.org/a' },
		})
	})

	test('an email link never sends the address', () => {
		assert.deepEqual(linkEvent('mailto:support@forvoyez.com', docLocation), {
			name: 'doc-outbound-other',
			data: { target: 'mailto' },
		})
	})

	test('internal links, on both hosts of the docs', () => {
		assert.deepEqual(linkEvent('/describe', docLocation), {
			name: 'doc-nav-click',
			data: { target: '/describe' },
		})
		assert.deepEqual(linkEvent('#packs', docLocation), {
			name: 'doc-nav-click',
			data: { target: '/pricing', anchor: 'packs' },
		})
		assert.deepEqual(linkEvent('/describe#request', docLocation), {
			name: 'doc-nav-click',
			data: { target: '/describe', anchor: 'request' },
		})
		for (const href of [
			'https://doc.forvoyez.com',
			'https://docs.forvoyez.com',
		]) {
			assert.equal(
				linkEvent(href, new URL('http://localhost:3000/')).name,
				'doc-nav-click'
			)
		}
	})
})

// Stand-in for a DOM element: a tag, attributes and a parent are all that
// `closest` and `clickEvent` read
function element(tag, attributes = {}, parent = null) {
	return {
		attributes: Object.entries(attributes).map(([name, value]) => ({
			name,
			value,
		})),
		closest(selector) {
			const [, wantedTag, attribute] = selector.match(/^(\w*)\[([\w-]+)\]$/)
			for (let node = this; node; node = node.parent) {
				if (
					(!wantedTag || node.tag === wantedTag) &&
					node.getAttribute(attribute) !== null
				) {
					return node
				}
			}
			return null
		},
		getAttribute: name => attributes[name] ?? null,
		parent,
		tag,
	}
}

describe('click events', () => {
	const main = element('main', { 'data-zone': 'main' })
	const footer = element('footer', { 'data-zone': 'footer' })

	test('a plain link is classified by host, with its zone and page', () => {
		const link = element('a', { href: 'https://forvoyez.com/contact' }, main)
		assert.deepEqual(clickEvent(element('strong', {}, link), docLocation), {
			name: 'doc-outbound-app',
			data: { zone: 'main', page: '/pricing', target: '/contact' },
		})
	})

	test('data-fv-event names the event and adds its properties', () => {
		const button = element(
			'a',
			{
				'data-fv-event': 'doc-pricing-pack-click',
				'data-fv-event-pack': '825',
				href: 'https://forvoyez.com/app/plans?utm_source=doc',
			},
			main
		)
		assert.deepEqual(clickEvent(button, docLocation), {
			name: 'doc-pricing-pack-click',
			data: {
				zone: 'main',
				page: '/pricing',
				target: '/app/plans',
				pack: '825',
			},
		})
	})

	test('data-fv-event works on a button, without a link', () => {
		const copy = element('button', {
			'data-fv-event': 'doc-code-copy',
			'data-fv-event-language': 'php',
		})
		assert.deepEqual(clickEvent(element('span', {}, copy), docLocation), {
			name: 'doc-code-copy',
			data: { page: '/pricing', language: 'php' },
		})
	})

	test('previous and next links report their direction', () => {
		const next = element(
			'a',
			{
				'data-fv-event': 'doc-nav-pager-click',
				'data-fv-event-direction': 'next',
				href: '/billing',
			},
			footer
		)
		assert.deepEqual(clickEvent(next, docLocation), {
			name: 'doc-nav-pager-click',
			data: {
				zone: 'footer',
				page: '/pricing',
				target: '/billing',
				direction: 'next',
			},
		})
	})

	test('a click outside links and tagged elements sends nothing', () => {
		assert.equal(clickEvent(element('p', {}, main), docLocation), null)
		assert.equal(clickEvent(null, docLocation), null)
		// a text node has no `closest`
		assert.equal(clickEvent({}, docLocation), null)
	})
})

// Source of every `track(...)` call of a file, up to its closing parenthesis
function trackCalls(source) {
	return [...source.matchAll(/\btrack\(/g)].map(({ index }) => {
		let depth = 0
		for (let end = index; end < source.length; end++) {
			if (source[end] === '(') depth++
			if (source[end] === ')' && --depth === 0) {
				return source.slice(index, end + 1)
			}
		}
		return source.slice(index)
	})
}

describe('search events', () => {
	test('report the length of the query, never the query', () => {
		assert.deepEqual(
			[0, 1, 2, 3, 5, 6, 10, 11, 20, 21, 400].map(lengthBucket),
			[
				'0',
				'1-2',
				'1-2',
				'3-5',
				'3-5',
				'6-10',
				'6-10',
				'11-20',
				'11-20',
				'21+',
				'21+',
			]
		)

		const calls = trackCalls(source('components/Search.jsx'))
		assert.equal(calls.length, 3)
		for (const call of calls) {
			// `query` may only be read for its length
			assert.doesNotMatch(call, /\bquery\b(?!\??\.length)/, call)
		}
	})
})
