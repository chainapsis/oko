export const MODAL_STYLES = `
  :host {
    /* Font */
    --oko-font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

    /* Colors - Light theme (from oko_common_ui color_tokens) */
    --oko-white: #ffffff;
    --oko-gray-50: #fafafa;
    --oko-gray-100: #f5f5f5;
    --oko-gray-300: #d5d7da;
    --oko-gray-400: #a4a7ae;
    --oko-gray-500: #717680;
    --oko-gray-600: #535862;
    --oko-gray-700: #414651;
    --oko-gray-900: #181d27;
    --oko-gray-950: #0a0d12;

    /* Semantic tokens */
    --oko-bg-primary: var(--oko-white);
    --oko-bg-primary-hover: var(--oko-gray-50);
    --oko-bg-overlay: var(--oko-gray-950);
    --oko-text-primary: var(--oko-gray-900);
    --oko-text-secondary: var(--oko-gray-700);
    --oko-fg-tertiary: var(--oko-gray-600);
    --oko-fg-quaternary: var(--oko-gray-400);
    --oko-fg-disabled-subtle: var(--oko-gray-300);
    --oko-border-primary: var(--oko-gray-300);

    /* Shadows */
    --oko-shadow-xs: 0 1px 2px 0 rgba(16, 24, 40, 0.05);
    --oko-shadow-lg: 0 12px 16px -4px rgba(16, 24, 40, 0.08), 0 4px 6px -2px rgba(16, 24, 40, 0.03);

    /* Spacing */
    --oko-spacing-xs: 4px;
    --oko-radius-md: 8px;
    --oko-radius-lg: 16px;
  }

  /* Dark theme */
  :host([data-theme="dark"]) {
    /* Colors - Dark theme (from oko_common_ui color_tokens) */
    --oko-gray-50: #f7f7f7;
    --oko-gray-300: #cecfd2;
    --oko-gray-400: #94979c;
    --oko-gray-500: #85888e;
    --oko-gray-600: #61656c;
    --oko-gray-700: #373a41;
    --oko-gray-800: #22262f;
    --oko-gray-900: #13161b;
    --oko-gray-950: #0c0e12;

    /* Semantic tokens - Dark */
    --oko-bg-primary: var(--oko-gray-950);
    --oko-bg-primary-hover: var(--oko-gray-800);
    --oko-text-primary: var(--oko-gray-50);
    --oko-text-secondary: var(--oko-gray-300);
    --oko-fg-tertiary: var(--oko-gray-400);
    --oko-fg-quaternary: var(--oko-gray-600);
    --oko-fg-disabled-subtle: var(--oko-gray-600);
    --oko-border-primary: var(--oko-gray-700);

    /* Shadows - Dark */
    --oko-shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.2);
    --oko-shadow-lg: 0 12px 16px -4px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2);
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  .oko-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2147483647;
    isolation: isolate;
    font-family: var(--oko-font-family);
  }

  .oko-modal-container {
    position: relative;
    background: var(--oko-bg-primary);
    border-radius: var(--oko-radius-lg);
    box-shadow: var(--oko-shadow-lg);
    width: 100%;
    max-width: 400px;
    margin: 16px;
    overflow: hidden;
    animation: oko-modal-fade-in 0.2s ease-out;
  }

  @keyframes oko-modal-fade-in {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .oko-modal-close {
    position: absolute;
    right: 16px;
    top: 16px;
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--oko-radius-md);
    color: var(--oko-fg-tertiary);
    transition: background-color 0.2s ease;
    z-index: 1;
  }

  .oko-modal-close:hover {
    background: var(--oko-bg-primary-hover);
  }

  .oko-modal-close svg {
    width: 20px;
    height: 20px;
  }

  /* Error Message */
  .oko-error-message {
    margin-top: 16px;
    padding: 12px;
    width: 100%;
    background: #fef3f2;
    border: 1px solid #fda29b;
    border-radius: var(--oko-radius-md);
    color: #b42318;
    font-size: 14px;
    line-height: 20px;
    text-align: center;
  }

  /* Default View */
  .oko-default-view {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 48px 20px 20px 20px;
  }

  .oko-logo-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 20px;
    margin-bottom: 36px;
  }

  .oko-logo-wrapper img {
    display: block;
  }

  /* Socials View */
  .oko-socials-view {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24px;
  }

  .oko-back-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    align-self: stretch;
    margin-bottom: 26px;
  }

  .oko-back-btn {
    width: 24px;
    height: 24px;
    border: none;
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--oko-text-primary);
    padding: 0;
  }

  .oko-back-btn svg {
    width: 24px;
    height: 24px;
  }

  .oko-back-title {
    flex: 1;
    text-align: center;
    font-size: 14px;
    font-weight: 500;
    color: var(--oko-text-primary);
    padding-right: 24px; /* Balance the back button */
  }

  /* Provider List */
  .oko-provider-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
  }

  .oko-socials-list {
    gap: 12px;
  }

  /* Provider Button */
  .oko-provider-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: var(--oko-spacing-xs);
    width: 100%;
    height: 40px;
    padding: 10px 14px;
    border: 1px solid var(--oko-border-primary);
    border-radius: var(--oko-radius-md);
    background: var(--oko-bg-primary);
    cursor: pointer;
    font-family: var(--oko-font-family);
    font-size: 14px;
    font-weight: 600;
    line-height: 20px;
    color: var(--oko-text-primary);
    box-shadow: var(--oko-shadow-xs);
    transition: background 0.2s ease;
    outline: none;
  }

  .oko-provider-btn:hover:not(:disabled) {
    background: var(--oko-bg-primary-hover);
  }

  .oko-provider-btn:focus {
    box-shadow: 0 0 0 4px rgba(152, 162, 179, 0.14), 0 1px 2px 0 rgba(16, 24, 40, 0.05);
  }

  .oko-provider-btn:disabled {
    color: var(--oko-fg-quaternary);
    border-color: var(--oko-fg-disabled-subtle);
    cursor: not-allowed;
  }

  .oko-provider-icon {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .oko-provider-icon svg {
    width: 100%;
    height: 100%;
  }

  .oko-provider-label {
    padding: 0 2px;
  }

  /* Social Icons Wrapper (for Other Socials button) */
  .oko-social-icons-wrapper {
    display: flex;
    align-items: center;
    position: relative;
  }

  .oko-social-icon {
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .oko-social-icon + .oko-social-icon {
    margin-left: -2px;
  }

  .oko-social-icon svg {
    width: 100%;
    height: 100%;
  }

  .oko-chevron-icon {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--oko-fg-quaternary);
  }

  .oko-chevron-icon svg {
    width: 100%;
    height: 100%;
  }

  /* Footer */
  .oko-modal-footer {
    margin-top: 28px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  .oko-footer-logo {
    display: block;
    width: 52px;
    height: 20px;
  }

  .oko-footer-link {
    font-size: 12px;
    font-weight: 500;
    color: var(--oko-text-secondary);
    text-decoration: underline;
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
  }

  .oko-footer-link:hover {
    color: var(--oko-text-primary);
  }

  .oko-external-icon {
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--oko-gray-500);
  }

  .oko-external-icon svg {
    width: 100%;
    height: 100%;
  }
`;
