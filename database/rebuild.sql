DROP TABLE IF EXISTS inventory, classification, account;

CREATE TABLE classification (
  classification_id SERIAL PRIMARY KEY,
  classification_name VARCHAR(255) NOT NULL
);

CREATE TABLE account (
  account_id SERIAL PRIMARY KEY,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  account_type VARCHAR(50) DEFAULT 'Client'
);

CREATE TABLE inventory (
  inv_id SERIAL PRIMARY KEY,
  inv_make VARCHAR(255),
  inv_model VARCHAR(255),
  inv_year INT,
  inv_description TEXT,
  inv_image VARCHAR(255),
  inv_thumbnail VARCHAR(255),
  inv_price NUMERIC,
  inv_miles INT,
  inv_color VARCHAR(50),
  classification_id INT REFERENCES classification(classification_id)
);

INSERT INTO classification (classification_name) VALUES ('Sport'), ('SUV'), ('Truck');

INSERT INTO inventory (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id)
VALUES
('GM', 'Hummer', 2022, 'A car with small interiors', '/images/hummer.jpg', '/images/thumbs/hummer.jpg', 60000, 5000, 'Black', 1),
('Toyota', 'Supra', 2023, 'A fast sports car', '/images/supra.jpg', '/images/thumbs/supra.jpg', 50000, 3000, 'Red', 1);

UPDATE inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_make = 'GM' AND inv_model = 'Hummer';

UPDATE inventory
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');
