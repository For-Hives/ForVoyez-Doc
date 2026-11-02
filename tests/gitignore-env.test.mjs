// An env file must never reach a commit through `git add .`. Run with `pnpm test`.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { test } from 'node:test'

const root = path.join(import.meta.dirname, '..')

for (const file of ['.env', '.env.local', '.env.production']) {
	test(`git ignores ${file}`, () => {
		// exits non-zero, so throws, when the path is not ignored
		const ignored = execFileSync('git', ['check-ignore', file], {
			cwd: root,
			encoding: 'utf8',
		})
		assert.equal(ignored.trim(), file)
	})
}
