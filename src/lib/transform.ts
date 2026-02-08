/* eslint-disable @typescript-eslint/no-explicit-any */

import type { ProfileAudit } from "./mock-data";
import { computeAudit } from "./scoring";

/**
 * Transform raw Apify profile + posts data into a ProfileAudit.
 * Delegates to modular scoring system in src/lib/scoring/.
 */
export function transformProfileAndPosts(profile: any, posts: any[]): ProfileAudit {
  return computeAudit(profile, posts);
}
