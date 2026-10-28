import { reactive } from 'vue';
import { config } from '../config.js';

// Discord sign-in for a static site: the OAuth2 implicit grant returns a short-lived token in the URL fragment,
// which is used once to read the Discord profile. Only the identify scope is requested.
const KEY = 'skooma-session', STATE = 'skooma-oauth-state';
export const auth = reactive({ user: null, error: '' });

try { const saved = JSON.parse(sessionStorage.getItem(KEY) || 'null'); if (saved && saved.expires > Date.now()) auth.user = saved.user; } catch { /* storage unavailable */ }

const redirectUri = () => location.origin + '/auth/callback';

export function signIn(returnTo = '/') {
  const state = crypto.randomUUID();
  try { sessionStorage.setItem(STATE, JSON.stringify({ state, returnTo })); } catch { /* storage unavailable */ }
  const params = new URLSearchParams({ client_id: config.discordClientId, response_type: 'token', redirect_uri: redirectUri(), scope: 'identify', state, prompt: 'none' });
  location.assign('https://discord.com/oauth2/authorize?' + params);
}

export async function finishSignIn() {
  const values = new URLSearchParams(location.hash.slice(1));
  history.replaceState(null, '', location.pathname);
  let pending = null;
  try { pending = JSON.parse(sessionStorage.getItem(STATE) || 'null'); sessionStorage.removeItem(STATE); } catch { /* storage unavailable */ }
  if (values.get('error')) throw new Error(values.get('error') === 'access_denied' ? 'Sign-in was cancelled.' : 'Discord could not sign you in.');
  if (!pending || values.get('state') !== pending.state) throw new Error('This sign-in link is invalid or expired. Please try again.');
  const token = values.get('access_token');
  if (!token) throw new Error('Discord did not return a sign-in token.');
  const response = await fetch('https://discord.com/api/v10/users/@me', { headers: { Authorization: 'Bearer ' + token } });
  if (!response.ok) throw new Error('Discord could not confirm your account.');
  const me = await response.json();
  auth.user = {
    id: me.id,
    name: me.global_name || me.username,
    avatar: me.avatar ? `https://cdn.discordapp.com/avatars/${me.id}/${me.avatar}.png?size=96` : `https://cdn.discordapp.com/embed/avatars/${Number(BigInt(me.id) >> 22n) % 6}.png`,
  };
  try { sessionStorage.setItem(KEY, JSON.stringify({ user: auth.user, expires: Date.now() + Number(values.get('expires_in') || 3600) * 1000 })); } catch { /* storage unavailable */ }
  return pending.returnTo || '/';
}

export function signOut() {
  auth.user = null;
  try { sessionStorage.removeItem(KEY); } catch { /* storage unavailable */ }
}
