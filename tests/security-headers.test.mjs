// The HTTP headers of the site, read from next.config.mjs. Run with
// `pnpm test` (node:test).
import assert from 'node:assert/strict'
import { test } from 'node:test'

import nextConfig from '../next.config.mjs'

test('every path gets the security headers', async () => {
	const rules = await nextConfig.headers()
	const all = rules.find(rule => rule.source === '/:path*')
	assert.ok(all, 'no rule on /:path*')
	assert.deepEqual(
		Object.fromEntries(all.headers.map(({ key, value }) => [key, value])),
		{
			'Referrer-Policy': 'strict-origin-when-cross-origin',
			'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
			'X-Content-Type-Options': 'nosniff',
			'X-Frame-Options': 'SAMEORIGIN',
		}
	)
})

test('the fonts keep their long cache', async () => {
	const rules = await nextConfig.headers()
	const fonts = rules.find(rule => rule.source === '/fonts/:file*.woff2')
	assert.deepEqual(fonts?.headers, [
		{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
	])
})

test('the server does not announce Next.js', () => {
	assert.equal(nextConfig.poweredByHeader, false)
})
