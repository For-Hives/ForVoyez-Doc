// robots.txt and sitemap.xml name a single host, even though docs.forvoyez.com
// serves the same app. Run with `pnpm test` (node:test).
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'

import robots from '../src/app/robots.js'
import sitemap from '../src/app/sitemap.js'

const appDir = path.join(import.meta.dirname, '..', 'src', 'app')

test('the sitemap lists every page once, on the canonical host', async () => {
	const urls = (await sitemap()).map(entry => entry.url)
	const expected = fs
		.readdirSync(appDir, { recursive: true })
		.filter(file => path.basename(file) === 'page.mdx')
		.map(file =>
			path.dirname(file) === '.'
				? 'https://doc.forvoyez.com'
				: `https://doc.forvoyez.com/${path.dirname(file)}`
		)
	assert.deepEqual([...urls].sort(), expected.sort())
})

test('robots.txt allows the whole site and points to the sitemap', () => {
	assert.deepEqual(robots(), {
		rules: { userAgent: '*', allow: '/' },
		sitemap: 'https://doc.forvoyez.com/sitemap.xml',
	})
})
