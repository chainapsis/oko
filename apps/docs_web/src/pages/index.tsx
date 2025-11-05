import { JSX, useEffect } from "react";
import { useHistory } from "@docusaurus/router";

export default function Home(): JSX.Element {
  const history = useHistory();

  useEffect(() => {
    history.replace("/docs");
  }, [history]);

  return null;
}
