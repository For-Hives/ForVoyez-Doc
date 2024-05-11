'use client'

import { motion, useMotionTemplate, useMotionValue } from 'framer-motion'
import Link from 'next/link'

import { GridPattern } from '@/components/GridPattern'
import { Heading } from '@/components/Heading'
import { BoltIcon } from '@/components/icons/BoltIcon'
import { BookIcon } from '@/components/icons/BookIcon'
import { CodeBracketIcon } from '@/components/icons/CodeBracketIcon'
import { CubeTransparentIcon } from '@/components/icons/CubeTransparentIcon'
import { GaugeIcon } from '@/components/icons/GaugeIcon'
import { KeyIcon } from '@/components/icons/KeyIcon'

export const guides = [
	[
		{
			href: '/introduction',
			name: 'Introduction',
			description:
				'Discover the need for automated image metadata generation and the benefits of our API.',
			icon: 'BookIcon',
			pattern: {
				y: 16,
				squares: [
					[0, 1],
					[1, 3],
				],
			},
		},
		{
			href: '/quickstart',
			name: 'Quick Start',
			description:
				'Get up and running quickly with our API by following this step-by-step guide.',
			icon: 'BoltIcon',
			pattern: {
				y: -6,
				squares: [
					[-1, 2],
					[1, 3],
				],
			},
		},
		{
			href: '/authentication',
			name: 'Authentication',
			description:
				'Learn how to authenticate your requests to the API and manage your API keys.',
			icon: 'KeyIcon',
			pattern: {
				y: 32,
				squares: [
					[0, 2],
					[1, 4],
				],
			},
		},
		{
			href: '/using-the-api',
			name: 'Using the API',
			description:
				'Understand the request format, parameters, and error handling when using our API.',
			icon: 'CodeBracketIcon',
			pattern: {
				y: 22,
				squares: [
					[0, 1],
					[1, 3],
				],
			},
		},
		{
			href: '/data-schemas',
			name: 'Data Schemas',
			description:
				'Explore the structure of JSON schemas and learn how to customize and validate them.',
			icon: 'CubeTransparentIcon',
			pattern: {
				y: 8,
				squares: [
					[0, 2],
					[1, 4],
				],
			},
		},
		{
			href: '/limits-and-quotas',
			name: 'Limits and Quotas',
			description:
				'Understand the request limits per subscription and how to handle quota overages.',
			icon: 'GaugeIcon',
			pattern: {
				y: -12,
				squares: [
					[-1, 1],
					[1, 2],
				],
			},
		},
	],
]

export function GuideIcon({ icon: Icon }) {
	return (
		<div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/5 ring-1 ring-slate-900/25 backdrop-blur-[2px] transition duration-300 group-hover:bg-white/50 group-hover:ring-slate-900/25">
			<Icon className="h-5 w-5 fill-slate-700/10 stroke-slate-700 transition-colors duration-300 group-hover:stroke-slate-900" />
		</div>
	)
}

function GuidePattern({ mouseX, mouseY, ...gridProps }) {
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

function Guide({ guide }) {
	let mouseX = useMotionValue(0)
	let mouseY = useMotionValue(0)

	function onMouseMove({ currentTarget, clientX, clientY }) {
		let { left, top } = currentTarget.getBoundingClientRect()
		mouseX.set(clientX - left)
		mouseY.set(clientY - top)
	}

	return (
		<div
			key={guide.href}
			onMouseMove={onMouseMove}
			className="group relative flex rounded-2xl bg-slate-50 transition-shadow hover:shadow-md hover:shadow-slate-900/5"
		>
			<GuidePattern {...guide.pattern} mouseX={mouseX} mouseY={mouseY} />
			<div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-slate-900/7.5 group-hover:ring-slate-900/10" />
			<div className="relative rounded-2xl px-4 pb-4 pt-16">
				<GuideIcon icon={guide.icon} />
				<h3 className="mt-4 text-sm font-semibold leading-7 text-slate-900">
					<Link href={guide.href}>
						<span className="absolute inset-0 rounded-2xl" />
						{guide.name}
					</Link>
				</h3>
				<p className="mt-1 text-sm text-slate-600">{guide.description}</p>
			</div>
		</div>
	)
}

export function Guides() {
	return (
		<div className="my-16 xl:max-w-none">
			<Heading level={2} id="guides">
				Guides
			</Heading>
			<div className="not-prose mt-4 grid grid-cols-1 gap-8 border-t border-slate-900/5 pt-10 sm:grid-cols-2 xl:grid-cols-4">
				{guides.map(guide => (
					<Guide key={guide.href} guide={guide} />
				))}
			</div>
		</div>
	)
}
