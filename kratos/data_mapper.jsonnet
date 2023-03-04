local claims = std.extVar('claims');
// // IMPORTANT: do not use std.trace in production, it is only for debugging purposes. See kratos logs
// std.trace("claims from nbp: %s" % [claims], claims)

{
  identity: {
    traits: {
      // [if 'email' in claims && claims.email_verified then 'email' else null]: claims.email, // this one is for production
      email: if 'email' in claims then claims.email else claims.preferred_username + '@localhost.org', // this one is for development
      // TODO: generate a small token and append to username in order to avoid clashing
      username: claims.preferred_username + "-1232kjl",
      // TODO: map nbp roles to ours
      interest: "",
    },
  },
}