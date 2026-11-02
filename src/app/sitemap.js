import glob from 'fast-glob'

import { SITE_URL } from '../lib/site.js'

// One entry per MDX page, with the same URL as its canonical link (the home
// page has no trailing slash). No lastModified: the build date would announce a
// change on every deploy.
export default async function sitemap() {
	let pages = await glob('**/page.mdx', { cwd: 'src/app' })
	return pages.sort().map(file => ({
		url:
			SITE_URL + ('/' + file.replace(/\/?page\.mdx$/, '')).replace(/\/$/, ''),
	}))
}
