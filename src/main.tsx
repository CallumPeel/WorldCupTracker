import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import { APP_VERSION } from './generated/version';
import './index.css';

interface AppVersion {
  version: string;
  buildTime: string;
  buildId: string;
}

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    showUpdatePrompt(() => {
      updateSW(true);
    });
  },
  onOfflineReady() {
    console.info('World Cup Tracker is ready to work offline.');
  },
});

checkForRescueUpdate();
setInterval(checkForRescueUpdate, 15 * 60 * 1000);

async function checkForRescueUpdate() {
  try {
    const response = await fetch(`/version.json?t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) return;

    const deployedVersion = (await response.json()) as Partial<AppVersion>;

    if (
      typeof deployedVersion.buildId === 'string' &&
      deployedVersion.buildId !== APP_VERSION.buildId
    ) {
      showUpdatePrompt(() => {
        unregisterServiceWorkersAndReload();
      });
    }
  } catch (error) {
    console.info('Unable to check for app updates right now.', error);
  }
}

async function unregisterServiceWorkersAndReload() {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));
  }

  window.location.reload();
}

function showUpdatePrompt(onUpdate: () => void) {
  if (document.getElementById('app-update-prompt')) return;

  const overlay = document.createElement('div');
  overlay.id = 'app-update-prompt';
  overlay.setAttribute('role', 'presentation');
  overlay.style.cssText = [
    'position: fixed',
    'inset: 0',
    'z-index: 9999',
    'display: flex',
    'justify-content: center',
    'align-items: center',
    'padding: max(1.25rem, env(safe-area-inset-top)) max(1.25rem, env(safe-area-inset-right)) max(1.25rem, env(safe-area-inset-bottom)) max(1.25rem, env(safe-area-inset-left))',
    'background: radial-gradient(circle at 50% 20%, rgba(10, 132, 255, 0.18), transparent 28rem), rgba(0, 0, 0, 0.84)',
    'color: #ffffff',
    'font: 600 1rem system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    'backdrop-filter: blur(14px)',
    '-webkit-backdrop-filter: blur(14px)',
  ].join(';');

  const dialog = document.createElement('div');
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-labelledby', 'app-update-title');
  dialog.setAttribute('aria-describedby', 'app-update-description');
  dialog.style.cssText = [
    'width: min(100%, 34rem)',
    'border: 1px solid rgba(255, 255, 255, 0.22)',
    'border-radius: 1.5rem',
    'background: linear-gradient(145deg, rgba(24, 24, 34, 0.98), rgba(8, 8, 14, 0.98))',
    'box-shadow: 0 2rem 6rem rgba(0, 0, 0, 0.72), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
    'padding: clamp(1.5rem, 5vw, 2.25rem)',
    'text-align: center',
  ].join(';');

  const eyebrow = document.createElement('div');
  eyebrow.textContent = 'Update ready';
  eyebrow.style.cssText = [
    'display: inline-flex',
    'align-items: center',
    'gap: 0.5rem',
    'margin-bottom: 1rem',
    'border-radius: 999px',
    'background: rgba(10, 132, 255, 0.14)',
    'color: #8ecbff',
    'font-size: 0.75rem',
    'font-weight: 900',
    'letter-spacing: 0.14em',
    'padding: 0.45rem 0.8rem',
    'text-transform: uppercase',
  ].join(';');

  const title = document.createElement('h2');
  title.id = 'app-update-title';
  title.textContent = 'A new version is ready';
  title.style.cssText = [
    'margin: 0',
    'font-size: clamp(2rem, 7vw, 3.5rem)',
    'font-weight: 950',
    'letter-spacing: -0.05em',
    'line-height: 0.98',
  ].join(';');

  const message = document.createElement('p');
  message.id = 'app-update-description';
  message.textContent = 'Update now to get the latest fixtures, fixes, and app improvements.';
  message.style.cssText = [
    'margin: 1rem auto 0',
    'max-width: 26rem',
    'color: rgba(255, 255, 255, 0.72)',
    'font-size: 1rem',
    'line-height: 1.55',
  ].join(';');

  const actions = document.createElement('div');
  actions.style.cssText = [
    'display: flex',
    'flex-wrap: wrap',
    'justify-content: center',
    'gap: 0.75rem',
    'margin-top: 1.75rem',
  ].join(';');

  const updateButton = document.createElement('button');
  updateButton.type = 'button';
  updateButton.textContent = 'Update now';
  updateButton.style.cssText = [
    'border: 0',
    'border-radius: 999px',
    'background: #ffffff',
    'color: #0c0c12',
    'cursor: pointer',
    'font: inherit',
    'font-size: 1.05rem',
    'font-weight: 900',
    'min-width: 11rem',
    'padding: 0.9rem 1.35rem',
    'box-shadow: 0 0.9rem 2rem rgba(255, 255, 255, 0.14)',
  ].join(';');
  updateButton.addEventListener('click', onUpdate, { once: true });

  const dismissButton = document.createElement('button');
  dismissButton.type = 'button';
  dismissButton.textContent = 'Later';
  dismissButton.style.cssText = [
    'border: 0',
    'border-radius: 999px',
    'background: rgba(255, 255, 255, 0.08)',
    'color: rgba(255, 255, 255, 0.72)',
    'cursor: pointer',
    'font: inherit',
    'font-weight: 800',
    'min-width: 7rem',
    'padding: 0.9rem 1.1rem',
  ].join(';');
  const dismissPrompt = () => {
    overlay.remove();
    document.removeEventListener('keydown', handlePromptKeyDown);
  };
  const handlePromptKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') dismissPrompt();
  };
  dismissButton.addEventListener('click', dismissPrompt, { once: true });
  document.addEventListener('keydown', handlePromptKeyDown);

  actions.append(updateButton, dismissButton);
  dialog.append(eyebrow, title, message, actions);
  overlay.append(dialog);
  document.body.appendChild(overlay);
  updateButton.focus();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
