// Guard for the search dialog: closed by a click outside, it used to reopen on
// its last results (or on "Nothing found for ''") under an empty field, because
// only the query was reset and the panel stayed open. Nothing renders a page
// here (see doc-analytics.test.mjs): the component is read as text. Run with
// `pnpm test`.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { describe, test } from 'node:test'

const search = fs.readFileSync(
	path.join(import.meta.dirname, '..', 'src', 'components', 'Search.jsx'),
	'utf8'
)

describe('search dialog reset', () => {
	const reset = search.match(/function resetSearch\(\) \{([\s\S]*?)\n\t\}/)?.[1]

	test('resets the panel, not only the query', () => {
		assert.ok(reset, 'resetSearch() not found in Search.jsx')
		for (const call of [
			"autocomplete.setQuery('')",
			'autocomplete.setCollections([])',
			'autocomplete.setIsOpen(false)',
			"autocomplete.setStatus('idle')",
		]) {
			assert.ok(reset.includes(call), `resetSearch() does not call ${call}`)
		}
	})

	test('runs once the dialog has left and before it enters', () => {
		assert.match(search, /afterLeave=\{resetSearch\}/)
		assert.match(search, /beforeEnter=\{resetSearch\}/)
	})

	test('renders no result panel without a collection', () => {
		assert.match(
			search,
			/autocompleteState\.isOpen &&\s+autocompleteState\.collections\[0\] && \(/
		)
	})
})
