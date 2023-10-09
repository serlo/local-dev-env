function(ctx) {
  email_address: if 'subscribedNewsletter' in ctx.identity.traits && ctx.identity.traits.subscribedNewsletter == true then
    ctx.identity.traits.email
  else
    error 'User did not subscribed to newsletter. Aborting!',
  merge_fields: {
    UNAME: ctx.identity.traits.username,
  },
  status: 'subscribed',
}
