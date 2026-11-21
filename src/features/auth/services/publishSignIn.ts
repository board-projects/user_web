export const PUBLISH_RESUME_PARAM = "resumePublish";

export function isPublishResumeId(value: string | null): value is string {
  return !!value && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export function openPublishSignInChannel(id: string): BroadcastChannel | null {
  if (typeof BroadcastChannel === "undefined") return null;
  try {
    return new BroadcastChannel(`dequizma:publish:${id}`);
  } catch {
    return null;
  }
}
