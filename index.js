const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;
require('dotenv').config();
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.hmvy7hf.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
console.log(uri);
async function run() {

    try {
        const serviceCollection = client.db('PersonalStylist').collection('services');

        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });

    }
    finally {


    }

}
run().catch(err => console.error(err));



app.get('/', (req, res) => {
    res.send('Glam Girl personal stylist server is running')
})

app.listen(port, () => {
    console.log(`Glam Girl personal stylist server running on ${port}`);
})
