// see https://www.ory.sh/docs/kratos/social-signin/data-mapping for all keys of the external variable claims
local claims = std.extVar('claims');

// IMPORTANT: do not use std.trace in production, it is only for debugging purposes. See kratos logs
// std.trace("claims from nbp: %s" % [claims], claims)

// not really jsonnet code of what I understand from the ticket but doesn't work because jsonnet is only intended to have pure functions
/*
local get_unique_username(preferred_username, token='')
  local identity = http(
    url = kratosUrl + "/identities?trait=username:" + username + token,
    method = "GET"
  );
  if identity == null then [
    // username exists and we try with an appended token
    token = "-" + randString(5)
    get_unique_username(preferred_username, token)
  ] else [
    username + token
  ]
  */

{
  identity: {
    traits: {
      // [if 'email' in claims && claims.email_verified then 'email' else null]: claims.email, // this one is for production
      email: if 'email' in claims then claims.email else claims.preferred_username + '@localhost.org', // this one is for development
      // TODO: generate a small token and append to username in order to avoid clashing
      //username: get_unique_username(claims.preferred_username),
      username: claims.website + "/" + claims.preferred_username,
      // TODO: map nbp roles to ours
      interest: "",
    },
  },
}