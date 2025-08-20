"use client";

import { memo, useEffect } from "react";

const Script = memo(() => (
  <script
    dangerouslySetInnerHTML={{
      __html: `
        (function() {
          const SYSTEM = "system";
          const DARK = "dark";
          const LIGHT = "light";

          function modifyTransition() {
            const css = document.createElement("style");
            css.textContent = "*,*:after,*:before{transition:none !important;}";
            document.head.appendChild(css);

            return function() {
              getComputedStyle(document.body);
              setTimeout(function() { document.head.removeChild(css); }, 1);
            };
          }

          const media = matchMedia('(prefers-color-scheme: dark)');

          function updateDOM() {
            const restoreTransitions = modifyTransition();
            const systemMode = media.matches ? DARK : LIGHT;
            const classList = document.documentElement.classList;
            if (systemMode === DARK) classList.add(DARK);
            else classList.remove(DARK);
            document.documentElement.setAttribute("data-mode", SYSTEM);
            restoreTransitions();
          }

          window.updateDOM = updateDOM;
          updateDOM();
          media.addEventListener("change", updateDOM);
        })();
      `,
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
