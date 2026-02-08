// Composio integration for GrowthLens
// Handles Twitter/X OAuth connections and data fetching

const COMPOSIO_API_KEY = process.env.COMPOSIO_API_KEY || '';
const COMPOSIO_BASE = 'https://backend.composio.dev/api/v3';

// Auth config IDs (created automatically by Composio)
let twitterAuthConfigId: string | null = null;

async function composioFetch(path: string, options: RequestInit = {}) {
  const resp = await fetch(`${COMPOSIO_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': COMPOSIO_API_KEY,
      ...(options.headers || {}),
    },
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Composio API error ${resp.status}: ${text}`);
  }
  return resp.json();
}

// Get or create auth config for a toolkit
async function getAuthConfigId(toolkit: string): Promise<string> {
  if (toolkit === 'twitter' && twitterAuthConfigId) return twitterAuthConfigId;

  const data = await composioFetch(`/auth_configs?toolkit_slug=${toolkit}`);
  if (data.items?.length > 0) {
    const id = data.items[0].id;
    if (toolkit === 'twitter') twitterAuthConfigId = id;
    return id;
  }

  throw new Error(`No auth config found for ${toolkit}. Set it up in Composio dashboard.`);
}

// Create a connect link for a user to authenticate with Twitter
export async function createConnectLink(
  userId: string,
  toolkit: 'twitter' | 'linkedin',
  callbackUrl: string
): Promise<{ redirectUrl: string; connectedAccountId: string }> {
  const authConfigId = await getAuthConfigId(toolkit);

  const data = await composioFetch('/connected_accounts/link', {
    method: 'POST',
    body: JSON.stringify({
      auth_config_id: authConfigId,
      user_id: userId,
      callback_url: callbackUrl,
    }),
  });

  return {
    redirectUrl: data.redirect_url,
    connectedAccountId: data.connected_account_id,
  };
}

// Check if a user has a connected account for a toolkit
export async function getConnectedAccount(
  userId: string,
  toolkit: string
): Promise<{ id: string; status: string } | null> {
  try {
    const data = await composioFetch(
      `/connected_accounts?user_id=${encodeURIComponent(userId)}&toolkit_slug=${toolkit}`
    );
    if (data.items?.length > 0) {
      const account = data.items[0];
      return { id: account.id, status: account.status };
    }
    return null;
  } catch {
    return null;
  }
}

// Execute a Composio tool with a connected account
export async function executeTool(
  connectedAccountId: string,
  toolSlug: string,
  params: Record<string, unknown>
): Promise<unknown> {
  // Use the v1 execute endpoint (v3 uses sessions)
  const resp = await fetch('https://backend.composio.dev/api/v2/actions/execute/direct', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': COMPOSIO_API_KEY,
    },
    body: JSON.stringify({
      connected_account_id: connectedAccountId,
      action: toolSlug,
      input: params,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Tool execution error ${resp.status}: ${text}`);
  }

  return resp.json();
}

// Fetch Twitter/X profile data for audit
export async function fetchTwitterProfile(
  connectedAccountId: string,
  username: string
) {
  const userData = await executeTool(connectedAccountId, 'TWITTER_USER_LOOKUP_BY_USERNAMES', {
    usernames: [username.replace('@', '')],
    user_fields: [
      'created_at', 'description', 'profile_image_url', 'profile_banner_url',
      'public_metrics', 'verified', 'verified_type', 'location', 'url',
      'pinned_tweet_id', 'most_recent_tweet_id'
    ],
    expansions: ['pinned_tweet_id'],
    tweet_fields: ['created_at', 'public_metrics', 'text'],
  });

  return userData;
}

// Search recent tweets by a user
export async function searchTwitterPosts(
  connectedAccountId: string,
  username: string,
  maxResults: number = 100
) {
  const searchData = await executeTool(connectedAccountId, 'TWITTER_RECENT_SEARCH', {
    query: `from:${username.replace('@', '')} -is:retweet -is:reply`,
    max_results: Math.min(maxResults, 100),
    sort_order: 'recency',
    tweet_fields: [
      'created_at', 'public_metrics', 'text', 'entities',
      'attachments', 'referenced_tweets', 'conversation_id', 'source'
    ],
    expansions: ['attachments.media_keys', 'author_id'],
    media_fields: ['type', 'url', 'preview_image_url'],
    user_fields: ['public_metrics', 'username', 'name'],
  });

  return searchData;
}

// Get the authenticated user's own profile
export async function getTwitterMe(connectedAccountId: string) {
  return executeTool(connectedAccountId, 'TWITTER_USER_LOOKUP_ME', {
    user_fields: [
      'created_at', 'description', 'profile_image_url', 'profile_banner_url',
      'public_metrics', 'verified', 'location', 'url'
    ],
  });
}
