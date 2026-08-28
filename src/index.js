// Makes this Worker path-aware so it can sit behind a single broad
// Cloudflare Route — topteam.maximy.life/thinking* — on a zone whose
// root is served by a completely separate Worker (BPL, on a Custom
// Domain), without either site's assets ever resolving against the
// other's, and without swallowing paths the Route's wildcard happens
// to also match but that aren't actually this site (e.g.
// "/thinking-something-else").
//
// Every asset reference in public/index.html is a relative path with
// no leading slash (e.g. "assets/photos/x.jpg"), so once the browser's
// document URL ends in "/thinking/", those references resolve to
// "/thinking/assets/..." on their own — no HTML/CSS/JS edits needed.
// This Worker's job is purely routing:
//
//   1. pathname === "/thinking"        -> 308 redirect to "/thinking/",
//      preserving the query string. Without the trailing slash,
//      relative asset URLs would resolve against "/" (BPL's own root)
//      instead, and BPL happens to have an "assets/" tree of its own
//      -- so this redirect is what prevents a silent wrong-asset load,
//      not just a cosmetic nicety.
//   2. pathname starts with "/thinking/" -> strip the prefix, serve
//      from this Worker's own static assets exactly as before.
//   3. anything else -> only reachable at all because the Route
//      pattern's wildcard is broader than this site (e.g.
//      "/thinking-something-else"). On the production hostname, hand
//      the ORIGINAL, unmodified request back to BPL's Custom Domain
//      Worker via fetch(request) -- Cloudflare documents that a
//      same-zone fetch() to a Custom Domain hostname invokes that
//      Custom Domain's Worker directly rather than re-entering Route
//      matching, so this does not loop back into this Worker. On any
//      other hostname (workers.dev, previews, local dev) there is no
//      BPL to fall back to, so this Worker keeps serving its own root
//      exactly as it always has.
const MOUNT_PREFIX = "/thinking";
const PRODUCTION_HOST = "topteam.maximy.life";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === MOUNT_PREFIX) {
      url.pathname = MOUNT_PREFIX + "/";
      return Response.redirect(url.toString(), 308);
    }

    if (url.pathname.startsWith(MOUNT_PREFIX + "/")) {
      const rewritten = new URL(request.url);
      rewritten.pathname = url.pathname.slice(MOUNT_PREFIX.length) || "/";
      return env.ASSETS.fetch(new Request(rewritten, request));
    }

    if (url.hostname === PRODUCTION_HOST) {
      return fetch(request);
    }

    return env.ASSETS.fetch(request);
  },
};
