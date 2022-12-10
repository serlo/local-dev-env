#!/bin/sh

echo
echo 'Registering rocket chat as client in hydra'
echo

sleep 30

docker-compose exec hydra hydra clients delete rocket.chat --endpoint http://hydra:4445

docker-compose exec hydra \
  hydra clients create \
  --skip-tls-verify \
  --endpoint http://hydra:4445 \
  --id rocket.chat \
  --secret rocket.chat \
  --grant-types authorization_code,refresh_token \
  --response-types code \
  --scope openid,offline_access,email \
  --callbacks http://localhost:3030/_oauth/serlo \
  --token-endpoint-auth-method client_secret_post

echo
echo 'Dumping a basic preconfigured database for rocket chat'
echo

docker-compose exec --user root mongodb  mongorestore --drop --quiet /dump/

# TODO: extract to other script
# echo
# echo 'Creating the user dev in Kratos'
# echo
# yarn kratos:new-user dev serlo@dev.org 123456

# echo
# echo 'Adjusting link to rocket chat'
# echo

# TODO: extract to other script or wait for integration cloudflare worker
# echo
# echo 'Making authentication in api possible'
# echo
# cp -f scripts/kratos/graphql-fetch-cloudflare-auth.template src/api/graphql-fetch.ts
# echo
# echo "\033[0;31mImportant:\033[0m the file src/api/graphql-fetch.ts and src/data/de/menu-data.ts were modified in order to imitate the current behavior in deployment. DO NOT COMMIT these changes."
# echo
