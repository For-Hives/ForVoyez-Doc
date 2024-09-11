import Image from 'next/image'

export function ScreenConfiguration() {
	return (
		<>
			<span className="sr-only">ScreenConfiguration</span>
			<Image
				className="w-auto"
				src="/screenshot-configuration.png"
				alt="logo ForVoyez"
				width={1500}
				height={800}
			/>
		</>
	)
}
