const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
require('dotenv').config();
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.hmvy7hf.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// console.log(uri);

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        req.decoded = decoded;
        next();
    })
}
async function run() {

    try {
        const serviceCollection = client.db('PersonalStylist').collection('services');
        const reviewCollection = client.db('PersonalStylist').collection('reviews')

        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
            res.send({ token })
        })

        app.get('/services', async (req, res) => {
            const query = {}
            const size = 3;
            const cursor = serviceCollection.find(query);
            const services = await cursor.limit(size).toArray();
            res.send(services);
        });
        app.get('/allservices', async (req, res) => {
            const query = {}

            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        });

        app.post('/reviews', async (req, res) => {

            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);


        })
        app.post('/addservice', async (req, res) => {

            const ser = req.body;
            const result = await serviceCollection.insertOne(ser);
            res.send(result);


        })





        app.get('/myreview', verifyJWT, async (req, res) => {


            let query = {};

            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }

            const cursor = reviewCollection.find(query);
            const myreviews = await cursor.toArray();
            res.send(myreviews);
        });

        app.get('/review', async (req, res) => {

            // const serviceId = req.params.id;
            let query = {};
            if (req.query.serviceId) {
                query = {
                    service: req.query.serviceId
                }
            }
            const cursor = reviewCollection.find(query).sort({ service: -1 });
            const reviews = await cursor.toArray();
            res.send(reviews);

        })

        app.delete('/myreview/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
        })

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
