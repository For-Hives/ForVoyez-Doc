import Image from 'next/image'

export function Logo() {
    return (
        <>
            <span className="sr-only">ForVoyez</span>
            <Image
                className="h-8 w-auto"
                src="/logo/logo.webp"
                alt="logo ForVoyez"
                width={80}
                height={80}
            />
        </>
    )
}
