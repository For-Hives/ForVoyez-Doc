import glob from 'fast-glob'
import {Layout} from '@/components/Layout'

import '@/styles/tailwind.css'

export const metadata = {
    title: {
        template: '%s - ForVoyez API Reference',
        default: 'ForVoyez API Reference',
    },
}

export default async function RootLayout({children}) {
    let pages = await glob('**/*.mdx', {cwd: 'src/app'})
    let allSectionsEntries = await Promise.all(
        pages.map(async (filename) => [
            '/' + filename.replace(/(^|\/)page\.mdx$/, ''),
            (await import(`./${filename}`)).sections,
        ]),
    )
    let allSections = Object.fromEntries(allSectionsEntries)

    return (
        <html lang="en" className="h-full" suppressHydrationWarning>
        <body className="flex min-h-full bg-white antialiased">
        <div className="w-full">
            <Layout allSections={allSections}>{children}</Layout>
        </div>
        </body>
        </html>
    )
}
