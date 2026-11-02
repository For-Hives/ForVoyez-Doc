// A code block without a language goes through the same HTML rendering as a
// highlighted one (src/components/Code.jsx). Run with `pnpm test` (node:test).
import assert from 'node:assert/strict'
import { test } from 'node:test'

import { rehypePlugins } from '../src/mdx/rehype.mjs'

const rehypeShiki = rehypePlugins.find(plugin => plugin.name === 'rehypeShiki')

function codeBlock(text) {
	const textNode = { type: 'text', value: text }
	const pre = {
		type: 'element',
		tagName: 'pre',
		properties: {},
		children: [
			{
				type: 'element',
				tagName: 'code',
				properties: {},
				children: [textNode],
			},
		],
	}
	return { pre, textNode, tree: { type: 'root', children: [pre] } }
}

test('a block without a language is escaped, the copy button keeps the text', async () => {
	const source = '<img src=x onerror="alert(1)"> & more'
	const { pre, textNode, tree } = codeBlock(source)
	await rehypeShiki()(tree)
	assert.equal(
		textNode.value,
		'&lt;img src=x onerror=&quot;alert(1)&quot;&gt; &amp; more'
	)
	assert.equal(pre.properties.code, source)
})

test('plain text is unchanged', async () => {
	const source = 'POST https://forvoyez.com/api/describe'
	const { textNode, tree } = codeBlock(source)
	await rehypeShiki()(tree)
	assert.equal(textNode.value, source)
})
