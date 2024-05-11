'use client'

import { motion, useMotionTemplate, useMotionValue } from 'framer-motion'
import Link from 'next/link'

import { GridPattern } from '@/components/GridPattern'
import { Heading } from '@/components/Heading'
import { ClipboardIcon } from '@/components/icons/ClipboardIcon'
import { CogIcon } from '@/components/icons/CogIcon'
import { CurrencyDollarIcon } from '@/components/icons/CurrencyDollarIcon'
import { EnvelopeIcon } from '@/components/icons/EnvelopeIcon'
import { GaugeIcon } from '@/components/icons/GaugeIcon'
import { LinkIcon } from '@/components/icons/LinkIcon'
import { SquaresPlusIcon } from '@/components/icons/SquaresPlusIcon'
import { TagIcon } from '@/components/icons/TagIcon'

const dashboardSupportItems = [
	{
		href: '/account-management',
		name: 'Account Management',
		description:
			'Manage your user account settings, subscriptions, billing, and payment history.',
		icon: CogIcon,
		pattern: {
			y: 16,
			squares: [
				[0, 1],
				[1, 3],
			],
		},
	},
	{
		href: '/usage-tracking',
		name: 'Usage Tracking',
		description:
			'Track your API usage statistics, quota limits, and receive alerts and notifications.',
		icon: GaugeIcon,
		pattern: {
			y: -6,
			squares: [
				[-1, 2],
				[1, 3],
			],
		},
	},
	{
		href: '/pricing',
		name: 'Pricing',
		description:
			'Explore our pricing plans and choose the one that best fits your needs.',
		icon: TagIcon,
		pattern: {
			y: 32,
			squares: [
				[0, 2],
				[1, 4],
			],
		},
	},
	{
		href: '/billing',
		name: 'Billing',
		description:
			'Manage your billing information, payment methods, and view your invoice history.',
		icon: CurrencyDollarIcon,
		pattern: {
			y: 22,
			squares: [
				[0, 1],
				[1, 3],
			],
		},
	},
	{
		href: '/online-tools',
		name: 'Online Tools',
		description:
			'Explore our online tools, including the API playground, JSON schema generator, and request validator.',
		icon: SquaresPlusIcon,
		pattern: {
			y: 8,
			squares: [
				[0, 2],
				[1, 4],
			],
		},
	},
	{
		href: '/support',
		name: 'Contact Us',
		description:
			'Get in touch with our support team for assistance, inquiries, or feedback.',
		icon: EnvelopeIcon,
		pattern: {
			y: -12,
			squares: [
				[-1, 1],
				[1, 2],
			],
		},
	},
	{
		href: '/useful-links',
		name: 'Useful Links',
		description:
			'Find a collection of helpful links related to the ForVoyez API and resources.',
		icon: LinkIcon,
		pattern: {
			y: 16,
			squares: [
				[0, 1],
				[1, 3],
			],
		},
	},
	{
		href: '/changelog',
		name: 'Changelog',
		description:
			'Stay updated with the latest changes, updates, and improvements to the ForVoyez API.',
		icon: ClipboardIcon,
		pattern: {
			y: -6,
			squares: [
				[-1, 2],
				[1, 3],
			],
		},
	},
]

function DashboardSupportIcon({ icon: Icon }) {
	return (
		<div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/5 ring-1 ring-slate-900/25 backdrop-blur-[2px] transition duration-300 group-hover:bg-white/50 group-hover:ring-slate-900/25">
			<Icon className="h-5 w-5 fill-slate-700/10 stroke-slate-700 transition-colors duration-300 group-hover:stroke-slate-900" />
		</div>
	)
}

function DashboardSupportPattern({ mouseX, mouseY, ...gridProps }) {
	let maskImage = useMotionTemplate`radial-gradient(180px at ${mouseX}px ${mouseY}px, white, transparent)`
	let style = { maskImage, WebkitMaskImage: maskImage }

	return (
		<div className="pointer-events-none">
			<div className="absolute inset-0 rounded-2xl transition duration-300 [mask-image:linear-gradient(white,transparent)] group-hover:opacity-50">
				<GridPattern
					width={72}
					height={56}
					x="50%"
					className="absolute inset-x-0 inset-y-[-30%] h-[160%] w-full skew-y-[-18deg] fill-black/[0.02] stroke-black/5"
					{...gridProps}
				/>
			</div>
			<motion.div
				className="absolute inset-0 rounded-2xl bg-gradient-to-r from-forvoyez_orange-200/15 to-forvoyez_orange-300/15 opacity-0 transition duration-300 group-hover:opacity-100"
				style={style}
			/>
			<motion.div
				className="absolute inset-0 rounded-2xl opacity-0 mix-blend-overlay transition duration-300 group-hover:opacity-100"
				style={style}
			>
				<GridPattern
					width={72}
					height={56}
					x="50%"
					className="absolute inset-x-0 inset-y-[-30%] h-[160%] w-full skew-y-[-18deg] fill-black/50 stroke-black/70"
					{...gridProps}
				/>
			</motion.div>
		</div>
	)
}

function DashboardSupportItem({ item }) {
	let mouseX = useMotionValue(0)
	let mouseY = useMotionValue(0)

	function onMouseMove({ currentTarget, clientX, clientY }) {
		let { left, top } = currentTarget.getBoundingClientRect()
		mouseX.set(clientX - left)
		mouseY.set(clientY - top)
	}

	return (
		<div
			key={item.href}
			onMouseMove={onMouseMove}
			className="group relative flex rounded-2xl bg-slate-50 transition-shadow hover:shadow-md hover:shadow-slate-900/5"
		>
			<DashboardSupportPattern
				{...item.pattern}
				mouseX={mouseX}
				mouseY={mouseY}
			/>
			<div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-slate-900/7.5 group-hover:ring-slate-900/10" />
			<div className="relative rounded-2xl px-4 pb-4 pt-16">
				<DashboardSupportIcon icon={item.icon} />
				<h3 className="mt-4 text-sm font-semibold leading-7 text-slate-900">
					<Link href={item.href}>
						<span className="absolute inset-0 rounded-2xl" />
						{item.name}
					</Link>
				</h3>
				<p className="mt-1 text-sm text-slate-600">{item.description}</p>
			</div>
		</div>
	)
}

export function DashboardSupport() {
	return (
		<div className="my-16 xl:max-w-none">
			<Heading level={2} id="dashboard-support">
				Dashboard & Support
			</Heading>
			<div className="not-prose mt-4 grid grid-cols-1 gap-8 border-t border-slate-900/5 pt-10 sm:grid-cols-2 xl:grid-cols-4">
				{dashboardSupportItems.map(item => (
					<DashboardSupportItem key={item.href} item={item} />
				))}
			</div>
		</div>
	)
}
