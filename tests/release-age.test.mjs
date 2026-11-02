// Renovate merges minor, patch and lock file updates alone, and a merge deploys.
// Both delays are needed: Renovate does not check the age of the packages its
// lock file maintenance brings in, pnpm does the resolving there. Run with
// `pnpm test`.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'

const root = path.join(import.meta.dirname, '..')
const renovate = JSON.parse(
	fs.readFileSync(path.join(root, 'renovate.json'), 'utf8')
)
const workspace = fs.readFileSync(
	path.join(root, 'pnpm-workspace.yaml'),
	'utf8'
)

const THREE_DAYS_IN_MINUTES = 3 * 24 * 60

test('Renovate waits three days after a release', () => {
	assert.equal(renovate.minimumReleaseAge, '3 days')
})

test('no package rule removes the Renovate delay', () => {
	for (const rule of renovate.packageRules) {
		assert.ok(!('minimumReleaseAge' in rule), JSON.stringify(rule))
	}
})

test('pnpm refuses the same releases during lock file maintenance', () => {
	assert.equal(renovate.lockFileMaintenance.automerge, true)
	const age = workspace.match(/^minimumReleaseAge: (\d+)$/m)?.[1]
	assert.equal(Number(age), THREE_DAYS_IN_MINUTES)
})

test('no package escapes the pnpm delay', () => {
	assert.doesNotMatch(workspace, /minimumReleaseAgeExclude/)
})
