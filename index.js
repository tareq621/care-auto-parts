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
        const profileCollection = client.db('assignment12').collection('profile');
        const userCollection = client.db('assignment12').collection('users');

        app.get('/purchase', async (req, res) => {
            const query = {};
            const cursor = purchaseCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        });

        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })

        app.post('/purchase', async (req, res) => {
            const newParts = req.body;
            const result = await purchaseCollection.insertOne(newParts);
            res.send(result);
        });

        app.get('/purchase/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const item = await purchaseCollection.findOne(query);
            res.send(item);
        });


        app.get('/profile', async (req, res) => {
            const query = {};
            const cursor = profileCollection.find(query);
            const profiles = await cursor.toArray();
            res.send(profiles);
        });

        app.get('/profile/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const profileResult = await profileCollection.findOne(query);
            res.send(profileResult);
        });

        app.put('/dashboard/profile/:id', async (req, res) => {
            const id = req.params.id;
            const updateProfile = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: updateProfile.name,
                    email: updateProfile.email,
                    city: updateProfile.city,
                    zip: updateProfile.zip,
                    education: updateProfile.education,
                    phoneNumber: updateProfile.phoneNumber
                }
            };
            const result = await profileCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })

        app.post('/order', async (req, res) => {
            const order = req.body;
            const orderResult = await orderCollection.insertOne(order);
            res.send(orderResult);
        });

        app.get('/review', async (req, res) => {
            const query = {};
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        app.post('/review', async (req, res) => {
            const newReview = req.body;
            const reviewResult = await reviewCollection.insertOne(newReview);
            res.send(reviewResult);
        });

        app.post('/profile', async (req, res) => {
            const newProfile = req.body;
            const profileResult = await profileCollection.insertOne(newProfile);
            res.send(profileResult);

        });
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