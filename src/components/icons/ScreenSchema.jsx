import Image from 'next/image'

export function ScreenSchema() {
	return (
		<>
			<span className="sr-only">ScreenSchema</span>
			<Image
				className="w-auto"
				src="/screenshot-schema.png"
				alt="logo ForVoyez"
				width={1500}
				height={800}
			/>
		</>
	)
}
