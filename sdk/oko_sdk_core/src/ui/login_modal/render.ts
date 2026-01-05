import type { SignInType } from "@oko-wallet-sdk-core/types/oauth";
import { MODAL_STYLES } from "./styles";
import { ICONS, S3_LOGO_URL, S3_LOGO_WITH_NAME_URL } from "./icons";

const cleanupMap = new WeakMap<HTMLElement, () => void>();

export interface LoginModalOptions {
  onSelect: (provider: SignInType) => void;
  onClose: () => void;
}

export interface LoginModalController {
  container: HTMLElement;
  showError: (message: string) => void;
  hideError: () => void;
}

export function renderLoginModal(
  options: LoginModalOptions,
): LoginModalController {
  const { onSelect, onClose } = options;

  // Create container element
  const container = document.createElement("div");
  container.id = "oko-login-modal";

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

  // Close button (always visible)
  const closeBtn = document.createElement("button");
  closeBtn.className = "oko-modal-close";
  closeBtn.innerHTML = ICONS.close;
  closeBtn.setAttribute("aria-label", "Close modal");

  // Error message element
  const errorMessage = document.createElement("div");
  errorMessage.className = "oko-error-message";
  errorMessage.style.display = "none";

  // Content wrapper
  const contentWrapper = document.createElement("div");
  contentWrapper.className = "oko-content-wrapper";

  // Render functions
  function renderDefaultView(): HTMLElement {
    const view = document.createElement("div");
    view.className = "oko-default-view";

    // Logo
    const logoWrapper = document.createElement("div");
    logoWrapper.className = "oko-logo-wrapper";
    const logo = document.createElement("img");
    logo.src = S3_LOGO_URL;
    logo.alt = "Oko";
    logo.width = 84;
    logo.height = 32;
    logoWrapper.appendChild(logo);

    // Provider buttons
    const providerList = document.createElement("div");
    providerList.className = "oko-provider-list";

    // Email button
    const emailBtn = createProviderButton("email", "Email", ICONS.email);
    providerList.appendChild(emailBtn);

    // Google button
    const googleBtn = createProviderButton("google", "Google", ICONS.google);
    providerList.appendChild(googleBtn);

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
      <img class="oko-footer-logo" src="${S3_LOGO_WITH_NAME_URL}" alt="Oko" width="52" height="20" />
      <a class="oko-footer-link" href="https://oko-wallet.canny.io/bug-reports" target="_blank" rel="noopener noreferrer">
        Get support
        <span class="oko-external-icon">${ICONS.externalLink}</span>
      </a>
    `;

    view.appendChild(logoWrapper);
    view.appendChild(providerList);
    view.appendChild(errorMessage);
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

    // Provider buttons
    const providerList = document.createElement("div");
    providerList.className = "oko-provider-list oko-socials-list";

    // X button
    const xBtn = createProviderButton("x", "X", ICONS.x);
    providerList.appendChild(xBtn);

    // Telegram button
    const telegramBtn = createProviderButton(
      "telegram",
      "Telegram",
      ICONS.telegram,
    );
    providerList.appendChild(telegramBtn);

    // Discord button
    const discordBtn = createProviderButton(
      "discord",
      "Discord",
      ICONS.discord,
    );
    providerList.appendChild(discordBtn);

    // Apple button (disabled)
    const appleBtn = createProviderButton("apple", "Apple", ICONS.apple, true);
    providerList.appendChild(appleBtn);

    view.appendChild(backRow);
    view.appendChild(providerList);
    view.appendChild(errorMessage);

    return view;
  }

  function createProviderButton(
    id: string,
    label: string,
    icon: string,
    disabled = false,
  ): HTMLButtonElement {
    const btn = document.createElement("button");
    btn.className = "oko-provider-btn";
    btn.dataset.provider = id;
    if (disabled) {
      btn.disabled = true;
    }

    btn.innerHTML = `
      <span class="oko-provider-icon">${icon}</span>
      <span class="oko-provider-label">${label}</span>
    `;

    return btn;
  }

  function switchView(view: "default" | "socials") {
    errorMessage.style.display = "none";
    contentWrapper.innerHTML = "";
    if (view === "default") {
      modalContainer.className = "oko-modal-container";
      contentWrapper.appendChild(renderDefaultView());
    } else {
      modalContainer.className = "oko-modal-container oko-socials-container";
      contentWrapper.appendChild(renderSocialsView());
    }
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

  // Controller functions
  const showError = (message: string) => {
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
  };

  const hideError = () => {
    errorMessage.textContent = "";
    errorMessage.style.display = "none";
  };

  return {
    container,
    showError,
    hideError,
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
