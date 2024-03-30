// const puppeteer = require('puppeteer');

// async function scrapeData() {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();

//     const categories = [{
//         "name": "Sofas Sectional Sofas Sofa Cum Beds Futons Chaise Loungers Bean Bags",
//         "subcategories": [
//             {
//                 "index": 1,
//                 "name": "Sofas",
//                 "anchor": {
//                     "href": "/category/sofas.html?type=hover-furniture-sofas",
//                     "text": "Sofas"
//                 }
//             },
//             {
//                 "index": 2,
//                 "name": "3 Seater Sofas",
//                 "anchor": {
//                     "href": "/category/3-seater-sofas.html?type=hover-furniture-sofas-3seatersofas",
//                     "text": "3 Seater Sofas"
//                 }
//             },
//             // Add more subcategories here
//         ]
//     }];

//     for (let categoryIndex = 0; categoryIndex < categories.length; categoryIndex++) {
//         const category = categories[categoryIndex];
//         const subcategories = category.subcategories;

//         for (let subcategoryIndex = 0; subcategoryIndex < subcategories.length; subcategoryIndex++) {
//             const subcategory = subcategories[subcategoryIndex];
//             const href = subcategory.anchor.href;

//             console.log(`Fetching data for subcategory: ${subcategory.name}`);

//             try {
//                 const url = `https://www.pepperfry.com${href}`;
                
//                 for (let pageNumber = 1; pageNumber <= 7; pageNumber++) {
//                     console.log(`Scraping Page ${pageNumber} of URL: ${url}&page=${pageNumber}`);

//                     await page.goto(`${url}&page=${pageNumber}`);
//                     await page.waitForSelector('div.clip-product-card-wrapper');

//                     const products = await page.evaluate(() => {
//                         const products = [];
//                         document.querySelectorAll('div.clip-product-card-wrapper').forEach(element => {
//                             const product = {};
//                             product.name = element.querySelector('.product-name').textContent.trim();
//                             product.brand = element.querySelector('.product-brand').textContent.trim();
//                             product.price = element.querySelector('.product-offer-price').textContent.trim();
//                             product.mrp = element.querySelector('.product-mrp-price').textContent.trim();
//                             product.discount = element.querySelector('.product-discount').textContent.trim();
//                             product.image = element.querySelector('.product-card-image img').getAttribute('src');
//                             products.push(product);
//                         });
//                         return products;
//                     });

//                     console.log(`Data for subcategory ${subcategory.name}, Page ${pageNumber}:`);
//                     console.log(products.map((product, index) => ({...product, index: index + 1})));
//                 }
//             } catch (error) {
//                 console.error(`Error fetching data for subcategory ${subcategory.name}: ${error.message}`);
//             }
//         }
//     }

//     await browser.close();
// }

// scrapeData();


const puppeteer = require('puppeteer');
const mysql = require('mysql');

async function scrapeData() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Define the list of subcategories with their hrefs
    const subcategories = [
      {
        "name": "Outdoor",
        "anchor": {
          "href": "/category/outdoor-furniture.html?type=hover-furniture-outdoor",
          "text": "Outdoor"
        }
      },
      {
        "name": "Swings",
        "anchor": {
          "href": "/category/swings.html?type=hover-furniture-outdoor-swings",
          "text": "Swings"
        }
      },
      {
        "name": "Outdoor Tables",
        "anchor": {
          "href": "/category/outdoor-tables.html?type=hover-furniture-outdoor-outdoortables",
          "text": "Outdoor Tables"
        }
      },
      {
        "name": "Table & Chair Sets",
        "anchor": {
          "href": "/category/table-and-chair-sets.html?type=hover-furniture-outdoor-tablechairsets",
          "text": "Table & Chair Sets"
        }
      },
      {
        "name": "Outdoor Seating",
        "anchor": {
          "href": "/category/outdoor-seating.html?type=hover-furniture-outdoor-outdoorseating",
          "text": "Outdoor Seating"
        }
      },
      {
        "name": "Plastic Chairs",
        "anchor": {
          "href": "/category/plastic-chairs.html?type=hover-furniture-outdoor-plasticchairs",
          "text": "Plastic Chairs"
        }
      },
      {
        "name": "Loungers",
        "anchor": {
          "href": "/category/loungers.html?type=hover-furniture-outdoor-loungers",
          "text": "Loungers"
        }
      },
      {
        "name": "Pet Furniture",
        "anchor": {
          "href": "/category/pets-furniture.html?type=hover-furniture-petfurniture",
          "text": "Pet Furniture"
        }
      },
      {
        "name": "Dog Furniture",
        "anchor": {
          "href": "/category/dog-furniture.html?type=hover-furniture-petfurniture-dogfurniture",
          "text": "Dog Furniture"
        }
      },
      {
        "name": "Cat Furniture",
        "anchor": {
          "href": "/category/cat-furniture.html?type=hover-furniture-petfurniture-catfurniture",
          "text": "Cat Furniture"
        }
      },
      {
        "name": "Bird Houses & Feeders",
        "anchor": {
          "href": "/category/bird-houses-and-feeders.html?type=hover-furniture-petfurniture-birdhousesfeeders",
          "text": "Bird Houses & Feeders"
        }
      },
      {
        "name": "Crates & Carriers",
        "anchor": {
          "href": "/category/pets-crates-and-carrier.html?type=hover-furniture-petfurniture-cratescarriers",
          "text": "Crates & Carriers"
        }
      }
    ];

    const allScrapedData = [];

    // MySQL database configuration
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'paper'
    });

    // Connect to the MySQL database
    connection.connect((err) => {
        if (err) {
            console.error('Error connecting to MySQL database:', err.message);
            return;
        }
        console.log('Connected to MySQL database');
    });

    try {
        // Create the 'furniture' table if it doesn't exist
        connection.query(`
            CREATE TABLE IF NOT EXISTS furniture (
                id INT AUTO_INCREMENT PRIMARY KEY,
                subcategory TEXT NOT NULL,
                name TEXT NOT NULL,
                brand TEXT NOT NULL,
                price TEXT NOT NULL,
                mrp TEXT NOT NULL,
                discount TEXT NOT NULL,
                image TEXT NOT NULL,
                UNIQUE KEY (name, brand, price, mrp, discount, image)
            )
        `, (err, result) => {
            if (err) {
                console.error('Error creating furniture table:', err.message);
                return;
            }
            console.log('Furniture table created or already exists');
        });

        for (let subcategoryIndex = 0; subcategoryIndex < subcategories.length; subcategoryIndex++) {
            const subcategory = subcategories[subcategoryIndex];
            let nextHref = subcategory.anchor.href;

            console.log(`Fetching data for subcategory: ${subcategory.name}`);

            let currentPage = 1;
            const scrapedData = [];

            while (currentPage <= 60 && nextHref) {
                const url = `https://www.pepperfry.com${nextHref}`;
                console.log(`Scraping Page ${currentPage} of URL: ${url}`);

                try {
                    await page.goto(`${url}&page=${currentPage}`, { timeout: 0 }); // Disable timeout

                    // Wait for the products to load
                    await page.waitForSelector('div.clip-product-card-wrapper');

                    const products = await page.evaluate(() => {
                        const products = [];
                        document.querySelectorAll('div.clip-product-card-wrapper').forEach(element => {
                            const product = {
                                name: element.querySelector('.product-name').textContent.trim(),
                                brand: element.querySelector('.product-brand').textContent.trim(),
                                price: element.querySelector('.product-offer-price').textContent.trim(),
                                mrp: element.querySelector('.product-mrp-price').textContent.trim(),
                                discount: element.querySelector('.product-discount').textContent.trim(),
                                image: element.querySelector('.product-card-image img').getAttribute('src')
                            };
                            products.push(product);
                        });
                        return products;
                    });

                    // Insert scraped data into the 'furniture' table
                    for (const product of products) {
                        connection.query('INSERT IGNORE INTO furniture (subcategory, name, brand, price, mrp, discount, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
                            [subcategory.name, product.name, product.brand, product.price, product.mrp, product.discount, product.image],
                            (err, results) => {
                                if (err) {
                                    console.error('Error inserting data into MySQL:', err.message);
                                    return;
                                }
                                if (results.affectedRows > 0) {
                                    console.log(`Inserted data for product: ${product.name}`);
                                } else {
                                    console.log(`Data for product ${product.name} already exists in the database`);
                                }
                            });
                    }

                    scrapedData.push(...products);

                    currentPage++;
                } catch (error) {
                    console.error(`Error fetching data: ${error.message}`);
                    console.log(`Moving to the next subcategory...`);
                    break; // Move to the next subcategory
                }
            }

            allScrapedData.push({
                subcategory: subcategory.name,
                data: scrapedData
            });

            console.log(`Finished scraping data for subcategory: ${subcategory.name}`);
        }

        console.log("All scraped data:");
        console.log(allScrapedData);
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }

    // Close the connection to the MySQL database
    connection.end((err) => {
        if (err) {
            console.error('Error closing MySQL connection:', err.message);
            return;
        }
        console.log('Closed MySQL connection');
    });

    await browser.close();
}

scrapeData();


