import Image from 'next/image'

export function ScreenDashboard() {
	return (
		<>
			<span className="sr-only">ScreenDashboard</span>
			<Image
				className="w-auto"
				src="/screenshot-dashboard.png"
				alt="logo ForVoyez"
				width={1500}
				height={800}
			/>
		</>
	)
}
