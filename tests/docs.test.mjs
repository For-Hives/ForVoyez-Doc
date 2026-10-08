// Content checks for the MDX pages: the code examples must run as written
// against the API, and the facts the pages state (prices, links, error
// bodies) must stay consistent. Run with `pnpm test` (node:test, no
// dependencies). Interpreters that are not installed are skipped.
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, test } from 'node:test'

const appDir = path.join(import.meta.dirname, '..', 'src', 'app')

const pages = fs
	.readdirSync(appDir, { recursive: true })
	.filter(file => file.endsWith('page.mdx'))
	.map(file => ({
		name: path.dirname(file) === '.' ? 'home' : path.dirname(file),
		source: fs.readFileSync(path.join(appDir, file), 'utf8'),
	}))

function page(name) {
	const found = pages.find(p => p.name === name)
	assert.ok(found, `page ${name} not found`)
	return found.source
}

// Fenced code blocks: ```lang {{ title: '...' }}
const codeBlocks = pages.flatMap(({ name, source }) =>
	[...source.matchAll(/^```(\w*)[^\n]*\n([\s\S]*?)^```/gm)].map(
		([, lang, code], index) => ({ page: name, index, lang, code })
	)
)

function blocksOf(...langs) {
	return codeBlocks.filter(block => langs.includes(block.lang))
}

function hasCommand(command) {
	return spawnSync(command, ['--version'], { encoding: 'utf8' }).status === 0
}

// Writes `code` to a temporary file and runs `command ...args file`.
function checkSyntax(command, args, extension, code) {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'forvoyez-doc-'))
	const file = path.join(dir, `example${extension}`)
	try {
		fs.writeFileSync(file, code)
		return spawnSync(command, [...args, file], { encoding: 'utf8' })
	} finally {
		fs.rmSync(dir, { force: true, recursive: true })
	}
}

describe('code examples', () => {
	test('the pages have examples in every documented language', () => {
		for (const lang of ['bash', 'javascript', 'json', 'php', 'python']) {
			assert.ok(
				codeBlocks.some(block => block.lang === lang),
				`no ${lang} example found`
			)
		}
	})

	test('every JSON example is valid JSON', () => {
		for (const { code, index, page } of blocksOf('json')) {
			assert.doesNotThrow(
				() => JSON.parse(code),
				`${page} block ${index} is not valid JSON`
			)
		}
	})

	const syntaxCheckers = [
		{ args: ['-n'], command: 'bash', extension: '.sh', langs: ['bash'] },
		{
			args: ['--check'],
			command: process.execPath,
			extension: '.mjs',
			langs: ['javascript', 'js'],
		},
		{
			args: ['-m', 'py_compile'],
			command: 'python3',
			extension: '.py',
			langs: ['python'],
		},
		{ args: ['-l'], command: 'php', extension: '.php', langs: ['php'] },
	]

	for (const { args, command, extension, langs } of syntaxCheckers) {
		const name = path.basename(command)
		test(
			`${langs[0]} examples have no syntax error (${name})`,
			{ skip: !hasCommand(command) && `${name} is not installed` },
			() => {
				for (const { code, index, page } of blocksOf(...langs)) {
					const result = checkSyntax(command, args, extension, code)
					assert.equal(
						result.status,
						0,
						`${page} block ${index}: ${result.stderr || result.stdout}`
					)
				}
			}
		)
	}

	test('no example sets the multipart Content-Type header by hand', () => {
		// cURL -F, FormData and requests' files= set it with the boundary;
		// without the boundary the API cannot read the form.
		for (const { code, index, page } of codeBlocks) {
			for (const [header] of code.matchAll(
				/content-type['"]?\s*[:=,]\s*['"]?multipart\/form-data[^\n]*/gi
			)) {
				assert.match(
					header,
					/boundary=/,
					`${page} block ${index} sets "${header.trim()}" without a boundary`
				)
			}
		}
	})

	test('PHP examples do not call curl_close (deprecated in PHP 8.5)', () => {
		for (const { code, index, page } of blocksOf('php')) {
			assert.doesNotMatch(code, /curl_close\s*\(/, `${page} block ${index}`)
		}
	})

	test('every request example calls a production endpoint of the API', () => {
		// the two public endpoints: POST /api/describe and GET /api/tokens
		for (const { code, index, page } of blocksOf(
			'bash',
			'javascript',
			'js',
			'php',
			'python'
		)) {
			if (!/forvoyez\.com\/api/.test(code)) continue
			assert.match(
				code,
				/https:\/\/forvoyez\.com\/api\/(describe|tokens)\b/,
				`${page} block ${index}`
			)
		}
	})
})

describe('links to the ForVoyez app', () => {
	// Public routes of forvoyez.com and the dashboard pages (forvoyez.com/app)
	const appRoutes = new Set([
		'/',
		'/app',
		'/app/billing',
		'/app/playground',
		'/app/plans',
		'/app/tokens',
		'/app/usage',
		'/contact',
		'/profile',
		'/sign-in',
		'/sign-up',
	])

	test('point at pages the app has, without anchors', () => {
		const links = pages.flatMap(({ name, source }) =>
			[
				...source.matchAll(/https:\/\/(?:www\.)?forvoyez\.com([^\s)"'`]*)/g),
			].map(([url, rest]) => ({ name, rest, url }))
		)
		assert.ok(links.length > 0)
		for (const { name, rest, url } of links) {
			if (rest.startsWith('/api/')) continue
			const pathname = rest.replace(/\/$/, '') || '/'
			assert.ok(appRoutes.has(pathname), `${name}: ${url} is not an app page`)
		}
	})
})

describe('pricing', () => {
	const pricing = page('pricing')

	function annualSaving(monthly, yearly) {
		return Math.round(((12 * monthly - yearly) / (12 * monthly)) * 1000) / 10
	}

	test('no page promises a 20% annual discount', () => {
		for (const { name, source } of pages) {
			assert.ok(!/20\s*%\s*off/i.test(source), `${name} promises 20% off`)
		}
	})

	// Starter and Growth cards: the only ones with an annual price
	const annualPlans = pricing
		.split('<h3')
		.slice(1)
		.filter(card => card.includes('/year'))
		.map(card => ({
			card,
			monthly: Number(card.match(/€([\d.]+)\/month/)?.[1]),
			name: card.match(/>([^<]+)<\/h3>/)?.[1],
			percent: Number(card.match(/([\d.]+)% less/)?.[1]),
			twelveMonths: card.match(/12 monthly payments \(€([\d.]+)\)/)?.[1],
			yearly: Number(card.match(/€([\d.]+)\/year/)?.[1]),
		}))

	test('each annual saving matches the plan prices', () => {
		assert.deepEqual(
			annualPlans.map(plan => plan.name),
			['Starter', 'Growth']
		)
		for (const {
			card,
			monthly,
			percent,
			twelveMonths,
			yearly,
		} of annualPlans) {
			assert.equal(percent, annualSaving(monthly, yearly), card)
			assert.equal(twelveMonths, (12 * monthly).toFixed(2), card)
		}
	})

	test('the summary sentence matches the cards', () => {
		for (const { monthly, name, yearly } of annualPlans) {
			const claim = `${annualSaving(monthly, yearly)}% less for ${name} (€${yearly} instead of €${(12 * monthly).toFixed(2)})`
			assert.ok(pricing.includes(claim), `pricing does not say "${claim}"`)
		}
	})
})

describe('error documentation', () => {
	const statuses = ['400', '401', '413', '500']

	for (const name of ['error-codes', 'describe', 'api-documentation']) {
		test(`${name} documents every status the API returns`, () => {
			const source = page(name)
			for (const status of statuses) {
				assert.ok(source.includes(`\`${status}`), `${name}: no ${status}`)
			}
		})
	}

	test('every error body example is {"error": "<message>"}', () => {
		const bodies = ['error-codes', 'describe', 'api-documentation'].flatMap(
			name =>
				[...page(name).matchAll(/`(\{"error":[^`]*\})`/g)].map(([, body]) => ({
					body,
					name,
				}))
		)
		assert.ok(bodies.length >= 10, `only ${bodies.length} bodies found`)
		for (const { body, name } of bodies) {
			const parsed = JSON.parse(body)
			assert.deepEqual(Object.keys(parsed), ['error'], `${name}: ${body}`)
			assert.equal(typeof parsed.error, 'string', `${name}: ${body}`)
		}
	})
})

describe('usage tracking', () => {
	test('does not promise alerts or email notifications', () => {
		const source = page('usage-tracking')
		for (const claim of [
			/alerts and notifications/i,
			/email notif/i,
			/top consuming/i,
		]) {
			assert.ok(!claim.test(source), `usage-tracking promises ${claim}`)
		}
	})
})
