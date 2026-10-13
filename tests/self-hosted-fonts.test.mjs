// The fonts are served from public/fonts so that `next build` never downloads
// them: next/font/google fetched them from Google Fonts on every build, and
// that request failed at random (CI and deployments). Nothing renders a page
// here: the sources are read as text. Run with `pnpm test`.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { describe, test } from 'node:test'

const root = path.join(import.meta.dirname, '..')
const fontsDir = path.join(root, 'public', 'fonts')
const css = fs.readFileSync(
	path.join(root, 'src', 'styles', 'fonts.css'),
	'utf8'
)
const layout = fs.readFileSync(
	path.join(root, 'src', 'app', 'layout.jsx'),
	'utf8'
)
const nextConfig = fs.readFileSync(path.join(root, 'next.config.mjs'), 'utf8')

const faces = [...css.matchAll(/@font-face \{([^}]*)\}/g)]
	.map(match => match[1])
	.filter(body => body.includes('unicode-range'))
	.map(body => ({
		family: body.match(/font-family: ['"]([^'"]+)['"]/)?.[1],
		style: body.match(/font-style: (\w+)/)?.[1],
		weight: body.match(/font-weight: (\d+)/)?.[1],
		display: body.match(/font-display: (\w+)/)?.[1],
		file: body.match(/url\(['"]\/fonts\/([^'"]+)['"]\)/)?.[1],
	}))

function variants(family) {
	return [
		...new Set(
			faces
				.filter(face => face.family === family)
				.map(face => `${face.style} ${face.weight}`)
		),
	].sort()
}

describe('self-hosted fonts', () => {
	test('no source asks Google Fonts for a font', () => {
		const offenders = fs
			.readdirSync(path.join(root, 'src'), { recursive: true })
			.filter(file => /\.(js|jsx|mjs|mdx|css)$/.test(file))
			.filter(file =>
				/next\/font\/google|fonts\.googleapis\.com|fonts\.gstatic\.com/.test(
					fs
						.readFileSync(path.join(root, 'src', file), 'utf8')
						.replace(/\/\*[\s\S]*?\*\//g, '')
				)
			)

		assert.deepEqual(offenders, [])
	})

	test('declares the weights and styles the site was built with, for every subset', () => {
		assert.deepEqual(variants('Source Sans 3'), [
			'italic 300',
			'italic 400',
			'italic 700',
			'italic 900',
			'normal 300',
			'normal 400',
			'normal 700',
			'normal 900',
		])
		assert.deepEqual(variants('Jost'), [
			'normal 200',
			'normal 300',
			'normal 400',
			'normal 500',
			'normal 600',
			'normal 700',
			'normal 800',
		])
		// 7 subsets of Source Sans 3 in 8 variants, 3 subsets of Jost in 7
		assert.equal(faces.length, 7 * 8 + 3 * 7)
		assert.ok(faces.every(face => face.display === 'swap'))
	})

	test('ships every font file the stylesheet names, and no other', () => {
		const named = [...new Set(faces.map(face => face.file))].sort()
		const shipped = fs
			.readdirSync(fontsDir)
			.filter(file => file.endsWith('.woff2'))
			.sort()

		assert.equal(named.length, 17)
		assert.deepEqual(shipped, named)
	})

	test('ships the licence of both fonts next to the files', () => {
		for (const licence of ['OFL-source-sans-3.txt', 'OFL-jost.txt']) {
			assert.match(
				fs.readFileSync(path.join(fontsDir, licence), 'utf8'),
				/SIL Open Font License/
			)
		}
	})

	test('sets the two font variables the theme reads, with a resized Arial while the font loads', () => {
		assert.match(
			css,
			/--next-font-sourcesans: ['"]Source Sans 3['"], ['"]Source Sans 3 Fallback['"];/
		)
		assert.match(css, /--next-font-jost: ['"]Jost['"], ['"]Jost Fallback['"];/)
		assert.equal(css.match(/src: local\(Arial\);/g).length, 2)
	})

	test('preloads the latin file of each font, like next/font did', () => {
		const preloaded = [...layout.matchAll(/'(\/fonts\/[^']+\.woff2)'/g)].map(
			match => match[1]
		)

		assert.deepEqual(preloaded.sort(), [
			'/fonts/jost-v20-latin-normal.woff2',
			'/fonts/source-sans-3-v20-latin-italic.woff2',
			'/fonts/source-sans-3-v20-latin-normal.woff2',
		])
		for (const href of preloaded) {
			assert.ok(fs.existsSync(path.join(root, 'public', href)), href)
		}
		assert.match(
			layout,
			/preload\(href, \{ as: 'font', type: 'font\/woff2', crossOrigin: 'anonymous' \}\)/
		)
	})

	test('lets browsers keep the versioned font files for a year', () => {
		assert.match(nextConfig, /source: '\/fonts\/:file\*\.woff2'/)
		assert.match(nextConfig, /value: 'public, max-age=31536000, immutable'/)
		// a new font version needs a new file name: the old one stays cached
		assert.ok(faces.every(face => /-v\d+-/.test(face.file)))
	})
})
