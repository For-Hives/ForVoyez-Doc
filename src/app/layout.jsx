import glob from 'fast-glob'
import {Layout} from '@/components/Layout'
import {Kanit, Playpen_Sans} from 'next/font/google'

import '@/styles/tailwind.css'

export const metadata = {
    title: {
        template: '%s - ForVoyez API Reference', default: 'ForVoyez API Reference',
    },
}

// fixme replace that with your chosen font
const kanit = Kanit({
    weight: ['100', '300', '400', '700', '900'], subsets: ['latin'], variable: '--font-kanit', style: ['normal', 'italic'],
})

// fixme replace that with your chosen font
const playpen_sans = Playpen_Sans({
    weight: ['200', '300', '400', '500', '600', '700', '800'], subsets: ['latin'], variable: '--font-playpen_sans', style: ['normal'],
})

export default async function RootLayout({children}) {
    let pages = await glob('**/*.mdx', {cwd: 'src/app'})
    let allSectionsEntries = await Promise.all(pages.map(async (filename) => ['/' + filename.replace(/(^|\/)page\.mdx$/, ''), (await import(`./${filename}`)).sections,]),)
    let allSections = Object.fromEntries(allSectionsEntries)

    return (<html lang="en" suppressHydrationWarning className={`h-full ${kanit.variable} ${playpen_sans.variable}`}>
    <body className="flex min-h-full bg-white antialiased">
    <div className="w-full">
        <Layout allSections={allSections}>{children}</Layout>
    </div>
    </body>
    </html>)
}
