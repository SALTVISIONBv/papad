// database.js - Basic IndexedDB initialization with debugging

// Database constants
const DB_NAME = "MuundoConfigurator";
const DB_VERSION = 1;

// Debug function to log messages to console
function debugLog(message) {
    console.log("[MuundoDB] " + message);
}

// Initialize the database
// Update your database.js initialization function

function initDatabase() {
    return new Promise((resolve, reject) => {
        debugLog("Attempting to open database: MuundoConfigurator");

        const request = indexedDB.open("MuundoConfigurator", 1);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            debugLog("Database upgrade needed, creating object stores");
            
            // Create product catalog store if it doesn't exist
            if (!db.objectStoreNames.contains("ProductCatalog")) {
                const productStore = db.createObjectStore("ProductCatalog", { keyPath: "Article" });
                // Add indexes for searching
                productStore.createIndex("CategoryIndex", "Category", { unique: false });
                productStore.createIndex("NameIndex", "Name", { unique: false });
                debugLog("Created ProductCatalog object store");
            }
            
            // Create user configurations store if it doesn't exist
            if (!db.objectStoreNames.contains("UserConfigurations")) {
                const userConfigStore = db.createObjectStore("UserConfigurations", { keyPath: "userId" });
                debugLog("Created UserConfigurations object store");
            }
        };
        
        request.onsuccess = (event) => {
            const db = event.target.result;
            debugLog("Database initialized successfully");
            resolve(db);
        };
        
        request.onerror = (event) => {
            const errorMsg = "Error opening database: " + event.target.error;
            debugLog(errorMsg);
            reject(errorMsg);
        };
    });
}

// Function to check if database exists and is accessible
function checkDatabase() {
    debugLog("Testing database connection...");
    initDatabase()
        .then(db => {
            debugLog("Connection successful! DB Version: " + db.version);
            
            // List all object stores
            const storeNames = Array.from(db.objectStoreNames);
            debugLog("Object stores: " + storeNames.join(", "));
            
            // Close the connection
            db.close();
            
            // Display success in console with styled message
            console.log("%c ✓ IndexedDB initialized successfully ", 
                       "background: #4CAF50; color: white; padding: 5px; border-radius: 3px;");
        })
        .catch(error => {
            debugLog("Connection failed: " + error);
            
            // Display error in console
            console.error("%c ✗ IndexedDB initialization failed ", 
                         "background: #F44336; color: white; padding: 5px; border-radius: 3px;", error);
        });
}

// Auto-run check when script loads
setTimeout(checkDatabase, 1000);  // Slight delay to ensure page is fully loaded

// Add these functions to your existing database.js file

// Store a product in the database
function storeProduct(productData) {
    return new Promise((resolve, reject) => {
        debugLog("Attempting to store product: " + productData.Article);
        
        initDatabase().then(db => {
            const transaction = db.transaction("ProductCatalog", "readwrite");
            const store = transaction.objectStore("ProductCatalog");
            
            // Convert string to object if necessary
            let productObj = typeof productData === 'string' ? JSON.parse(productData) : productData;
            
            const request = store.put(productObj);
            
            request.onsuccess = (event) => {
                debugLog("Product stored successfully: " + productObj.Article);
                db.close();
                resolve(true);
            };
            
            request.onerror = (event) => {
                const errorMsg = "Error storing product: " + event.target.error;
                debugLog(errorMsg);
                db.close();
                reject(errorMsg);
            };
        }).catch(error => {
            reject("Database initialization failed: " + error);
        });
    });
}

// Retrieve a product from the database
function getProduct(articleId) {
    return new Promise((resolve, reject) => {
        debugLog("Attempting to retrieve product: " + articleId);
        
        initDatabase().then(db => {
            const transaction = db.transaction("ProductCatalog", "readonly");
            const store = transaction.objectStore("ProductCatalog");
            
            const request = store.get(articleId);
            
            request.onsuccess = (event) => {
                const product = event.target.result;
                if (product) {
                    debugLog("Product retrieved successfully: " + articleId);
                    db.close();
                    resolve(JSON.stringify(product));
                } else {
                    const errorMsg = "Product not found: " + articleId;
                    debugLog(errorMsg);
                    db.close();
                    reject(errorMsg);
                }
            };
            
            request.onerror = (event) => {
                const errorMsg = "Error retrieving product: " + event.target.error;
                debugLog(errorMsg);
                db.close();
                reject(errorMsg);
            };
        }).catch(error => {
            reject("Database initialization failed: " + error);
        });
    });
}

// Get all products from the database
function getAllProducts() {
    return new Promise((resolve, reject) => {
        debugLog("Attempting to retrieve all products");
        
        initDatabase().then(db => {
            const transaction = db.transaction("ProductCatalog", "readonly");
            const store = transaction.objectStore("ProductCatalog");
            const request = store.getAll();
            
            request.onsuccess = (event) => {
                const products = event.target.result;
                debugLog("Retrieved " + products.length + " products");
                db.close();
                resolve(JSON.stringify(products));
            };
            
            request.onerror = (event) => {
                const errorMsg = "Error retrieving products: " + event.target.error;
                debugLog(errorMsg);
                db.close();
                reject(errorMsg);
            };
        }).catch(error => {
            reject("Database initialization failed: " + error);
        });
    });
}

// Delete a product from the database
function deleteProduct(articleId) {
    return new Promise((resolve, reject) => {
        debugLog("Attempting to delete product: " + articleId);
        
        initDatabase().then(db => {
            const transaction = db.transaction("ProductCatalog", "readwrite");
            const store = transaction.objectStore("ProductCatalog");
            
            const request = store.delete(articleId);
            
            request.onsuccess = (event) => {
                debugLog("Product deleted successfully: " + articleId);
                db.close();
                resolve(true);
            };
            
            request.onerror = (event) => {
                const errorMsg = "Error deleting product: " + event.target.error;
                debugLog(errorMsg);
                db.close();
                reject(errorMsg);
            };
        }).catch(error => {
            reject("Database initialization failed: " + error);
        });
    });
}

// Test storing a sample product
function testProductStorage() {
    debugLog("Testing product storage...");
    
    // Create a sample product
    const sampleProduct = {
        Article: "TEST001",
        Name: "Test Product",
        Category: "Test",
        Width: 100,
        Height: 75,
        Depth: 50,
        Weight: 25,
        Price: 199.99,
        MaterialOptions: ["Wood", "Metal", "Glass"],
        Description: "This is a test product"
    };
    
    // Store the product
    storeProduct(sampleProduct)
        .then(() => {
            debugLog("Sample product stored, now retrieving it...");
            return getProduct("TEST001");
        })
        .then(productJson => {
            const retrievedProduct = JSON.parse(productJson);
            debugLog("Retrieved product name: " + retrievedProduct.Name);
            
            if (retrievedProduct.Name === "Test Product") {
                console.log("%c ✓ Product storage test passed! ", 
                           "background: #4CAF50; color: white; padding: 5px; border-radius: 3px;");
            } else {
                console.error("%c ✗ Product retrieval mismatch! ", 
                             "background: #F44336; color: white; padding: 5px; border-radius: 3px;");
            }
            
            return getAllProducts();
        })
        .then(allProductsJson => {
            const allProducts = JSON.parse(allProductsJson);
            debugLog("Total products in database: " + allProducts.length);
        })
        .catch(error => {
            console.error("%c ✗ Product storage test failed! ", 
                         "background: #F44336; color: white; padding: 5px; border-radius: 3px;", error);
        });
}

// Expose test function for manual testing
window.testProductStorage = testProductStorage;

// Add these functions to your existing database.js file

// Store user configuration in the database
function storeUserConfig(configData) {
    return new Promise((resolve, reject) => {
        debugLog("Attempting to store user configuration: " + configData.userId);
        
        initDatabase().then(db => {
            const transaction = db.transaction("UserConfigurations", "readwrite");
            const store = transaction.objectStore("UserConfigurations");
            
            // Convert string to object if necessary
            let configObj = typeof configData === 'string' ? JSON.parse(configData) : configData;
            
            const request = store.put(configObj);
            
            request.onsuccess = (event) => {
                debugLog("User configuration stored successfully: " + configObj.userId);
                db.close();
                resolve(true);
            };
            
            request.onerror = (event) => {
                const errorMsg = "Error storing user configuration: " + event.target.error;
                debugLog(errorMsg);
                db.close();
                reject(errorMsg);
            };
        }).catch(error => {
            reject("Database initialization failed: " + error);
        });
    });
}

// Retrieve a user configuration from the database
function getUserConfig(userId) {
    return new Promise((resolve, reject) => {
        debugLog("Attempting to retrieve user configuration: " + userId);
        
        initDatabase().then(db => {
            const transaction = db.transaction("UserConfigurations", "readonly");
            const store = transaction.objectStore("UserConfigurations");
            
            const request = store.get(userId);
            
            request.onsuccess = (event) => {
                const config = event.target.result;
                if (config) {
                    debugLog("User configuration retrieved successfully: " + userId);
                    db.close();
                    resolve(JSON.stringify(config));
                } else {
                    const errorMsg = "User configuration not found: " + userId;
                    debugLog(errorMsg);
                    db.close();
                    reject(errorMsg);
                }
            };
            
            request.onerror = (event) => {
                const errorMsg = "Error retrieving user configuration: " + event.target.error;
                debugLog(errorMsg);
                db.close();
                reject(errorMsg);
            };
        }).catch(error => {
            reject("Database initialization failed: " + error);
        });
    });
}

// Delete a user configuration from the database
function deleteUserConfig(userId) {
    return new Promise((resolve, reject) => {
        debugLog("Attempting to delete user configuration: " + userId);
        
        initDatabase().then(db => {
            const transaction = db.transaction("UserConfigurations", "readwrite");
            const store = transaction.objectStore("UserConfigurations");
            
            const request = store.delete(userId);
            
            request.onsuccess = (event) => {
                debugLog("User configuration deleted successfully: " + userId);
                db.close();
                resolve(true);
            };
            
            request.onerror = (event) => {
                const errorMsg = "Error deleting user configuration: " + event.target.error;
                debugLog(errorMsg);
                db.close();
                reject(errorMsg);
            };
        }).catch(error => {
            reject("Database initialization failed: " + error);
        });
    });
}

// Test user configuration storage
// Test user configuration storage
function testUserConfigStorage() {
    debugLog("Testing user configuration storage...");
    
    // Create a sample user configuration
    const sampleConfig = {
        userId: "user123",
        displayName: "Test User",
        theme: "dark",
        language: "en",
        savedProductIds: ["TEST001", "UNITY001"],
        customSettings: {
            showPrices: true,
            enableNotifications: false,
            zoomLevel: 1.2
        },
        lastLogin: new Date().toISOString()
    };
    
    // Store the configuration
    return storeUserConfig(sampleConfig)
        .then(() => {
            debugLog("Sample user configuration stored, now retrieving it...");
            return getUserConfig("user123");
        })
        .then(configJson => {
            const retrievedConfig = JSON.parse(configJson);
            debugLog("Retrieved user configuration name: " + retrievedConfig.displayName);
            
            if (retrievedConfig.displayName === "Test User") {
                console.log("%c ✓ User configuration storage test passed! ", 
                           "background: #4CAF50; color: white; padding: 5px; border-radius: 3px;");
                return true;
            } else {
                console.error("%c ✗ User configuration retrieval mismatch! ", 
                             "background: #F44336; color: white; padding: 5px; border-radius: 3px;");
                return false;
            }
        })
        .catch(error => {
            console.error("%c ✗ User configuration storage test failed! ", 
                         "background: #F44336; color: white; padding: 5px; border-radius: 3px;", error);
            throw error;
        });
}

// Export all database data as JSON
function exportDatabaseData() {
    return new Promise((resolve, reject) => {
        debugLog("Exporting all database data");
        
        const exportData = {
            products: [],
            userConfigurations: [],
            version: "1.0",
            exportDate: new Date().toISOString()
        };
        
        // First get all products
        getAllProducts()
            .then(productsJson => {
                exportData.products = JSON.parse(productsJson);
                debugLog(`Exported ${exportData.products.length} products`);
                
                // Then get all user configurations
                return getAllUserConfigurations();
            })
            .then(configs => {
                exportData.userConfigurations = configs;
                debugLog(`Exported ${exportData.userConfigurations.length} user configurations`);
                
                // Convert to JSON string
                const exportJson = JSON.stringify(exportData, null, 2);
                resolve(exportJson);
            })
            .catch(error => {
                reject("Error exporting database data: " + error);
            });
    });
}

// Get all user configurations
function getAllUserConfigurations() {
    return new Promise((resolve, reject) => {
        debugLog("Getting all user configurations");
        
        initDatabase().then(db => {
            const transaction = db.transaction("UserConfigurations", "readonly");
            const store = transaction.objectStore("UserConfigurations");
            const request = store.getAll();
            
            request.onsuccess = (event) => {
                const configs = event.target.result;
                debugLog("Retrieved " + configs.length + " user configurations");
                db.close();
                resolve(configs);
            };
            
            request.onerror = (event) => {
                const errorMsg = "Error retrieving user configurations: " + event.target.error;
                debugLog(errorMsg);
                db.close();
                reject(errorMsg);
            };
        }).catch(error => {
            reject("Database initialization failed: " + error);
        });
    });
}

// Import database data from JSON
function importDatabaseData(jsonData) {
    return new Promise((resolve, reject) => {
        debugLog("Importing database data");
        
        let importData;
        try {
            // Parse the JSON if it's a string
            if (typeof jsonData === 'string') {
                importData = JSON.parse(jsonData);
            } else {
                importData = jsonData;
            }
            
            // Validate the import data structure
            if (!importData.products || !importData.userConfigurations) {
                throw new Error("Invalid import data format");
            }
            
            debugLog(`Found ${importData.products.length} products and ${importData.userConfigurations.length} user configurations to import`);
            
            // Import all products
            const productPromises = importData.products.map(product => {
                return storeProduct(JSON.stringify(product));
            });
            
            // Import all user configurations
            const configPromises = importData.userConfigurations.map(config => {
                return storeUserConfig(JSON.stringify(config));
            });
            
            // Wait for all imports to complete
            Promise.all([...productPromises, ...configPromises])
                .then(() => {
                    debugLog("Successfully imported all data");
                    resolve({
                        success: true,
                        productsImported: importData.products.length,
                        configurationsImported: importData.userConfigurations.length
                    });
                })
                .catch(error => {
                    reject("Error during import: " + error);
                });
                
        } catch (e) {
            reject("Error parsing or processing import data: " + e.message);
        }
    });
}

// Generate a download of the database content
function downloadDatabaseExport() {
    debugLog("Generating database export download");
    
    exportDatabaseData()
        .then(jsonData => {
            // Create a download link
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(jsonData);
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "muundo_database_export_" + new Date().toISOString().slice(0,10) + ".json");
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
            
            debugLog("Database export download initiated");
        })
        .catch(error => {
            console.error("Failed to generate export: " + error);
        });
}

// Test the export/import functionality
function testExportImport() {
    debugLog("Testing export/import functionality");
    
    // Create test data if the database is empty
    let testProductCreated = false;
    let testUserCreated = false;
    
    // Check if test product exists
    getProduct("EXPORT_TEST")
        .catch(() => {
            // Create test product if it doesn't exist
            const testProduct = {
                Article: "EXPORT_TEST",
                Name: "Export Test Product",
                Category: "Test",
                Width: 100,
                Height: 200,
                Depth: 50,
                Weight: 5,
                Price: 99.99,
                MaterialOptions: ["Wood", "Metal", "Plastic"],
                Description: "This is a test product for export/import"
            };
            
            return storeProduct(JSON.stringify(testProduct))
                .then(() => {
                    testProductCreated = true;
                    return Promise.resolve();
                });
        })
        .then(() => {
            // Check if test user exists
            return getUserConfig("export_test_user")
                .catch(() => {
                    // Create test user if it doesn't exist
                    const testUser = {
                        userId: "export_test_user",
                        displayName: "Export Test User",
                        theme: "dark",
                        language: "en",
                        savedProductIds: ["EXPORT_TEST"],
                        customSettings: {
                            showPrices: true,
                            enableNotifications: true,
                            zoomLevel: 1.0
                        },
                        lastLogin: new Date().toISOString()
                    };
                    
                    return storeUserConfig(JSON.stringify(testUser))
                        .then(() => {
                            testUserCreated = true;
                            return Promise.resolve();
                        });
                });
        })
        .then(() => {
            // Now export the database
            debugLog("Test data prepared, exporting database");
            return exportDatabaseData();
        })
        .then(exportJson => {
            debugLog("Database exported, now clearing and reimporting");
            
            // Clear the test data
            const clearPromises = [];
            if (testProductCreated) {
                clearPromises.push(deleteProduct("EXPORT_TEST"));
            }
            if (testUserCreated) {
                clearPromises.push(deleteUserConfig("export_test_user"));
            }
            
            return Promise.all(clearPromises)
                .then(() => {
                    // Now import the data back
                    return importDatabaseData(exportJson);
                });
        })
        .then(result => {
            // Verify the import by checking if our test data is back
            debugLog(`Import completed: ${result.productsImported} products, ${result.configurationsImported} configurations`);
            
            // Check if the product is back
            return getProduct("EXPORT_TEST")
                .then(productJson => {
                    const product = JSON.parse(productJson);
                    if (product.Name === "Export Test Product") {
                        debugLog("Successfully verified product import");
                        
                        // Check if the user is back
                        return getUserConfig("export_test_user");
                    } else {
                        throw new Error("Imported product data doesn't match original");
                    }
                })
                .then(userJson => {
                    const user = JSON.parse(userJson);
                    if (user.displayName === "Export Test User") {
                        debugLog("Successfully verified user configuration import");
                        console.log("%c ✓ Export/Import test passed! ", 
                                   "background: #4CAF50; color: white; padding: 5px; border-radius: 3px;");
                        return true;
                    } else {
                        throw new Error("Imported user data doesn't match original");
                    }
                });
        })
        .catch(error => {
            console.error("%c ✗ Export/Import test failed! ", 
                         "background: #F44336; color: white; padding: 5px; border-radius: 3px;", error);
        });
}

// Expose functions for global access
window.exportDatabaseData = exportDatabaseData;
window.importDatabaseData = importDatabaseData;
window.downloadDatabaseExport = downloadDatabaseExport;
window.testExportImport = testExportImport;

