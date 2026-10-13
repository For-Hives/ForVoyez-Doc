# ForVoyez Documentation

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-38B2AC.svg)](https://tailwindcss.com/)

ForVoyez Documentation is a comprehensive guide for using the ForVoyez API, an AI-powered image metadata generation service. This documentation project provides detailed information on API usage, account management, billing, and best practices for integrating ForVoyez into your applications.

## Features

- 📚 In-depth API documentation
- 🚀 Quick start guide for new users
- 💻 Code examples in multiple programming languages
- 🔐 Authentication and security best practices
- 📊 Usage tracking and quota management information
- 💳 Billing and subscription management details
- 🧪 Guide to the API playground of the dashboard
- 🎨 Responsive and user-friendly design

## Getting Started

To run the ForVoyez documentation project locally, follow these steps:

1. Clone the repository:

   ```
   git clone https://github.com/For-Hives/ForVoyez-Doc.git
   ```

2. Navigate to the project directory:

   ```
   cd ForVoyez-Doc
   ```

3. Install dependencies (pnpm, version pinned by `packageManager` in `package.json`):
   ```
   corepack enable
   pnpm install
   ```
4. Start the development server:

   ```
   pnpm dev
   ```

5. Open your browser and visit `http://localhost:3000` to view the documentation.

Other scripts: `pnpm lint` (ESLint), `pnpm format:check` (Prettier), `pnpm test` (content checks of the pages in `tests/`: code examples, links to the app, prices, error bodies; it syntax-checks the examples with bash, Node, Python 3 and PHP when they are installed), `pnpm build` and `pnpm start`.

## Prerequisites

Ensure you have the following installed:

- Node.js 22.22.1 or higher, for example the latest 22.x or 24.x (the lint-staged pre-commit hook needs 22.22.1+). Production (Coolify/Nixpacks) builds with the Node major version in `.nvmrc`.
- pnpm 10 (through Corepack, see `packageManager` in `package.json`)

## Contributing

We welcome contributions to improve the ForVoyez documentation. If you'd like to contribute:

1. Fork the repository
2. Create a new branch for your feature or bug fix
3. Make your changes and commit them with descriptive commit messages
4. Push your changes to your fork
5. Submit a pull request to the main repository

Please ensure your code adheres to our coding standards and includes appropriate tests.

## Support

If you encounter any issues or have questions about the ForVoyez documentation, please:

- Open an issue on [For-Hives/ForVoyez](https://github.com/For-Hives/ForVoyez/issues), the tracker of the app, this documentation and the WordPress plugin
- Contact our support team at support@forvoyez.com for API-specific inquiries

## When change the pricing - quota

- Change the numbers in `src/app/limits-and-quotas/page.mdx`
- Change the pricing in `src/app/pricing/page.mdx`, including the yearly price and saving on the Starter and Growth cards (`pnpm test` checks the saving against the prices)
- Change the pricing in lemonsqueezy
- Call `/api/sync` on the app with the `x-sync-secret` header set to the app's `SYNC_SECRET` environment variable (requests without the right header are refused, and the route answers `404` when `SYNC_SECRET` is not set on the app; the old `?true=true` query is no longer needed):

  ```
  curl -H "x-sync-secret: $SYNC_SECRET" https://forvoyez.com/api/sync
  ```

- Change the pricing/number in the database (for the descriptions)

## Analytics events

The site sends click events to the Umami website it shares with the app, so every event name starts with `doc-`. The names are listed in `EVENTS` in `src/lib/analytics.js` and checked by `pnpm test` (`tests/doc-analytics.test.mjs`).

- Links need no markup: one click listener (`src/components/Analytics.jsx`) classifies each link by host (`doc-nav-click`, `doc-outbound-app`, `doc-outbound-wporg`, `doc-outbound-social`, `doc-outbound-other`) and sends the `zone` (the closest `data-zone`: header, sidebar, main, footer), the `target` path and the current `page`.
- To give a button or a link its own event, add `data-fv-event="doc-..."` and optional `data-fv-event-<key>="<value>"` properties, then add the name to `EVENTS`. Never use Umami's own `data-umami-event` attribute: on a link, the Umami script cancels the click and breaks client-side navigation.
- For an outcome only known in JavaScript, call `track(name, data)` from `src/lib/analytics.js`.
- Links to forvoyez.com get their UTM parameters at render time (`src/components/DocLink.jsx`): keep the bare URLs in the MDX pages.
- Never send personal data or what a visitor typed: the search only reports the length of the query.
- The tracker only runs on forvoyez.com, doc.forvoyez.com and docs.forvoyez.com: nothing is sent from localhost.

---

📚 Comprehensive documentation for ForVoyez - Empowering your AI-powered image metadata generation! 📚
