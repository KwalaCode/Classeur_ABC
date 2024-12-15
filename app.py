from flask import Flask, render_template, request, jsonify
from database import init_db, add_product, get_all_products, update_product, delete_product
import sqlite3

app = Flask(__name__)

# Initialize the database
init_db()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/products', methods=['GET', 'POST'])
def handle_products():
    if request.method == 'POST':
        data = request.json
        product_name = data['productName']
        unit_price = float(data['unitPrice'])
        annual_consumption = int(data['annualConsumption'])
        
        try:
            add_product(product_name, unit_price, annual_consumption)
            return jsonify({"message": "Product added successfully"}), 201
        except sqlite3.IntegrityError:
            return jsonify({"error": "Product name already exists"}), 400
    else:
        products = get_all_products()
        return jsonify(products)

@app.route('/api/products/<int:product_id>', methods=['PUT', 'DELETE'])
def handle_product(product_id):
    if request.method == 'PUT':
        data = request.json
        product_name = data['productName']
        unit_price = float(data['unitPrice'])
        annual_consumption = int(data['annualConsumption'])
        
        try:
            update_product(product_id, product_name, unit_price, annual_consumption)
            return jsonify({"message": "Product updated successfully"})
        except sqlite3.IntegrityError:
            return jsonify({"error": "Product name already exists"}), 400
    elif request.method == 'DELETE':
        delete_product(product_id)
        return jsonify({"message": "Product deleted successfully"})

@app.route('/api/abc-classification')
def get_abc_classification():
    products = get_all_products()
    total_value = sum(product['total_value'] for product in products)
    
    # Sort products by total value in descending order
    sorted_products = sorted(products, key=lambda x: x['total_value'], reverse=True)
    
    cumulative_value = 0
    for product in sorted_products:
        cumulative_value += product['total_value']
        if cumulative_value <= 0.8 * total_value:
            product['category'] = 'A'
        elif cumulative_value <= 0.95 * total_value:
            product['category'] = 'B'
        else:
            product['category'] = 'C'
    
    # Calculate summary
    summary = {
        'A': {'count': 0, 'value': 0},
        'B': {'count': 0, 'value': 0},
        'C': {'count': 0, 'value': 0}
    }
    
    for product in sorted_products:
        category = product['category']
        summary[category]['count'] += 1
        summary[category]['value'] += product['total_value']
    
    for category in summary:
        summary[category]['percentage'] = (summary[category]['value'] / total_value) * 100
    
    return jsonify({
        'products': sorted_products,
        'summary': summary
    })

if __name__ == '__main__':
    app.run(debug=True)