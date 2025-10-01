interface ThemeScriptOptions {
  debug?: boolean;
}

/**
 * Generates a script that applies the system color scheme immediately during SSR hydration.
 * The script exposes helpers on the window for later subscribers so client code can observe
 * theme changes without duplicating application logic.
 */
export function createThemeInitializerScript(options: ThemeScriptOptions = {}): string {
  const debug = options.debug === true;

  // Inline script string. Keep it self-contained – do not rely on bundler helpers.
  return `;(function(){
    var DEBUG = ${debug ? "true" : "false"};
    var DARK = 'dark';
    var LIGHT = 'light';
    var mediaQuery;
    var subscribers = new Set();

    function ensureMediaQuery(){
      if (mediaQuery) return mediaQuery;
      if (typeof window === 'undefined' || !window.matchMedia) return undefined;
      try {
        mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      } catch (error) {
        if (DEBUG) console.warn('[theme] matchMedia unavailable', error);
        mediaQuery = undefined;
      }
      return mediaQuery;
    }

    function notify(detail){
      try {
        document.documentElement.dispatchEvent(new CustomEvent('sg-theme:change', { detail: detail }));
      } catch (error) {
        if (DEBUG) console.warn('[theme] dispatch failed', error);
      }
      subscribers.forEach(function(callback){
        try { callback(detail); }
        catch (error) { if (DEBUG) console.error('[theme] subscriber error', error); }
      });
    }

    function applyTheme(reason){
      var html = document.documentElement;
      if (!html) return { isDark: false, reason: reason, applied: false };

      var mq = ensureMediaQuery();
      var isDark = mq ? mq.matches : false;

      html.classList.remove(DARK, LIGHT);
      html.classList.add(isDark ? DARK : LIGHT);
      html.setAttribute('data-theme', isDark ? DARK : LIGHT);

      var detail = {
        isDark: isDark,
        reason: reason,
        applied: true,
        timestamp: Date.now()
      };

      if (DEBUG) console.info('[theme] applied', detail);

      notify(detail);
      return detail;
    }

    function handleChange(){
      applyTheme('media-change');
    }

    function attachListener(){
      var mq = ensureMediaQuery();
      if (!mq) return;
      if (typeof mq.addEventListener === 'function') {
        mq.addEventListener('change', handleChange);
      } else if (typeof mq.addListener === 'function') {
        mq.addListener(handleChange);
      }
    }

    if (typeof window !== 'undefined') {
      window.__sgApplyTheme = function(reason){
        return applyTheme(reason || 'manual-call');
      };
      window.__sgOnThemeChange = function(callback){
        if (typeof callback !== 'function') {
          if (DEBUG) console.warn('[theme] invalid subscriber provided');
          return function(){};
        }
        subscribers.add(callback);
        return function(){ subscribers.delete(callback); };
      };
    }

    // Initial application sequence
    applyTheme('script-init');
    attachListener();

    // Re-apply after hydration to verify no flashes occur
    setTimeout(function(){ applyTheme('post-hydration-check'); }, 50);
  })();`;
}

export type ThemeScriptDetail = {
  isDark: boolean;
  reason: string;
  applied: boolean;
  timestamp: number;
};


