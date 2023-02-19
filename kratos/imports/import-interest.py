from dotenv import load_dotenv
import mysql.connector
import os
import psycopg2

load_dotenv()

mysql_connection = None
postgres_connection = None

try:
    mysql_connection = mysql.connector.connect(
        host=os.getenv("MYSQL_HOST"),
        database="serlo",
        user=os.getenv("MYSQL_USER"),
        password=os.getenv("MYSQL_PASSWORD"),
    )
    if not mysql_connection.is_connected():
        raise Exception("Could not connect to mysql database")
    postgres_connection = psycopg2.connect(
        database="kratos",
        host=os.getenv("POSTGRES_HOST"),
        user="serlo",
        password=os.getenv("POSTGRES_PASSWORD"),
    )
    mysql_cursor = mysql_connection.cursor()
    # We don't need to check what is in columns `field` and `value`
    # because in legacy all of them are 'interests' and 'teacher' respectively
    mysql_cursor.execute("select user_id from user_field")
    user_field_result = mysql_cursor.fetchall()
    user_ids = tuple(map(lambda x: str(x), map(lambda x: x[0], user_field_result)))

    postgres_cursor = postgres_connection.cursor()
    postgres_cursor.execute(
        "UPDATE identities SET traits = traits || '{\"interest\": \"\"}' WHERE metadata_public ->> 'legacy_id' NOT IN %s",
        [user_ids],
    )
    postgres_cursor.execute(
        "UPDATE identities SET traits = traits || '{\"interest\": \"teacher\"}' WHERE metadata_public ->> 'legacy_id' IN %s",
        [user_ids],
    )
    postgres_connection.commit()
except Exception as exception:
    raise exception
finally:
    if mysql_connection is not None:
        mysql_connection.close()
    if postgres_connection is not None:
        postgres_connection.close()
