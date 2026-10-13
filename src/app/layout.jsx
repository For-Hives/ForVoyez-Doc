import glob from 'fast-glob'
import Script from 'next/script'
import { preload } from 'react-dom'

import { Analytics } from '@/components/Analytics'
import { Layout } from '@/components/Layout'

import '@/styles/fonts.css'
import '@/styles/tailwind.css'

export const metadata = {
	// docs.forvoyez.com serves the same pages: every page names its
	// doc.forvoyez.com URL as canonical ('./' resolves to the page's own path)
	metadataBase: new URL('https://doc.forvoyez.com'),
	alternates: { canonical: './' },
	title: {
		template: '%s - ForVoyez API Reference',
		default: 'ForVoyez API Reference',
	},
}

// The latin files of the two fonts (src/styles/fonts.css), preloaded like
// next/font did (the italic one is only used on a few pages); the other
// subsets load on demand.
const PRELOADED_FONTS = [
	'/fonts/source-sans-3-v20-latin-normal.woff2',
	'/fonts/source-sans-3-v20-latin-italic.woff2',
	'/fonts/jost-v20-latin-normal.woff2',
]

export default async function RootLayout({ children }) {
	let pages = await glob('**/*.mdx', { cwd: 'src/app' })
	let allSectionsEntries = await Promise.all(
		pages.map(async filename => [
			'/' + filename.replace(/(^|\/)page\.mdx$/, ''),
			(await import(`./${filename}`)).sections,
		])
	)
	let allSections = Object.fromEntries(allSectionsEntries)

	for (let href of PRELOADED_FONTS) {
		preload(href, { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' })
	}

	return (
		<html lang="en" suppressHydrationWarning className="h-full">
			<Script
				async
				data-domains={'forvoyez.com,doc.forvoyez.com,docs.forvoyez.com'}
				data-website-id="705a7c53-7dc4-4cf7-b625-f2f87a428bfb"
				src="https://umami.wadefade.fr/script.js"
				strategy="afterInteractive"
			></Script>
			<body className="flex min-h-full bg-white antialiased">
				<div className="w-full">
					<Layout allSections={allSections}>{children}</Layout>
				</div>
				<Analytics />
			</body>
		</html>
	)
}
