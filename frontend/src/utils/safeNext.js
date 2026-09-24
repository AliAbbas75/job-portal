/** Returns `next` only if it is a same-site path, so login can't redirect off-site. */
export function safeNext(next, fallback) {
  const isLocalPath = next?.startsWith('/') && !next.startsWith('//') && !next.startsWith('/\\');
  return isLocalPath ? next : fallback;
}
