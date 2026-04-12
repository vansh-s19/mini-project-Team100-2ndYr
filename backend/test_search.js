const axios = require('axios');

async function testSearch(query) {
    try {
        console.log(`Searching for: "${query}"`);
        const response = await axios.get(`http://localhost:5001/api/property/search?query=${encodeURIComponent(query)}`);
        console.log('Results:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
    }
}

async function run() {
    await testSearch('deed 03');
    await testSearch('123');
}

run();
