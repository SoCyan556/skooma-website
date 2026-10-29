// Guide content. Each section is a category in the sidebar; each article is one page.
// Block types: p (paragraph), steps (numbered), list (bullets), keys ([key, description] rows), note (callout).
// Add server systems (jobs, economy, factions…) as new sections in the same shape.
import { BookOpen, Briefcase, Compass, LifeBuoy, MonitorCog } from 'lucide-vue-next';

export const guide = [
  {
    id: 'setup', title: 'Setup', icon: BookOpen,
    articles: [
      { id: 'requirements', title: 'Before you start', blocks: [
        { type: 'list', items: ['Skyrim Special Edition, owned on Steam.', 'Windows 10 or 11, 64-bit.', 'A Discord account that has joined the Skooma server.'] },
        { type: 'p', text: 'You don\'t need to install mods yourself. The launcher installs SKSE, the multiplayer client and every required mod.' },
      ] },
      { id: 'install-launcher', title: 'Install the launcher', blocks: [
        { type: 'steps', items: ['Open the Download page; the newest installer downloads automatically.', 'Run Skooma-Setup. If Windows SmartScreen appears, choose More info → Run anyway.', 'The launcher opens when the install finishes and keeps itself up to date.'] },
      ] },
      { id: 'sign-in', title: 'Sign in with Discord', blocks: [
        { type: 'steps', items: ['Press Sign in with Discord in the launcher.', 'Approve the request in your browser, then return to the launcher.', 'The launcher checks that you\'re a member of the Skooma server.'] },
        { type: 'note', text: 'If the server asks new members to accept its rules, accept them in Discord first, then press Recheck membership.' },
      ] },
      { id: 'game-folder', title: 'Choose your game folder', blocks: [
        { type: 'p', text: 'The launcher looks for Skyrim Special Edition in your Steam libraries. If it can\'t find it, press Choose Skyrim folder and select the folder that contains SkyrimSE.exe.' },
      ] },
      { id: 'game-version', title: 'Install the required game version', blocks: [
        { type: 'p', text: 'The server runs on Skyrim 1.6.1170. If your game is a different version, the Play button changes to Install game version.' },
        { type: 'steps', items: ['Press Install game version.', 'A Steam download window opens. Scan its QR code with the Steam mobile app - your Steam login stays in that window.', 'When it finishes, the launcher continues on its own.'] },
      ] },
      { id: 'install-mods', title: 'Install the mods', blocks: [
        { type: 'p', text: 'Press Install & update. The launcher downloads SKSE, the multiplayer client and the required mods, checks every file, and enables the mods\' plugins.' },
        { type: 'list', items: ['The Mods page shows each mod as Installed or Install.', 'Your own files and plugins are left alone.', 'If an install is interrupted, the launcher puts everything back the next time it opens.'] },
      ] },
    ],
  },
  {
    id: 'getting-started', title: 'Getting started', icon: Compass,
    articles: [
      { id: 'your-character', title: 'Your character', blocks: [
        { type: 'p', text: 'Signing in gives you a permanent account number. That number is your character, so it follows you on any PC where you sign in with the same Discord account.' },
        { type: 'p', text: 'You can see it in the launcher under Settings → Account.' },
      ] },
      { id: 'joining', title: 'Joining the server', blocks: [
        { type: 'steps', items: ['Open the launcher and press Play.', 'The launcher signs you in to the server and starts Skyrim through SKSE.', 'Keep the launcher running while you play.'] },
      ] },
      { id: 'voice-chat', title: 'Voice chat', blocks: [
        { type: 'p', text: 'Voice is proximity-based: players near you hear you, and your voice fades with distance.' },
        { type: 'keys', items: [['V', 'Push to talk'], ['B', 'Switch range: Whisper, Normal, Yell']] },
        { type: 'list', items: ['Choose your microphone in the launcher under Settings → Voice chat.', 'Closing the launcher window hides it to the tray so voice keeps working.'] },
      ] },
    ],
  },
  {
    id: 'launcher', title: 'Launcher', icon: MonitorCog,
    articles: [
      { id: 'updates', title: 'Updates', blocks: [
        { type: 'p', text: 'Updates are required so everyone plays with the same files. When one is available the launcher shows Update launcher; press it and the launcher restarts on the new version.' },
      ] },
      { id: 'tray', title: 'Tray and quitting', blocks: [
        { type: 'list', items: ['The close button hides the launcher to the system tray.', 'Click the tray icon to bring it back.', 'Quit from the tray menu closes the launcher and Skyrim. You\'ll be asked to confirm.'] },
      ] },
      { id: 'problem-scanner', title: 'Problem scanner', blocks: [
        { type: 'p', text: 'Settings → Diagnostics → Scan for problems checks your Discord membership, character, update feed, game version, required files and server connection. It doesn\'t change any files.' },
      ] },
    ],
  },
  {
    id: 'jobs', title: 'Jobs', icon: Briefcase,
    articles: [
      { id: 'overview', title: 'Jobs', draft: true, blocks: [] },
    ],
  },
  {
    id: 'troubleshooting', title: 'Troubleshooting', icon: LifeBuoy,
    articles: [
      { id: 'recheck-membership', title: 'Stuck on Recheck membership', blocks: [
        { type: 'list', items: ['Make sure you\'ve joined the Skooma Discord server with the account you signed in with.', 'Accept the server rules in Discord if it asks you to.', 'If the launcher says Discord is limiting checks, wait the time shown and press Recheck membership once.'] },
      ] },
      { id: 'install-loop', title: 'Install & update keeps coming back', blocks: [
        { type: 'p', text: 'The line under the title on the Home screen says why the install didn\'t finish.' },
        { type: 'list', items: ['Close Skyrim before installing.', 'If your antivirus removed a file, allow the Skyrim folder and run Install & update again.', 'Run the problem scanner to see which files are missing or changed.'] },
      ] },
      { id: 'character-id', title: 'Character ID warning', blocks: [
        { type: 'p', text: 'The launcher couldn\'t reach the account server. It retries every minute; running the problem scanner retries straight away. If it persists, the server may be down.' },
      ] },
    ],
  },
];
