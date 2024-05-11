// DashboardSupport.jsx
import { Button } from '@/components/Button'
import { Heading } from '@/components/Heading'

const dashboardSupportItems = [
	{
		href: '/account-management',
		name: 'Account Management',
		description:
			'Manage your user account settings, subscriptions, billing, and payment history.',
	},
	{
		href: '/usage-tracking',
		name: 'Usage Tracking',
		description:
			'Track your API usage statistics, quota limits, and receive alerts and notifications.',
	},
	{
		href: '/online-tools',
		name: 'Online Tools',
		description:
			'Explore our online tools, including the API playground, JSON schema generator, and request validator.',
	},
	{
		href: '/support',
		name: 'Support',
		description:
			'Learn how to contact our support team, submit requests, and stay updated with the API changelog.',
	},
]

export function DashboardSupport() {
	return (
		<div className="my-16 xl:max-w-none">
			<Heading level={2} id="dashboard-support">
				Dashboard & Support
			</Heading>
			<div className="not-prose mt-4 grid grid-cols-1 gap-8 border-t border-slate-900/5 pt-10 sm:grid-cols-2 xl:grid-cols-4">
				{dashboardSupportItems.map(item => (
					<div key={item.href}>
						<h3 className="text-sm font-semibold text-slate-900">
							{item.name}
						</h3>
						<p className="mt-1 text-sm text-slate-600">{item.description}</p>
						<p className="mt-4">
							<Button href={item.href} variant="text" arrow="right">
								Read more
							</Button>
						</p>
					</div>
				))}
			</div>
		</div>
	)
}
