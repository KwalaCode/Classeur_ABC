import sqlite3

DATABASE = 'inventory.db'

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_db() as db:
        db.execute('''
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                unit_price REAL NOT NULL,
                annual_consumption INTEGER NOT NULL
            )
        ''')

def add_product(name, unit_price, annual_consumption):
    with get_db() as db:
        db.execute('INSERT INTO products (name, unit_price, annual_consumption) VALUES (?, ?, ?)',
                   (name, unit_price, annual_consumption))

def get_all_products():
    with get_db() as db:
        products = db.execute('SELECT * FROM products').fetchall()
        return [{
            'id': product['id'],
            'name': product['name'],
            'unit_price': product['unit_price'],
            'annual_consumption': product['annual_consumption'],
            'total_value': product['unit_price'] * product['annual_consumption']
        } for product in products]

def update_product(product_id, name, unit_price, annual_consumption):
    with get_db() as db:
        db.execute('UPDATE products SET name = ?, unit_price = ?, annual_consumption = ? WHERE id = ?',
                   (name, unit_price, annual_consumption, product_id))

def delete_product(product_id):
    with get_db() as db:
        db.execute('DELETE FROM products WHERE id = ?', (product_id,))