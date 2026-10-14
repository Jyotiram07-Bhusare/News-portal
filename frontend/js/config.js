/*
 * LOKMANGAL — site settings. The one file to edit when the site moves to another server.
 *
 * API_BASE = where the Python backend (backend/app.py) lives:
 *   ""                         same address as this website (the backend also serves the site: SERVE_FRONTEND=true)
 *   "https://api.example.com"  the backend runs on its own server (website hosted on Vercel, Netlify ...)
 *
 * It is chosen for you:
 *   on this PC / your Wi-Fi (localhost, 192.168.x.x ...)  - always the backend running here, never the production one,
 *                                                           so testing can not touch the real data:
 *       page opened from the backend itself (http://localhost:5000)         -> ""
 *       page opened from another local server (Live Server :5500, ...)      -> http://<same host>:5000
 *   on the internet (Vercel, your own domain ...)         -> API_BASE_PRODUCTION below
 *       (leave it "" when the site has no backend: it then runs from its built-in data)
 */
(function () {
  var API_BASE_PRODUCTION = "";   // e.g. "https://api.lokmangal.in"
  var DEV_API_PORT = "5000";      // PORT in backend/.env

  var cfg = (window.LOKMANGAL_CONFIG = window.LOKMANGAL_CONFIG || {});
  if (typeof cfg.API_BASE !== "string") {
    var host = location.hostname;
    var local = host === "localhost" || host === "127.0.0.1" || host === "[::1]" ||
      /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host);
    var base = API_BASE_PRODUCTION;
    if (local) {
      base = location.port && location.port !== DEV_API_PORT
        ? location.protocol + "//" + host + ":" + DEV_API_PORT
        : "";
    }
    cfg.API_BASE = base;
  }
  cfg.API_BASE = cfg.API_BASE.replace(/\/+$/, "");
})();
