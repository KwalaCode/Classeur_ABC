document.addEventListener('DOMContentLoaded', function() {
    const productForm = document.getElementById('productForm');
    const productList = document.getElementById('productList');
    const summaryDiv = document.getElementById('summary');
    const ctx = document.getElementById('abcChart').getContext('2d');
    let chart;

    productForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const productName = document.getElementById('productName').value;
        const unitPrice = document.getElementById('unitPrice').value;
        const annualConsumption = document.getElementById('annualConsumption').value;

        try {
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ productName, unitPrice, annualConsumption }),
            });

            if (response.ok) {
                productForm.reset();
                await loadProducts();
                await updateABCClassification();
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to add product');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while adding the product');
        }
    });

    async function loadProducts() {
        try {
            const response = await fetch('/api/products');
            const products = await response.json();
            productList.innerHTML = '';
            products.forEach(product => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${product.name}</td>
                    <td>$${product.unit_price.toFixed(2)}</td>
                    <td>${product.annual_consumption}</td>
                    <td>$${product.total_value.toFixed(2)}</td>
                    <td>${product.category || '-'}</td>
                    <td>
                        <button class="btn btn-sm btn-primary edit-btn" data-id="${product.id}">Edit</button>
                        <button class="btn btn-sm btn-danger delete-btn" data-id="${product.id}">Delete</button>
                    </td>
                `;
                productList.appendChild(row);
            });

            // Add event listeners for edit and delete buttons
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', editProduct);
            });
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', deleteProduct);
            });
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while loading products');
        }
    }

    async function updateABCClassification() {
        try {
            const response = await fetch('/api/abc-classification');
            const data = await response.json();
            
            // Update product list with categories
            productList.innerHTML = '';
            data.products.forEach(product => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${product.name}</td>
                    <td>$${product.unit_price.toFixed(2)}</td>
                    <td>${product.annual_consumption}</td>
                    <td>$${product.total_value.toFixed(2)}</td>
                    <td>${product.category}</td>
                    <td>
                        <button class="btn btn-sm btn-primary edit-btn" data-id="${product.id}">Edit</button>
                        <button class="btn btn-sm btn-danger delete-btn" data-id="${product.id}">Delete</button>
                    </td>
                `;
                productList.appendChild(row);
            });

            // Update summary
            summaryDiv.innerHTML = `
                <p>Category A: ${data.summary.A.count} products (${data.summary.A.percentage.toFixed(2)}% of total value)</p>
                <p>Category B: ${data.summary.B.count} products (${data.summary.B.percentage.toFixed(2)}% of total value)</p>
                <p>Category C: ${data.summary.C.count} products (${data.summary.C.percentage.toFixed(2)}% of total value)</p>
            `;

            // Update chart
            if (chart) {
                chart.destroy();
            }
            chart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: ['Category A', 'Category B', 'Category C'],
                    datasets: [{
                        data: [
                            data.summary.A.percentage,
                            data.summary.B.percentage,
                            data.summary.C.percentage
                        ],
                        backgroundColor: ['#007bff', '#28a745', '#ffc107']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });

            // Add event listeners for edit and delete buttons
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', editProduct);
            });
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', deleteProduct);
            });
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while updating ABC classification');
        }
    }

    async function editProduct(e) {
        const productId = e.target.dataset.id;
        const row = e.target.closest('tr');
        const cells = row.querySelectorAll('td');

        const newName = prompt('Enter new product name:', cells[0].textContent);
        const newUnitPrice = prompt('Enter new unit price:', cells[1].textContent.slice(1));
        const newAnnualConsumption = prompt('Enter new annual consumption:', cells[2].textContent);

        if (newName && newUnitPrice && newAnnualConsumption) {
            try {
                const response = await fetch(`/api/products/${productId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        productName: newName,
                        unitPrice: newUnitPrice,
                        annualConsumption: newAnnualConsumption
                    }),
                });

                if (response.ok) {
                    await loadProducts();
                    await updateABCClassification();
                } else {
                    const data = await response.json();
                    alert(data.error || 'Failed to update product');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred while updating the product');
            }
        }
    }

    async function deleteProduct(e) {
        const productId = e.target.dataset.id;
        if (confirm('Are you sure you want to delete this product?')) {
            try {
                const response = await fetch(`/api/products/${productId}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    await loadProducts();
                    await updateABCClassification();
                } else {
                    const data = await response.json();
                    alert(data.error || 'Failed to delete product');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred while deleting the product');
            }
        }
    }

    // Initial load
    loadProducts();
    updateABCClassification();
});