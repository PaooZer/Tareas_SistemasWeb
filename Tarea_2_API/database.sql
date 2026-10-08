CREATE DATABASE IF NOT EXISTS universitienda;

USE universitienda;

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    stock INTEGER NOT NULL,
    description VARCHAR(500) NOT NULL,
    brand VARCHAR(100),
    img TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

INSERT INTO products (name, price, stock, description, brand, img)
VALUES (
    'Mouse de ejemplo',
    250.50,
    10,
    'Mouse para probar la API de productos.',
    'Nova',
    'mouse-ejemplo.jpg'
);