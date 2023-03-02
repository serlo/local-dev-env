local claims = std.extVar('claims');
std.trace("obj content: %s" % [claims], claims)
{
  identity: {
    traits: {
      email: claims.sub + "@localhost",
      username: claims.preferred_username + "2",
      interest: "",
    },
  },
}