# serlo.org - Local Development Environment

Scripts for having the main backend services of the serlo.org environment in a local machine.

Requirements:

- UNIX System
- Docker and Docker Compose
- Nodejs and Yarn
- Python 3 and pip

```
yarn
yarn start
# or `yarn start:detach` to have control of the terminal
```

Take a look `package.json` for useful scripts!

## Integrating local Serlo frontend

1. `cd $YOUR_FRONTEND_DIR`
2. Make sure to use the local environment in `.env`

```
NEXT_PUBLIC_ENV=local
# NEXT_PUBLIC_ENV=staging
```

3. `yarn dev`
   _Note: every time you change `.env`, you have to rerun `yarn dev`_

4. cd back to this repo directory and `cp localhost-graphql-fetch.ts "$YOUR_FRONTEND_DIR/src/pages/api/frontend/localhost-graphql-fetch.ts"` <- important for doing authenticated actions, but _do not commit this change in frontend!_, in case you are also working there.

In case of registering new user head to `localhost:4436` to get the verification link.

## Developing with Ory Kratos

### Integrating with Keycloak

First of all add `nbp` as host  
`sudo bash -c "echo '127.0.0.1	nbp'" >> /etc/hosts`

_why do I need it? Kratos makes a request to the url of the oauth2 provider, but since its running inside a container, it can't easily use host port. nbp is a dns that is discoverable for the kratos container, so the host can use it also._

Run `yarn start:nbp`.

Keycloak UI is available on `nbp:11111` (username: admin, pw: admin).  
There you have to configure Serlo as a client.

> Client -> Create Client
>
> ```
> id: serlo
> home and root url: http://localhost:3000
> redirect uri: http://localhost:4433/self-service/methods/oidc/callback/nbp
> ```

Get the credentials and go to `kratos/config.yml`:

```yaml
selfservice:
  methods:
    oidc:
      enabled: true
      config:
        providers:
          - id: nbp
            provider: generic
            client_id: serlo
            client_secret: <put secret here>
```

Run the local frontend (not forgetting to change in .env to local) to test.

Documentation:

- Kratos
  - [Configuration File](https://www.ory.sh/docs/kratos/reference/configuration)
  - [General instructions](https://www.ory.sh/docs/kratos/social-signin/generic) (select 'Ory CLI')
- [Keycloak](https://www.keycloak.org/docs/latest/server_admin/index.html#con-server-oidc-uri-endpoints_server_administration_guide)

### Email templates

Kratos has to be rebuilt every time you change an email template. Use the following workflow:

1. Edit templates.
2. Run `yarn kratos:rebuild`
3. Test the verification or the recovery email at `localhost:4436`. Repeat the process.

### Writing an import script

We are still in the phase of importing data from the legacy database into the kratos one.  
From now on let's prefer imports using python for the simple reason that
we want to use the very same script in terraform and terraform template files
the $ may interfere with javascript $ in string interpolation.

```
$ python3 -m venv .venv
$ source .venv/bin/activate
(.venv) $ pip install -r requirements.txt
(.venv) $ python3 path/to/import/script
...
# when you are done
(.venv) $ deactivate
$
```

## Developing with Rocket Chat

1.

```console
$ yarn start:chat -d # or start:chat:kratos:db-layer if you're developing in api at the same time
# wait +- 1 minute
$ yarn prepare:rocket-chat
Registering rocket chat as client in hydra

CLIENT ID a6c3e143-****** # It will be different every time
CLIENT SECRET rocket.chat
```

Copy the client Id.  
2. Rocket chat will be available in `localhost:3030`. Log in as admin using the username `dev` and password `123456`.  
3. Go to three dots -> Administration -> Workspace -> Settings -> OAuth2 -> Serlo and paste the client id that you got earlier in the `id`.  
4. `sudo bash -c "echo '127.0.0.1 hydra' >> /etc/hosts"`. This step is optional, but quite handy. Downside: at the end you are not going to see yourself inside of the rocket chat, because of dns name clash with the container.  
5. Logout and click on Serlo. You are going to be redirected to `http://hydra:4444...`. If you haven't done step 4, just change `hydra` with `localhost`.

Note that while developing you may want to change the links to chat in some files of frontend (`https://community.serlo.org` to `http://localhost:3030`).
