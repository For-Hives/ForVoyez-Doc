'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { navigation } from '@/components/Navigation'
import { pageSlug, withUtm } from '@/lib/analytics'

// Link of the MDX pages, of Button and of the header. Links to forvoyez.com
// get their UTM parameters here, at render time: the MDX sources keep the bare
// URLs that tests/docs.test.mjs checks.
//
// `utmContent` names the link in utm_content; without it, the path of the link
// does. The caller derives it from the link text and passes it as a string:
// `children` sent by a server component can reach this client component as a
// lazy reference with no text to read, depending on how React cut the payload,
// and the same link would then get two different values.
export function DocLink({ href, utmContent, children, ...props }) {
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
				content: utmContent,
			})}
			{...props}
		>
			{children}
		</Link>
	)
}
