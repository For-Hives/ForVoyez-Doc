import clsx from 'clsx'
import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { forwardRef } from 'react'

import { Logo } from '@/components/Logo'
import {
	MobileNavigation,
	useIsInsideMobileNavigation,
} from '@/components/MobileNavigation'
import { useMobileNavigationStore } from '@/components/MobileNavigation'
import { MobileSearch, Search } from '@/components/Search'

function TopLevelNavItem({ href, children }) {
	return (
		<li>
			<Link
				href={href}
				className="text-sm leading-5 text-slate-600 transition hover:text-slate-900"
			>
				{children}
			</Link>
		</li>
	)
}

export const Header = forwardRef(function Header({ className }, ref) {
	let { isOpen: mobileNavIsOpen } = useMobileNavigationStore()
	let isInsideMobileNavigation = useIsInsideMobileNavigation()

	let { scrollY } = useScroll()
	let bgOpacityLight = useTransform(scrollY, [0, 72], [0.5, 0.9])

	return (
		<motion.div
			ref={ref}
			className={clsx(
				className,
				'fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between gap-12 px-4 transition sm:px-6 lg:left-72 lg:z-30 lg:px-8 xl:left-80',
				!isInsideMobileNavigation && 'backdrop-blur-sm lg:left-72 xl:left-80',
				isInsideMobileNavigation
					? 'bg-white'
					: 'bg-white/[var(--bg-opacity-light)]'
			)}
			style={{
				'--bg-opacity-light': bgOpacityLight,
			}}
		>
			<div
				className={clsx(
					'absolute inset-x-0 top-full h-px transition',
					(isInsideMobileNavigation || !mobileNavIsOpen) && 'bg-slate-900/7.5'
				)}
			/>
			<Search />
			<div className="flex items-center gap-5 lg:hidden">
				<MobileNavigation />
				<Link href="/" aria-label="Home">
					<Logo className="h-6" />
				</Link>
			</div>
			<div className="flex items-center gap-5">
				<nav className="hidden md:block">
					<ul role="list" className="flex items-center gap-8">
						<TopLevelNavItem href="https://forvoyez.com/">
							Website
						</TopLevelNavItem>
						<TopLevelNavItem href="/">Documentation</TopLevelNavItem>
						<TopLevelNavItem href="https://forvoyez.com/app">
							Profile
						</TopLevelNavItem>
					</ul>
				</nav>
				<div className="flex gap-4">
					<MobileSearch />
				</div>
			</div>
		</motion.div>
	)
})
