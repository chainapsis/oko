import { OKO_PUBLIC_S3_BUCKET_URL } from "@oko-wallet-attached/requests/endpoints";

import styles from "./styles.module.scss";

export const SiweSigTitleBadge = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const imageUrl = {
    png: isDarkMode
      ? `${OKO_PUBLIC_S3_BUCKET_URL}/assets/oko_siwe_sign_badge_dark.png`
      : `${OKO_PUBLIC_S3_BUCKET_URL}/assets/oko_siwe_sign_badge_light.png`,
    webp: isDarkMode
      ? `${OKO_PUBLIC_S3_BUCKET_URL}/assets/oko_siwe_sign_badge_dark.webp`
      : `${OKO_PUBLIC_S3_BUCKET_URL}/assets/oko_siwe_sign_badge_light.webp`,
  };

  return (
    <div className={styles.imageContainer}>
      <picture>
        <source srcSet={imageUrl.webp} type="image/webp" />
        <img
          className={styles.image}
          src={imageUrl.png}
          alt="sign siwe title image"
        />
      </picture>
    </div>
  );
};
