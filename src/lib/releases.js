import { config } from '../config.js';

// Published launcher releases from GitHub, cached for the session.
let cache;
export function loadReleases() {
  cache ??= fetch(`https://api.github.com/repos/${config.releasesRepo}/releases?per_page=30`, { headers: { Accept: 'application/vnd.github+json' } })
    .then(r => { if (!r.ok) throw new Error('GitHub returned ' + r.status); return r.json(); })
    .then(list => list.filter(r => !r.draft && !r.prerelease && /^v\d+\.\d+\.\d+/.test(r.tag_name)).map(parse)
      // A version can be published more than once; only its newest release counts.
      .sort((a, b) => new Date(b.date) - new Date(a.date)).filter((r, i, all) => all.findIndex(o => o.version === r.version) === i))
    .catch(error => { cache = undefined; throw error; });
  return cache;
}

function parse(release) {
  const version = release.tag_name.slice(1).split('-')[0];
  const lines = (release.body || '').split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  // Release bodies start with "Skooma X" / "Tamriel RP X" and end with the requirements footer.
  const body = lines.filter(l => !/^(Skooma|Tamriel RP) \d/.test(l) && !/^Requires Skyrim/.test(l));
  const clean = l => l.replace(/^[-*]\s+/, '').replace(/[*_`]/g, '');
  const installer = release.assets.find(a => /setup.*\.exe$/i.test(a.name));
  return {
    version,
    tag: release.tag_name,
    url: release.html_url,
    date: release.published_at,
    intro: clean(body.find(l => !/^[-*]\s/.test(l)) || 'Launcher update.'),
    changes: body.filter(l => /^[-*]\s/.test(l)).map(clean),
    installer: installer && { name: installer.name, url: installer.browser_download_url, size: installer.size },
  };
}

export const formatDate = value => new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
export const formatSize = bytes => (bytes / 1048576).toFixed(0) + ' MB';
