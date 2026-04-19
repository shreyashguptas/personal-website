interface ThemeScriptOptions {
  debug?: boolean;
  storageKey?: string;
}

export const THEME_STORAGE_KEY = "sg-theme";

/**
 * Inline script — runs before paint to prevent theme flash. Reads the user's
 * stored preference ("light" | "dark" | "system") from localStorage and
 * applies a .dark class on <html> if appropriate. Exposes helpers on window
 * so a segmented toggle can re-apply and subscribe to changes.
 */
export function createThemeInitializerScript(options: ThemeScriptOptions = {}): string {
  const debug = options.debug === true;
  const storageKey = options.storageKey ?? THEME_STORAGE_KEY;

  return `;(function(){
    var DEBUG = ${debug ? "true" : "false"};
    var KEY = ${JSON.stringify(storageKey)};
    var subscribers = new Set();
    var mediaQuery;

    function ensureMedia(){
      if (mediaQuery) return mediaQuery;
      if (typeof window === 'undefined' || !window.matchMedia) return undefined;
      try { mediaQuery = window.matchMedia('(prefers-color-scheme: dark)'); }
      catch(e){ mediaQuery = undefined; }
      return mediaQuery;
    }

    function readPref(){
      try {
        var v = window.localStorage.getItem(KEY);
        if (v === 'light' || v === 'dark' || v === 'system') return v;
      } catch(e){}
      return 'system';
    }

    function writePref(v){
      try { window.localStorage.setItem(KEY, v); } catch(e){}
    }

    function resolve(pref){
      if (pref === 'light') return false;
      if (pref === 'dark') return true;
      var mq = ensureMedia();
      return mq ? mq.matches : false;
    }

    function notify(detail){
      try {
        document.documentElement.dispatchEvent(new CustomEvent('sg-theme:change', { detail: detail }));
      } catch(e){}
      subscribers.forEach(function(cb){ try { cb(detail); } catch(e){} });
    }

    function apply(reason){
      var html = document.documentElement;
      if (!html) return { isDark:false, pref:'system', applied:false };
      var pref = readPref();
      var isDark = resolve(pref);
      html.classList.remove('dark','light');
      html.classList.add(isDark ? 'dark' : 'light');
      html.setAttribute('data-theme', isDark ? 'dark' : 'light');
      html.style.colorScheme = isDark ? 'dark' : 'light';
      var detail = { isDark: isDark, pref: pref, applied: true, reason: reason, timestamp: Date.now() };
      if (DEBUG) console.info('[theme] applied', detail);
      notify(detail);
      return detail;
    }

    function setPref(pref){
      if (pref !== 'light' && pref !== 'dark' && pref !== 'system') pref = 'system';
      writePref(pref);
      return apply('set-pref');
    }

    function handleMediaChange(){
      if (readPref() === 'system') apply('media-change');
    }

    var mq = ensureMedia();
    if (mq) {
      if (typeof mq.addEventListener === 'function') mq.addEventListener('change', handleMediaChange);
      else if (typeof mq.addListener === 'function') mq.addListener(handleMediaChange);
    }

    if (typeof window !== 'undefined') {
      window.__sgTheme = {
        apply: function(reason){ return apply(reason || 'manual'); },
        get: readPref,
        set: setPref,
        subscribe: function(cb){
          if (typeof cb !== 'function') return function(){};
          subscribers.add(cb);
          return function(){ subscribers.delete(cb); };
        }
      };
    }

    apply('script-init');
  })();`;
}

export type ThemePref = "light" | "dark" | "system";

export type ThemeDetail = {
  isDark: boolean;
  pref: ThemePref;
  applied: boolean;
  reason?: string;
  timestamp: number;
};
