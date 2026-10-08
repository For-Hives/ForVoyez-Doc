import nextMDX from '@next/mdx'

import { recmaPlugins } from './src/mdx/recma.mjs'
import { rehypePlugins } from './src/mdx/rehype.mjs'
import { remarkPlugins } from './src/mdx/remark.mjs'
import withSearch from './src/mdx/search.mjs'

const withMDX = nextMDX({
	options: {
		remarkPlugins,
		rehypePlugins,
		recmaPlugins,
	},
})

// Workaround for https://github.com/vercel/next.js/issues/91735 (upstream fix
// pending in https://github.com/vercel/next.js/pull/95057): since Next.js 16.2,
// webpack builds run the `.mdx` rule through a layer-agnostic SWC pass, which
// rejects the `metadata` export of MDX pages as if they were Client Components.
// App Router MDX pages are Server Components, so pin that pass to the React
// Server Components layer for server compilations, like the upstream fix does.
// Remove once @next/mdx ships the fix.
function withMDXServerLayer(nextConfig) {
	return Object.assign({}, nextConfig, {
		webpack(config, options) {
			if (typeof nextConfig.webpack === 'function') {
				config = nextConfig.webpack(config, options)
			}

			if (options.isServer) {
				for (let rule of config.module.rules) {
					if (
						rule?.test instanceof RegExp &&
						rule.test.test('page.mdx') &&
						Array.isArray(rule.use)
					) {
						rule.use = rule.use.map(loader =>
							loader === options.defaultLoaders.babel
								? {
										...loader,
										options: { ...loader.options, bundleLayer: 'rsc' },
									}
								: loader
						)
					}
				}
			}

			return config
		},
	})
}

/** @type {import('next').NextConfig} */
const nextConfig = {
	pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'mdx'],
}

export default withMDXServerLayer(withSearch(withMDX(nextConfig)))
