// References.jsx
import { Button } from '@/components/Button'
import { Heading } from '@/components/Heading'

const references = [
	{
		href: '/api-documentation',
		name: 'API Documentation',
		description:
			'Explore the complete reference of endpoints, parameters, and responses.',
	},
	{
		href: '/code-examples',
		name: 'Code Examples',
		description:
			'Discover code snippets in different programming languages to help you get started.',
	},
	{
		href: '/additional-resources',
		name: 'Additional Resources',
		description:
			'Find links to the landing page, dashboard, contact page, and more.',
	},
]

export function References() {
	return (
		<div className="my-16 xl:max-w-none">
			<Heading level={2} id="references">
				References
			</Heading>
			<div className="not-prose mt-4 grid grid-cols-1 gap-8 border-t border-slate-900/5 pt-10 sm:grid-cols-2 xl:grid-cols-4">
				{references.map(reference => (
					<div key={reference.href}>
						<h3 className="text-sm font-semibold text-slate-900">
							{reference.name}
						</h3>
						<p className="mt-1 text-sm text-slate-600">
							{reference.description}
						</p>
						<p className="mt-4">
							<Button href={reference.href} variant="text" arrow="right">
								Read more
							</Button>
						</p>
					</div>
				))}
			</div>
		</div>
	)
}
