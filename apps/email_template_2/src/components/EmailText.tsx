import React from "react";

interface EmailTextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
  className?: string; // For compatibility, though we prefer inline styles
  style?: React.CSSProperties;
  variant?: "body" | "caption" | "heading";
  align?: "left" | "center" | "right";
}

export const EmailText = ({
  children,
  style,
  variant = "body",
  align = "left",
  ...props
}: EmailTextProps) => {
  const baseStyle: React.CSSProperties = {
    fontFamily: "Inter, Arial, sans-serif",
    margin: 0,
    color: "#1c1b1f",
    textAlign: align,
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    body: {
      fontWeight: 500,
      fontSize: "16px",
      lineHeight: "160%",
      letterSpacing: "-0.01em",
    },
    caption: {
      fontWeight: 500,
      fontSize: "14px",
      lineHeight: "150%",
      letterSpacing: "-0.01em",
      color: "rgba(28, 27, 31, 0.5)",
    },
    heading: {
      fontWeight: 600,
      fontSize: "20px",
      lineHeight: "150%",
      letterSpacing: "-0.01em",
    },
  };

  return (
    <p style={{ ...baseStyle, ...variantStyles[variant], ...style }} {...props}>
      {children}
    </p>
  );
};
