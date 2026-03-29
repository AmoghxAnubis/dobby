"""Run the SQL migration directly against the Supabase PostgreSQL database."""
import psycopg2
import os

DB_HOST = "db.tgexqrvrohxqucqwlbcm.supabase.co"
DB_PORT = 5432
DB_NAME = "postgres"
DB_USER = "postgres"

SQL_FILE = os.path.join(os.path.dirname(__file__), "migrations", "001_initial_schema.sql")

def run_migration():
    with open(SQL_FILE, "r") as f:
        sql = f.read()

    print("Attempting direct PostgreSQL connection...")
    print(f"Host: {DB_HOST}")

    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            dbname=DB_NAME,
            user=DB_USER,
            password="postgres",
            connect_timeout=10,
        )
        conn.autocommit = True
        cur = conn.cursor()
        print("Connected! Running migration...")
        cur.execute(sql)
        print("Migration completed successfully!")
        cur.close()
        conn.close()
    except psycopg2.OperationalError as e:
        print(f"Connection failed: {e}")
        print()
        print("The direct PostgreSQL connection requires your database password.")
        print("This is the password you set when creating the Supabase project.")
        print()
        print("Please either:")
        print("  1. Run this script with your DB password:")
        print("     Set DB_PASSWORD env var and re-run")
        print("  2. Manually run the SQL in Supabase Dashboard SQL Editor:")
        print("     https://supabase.com/dashboard/project/tgexqrvrohxqucqwlbcm/sql/new")

if __name__ == "__main__":
    run_migration()
