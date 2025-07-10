"use client";

import { memo, useEffect } from "react";

declare global {
  var updateDOM: () => void;
}

const STORAGE_KEY = "nextjs-blog-starter-theme";

/** function to be injected in script tag for avoiding FOUC (Flash of Unstyled Content) */
export const NoFOUCScript = () => {
  const SYSTEM = "system";
  const DARK = "dark";
  const LIGHT = "light";

  /** Modify transition globally to avoid patched transitions */
  const modifyTransition = () => {
    const css = document.createElement("style");
    css.textContent = "*,*:after,*:before{transition:none !important;}";
    document.head.appendChild(css);

    return () => {
      /* Force restyle */
      getComputedStyle(document.body);
      /* Wait for next tick before removing */
      setTimeout(() => document.head.removeChild(css), 1);
    };
  };

  const media = matchMedia(`(prefers-color-scheme: ${DARK})`);

  /** function to add remove dark class */
  window.updateDOM = () => {
    const restoreTransitions = modifyTransition();
    // Always use system preference
    const systemMode = media.matches ? DARK : LIGHT;
    const classList = document.documentElement.classList;
    if (systemMode === DARK) classList.add(DARK);
    else classList.remove(DARK);
    document.documentElement.setAttribute("data-mode", SYSTEM);
    restoreTransitions();
  };
  window.updateDOM();
  media.addEventListener("change", window.updateDOM);
};

const Script = memo(() => (
  <script
    dangerouslySetInnerHTML={{
      __html: `(${NoFOUCScript.toString()})('${STORAGE_KEY}')`,
    }}
  />
));

Script.displayName = 'ThemeSwitcherScript';

/**
 * This component which applies classes and transitions automatically based on system preference.
 */
export const ThemeSwitcher = () => {
  useEffect(() => {
    // Theme switching is handled by the injected script
  }, []);

  return <Script />;
};
