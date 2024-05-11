'use client'

import clsx from 'clsx'
import { AnimatePresence, motion, useIsPresent } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRef } from 'react'

import { Button } from '@/components/Button'
import { useIsInsideMobileNavigation } from '@/components/MobileNavigation'
import { useSectionStore } from '@/components/SectionProvider'
import { Tag } from '@/components/Tag'
import { remToPx } from '@/lib/remToPx'

function useInitialValue(value, condition = true) {
	let initialValue = useRef(value).current
	return condition ? initialValue : value
}

function TopLevelNavItem({ href, children }) {
	return (
		<li className="md:hidden">
			<Link
				href={href}
				className="block py-1 text-sm text-slate-600 transition hover:text-slate-900"
			>
				{children}
			</Link>
		</li>
	)
}

function NavLink({
	href,
	children,
	tag,
	active = false,
	isAnchorLink = false,
}) {
	return (
		<Link
			href={href}
			aria-current={active ? 'page' : undefined}
			className={clsx(
				'flex justify-between gap-2 py-1 pr-3 text-sm transition',
				isAnchorLink ? 'pl-7' : 'pl-4',
				active ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'
			)}
		>
			<span className="truncate">{children}</span>
			{tag && (
				<Tag variant="small" color="slate">
					{tag}
				</Tag>
			)}
		</Link>
	)
}

function VisibleSectionHighlight({ group, pathname }) {
	let [sections, visibleSections] = useInitialValue(
		[useSectionStore(s => s.sections), useSectionStore(s => s.visibleSections)],
		useIsInsideMobileNavigation()
	)

	let isPresent = useIsPresent()
	let firstVisibleSectionIndex = Math.max(
		0,
		[{ id: '_top' }, ...sections].findIndex(
			section => section.id === visibleSections[0]
		)
	)
	let itemHeight = remToPx(2)
	let height = isPresent
		? Math.max(1, visibleSections.length) * itemHeight
		: itemHeight
	let top =
		group.links.findIndex(link => link.href === pathname) * itemHeight +
		firstVisibleSectionIndex * itemHeight

	return (
		<motion.div
			layout
			initial={{ opacity: 0 }}
			animate={{ opacity: 1, transition: { delay: 0.2 } }}
			exit={{ opacity: 0 }}
			className="absolute inset-x-0 top-0 bg-slate-800/2.5 will-change-transform"
			style={{ borderRadius: 8, height, top }}
		/>
	)
}

function ActivePageMarker({ group, pathname }) {
	let itemHeight = remToPx(2)
	let offset = remToPx(0.25)
	let activePageIndex = group.links.findIndex(link => link.href === pathname)
	let top = offset + activePageIndex * itemHeight

	return (
		<motion.div
			layout
			className="absolute left-2 h-6 w-px bg-forvoyez_orange-500"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1, transition: { delay: 0.2 } }}
			exit={{ opacity: 0 }}
			style={{ top }}
		/>
	)
}

function NavigationGroup({ group, className }) {
	// If this is the mobile navigation then we always render the initial
	// state, so that the state does not change during the close animation.
	// The state will still update when we re-open (re-render) the navigation.
	let isInsideMobileNavigation = useIsInsideMobileNavigation()
	let [pathname, sections] = useInitialValue(
		[usePathname(), useSectionStore(s => s.sections)],
		isInsideMobileNavigation
	)

	let isActiveGroup =
		group.links.findIndex(link => link.href === pathname) !== -1

	return (
		<li className={clsx('relative mt-6', className)}>
			<motion.h2
				layout="position"
				className="text-xs font-semibold text-slate-900"
			>
				{group.title}
			</motion.h2>
			<div className="relative mt-3 pl-2">
				<AnimatePresence initial={!isInsideMobileNavigation}>
					{isActiveGroup && (
						<VisibleSectionHighlight group={group} pathname={pathname} />
					)}
				</AnimatePresence>
				<motion.div
					layout
					className="absolute inset-y-0 left-2 w-px bg-slate-900/10"
				/>
				<AnimatePresence initial={false}>
					{isActiveGroup && (
						<ActivePageMarker group={group} pathname={pathname} />
					)}
				</AnimatePresence>
				<ul role="list" className="border-l border-transparent">
					{group.links.map(link => (
						<motion.li key={link.href} layout="position" className="relative">
							<NavLink href={link.href} active={link.href === pathname}>
								{link.title}
							</NavLink>
							<AnimatePresence mode="popLayout" initial={false}>
								{link.href === pathname && sections.length > 0 && (
									<motion.ul
										role="list"
										initial={{ opacity: 0 }}
										animate={{
											opacity: 1,
											transition: { delay: 0.1 },
										}}
										exit={{
											opacity: 0,
											transition: { duration: 0.15 },
										}}
									>
										{sections.map(section => (
											<li key={section.id}>
												<NavLink
													href={`${link.href}#${section.id}`}
													tag={section.tag}
													isAnchorLink
												>
													{section.title}
												</NavLink>
											</li>
										))}
									</motion.ul>
								)}
							</AnimatePresence>
						</motion.li>
					))}
				</ul>
			</div>
		</li>
	)
}

export const navigation = [
	{
		title: 'Guides',
		links: [
			{ title: 'Introduction', href: '/introduction' },
			{ title: 'Quick Start', href: '/quickstart' },
			{ title: 'Authentication', href: '/authentication' },
			{ title: 'Using the API', href: '/using-the-api' },
			{ title: 'Data Schemas', href: '/data-schemas' },
			{ title: 'Limits and Quotas', href: '/limits-and-quotas' },
		],
	},
	{
		title: 'References',
		links: [
			{ title: 'API Documentation', href: '/api-documentation' },
			{ title: 'API: Describe', href: '/describe' },
			{ title: 'Code Examples', href: '/code-examples' },
			{ title: 'Code errors', href: '/error-codes' },
			{ title: 'Additional Resources', href: '/additional-resources' },
		],
	},
	{
		title: 'Support',
		links: [
			{ title: 'Account Management', href: '/account-management' },
			{ title: 'Usage Tracking', href: '/usage-tracking' },
			{ title: 'Pricing', href: '/pricing' },
			{ title: 'Billing', href: '/billing' },
			{ title: 'Online Tools', href: '/online-tools' },
			{ title: 'Contact us', href: '/support' },
			{ title: 'Useful links', href: '/useful-links' },
			{ title: 'Changelog', href: '/changelog' },
		],
	},
]

export function Navigation(props) {
	return (
		<nav {...props}>
			<ul role="list">
				<TopLevelNavItem href="/">API</TopLevelNavItem>
				<TopLevelNavItem href="#">Documentation</TopLevelNavItem>
				<TopLevelNavItem href="#">Support</TopLevelNavItem>
				{navigation.map((group, groupIndex) => (
					<NavigationGroup
						key={group.title}
						group={group}
						className={groupIndex === 0 ? 'md:mt-0' : ''}
					/>
				))}
			</ul>
		</nav>
	)
}
