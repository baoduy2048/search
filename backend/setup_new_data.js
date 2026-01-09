const { Client } = require('@elastic/elasticsearch');
const fs = require('fs');
const path = require('path');

const client = new Client({ node: 'http://localhost:9200' });

async function run() {
    try {
        console.log("Deleting old index 'book_index'...");
        try {
            await client.indices.delete({ index: 'book_index' });
        } catch (e) {
            console.log("Index not found or already deleted.");
        }

        console.log("Creating new index 'book_index' with updated settings...");
        await client.indices.create({
            index: 'book_index',
            body: {
                settings: {
                    analysis: {
                        analyzer: {
                            vi_mixed_analyzer: {
                                tokenizer: "icu_tokenizer",
                                filter: ["lowercase", "icu_folding"]
                            }
                        }
                    },
                    index: {
                        similarity: {
                            lm_scoring: {
                                type: "LMDirichlet"
                            }
                        }
                    }
                },
                mappings: {
                    properties: {
                        title: {
                            type: "text",
                            analyzer: "vi_mixed_analyzer",
                            fields: {
                                suggest: {
                                    type: "text",
                                    analyzer: "vi_mixed_analyzer"
                                }
                            }
                        },
                        description: {
                            type: "text",
                            analyzer: "vi_mixed_analyzer",
                            similarity: "lm_scoring"
                        },
                        author: { type: "text" },
                        publisher: { type: "keyword" },
                        price: { type: "text" }, // Price in JSON is string "27000"
                        product_url: { type: "keyword" },
                        image_url: { type: "keyword" }
                    }
                }
            }
        });

        console.log("Reading data file data-format.json...");
        const dataPath = path.join(__dirname, '../data/data-format.json');

        // Read file
        const fileContent = fs.readFileSync(dataPath, 'utf8');

        // Parse NDJSON lines
        const lines = fileContent.split(/\r?\n/).filter(line => line.trim() !== '');
        const body = lines.map(line => {
            // Handle potential "End of file expected" or trailing comma/brace issues by try-catch if necessary
            // But valid NDJSON should parse line by line.
            try {
                return JSON.parse(line);
            } catch (e) {
                console.error("Error parsing line:", line);
                return null;
            }
        }).filter(item => item !== null);

        if (body.length === 0) {
            console.log("No data found to index.");
            return;
        }

        console.log(`Indexing ${body.length / 2} documents...`);

        // Perform bulk index
        // We specify 'index: book_index' so the items without _index in metadata use this default.
        const bulkResponse = await client.bulk({
            index: 'book_index',
            body: body
        });

        if (bulkResponse.errors) {
            const erroredDocuments = [];
            bulkResponse.items.forEach((action, i) => {
                const operation = Object.keys(action)[0];
                if (action[operation].error) {
                    erroredDocuments.push({
                        status: action[operation].status,
                        error: action[operation].error,
                    });
                }
            });
            console.log("Bulk errors found:", erroredDocuments.slice(0, 3)); // Show first 3 errors
        } else {
            console.log("Indexed successfully.");
        }

    } catch (err) {
        console.error("Critical Error:", err);
    }
}

run();
