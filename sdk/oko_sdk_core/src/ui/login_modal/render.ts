import type { SignInType } from "@oko-wallet-sdk-core/types/oauth";
import { MODAL_STYLES } from "./styles";
import { ICONS, S3_LOGO_URL, S3_LOGO_WITH_NAME_URL } from "./icons";

const cleanupMap = new WeakMap<HTMLElement, () => void>();

export type LoginModalTheme = "light" | "dark" | "system";

export interface LoginModalOptions {
  onSelect: (provider: SignInType) => void;
  onClose: () => void;
  theme?: LoginModalTheme;
}

function getSystemTheme(): "light" | "dark" {
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }
  return "light";
}

function getHostTheme(): "light" | "dark" | null {
  if (typeof document === "undefined") {
    return null;
  }

  const root = document.documentElement;
  const body = document.body;

  // Check data-theme attribute (common pattern)
  const dataTheme = root.dataset.theme || body?.dataset.theme;
  if (dataTheme === "dark" || dataTheme === "light") {
    return dataTheme;
  }

  // Check class-based theme (Tailwind, etc.)
  if (root.classList.contains("dark") || body?.classList.contains("dark")) {
    return "dark";
  }
  if (root.classList.contains("light") || body?.classList.contains("light")) {
    return "light";
  }

  // Check color-scheme style
  const colorScheme = getComputedStyle(root).colorScheme;
  if (colorScheme === "dark") {
    return "dark";
  }
  if (colorScheme === "light") {
    return "light";
  }

  return null;
}

function resolveTheme(theme: LoginModalTheme): "light" | "dark" {
  if (theme === "light" || theme === "dark") {
    return theme;
  }
  // "system" mode: try host theme first, fallback to system
  return getHostTheme() ?? getSystemTheme();
}

export interface LoginModalController {
  container: HTMLElement;
  showLoading: (method: SignInType) => void;
  showFailed: (method: SignInType) => void;
}

export function renderLoginModal(
  options: LoginModalOptions,
): LoginModalController {
  const { onSelect, onClose, theme = "system" } = options;
  const resolvedTheme = resolveTheme(theme);

  // Create container element
  const container = document.createElement("div");
  container.id = "oko-login-modal";
  container.dataset.theme = resolvedTheme;

  // Attach shadow DOM for style isolation
  const shadow = container.attachShadow({ mode: "closed" });

  // Inject styles
  const styleEl = document.createElement("style");
  styleEl.textContent = MODAL_STYLES;
  shadow.appendChild(styleEl);

  // Create modal structure
  const overlay = document.createElement("div");
  overlay.className = "oko-modal-overlay";

  const modalContainer = document.createElement("div");
  modalContainer.className = "oko-modal-container";

  const closeBtn = document.createElement("button");
  closeBtn.className = "oko-modal-close";
  closeBtn.innerHTML = ICONS.close;
  closeBtn.setAttribute("aria-label", "Close modal");

  const contentWrapper = document.createElement("div");
  contentWrapper.className = "oko-content-wrapper";

  function createProviderButton(
    provider: SignInType,
    label: string,
  ): HTMLButtonElement {
    const btn = document.createElement("button");
    btn.className = "oko-provider-btn";
    btn.dataset.provider = provider;
    btn.innerHTML = `
      <span class="oko-provider-icon">${ICONS[provider]}</span>
      <span class="oko-provider-label">${label}</span>
    `;

    return btn;
  }

  function renderDefaultView(): HTMLElement {
    const view = document.createElement("div");
    view.className = "oko-default-view";

    // Logo
    const logoWrapper = document.createElement("div");
    logoWrapper.className = "oko-logo-wrapper";
    const logo = document.createElement("img");
    logo.src = S3_LOGO_URL[resolvedTheme];
    logo.alt = "Oko";
    logo.width = 84;
    logo.height = 32;
    logoWrapper.appendChild(logo);

    // Provider buttons
    const providerList = document.createElement("div");
    providerList.className = "oko-provider-list";

    providerList.appendChild(createProviderButton("email", "Email"));
    providerList.appendChild(createProviderButton("google", "Google"));

    // Other Socials button
    const socialsBtn = document.createElement("button");
    socialsBtn.className = "oko-provider-btn";
    socialsBtn.innerHTML = `
      <span class="oko-social-icons-wrapper">
        <span class="oko-social-icon">${ICONS.xSmall}</span>
        <span class="oko-social-icon">${ICONS.telegramSmall}</span>
        <span class="oko-social-icon">${ICONS.appleSmall}</span>
      </span>
      <span class="oko-provider-label">Other Socials</span>
      <span class="oko-chevron-icon">${ICONS.chevronRight}</span>
    `;
    socialsBtn.addEventListener("click", () => switchView("socials"));
    providerList.appendChild(socialsBtn);

    // Footer
    const footer = document.createElement("div");
    footer.className = "oko-modal-footer";
    footer.innerHTML = `
      <img class="oko-footer-logo" src="${S3_LOGO_WITH_NAME_URL[resolvedTheme]}" alt="Oko" width="52" height="20" />
      <a class="oko-footer-link" href="https://oko-wallet.canny.io/bug-reports" target="_blank" rel="noopener noreferrer">
        Get support
        <span class="oko-external-icon">${ICONS.externalLink}</span>
      </a>
    `;

    view.appendChild(logoWrapper);
    view.appendChild(providerList);
    view.appendChild(footer);

    return view;
  }

  function renderSocialsView(): HTMLElement {
    const view = document.createElement("div");
    view.className = "oko-socials-view";

    // Back header
    const backRow = document.createElement("div");
    backRow.className = "oko-back-row";

    const backBtn = document.createElement("button");
    backBtn.className = "oko-back-btn";
    backBtn.innerHTML = ICONS.chevronLeft;
    backBtn.addEventListener("click", () => switchView("default"));

    const backTitle = document.createElement("span");
    backTitle.className = "oko-back-title";
    backTitle.textContent = "Login or sign up";

    backRow.appendChild(backBtn);
    backRow.appendChild(backTitle);

    const providerList = document.createElement("div");
    providerList.className = "oko-provider-list oko-socials-list";

    providerList.appendChild(createProviderButton("x", "X"));
    providerList.appendChild(createProviderButton("telegram", "Telegram"));
    providerList.appendChild(createProviderButton("discord", "Discord"));

    const appleBtn = document.createElement("button");
    appleBtn.className = "oko-provider-btn";
    appleBtn.disabled = true;
    appleBtn.innerHTML = `
      <span class="oko-provider-icon">${ICONS.apple}</span>
      <span class="oko-provider-label">Apple</span>
    `;
    providerList.appendChild(appleBtn);

    view.appendChild(backRow);
    view.appendChild(providerList);

    return view;
  }

  function renderProgressView(
    status: "loading" | "failed",
    method: SignInType,
  ): HTMLElement {
    const view = document.createElement("div");
    view.className = "oko-progress-view";

    const circle = document.createElement("div");
    circle.className = "oko-progress-circle";

    const icon = document.createElement("span");
    icon.className = "oko-provider-icon";
    icon.innerHTML = ICONS[method];

    const spinner = document.createElement("span");
    spinner.className =
      status === "loading"
        ? "oko-spinner-overlay oko-spinning"
        : "oko-spinner-overlay";
    spinner.innerHTML =
      status === "loading" ? ICONS.spinnerLoading : ICONS.spinnerFailed;

    circle.appendChild(icon);
    circle.appendChild(spinner);

    const text = document.createElement("div");
    text.className = "oko-progress-text";
    text.textContent = status === "loading" ? "Signing in" : "Login failed";

    view.appendChild(circle);
    view.appendChild(text);

    if (status === "failed") {
      const retryBtn = document.createElement("button");
      retryBtn.className = "oko-retry-btn";
      retryBtn.textContent = "Retry";
      retryBtn.addEventListener("click", () => switchView("default"));
      view.appendChild(retryBtn);
    }

    return view;
  }

  function clearContent() {
    contentWrapper.innerHTML = "";
    modalContainer.className = "oko-modal-container";
  }

  function switchView(view: "default" | "socials") {
    clearContent();
    if (view === "default") {
      contentWrapper.appendChild(renderDefaultView());
    } else {
      modalContainer.className = "oko-modal-container oko-socials-container";
      contentWrapper.appendChild(renderSocialsView());
    }
  }

  function switchToProgressView(status: "loading" | "failed", method: SignInType) {
    clearContent();
    contentWrapper.appendChild(renderProgressView(status, method));
  }

  // Initial render
  contentWrapper.appendChild(renderDefaultView());

  // Assemble modal
  modalContainer.appendChild(closeBtn);
  modalContainer.appendChild(contentWrapper);
  overlay.appendChild(modalContainer);
  shadow.appendChild(overlay);

  // Event handlers
  closeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    onClose();
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      onClose();
    }
  });

  contentWrapper.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    const btn = target.closest(".oko-provider-btn") as HTMLButtonElement | null;

    if (btn && !btn.disabled && btn.dataset.provider) {
      const provider = btn.dataset.provider as SignInType;
      onSelect(provider);
    }
  });

  // Handle escape key
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };
  document.addEventListener("keydown", handleKeyDown);

  // Prevent body scroll
  const originalOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";

  // Store cleanup function
  cleanupMap.set(container, () => {
    document.removeEventListener("keydown", handleKeyDown);
    document.body.style.overflow = originalOverflow;
  });

  const showLoading = (method: SignInType) => {
    switchToProgressView("loading", method);
  };

  const showFailed = (method: SignInType) => {
    switchToProgressView("failed", method);
  };

  return {
    container,
    showLoading,
    showFailed,
  };
}

export function removeLoginModal(container: HTMLElement): void {
  const cleanup = cleanupMap.get(container);
  if (cleanup) {
    cleanup();
    cleanupMap.delete(container);
  }
  container.remove();
}
