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

## Integrating local Serlo frontend

1. `cd $YOUR_FRONTEND_DIR`
2. Make sure to use the local environment in `.env`

```
NEXT_PUBLIC_ENV=local
# NEXT_PUBLIC_ENV=staging
```

3. `yarn dev`
   _Note: every time you change `.env`, you have to rerun `yarn dev`_

4. cd back to this repo directory and `cp graphql-fetch-cloudflare-auth.ts "$YOUR_FRONTEND_DIR/src/api/graphql-fetch.ts"` <- important for doing authenticated actions, but _do not commit this change in frontend!_, in case you are also working there.

In case of registering new user head to `localhost:4436` to get the verification link.

## Developing with Ory Kratos

### Integrating with Keycloak

First of all add `nbp` as host  
`sudo echo '127.0.0.1	nbp' >> /etc/hosts`

_why do I need it? Kratos makes a request to the url of the oauth2 provider, but since its running inside a container, it can't easily use host port. nbp is a dns that is discoverable for the kratos container, so the host can use it also._

Run `yarn start`.

Keycloak UI is available on `nbp:8080` (username: admin, pw: admin).  
There you have to configure Serlo as a client.

> Client -> Create Client
>
> ```
> id: serlo
> home and root url: http://localhost:3000
> redirect uri: http://localhost:4433/self-service/methods/oidc/callback/nbp, http://localhost:3000/auth/login,
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

```
yarn start:chat
```

Rocket chat will be available in `localhost:3030`.
You can log in as admin using the username `dev` and password `123456`.
Also go to your frontend directory and run:

```console
sed -i 's/https:\/\/community.serlo.org\//http:\/\/localhost:3030\//g' src/data/de/menu-data.ts
```

That way the link in menu will redirect you for the local rocket chat. _Do not commit this change!_
