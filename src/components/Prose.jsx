import clsx from 'clsx'

export function Prose({ as, className, ...props }) {
	let Component = as ?? 'div'

	return (
		<Component
			className={clsx(
				className,
				'prose',
				// `html :where(& > *)` is used to select all direct children without an increase in specificity like you'd get from just `& > *`
				// `hr` is left out: it keeps the full-bleed width and margins from typography.css (utilities now sit in a later cascade layer than `.prose`)
				'[html_:where(&>:not(hr))]:mx-auto [html_:where(&>:not(hr))]:max-w-2xl lg:[html_:where(&>:not(hr))]:mx-[calc(50%-min(50%,var(--container-lg)))] lg:[html_:where(&>:not(hr))]:max-w-3xl'
			)}
			{...props}
		/>
	)
}
