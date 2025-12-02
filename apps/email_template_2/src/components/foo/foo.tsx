import type { CSSProperties, FC } from "react";

export const Foo: FC = () => {
  const style: CSSProperties = { color: "blue" };

  return <div style={style}>foo</div>;
};
