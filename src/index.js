// Makes this Worker path-aware so it can be mounted under a subpath
// (e.g. https://topteam.maximy.life/thinking) on a hostname whose root
// is served by a completely separate Worker (BPL), while continuing to
// serve unprefixed requests exactly as before (workers.dev, previews).
//
// Every asset reference in public/index.html is a relative path with no
// leading slash (e.g. "assets/photos/x.jpg"), so once the browser has a
// document URL ending in "/thinking/", those references resolve to
// "/thinking/assets/..." on their own — no HTML/CSS/JS edits needed.
// This Worker's only job is to strip the "/thinking" prefix back off
// before asking the assets binding for the file, and to redirect the
// bare "/thinking" (no trailing slash) to "/thinking/" first, since
// without the trailing slash the browser would resolve relative paths
// against "/" instead (the parent site's root) and silently pick up
// the wrong assets there.
const MOUNT_PREFIX = "/thinking";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === MOUNT_PREFIX) {
      url.pathname = MOUNT_PREFIX + "/";
      return Response.redirect(url.toString(), 308);
    }

    if (url.pathname === MOUNT_PREFIX + "/" || url.pathname.startsWith(MOUNT_PREFIX + "/")) {
      const rewritten = new URL(request.url);
      rewritten.pathname = url.pathname.slice(MOUNT_PREFIX.length) || "/";
      return env.ASSETS.fetch(new Request(rewritten, request));
    }

    // Not mounted under /thinking (e.g. the raw workers.dev URL) —
    // unchanged, root-relative behaviour.
    return env.ASSETS.fetch(request);
  },
};
