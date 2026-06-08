const axios = require('axios');

async function test() {
    try {
        const loginRes = await axios.post('http://localhost:5259/api/auth/login', {
            email: 'test@test.com',
            password: 'password123'
        });
        const token = loginRes.data.token;
        console.log("Logged in successfully. Token length: ", token.length);
        
        try {
            const subRes = await axios.get('http://localhost:5259/api/chapters/6', {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("Subject 6 Detail:", JSON.stringify(subRes.data, null, 2));
        } catch(e) {
            console.error("API Error fetching 6:", e.response ? e.response.status : e.message);
        }
    } catch (e) {
        console.error("Login Error:", e.response ? e.response.data : e.message);
    }
}

test();
