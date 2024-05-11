import clsx from 'clsx'
import Link from 'next/link'

function ArrowIcon(props) {
	return (
		<svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				d="m11.5 6.5 3 3.5m0 0-3 3.5m3-3.5h-9"
			/>
		</svg>
	)
}

const variantStyles = {
	primary: 'rounded-full bg-slate-900 py-1 px-3 text-white hover:bg-slate-700',
	secondary:
		'rounded-full bg-slate-100 py-1 px-3 text-slate-900 hover:bg-slate-200',
	filled: 'rounded-full bg-slate-900 py-1 px-3 text-white hover:bg-slate-700',
	outline:
		'rounded-full py-1 px-3 text-slate-700 ring-1 ring-inset ring-slate-900/10 hover:bg-slate-900/2.5 hover:text-slate-900',
	text: 'text-forvoyez_orange-500 hover:text-forvoyez_orange-600',
}

export function Button({
	variant = 'primary',
	className,
	children,
	arrow,
	...props
}) {
	className = clsx(
		'inline-flex gap-0.5 justify-center overflow-hidden text-sm font-medium transition',
		variantStyles[variant],
		className
	)

	let arrowIcon = (
		<ArrowIcon
			className={clsx(
				'mt-0.5 h-5 w-5',
				variant === 'text' && 'relative top-px',
				arrow === 'left' && '-ml-1 rotate-180',
				arrow === 'right' && '-mr-1'
			)}
		/>
	)

	let inner = (
		<>
			{arrow === 'left' && arrowIcon}
			{children}
			{arrow === 'right' && arrowIcon}
		</>
	)

	if (typeof props.href === 'undefined') {
		return (
			<button className={className} {...props}>
				{inner}
			</button>
		)
	}

	return (
		<Link className={className} {...props}>
			{inner}
		</Link>
	)
}
