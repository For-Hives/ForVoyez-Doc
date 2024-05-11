// Guides.jsx
import { Button } from '@/components/Button'
import { Heading } from '@/components/Heading'

const guides = [
	{
		href: '/introduction',
		name: 'Introduction',
		description:
			'Discover the need for automated image metadata generation and the benefits of our API.',
	},
	{
		href: '/quickstart',
		name: 'Quick Start',
		description:
			'Get up and running quickly with our API by following this step-by-step guide.',
	},
	{
		href: '/authentication',
		name: 'Authentication',
		description:
			'Learn how to authenticate your requests to the API and manage your API keys.',
	},
	{
		href: '/using-the-api',
		name: 'Using the API',
		description:
			'Understand the request format, parameters, and error handling when using our API.',
	},
	{
		href: '/data-schemas',
		name: 'Data Schemas',
		description:
			'Explore the structure of JSON schemas and learn how to customize and validate them.',
	},
	{
		href: '/limits-and-quotas',
		name: 'Limits and Quotas',
		description:
			'Understand the request limits per subscription and how to handle quota overages.',
	},
]

export function Guides() {
	return (
		<div className="my-16 xl:max-w-none">
			<Heading level={2} id="guides">
				Guides
			</Heading>
			<div className="not-prose mt-4 grid grid-cols-1 gap-8 border-t border-slate-900/5 pt-10 sm:grid-cols-2 xl:grid-cols-4">
				{guides.map(guide => (
					<div key={guide.href}>
						<h3 className="text-sm font-semibold text-slate-900">
							{guide.name}
						</h3>
						<p className="mt-1 text-sm text-slate-600">{guide.description}</p>
						<p className="mt-4">
							<Button href={guide.href} variant="text" arrow="right">
								Read more
							</Button>
						</p>
					</div>
				))}
			</div>
		</div>
	)
}
