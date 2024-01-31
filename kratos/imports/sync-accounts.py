from dotenv import load_dotenv
import os
import psycopg2
import psycopg2.extras
import ory_client
from ory_client.api import identity_api
import requests

load_dotenv()

postgres_connection = None

kratos_config = ory_client.Configuration(host=os.getenv("KRATOS_HOST"))
kratos_client = ory_client.ApiClient(kratos_config)


def main():
    try:
        postgres_connection = psycopg2.connect(
            database="kratos",
            host=os.getenv("POSTGRES_HOST"),
            user="serlo",
            password=os.getenv("POSTGRES_PASSWORD"),
        )
        postgres_cursor = postgres_connection.cursor(
            cursor_factory=psycopg2.extras.RealDictCursor
        )
        postgres_cursor.execute(
            "SELECT * FROM identities WHERE (metadata_public->'legacy_id') is null"
        )
        unsynced_accounts = postgres_cursor.fetchall()
        print(f"{len(unsynced_accounts)} accounts to be synchronized")

        kratos_admin = identity_api.IdentityApi(kratos_client)

        for account in unsynced_accounts:
            response = requests.post(
                os.getenv("DB_LAYER_HOST"),
                json={
                    "type": "UserCreateMutation",
                    "payload": {
                        "username": account["traits"]["username"],
                        "email": account["traits"]["email"],
                        "password": account["id"],
                    },
                },
            )
            kratos_response = None
            print(account["metadata_public"] is dict)
            if response.status_code == 200:
                legacy_id = {"legacy_id": response.json()["userId"]}
                kratos_response = kratos_admin.update_identity(
                    account["id"],
                    update_identity_body={
                        **account,
                        "metadata_public": dict(legacy_id, **account["metadata_public"])
                        if isinstance(account["metadata_public"], dict)
                        else legacy_id,
                    },
                )
            else:
                response = requests.post(
                    os.getenv("DB_LAYER_HOST"),
                    json={
                        "type": "AliasQuery",
                        "payload": {
                            "instance": "de",
                            "path": f"/user/profile/{account['traits']['username']}",
                        },
                    },
                )
                legacy_id = {"legacy_id": response.json()["id"]}
                kratos_response = kratos_admin.update_identity(
                    account["id"],
                    update_identity_body={
                        **account,
                        "metadata_public": dict(legacy_id, **account["metadata_public"])
                        if isinstance(account["metadata_public"], dict)
                        else legacy_id,
                    },
                )

            print(
                f"{kratos_response['traits']['username']} with legacy_id {kratos_response['metadata_public']['legacy_id']} was created"
            )
        print("Success")
    except Exception as exception:
        raise exception
    finally:
        if postgres_connection is not None:
            postgres_connection.close()


if __name__ == "__main__":
    main()
