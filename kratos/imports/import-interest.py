import mysql.connector
import psycopg2

# TODO: add try

mysql_connection = mysql.connector.connect(
    host="localhost", database="serlo", user="root", password="secret"
)
if not mysql_connection.is_connected():
    raise Exception("Could not connect to mysql database")

postgres_connection = psycopg2.connect(
    database="kratos",
    host="localhost",
    user="serlo",
    password="secret",
)

mysql_cursor = mysql_connection.cursor()
# We don't need to check what is in columns field and value
# because in legacy all of them are 'interests' and 'teacher' respectively
mysql_cursor.execute("select user_id from user_field")

user_field_result = mysql_cursor.fetchall()
user_ids = tuple(map(lambda x: str(x), map(lambda x: x[0], user_field_result)))

postgres_cursor = postgres_connection.cursor()

# Introduce interest field
postgres_cursor.execute('update identities set traits = traits || \'{"interest": ""}\'')

postgres_cursor.execute(
    "update identities set traits = traits || '{\"interest\": \"teacher\"}' where metadata_public ->> 'legacy_id' in %s",
    [user_ids],
)

postgres_connection.commit()

mysql_connection.close()
postgres_connection.close()
