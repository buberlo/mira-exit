import { useEffect, useState } from "react";

export function useDocumentVisibility() {
  const [hidden, setHidden] = useState<boolean>(
    typeof document !== "undefined" ? document.hidden : false,
  );

  useEffect(() => {
    if (typeof document === "undefined") return;
    const update = () => setHidden(document.hidden);
    const onVisibility = () => update();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", update);
    window.addEventListener("focus", update);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", update);
      window.removeEventListener("focus", update);
    };
  }, []);

  return hidden;
}
