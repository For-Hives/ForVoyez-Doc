import glob from 'fast-glob'
import { Jost, Source_Sans_3 } from 'next/font/google'

import { Layout } from '@/components/Layout'

import '@/styles/tailwind.css'

export const metadata = {
	title: {
		template: '%s - ForVoyez API Reference',
		default: 'ForVoyez API Reference',
	},
}

const sourcesans = Source_Sans_3({
	weight: ['300', '400', '700', '900'],
	subsets: ['latin'],
	variable: '--font-sourcesans',
	style: ['normal', 'italic'],
})

const jost = Jost({
	weight: ['200', '300', '400', '500', '600', '700', '800'],
	subsets: ['latin'],
	variable: '--font-jost',
	style: ['normal'],
})

export default async function RootLayout({ children }) {
	let pages = await glob('**/*.mdx', { cwd: 'src/app' })
	let allSectionsEntries = await Promise.all(
		pages.map(async filename => [
			'/' + filename.replace(/(^|\/)page\.mdx$/, ''),
			(await import(`./${filename}`)).sections,
		])
	)
	let allSections = Object.fromEntries(allSectionsEntries)

	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={`h-full ${sourcesans.variable} ${jost.variable}`}
		>
			<body className="flex min-h-full bg-white antialiased">
				<div className="w-full">
					<Layout allSections={allSections}>{children}</Layout>
				</div>
			</body>
		</html>
	)
}
