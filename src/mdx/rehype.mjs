import { slugifyWithCounter } from '@sindresorhus/slugify'
import * as acorn from 'acorn'
import { toString } from 'mdast-util-to-string'
import { mdxAnnotations } from 'mdx-annotations'
import { createCssVariablesTheme, createHighlighter } from 'shiki'
import { visit } from 'unist-util-visit'

function rehypeParseCodeBlocks() {
	return tree => {
		visit(tree, 'element', (node, _nodeIndex, parentNode) => {
			if (node.tagName === 'code' && node.properties.className) {
				parentNode.properties.language = node.properties.className[0]?.replace(
					/^language-/,
					''
				)
			}
		})
	}
}

// Token colors come from the `--shiki-*` CSS variables in src/styles/tailwind.css
const cssVariablesTheme = createCssVariablesTheme({
	name: 'css-variables',
	variablePrefix: '--shiki-',
})

const FONT_STYLE_ITALIC = 1
const FONT_STYLE_BOLD = 2
const FONT_STYLE_UNDERLINE = 4

let highlighterPromise

function getHighlighter() {
	highlighterPromise =
		highlighterPromise ??
		createHighlighter({ themes: [cssVariablesTheme], langs: [] })
	return highlighterPromise
}

function escapeHtml(html) {
	return html.replace(
		/[&<>"']/g,
		chr =>
			({
				'&': '&amp;',
				'<': '&lt;',
				'>': '&gt;',
				'"': '&quot;',
				"'": '&#39;',
			})[chr]
	)
}

// One `<span>` per line (joined by newlines), one styled `<span>` per token
function renderTokens(lines) {
	return lines
		.map(
			line =>
				`<span>${line
					.map(token => {
						let declarations = []
						if (token.color) {
							declarations.push(`color: ${token.color}`)
						}
						if (token.fontStyle & FONT_STYLE_ITALIC) {
							declarations.push('font-style: italic')
						}
						if (token.fontStyle & FONT_STYLE_BOLD) {
							declarations.push('font-weight: bold')
						}
						if (token.fontStyle & FONT_STYLE_UNDERLINE) {
							declarations.push('text-decoration: underline')
						}
						let style = declarations.length
							? ` style="${declarations.join('; ')}"`
							: ''
						return `<span${style}>${escapeHtml(token.content)}</span>`
					})
					.join('')}</span>`
		)
		.join('\n')
}

function rehypeShiki() {
	return async tree => {
		let highlighter = await getHighlighter()
		let codeBlocks = []

		visit(tree, 'element', node => {
			if (node.tagName === 'pre' && node.children[0]?.tagName === 'code') {
				codeBlocks.push(node)
			}
		})

		let languages = [
			...new Set(codeBlocks.map(node => node.properties.language)),
		].filter(Boolean)
		await highlighter.loadLanguage(...languages)

		for (let node of codeBlocks) {
			let codeNode = node.children[0]
			let textNode = codeNode.children[0]

			node.properties.code = textNode.value

			if (node.properties.language) {
				let tokens = highlighter.codeToTokensBase(textNode.value, {
					lang: node.properties.language,
					theme: cssVariablesTheme.name,
				})

				textNode.value = renderTokens(tokens)
			}
		}
	}
}

function rehypeSlugify() {
	return tree => {
		let slugify = slugifyWithCounter()
		visit(tree, 'element', node => {
			if (node.tagName === 'h2' && !node.properties.id) {
				node.properties.id = slugify(toString(node))
			}
		})
	}
}

function rehypeAddMDXExports(getExports) {
	return tree => {
		let exports = Object.entries(getExports(tree))

		for (let [name, value] of exports) {
			for (let node of tree.children) {
				if (
					node.type === 'mdxjsEsm' &&
					new RegExp(`export\\s+const\\s+${name}\\s*=`).test(node.value)
				) {
					return
				}
			}

			let exportStr = `export const ${name} = ${value}`

			tree.children.push({
				type: 'mdxjsEsm',
				value: exportStr,
				data: {
					estree: acorn.parse(exportStr, {
						sourceType: 'module',
						ecmaVersion: 'latest',
					}),
				},
			})
		}
	}
}

function getSections(node) {
	let sections = []

	for (let child of node.children ?? []) {
		if (child.type === 'element' && child.tagName === 'h2') {
			sections.push(`{
        title: ${JSON.stringify(toString(child))},
        id: ${JSON.stringify(child.properties.id)},
        ...${child.properties.annotation}
      }`)
		} else if (child.children) {
			sections.push(...getSections(child))
		}
	}

	return sections
}

export const rehypePlugins = [
	mdxAnnotations.rehype,
	rehypeParseCodeBlocks,
	rehypeShiki,
	rehypeSlugify,
	[
		rehypeAddMDXExports,
		tree => ({
			sections: `[${getSections(tree).join()}]`,
		}),
	],
]
