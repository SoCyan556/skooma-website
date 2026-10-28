# Skooma website

Vue 3 + Vite single-page site: Home, Download, News, Guide, Sign in, and a 404 page (Store and account pages use it for now).

```bash
npm install
npm run dev      # http://127.0.0.1:5180
npm run build    # static files in dist/
```

## Where the content comes from

- **News, version number and Download** read the public GitHub releases of `SoCyan556/tamriel-rp-downloads` (`src/lib/releases.js`). Publishing a launcher release updates the site automatically; the Download page starts the newest `Skooma-Setup-*.exe`.
- **Guide** is `src/content/guide.js`. Add sections (Jobs, economy, factions…) in the same shape; the Jobs section is an empty placeholder.
- **Discord invite** goes in `src/config.js` (`discordInvite`). Until it's set, the Discord button does nothing.

## Discord sign-in

Uses the launcher's Discord application (`1564275479257555004`) with the `identify` scope, so the same Discord account is recognised on the site. Before it works, add each site address's callback to that app's **OAuth2 → Redirects** in the Discord Developer Portal:

- `http://127.0.0.1:5180/auth/callback` (local development)
- `https://<your domain>/auth/callback` (production)

The site is static, so it uses Discord's implicit grant: the short-lived token is used once to read the profile and is not stored. Signing in shows the user's name and avatar; there is no server-side session yet.

## Hosting

Any static host works. Configure it to serve `index.html` for unknown paths (SPA fallback), so links like `/guide/setup` load directly.
