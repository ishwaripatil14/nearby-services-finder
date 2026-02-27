import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def create_database():
    try:
        # Connect to default 'postgres' database
        conn = psycopg2.connect(
            dbname='postgres',
            user='postgres',
            password='123',
            host='localhost',
            port='5432'
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = conn.cursor()
        
        # Check if database exists
        cur.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = 'nearby_services'")
        exists = cur.fetchone()
        
        if not exists:
            print("Creating database 'nearby_services'...")
            cur.execute('CREATE DATABASE nearby_services')
            print("Database created successfully.")
        else:
            print("Database 'nearby_services' already exists.")
            
        cur.close()
        conn.close()
        
        # Now connect to the new database to enable PostGIS
        conn = psycopg2.connect(
            dbname='nearby_services',
            user='postgres',
            password='123',
            host='localhost',
            port='5432'
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = conn.cursor()
        
        print("Enabling PostGIS extension...")
        cur.execute('CREATE EXTENSION IF NOT EXISTS postgis')
        print("PostGIS enabled.")
        
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    create_database()
