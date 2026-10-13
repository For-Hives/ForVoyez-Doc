'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { navigation } from '@/components/Navigation'
import { pageSlug, slug, textOf, withUtm } from '@/lib/analytics'

// Link of the MDX pages, of Button and of the header. Links to forvoyez.com
// get their UTM parameters here, at render time: the MDX sources keep the bare
// URLs that tests/docs.test.mjs checks.
export function DocLink({ href, children, ...props }) {
	let pathname = usePathname()
	// Only real pages name a campaign: a 404 keeps the path the visitor typed,
	// which is not known when the page is prerendered
	let isDocPage =
		pathname === '/' ||
		navigation.some(group => group.links.some(link => link.href === pathname))

	return (
		<Link
			href={withUtm(href, {
				campaign: isDocPage ? pageSlug(pathname) : 'other',
				content: slug(textOf(children)),
			})}
			{...props}
		>
			{children}
		</Link>
	)
}
