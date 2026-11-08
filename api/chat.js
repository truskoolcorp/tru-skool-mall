/** Retired alternate paid entry point. Deliberately no fetch, credentials,
 * forwarding, redirects, or permissive CORS. Old callers must upgrade to the
 * capability/status contract; a redirect cannot safely translate their body.
 * This local candidate does not disable already-deployed copies of this route.
 */
module.exports = async function handler(_req, res) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(410).json({
    error: 'This legacy chat endpoint has been retired. Update the Mall chat client.',
    code: 'legacy_chat_retired',
    concierge_endpoint: 'https://www.cafe-sativa.com/api/concierge',
    capability_endpoint: 'https://www.cafe-sativa.com/api/concierge/status',
  });
};
