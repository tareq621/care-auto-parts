const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.k5dj1.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const purchaseCollection = client.db('assignment12').collection('products');
        const orderCollection = client.db('assignment12').collection('order');
        const reviewCollection = client.db('assignment12').collection('review');

        app.get('/purchase', async (req, res) => {
            const query = {};
            const cursor = purchaseCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        })

        app.get('/purchase/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const item = await purchaseCollection.findOne(query);
            res.send(item);
        });



        app.post('/order', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result);
        })
    }

    finally {

    }
}
run().catch(console.dir)


app.get('/', (req, res) => {
    res.send('Hello from auto parts')
})

app.listen(port, () => {
    console.log(`Auto parts app listening on port ${port}`)
})