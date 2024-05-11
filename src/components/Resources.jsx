'use client'

import { motion, useMotionTemplate, useMotionValue } from 'framer-motion'
import Link from 'next/link'

import { GridPattern } from '@/components/GridPattern'
import { Heading } from '@/components/Heading'
import { ChatBubbleIcon } from '@/components/icons/ChatBubbleIcon'
import { EnvelopeIcon } from '@/components/icons/EnvelopeIcon'
import { UserIcon } from '@/components/icons/UserIcon'
import { UsersIcon } from '@/components/icons/UsersIcon'

const resources = [
	{
		href: '/contacts',
		name: 'Contacts',
		description:
			'Learn about the contact model and how to create, retrieve, update, delete, and list contacts.',
		icon: UserIcon,
		pattern: {
			y: 16,
			squares: [
				[0, 1],
				[1, 3],
			],
		},
	},
	{
		href: '/conversations',
		name: 'Conversations',
		description:
			'Learn about the conversation model and how to create, retrieve, update, delete, and list conversations.',
		icon: ChatBubbleIcon,
		pattern: {
			y: -6,
			squares: [
				[-1, 2],
				[1, 3],
			],
		},
	},
	{
		href: '/messages',
		name: 'Messages',
		description:
			'Learn about the message model and how to create, retrieve, update, delete, and list messages.',
		icon: EnvelopeIcon,
		pattern: {
			y: 32,
			squares: [
				[0, 2],
				[1, 4],
			],
		},
	},
	{
		href: '/groups',
		name: 'Groups',
		description:
			'Learn about the group model and how to create, retrieve, update, delete, and list groups.',
		icon: UsersIcon,
		pattern: {
			y: 22,
			squares: [[0, 1]],
		},
	},
]

function ResourceIcon({ icon: Icon }) {
	return (
		<div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/5 ring-1 ring-slate-900/25 backdrop-blur-[2px] transition duration-300 group-hover:bg-white/50 group-hover:ring-slate-900/25">
			<Icon className="h-5 w-5 fill-slate-700/10 stroke-slate-700 transition-colors duration-300 group-hover:stroke-slate-900" />
		</div>
	)
}

function ResourcePattern({ mouseX, mouseY, ...gridProps }) {
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

function Resource({ resource }) {
	let mouseX = useMotionValue(0)
	let mouseY = useMotionValue(0)

	function onMouseMove({ currentTarget, clientX, clientY }) {
		let { left, top } = currentTarget.getBoundingClientRect()
		mouseX.set(clientX - left)
		mouseY.set(clientY - top)
	}

	return (
		<div
			key={resource.href}
			onMouseMove={onMouseMove}
			className="group relative flex rounded-2xl bg-slate-50 transition-shadow hover:shadow-md hover:shadow-slate-900/5"
		>
			<ResourcePattern {...resource.pattern} mouseX={mouseX} mouseY={mouseY} />
			<div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-slate-900/7.5 group-hover:ring-slate-900/10" />
			<div className="relative rounded-2xl px-4 pb-4 pt-16">
				<ResourceIcon icon={resource.icon} />
				<h3 className="mt-4 text-sm font-semibold leading-7 text-slate-900">
					<Link href={resource.href}>
						<span className="absolute inset-0 rounded-2xl" />
						{resource.name}
					</Link>
				</h3>
				<p className="mt-1 text-sm text-slate-600">{resource.description}</p>
			</div>
		</div>
	)
}

export function Resources() {
	return (
		<div className="my-16 xl:max-w-none">
			<Heading level={2} id="resources">
				Resources
			</Heading>
			<div className="not-prose mt-4 grid grid-cols-1 gap-8 border-t border-slate-900/5 pt-10 sm:grid-cols-2 xl:grid-cols-4">
				{resources.map(resource => (
					<Resource key={resource.href} resource={resource} />
				))}
			</div>
		</div>
	)
}
