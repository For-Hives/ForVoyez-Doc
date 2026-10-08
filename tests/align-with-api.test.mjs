// Checks that the pages describe the API, the dashboard and the WordPress
// plugin as they are: GET /api/tokens, server-side JavaScript examples, the
// current plugin labels, and no tool that does not exist. Run with
// `pnpm test` (node:test, no dependencies).
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { describe, test } from 'node:test'

const srcDir = path.join(import.meta.dirname, '..', 'src')
const appDir = path.join(srcDir, 'app')

const pages = fs
	.readdirSync(appDir, { recursive: true })
	.filter(file => file.endsWith('page.mdx'))
	.map(file => ({
		name: path.dirname(file) === '.' ? 'home' : path.dirname(file),
		source: fs.readFileSync(path.join(appDir, file), 'utf8'),
	}))

const components = fs
	.readdirSync(path.join(srcDir, 'components'), { recursive: true })
	.filter(file => file.endsWith('.jsx'))
	.map(file => ({
		name: file,
		source: fs.readFileSync(path.join(srcDir, 'components', file), 'utf8'),
	}))

function page(name) {
	const found = pages.find(p => p.name === name)
	assert.ok(found, `page ${name} not found`)
	return found.source
}

const codeBlocks = pages.flatMap(({ name, source }) =>
	[...source.matchAll(/^```(\w*)[^\n]*\n([\s\S]*?)^```/gm)].map(
		([, lang, code], index) => ({ page: name, index, lang, code })
	)
)

// GET /api/tokens answers (ForVoyez src/app/api/tokens/route.js)
const tokensErrors = [
	['400', 'Malformed token: missing userId'],
	['401', 'Missing or invalid authentication token'],
	['401', 'Invalid or expired token'],
	['401', 'Unauthorized, invalid token'],
	['404', 'User not found'],
	['500', 'Server error'],
]

describe('GET /api/tokens', () => {
	test('has its own page, linked from the API reference', () => {
		const tokens = page('tokens')
		assert.ok(tokens.includes('GET https://forvoyez.com/api/tokens'))
		const reference = page('api-documentation')
		assert.ok(reference.includes('`GET /tokens`'))
		assert.ok(reference.includes('href="/tokens"'))
	})

	test('documents every error the endpoint returns, with its JSON body', () => {
		for (const name of ['tokens', 'error-codes']) {
			const source = page(name)
			for (const [status, message] of tokensErrors) {
				assert.ok(
					source.includes(`\`{"error": "${message}"}\``),
					`${name}: no body for "${message}"`
				)
				assert.ok(source.includes(`\`${status}`), `${name}: no ${status}`)
			}
		}
	})

	test('the success example has the fields the endpoint returns', () => {
		const example = codeBlocks.find(
			block => block.page === 'tokens' && block.lang === 'json'
		)
		assert.ok(example, 'no JSON example on the tokens page')
		const body = JSON.parse(example.code)
		assert.deepEqual(Object.keys(body).sort(), [
			'subscription',
			'success',
			'token',
			'user',
		])
		assert.deepEqual(Object.keys(body.user).sort(), [
			'credits',
			'email',
			'id',
			'name',
			'registeredAt',
		])
		assert.deepEqual(Object.keys(body.token).sort(), [
			'createdAt',
			'expiredAt',
			'name',
		])
		assert.deepEqual(Object.keys(body.subscription).sort(), [
			'endsAt',
			'isSubscribed',
			'plan',
			'renewsAt',
			'status',
			'statusFormatted',
		])
		assert.equal(typeof body.user.credits, 'number')
	})
})

describe('JavaScript examples', () => {
	const jsBlocks = codeBlocks.filter(block =>
		['javascript', 'js'].includes(block.lang)
	)

	test('run on a server, without browser APIs', () => {
		assert.ok(jsBlocks.length > 0)
		for (const { code, index, page } of jsBlocks) {
			assert.doesNotMatch(
				code,
				/\b(fileInput|document|window|localStorage)\./,
				`${page} block ${index} uses a browser API`
			)
		}
	})

	test('read the API key from the environment, never from the code', () => {
		for (const { code, index, page } of jsBlocks) {
			if (!/forvoyez\.com\/api/.test(code)) continue
			assert.doesNotMatch(code, /YOUR_API_KEY/, `${page} block ${index}`)
			assert.match(
				code,
				/process\.env\.FORVOYEZ_API_KEY/,
				`${page} block ${index}`
			)
		}
	})
})

describe('claims', () => {
	test('no page promises dashboard tools that do not exist', () => {
		// the changelog may name what was removed
		const current = pages.filter(p => p.name !== 'changelog')
		for (const { name, source } of [...current, ...components]) {
			for (const claim of [/schema generator/i, /request validator/i]) {
				assert.doesNotMatch(source, claim, `${name} promises ${claim}`)
			}
		}
	})

	test('the WordPress plugin page uses the current plugin labels', () => {
		const plugin = page('wordpress-plugin')
		assert.ok(
			plugin.includes('https://wordpress.org/plugins/auto-alt-text-for-images/')
		)
		for (const label of [
			'Analyze with ForVoyez',
			'Analyze Selected Images',
			'Save API Key',
			'Configuration',
		]) {
			assert.ok(plugin.includes(label), `no "${label}"`)
		}
		for (const stale of [
			/Generate Alt Text/,
			/Customizable output formats/i,
			/workplace/i,
		]) {
			assert.doesNotMatch(plugin, stale)
		}
	})
})
