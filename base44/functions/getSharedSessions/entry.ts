import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get all shares for this user
  const shares = await base44.asServiceRole.entities.SessionShare.filter({
    shared_with_email: user.email
  });

  if (shares.length === 0) {
    return Response.json({ sessions: [] });
  }

  // Fetch each shared session using service role
  const sessionResults = await Promise.all(
    shares.map(async (share) => {
      const sessions = await base44.asServiceRole.entities.Session.filter({ id: share.session_id });
      if (sessions.length === 0) return null;
      return { ...sessions[0], _share: { permission: share.permission, shared_by: share.shared_by_email } };
    })
  );

  const sessions = sessionResults.filter(Boolean);
  return Response.json({ sessions });
});