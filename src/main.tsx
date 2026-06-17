import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

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

function showUpdatePrompt(onUpdate: () => void) {
  if (document.getElementById('app-update-prompt')) return;

  const prompt = document.createElement('div');
  prompt.id = 'app-update-prompt';
  prompt.setAttribute('role', 'status');
  prompt.style.cssText = [
    'position: fixed',
    'left: 50%',
    'bottom: calc(1rem + env(safe-area-inset-bottom))',
    'z-index: 9999',
    'display: flex',
    'align-items: center',
    'gap: 0.75rem',
    'max-width: calc(100vw - 2rem)',
    'padding: 0.75rem 0.875rem',
    'border: 1px solid rgba(255, 255, 255, 0.18)',
    'border-radius: 999px',
    'background: rgba(12, 12, 18, 0.96)',
    'box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.45)',
    'color: #ffffff',
    'font: 600 0.875rem system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    'transform: translateX(-50%)',
    'backdrop-filter: blur(18px)',
    '-webkit-backdrop-filter: blur(18px)',
  ].join(';');

  const message = document.createElement('span');
  message.textContent = 'A new version is ready';
  message.style.whiteSpace = 'nowrap';

  const updateButton = document.createElement('button');
  updateButton.type = 'button';
  updateButton.textContent = 'Update';
  updateButton.style.cssText = [
    'border: 0',
    'border-radius: 999px',
    'background: #ffffff',
    'color: #0c0c12',
    'cursor: pointer',
    'font: inherit',
    'font-weight: 800',
    'padding: 0.45rem 0.8rem',
  ].join(';');
  updateButton.addEventListener('click', onUpdate, { once: true });

  const dismissButton = document.createElement('button');
  dismissButton.type = 'button';
  dismissButton.textContent = 'Later';
  dismissButton.style.cssText = [
    'border: 0',
    'background: transparent',
    'color: rgba(255, 255, 255, 0.72)',
    'cursor: pointer',
    'font: inherit',
    'padding: 0.45rem 0.2rem',
  ].join(';');
  dismissButton.addEventListener('click', () => prompt.remove(), { once: true });

  prompt.append(message, updateButton, dismissButton);
  document.body.appendChild(prompt);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
