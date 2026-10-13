'use client'

import { useEffect } from 'react'

import { clickEvent, track } from '@/lib/analytics'

// Clicks already reported: MobileNavigation reports the clicks of its dialog
// itself, and those on internal links also reach the document
const reported = new WeakSet()

// Reports a native click to Umami. It only reads the DOM and never calls
// preventDefault, so next/link keeps navigating on the client.
export function reportClick(event) {
	try {
		if (reported.has(event)) {
			return
		}
		reported.add(event)

		let found = clickEvent(event.target, window.location)
		if (found) {
			track(found.name, found.data)
		}
	} catch {
		// analytics must never break a click
	}
}

// One delegated click listener for the whole site, in the bubble phase.
// Elements with `data-fv-event` send that event; any other link is classified
// by its host (see `linkEvent` in src/lib/analytics.js).
export function Analytics() {
	useEffect(() => {
		document.addEventListener('click', reportClick)
		return () => {
			document.removeEventListener('click', reportClick)
		}
	}, [])

	return null
}
