import {
  useState,
  useRef,
  type KeyboardEvent,
  type ClipboardEvent,
  type FC,
} from "react";
import styles from "./otp_input.module.scss";

interface OtpInputProps {
  length: number;
  value: string[];
  onChange: (value: string[]) => void;
  onComplete?: (value: string[]) => void;
  disabled?: boolean;
  isError?: boolean;
}

function isSingleDigit(value: string): boolean {
  return /^\d$/.test(value);
}
function isComplete(digits: string[], length: number): boolean {
  return (
    digits.length === length &&
    digits.every((digit) => digit !== "" && isSingleDigit(digit))
  );
}

export const OtpInput: FC<OtpInputProps> = ({
  length,
  value,
  onChange,
  onComplete,
  disabled = false,
  isError = false,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const digits = value;

  const focusInput = (index: number) => {
    if (inputRefs.current[index]) {
      inputRefs.current[index]?.focus();
    }
  };

  const handleChange = (index: number, inputValue: string) => {
    if (inputValue.length > 1) return;
    if (inputValue && !/^\d$/.test(inputValue)) return;

    const newDigits = [...digits];
    newDigits[index] = inputValue;

    while (newDigits.length < length) {
      newDigits.push("");
    }

    onChange(newDigits.slice(0, length));

    if (inputValue && index < length - 1) {
      focusInput(index + 1);
    }

    if (isComplete(newDigits, length) && onComplete) {
      onComplete(newDigits);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        focusInput(index - 1);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      focusInput(index - 1);
    } else if (e.key === "ArrowRight" && index < length - 1) {
      focusInput(index + 1);
    }
  };

  const handlePaste = (e: ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const pastedDigits = pastedData
      .replace(/\D/g, "")
      .slice(0, length)
      .split("");

    if (pastedDigits) {
      onChange(pastedDigits);

      if (isComplete(pastedDigits, length) && onComplete) {
        onComplete(pastedDigits);
      }
    }
  };

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
  };

  const handleBlur = () => {
    setFocusedIndex(null);
  };

  return (
    <div className={styles.otpContainer}>
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(el) => {
            if (el) {
              inputRefs.current[index] = el;
            }
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[index] || ""}
          placeholder="0"
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => handleFocus(index)}
          onBlur={handleBlur}
          disabled={disabled}
          className={`${styles.otpInput}
          ${digits[index] ? styles.filled : ""}
          ${focusedIndex === index ? styles.focused : ""} 
          ${isError ? styles.error : ""}
          `}
        />
      ))}
    </div>
  );
};
