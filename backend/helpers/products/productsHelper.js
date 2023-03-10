const { pool } = require('../../db/server.js');

// Function To Find Product List From Database By Category
const findProductsByCategory = async (categoryId) => {
    try {
        const SQL = 'SELECT * FROM products WHERE category_id=$1';
        const products = await pool.query(SQL, [categoryId]);
        return products.rows
        
    } catch (err) {
        console.log(err)
    }
    
};

// Function to Find All Products From Database Grouped By Category
const findProducts = async () => {
    try {
        const SQL = 'SELECT * FROM products GROUP BY category_id'
        const products = await pool.query(SQL);
        return products.rows
    } catch (err) {
        console.log(err);
    }
}
// Function To Get Product List From Database

const getProducts = async (req, res, next) => {
    try {
        const { category } = req.query;
        if (category) {
            const productsListByCategory = await findProductsByCategory(category);
            res.send(productsListByCategory);
        } else {
            const products = await findProducts();
            res.send(`Products Found: ${products}`);
        };
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
    
}


// Function To Find Product From Database By ID
const findProductById = async (productId) => {
    try {
        const SQL = 'SELECT * FROM products WHERE id=$1'
        const foundProduct = await pool.query(SQL, [productId]);
        return foundProduct.rows[0]
    } catch (err) {
        console.log(err)
    }
};

// Function To Get Product From Database By ID
const getProductById = async(req, res, next) => {
    try {
        const { id } = req.params;
        const product = await findProductById(id);
        res.send(product)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}


module.exports = { getProducts, getProductById }
