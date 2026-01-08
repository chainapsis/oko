import type { SignInType } from "@oko-wallet-sdk-core/types/oauth";
import { MODAL_STYLES } from "./styles";
import { ICONS, S3_LOGO_URL, S3_LOGO_WITH_NAME_URL } from "./icons";

export type SignInModalTheme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

export interface SignInModalOptions {
  onSelect: (provider: SignInType) => Promise<void>;
  onClose?: () => void;
  theme?: SignInModalTheme;
}

export interface SignInModal {
  container: HTMLElement;
}

function getSystemTheme(): ResolvedTheme {
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }
  return "light";
}

function getHostTheme(): ResolvedTheme | null {
  if (typeof document === "undefined") return null;

  const root = document.documentElement;
  const body = document.body;

  const dataTheme = root.dataset.theme || body?.dataset.theme;
  if (dataTheme === "dark" || dataTheme === "light") return dataTheme;

  if (root.classList.contains("dark") || body?.classList.contains("dark")) return "dark";
  if (root.classList.contains("light") || body?.classList.contains("light")) return "light";

  const colorScheme = getComputedStyle(root).colorScheme;
  if (colorScheme === "dark" || colorScheme === "light") return colorScheme;

  return null;
}

function resolveTheme(theme: SignInModalTheme): ResolvedTheme {
  if (theme === "light" || theme === "dark") return theme;
  return getHostTheme() ?? getSystemTheme();
}

function defaultViewTemplate(theme: ResolvedTheme): string {
  return `
    <div class="oko-default-view">
      <div class="oko-logo-wrapper">
        <img src="${S3_LOGO_URL[theme]}" alt="Oko" width="84" height="32" />
      </div>
      <div class="oko-provider-list">
        <button class="oko-provider-btn" data-provider="email">
          <span class="oko-provider-icon">${ICONS.email}</span>
          <span class="oko-provider-label">Email</span>
        </button>
        <button class="oko-provider-btn" data-provider="google">
          <span class="oko-provider-icon">${ICONS.google}</span>
          <span class="oko-provider-label">Google</span>
        </button>
        <button class="oko-provider-btn" data-action="socials">
          <span class="oko-social-icons-wrapper">
            <span class="oko-social-icon">${ICONS.xSmall}</span>
            <span class="oko-social-icon">${ICONS.telegramSmall}</span>
            <span class="oko-social-icon">${ICONS.appleSmall}</span>
          </span>
          <span class="oko-provider-label">Other Socials</span>
          <span class="oko-chevron-icon">${ICONS.chevronRight}</span>
        </button>
      </div>
      <div class="oko-modal-footer">
        <img class="oko-footer-logo" src="${S3_LOGO_WITH_NAME_URL[theme]}" alt="Oko" width="52" height="20" />
        <a class="oko-footer-link" href="https://oko-wallet.canny.io/bug-reports" target="_blank" rel="noopener noreferrer">
          Get support
          <span class="oko-external-icon">${ICONS.externalLink}</span>
        </a>
      </div>
    </div>
  `;
}

function socialsViewTemplate(): string {
  return `
    <div class="oko-socials-view">
      <div class="oko-back-row">
        <button class="oko-back-btn" data-action="back">${ICONS.chevronLeft}</button>
        <span class="oko-back-title">Login or sign up</span>
      </div>
      <div class="oko-provider-list oko-socials-list">
        <button class="oko-provider-btn" data-provider="x">
          <span class="oko-provider-icon">${ICONS.x}</span>
          <span class="oko-provider-label">X</span>
        </button>
        <button class="oko-provider-btn" data-provider="telegram">
          <span class="oko-provider-icon">${ICONS.telegram}</span>
          <span class="oko-provider-label">Telegram</span>
        </button>
        <button class="oko-provider-btn" data-provider="discord">
          <span class="oko-provider-icon">${ICONS.discord}</span>
          <span class="oko-provider-label">Discord</span>
        </button>
        <button class="oko-provider-btn" disabled>
          <span class="oko-provider-icon">${ICONS.apple}</span>
          <span class="oko-provider-label">Apple</span>
        </button>
      </div>
    </div>
  `;
}

function progressViewTemplate(status: "loading" | "failed", method: SignInType): string {
  const isLoading = status === "loading";
  return `
    <div class="oko-progress-view">
      <div class="oko-progress-circle">
        <span class="oko-provider-icon">${ICONS[method]}</span>
        <span class="oko-spinner-overlay${isLoading ? " oko-spinning" : ""}">
          ${isLoading ? ICONS.spinnerLoading : ICONS.spinnerFailed}
        </span>
      </div>
      <div class="oko-progress-text">${isLoading ? "Signing in" : "Login failed"}</div>
      ${status === "failed" ? `<button class="oko-retry-btn" data-action="retry">Retry</button>` : ""}
    </div>
  `;
}

function modalTemplate(theme: ResolvedTheme): string {
  return `
    <style>${MODAL_STYLES}</style>
    <div class="oko-modal-overlay">
      <div class="oko-modal-container">
        <button class="oko-modal-close" aria-label="Close modal">${ICONS.close}</button>
        <div class="oko-content-wrapper">
          ${defaultViewTemplate(theme)}
        </div>
      </div>
    </div>
  `;
}

export function renderSignInModal(options: SignInModalOptions): SignInModal {
  const { onSelect, onClose, theme = "system" } = options;
  const resolvedTheme = resolveTheme(theme);

  const container = document.createElement("div");
  container.id = "oko-signin-modal";
  container.dataset.theme = resolvedTheme;

  const shadow = container.attachShadow({ mode: "closed" });
  shadow.innerHTML = modalTemplate(resolvedTheme);

  const overlay = shadow.querySelector(".oko-modal-overlay") as HTMLElement;
  const modalContainer = shadow.querySelector(".oko-modal-container") as HTMLElement;
  const contentWrapper = shadow.querySelector(".oko-content-wrapper") as HTMLElement;
  const closeBtn = shadow.querySelector(".oko-modal-close") as HTMLElement;

  const originalOverflow = document.body.style.overflow;

  function cleanup() {
    document.removeEventListener("keydown", handleKeyDown);
    document.body.style.overflow = originalOverflow;
    container.remove();
  }

  function close() {
    cleanup();
    onClose?.();
  }

  function switchView(view: "default" | "socials") {
    modalContainer.className = view === "socials"
      ? "oko-modal-container oko-socials-container"
      : "oko-modal-container";
    contentWrapper.innerHTML = view === "socials"
      ? socialsViewTemplate()
      : defaultViewTemplate(resolvedTheme);
  }

  function showProgress(status: "loading" | "failed", method: SignInType) {
    modalContainer.className = "oko-modal-container";
    contentWrapper.innerHTML = progressViewTemplate(status, method);
  }

  async function handleProviderSelect(provider: SignInType) {
    showProgress("loading", provider);
    try {
      await onSelect(provider);
      cleanup();
    } catch {
      showProgress("failed", provider);
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      close();
    }
  }

  closeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    close();
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      close();
    }
  });

  contentWrapper.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest("button") as HTMLButtonElement | null;
    if (!btn || btn.disabled) return;

    const { provider, action } = btn.dataset;
    if (provider) {
      handleProviderSelect(provider as SignInType);
    } else if (action === "socials") {
      switchView("socials");
    } else if (action === "back" || action === "retry") {
      switchView("default");
    }
  });

  document.addEventListener("keydown", handleKeyDown);
  document.body.style.overflow = "hidden";

  return { container };
}
