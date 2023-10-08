#!/bin/sh

echo
echo 'Registering rocket chat as client in hydra'
echo

./scripts/docker-exec.sh hydra \
  hydra create client \
  --skip-tls-verify \
  --endpoint http://hydra:4445 \
  --name rocket.chat \
  --secret rocket.chat \
  --grant-type authorization_code,refresh_token \
  --response-type code \
  --scope openid,offline_access,email \
  --token-endpoint-auth-method client_secret_post \
  --redirect-uri http://localhost:3030/_oauth/serlo

echo
echo 'Dumping a basic preconfigured database for rocket chat'
echo

./scripts/docker-exec.sh --user root mongodb mongorestore --drop --quiet /dump/

# TODO: extract to other script or wait for integration cloudflare worker
# echo
# echo 'Making authentication in api possible'
# echo
# cp -f scripts/kratos/graphql-fetch-cloudflare-auth.template src/api/graphql-fetch.ts
# echo
# echo "\033[0;31mImportant:\033[0m the file src/api/graphql-fetch.ts and src/data/de/menu-data.ts were modified in order to imitate the current behavior in deployment. DO NOT COMMIT these changes."
# echo
