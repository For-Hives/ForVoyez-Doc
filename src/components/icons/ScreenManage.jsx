import Image from 'next/image'

export function ScreenManage() {
	return (
		<>
			<span className="sr-only">ScreenManage</span>
			<Image
				className="w-auto"
				src="/screenshot-manage.png"
				alt="logo ForVoyez"
				width={1500}
				height={800}
			/>
		</>
	)
}
