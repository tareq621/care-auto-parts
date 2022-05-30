const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const use = require('express/lib/response');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.k5dj1.mongodb.net/?retryWrites=true&w=majority`;

const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-shard-00-00.k5dj1.mongodb.net:27017,cluster0-shard-00-01.k5dj1.mongodb.net:27017,cluster0-shard-00-02.k5dj1.mongodb.net:27017/?ssl=true&replicaSet=atlas-hcxt4r-shard-0&authSource=admin&retryWrites=true&w=majority`;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized access' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        req.decoded = decoded;
        next()
    });
}

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

        app.get('/admin/:email', async (req, res) => {
            const email = req.params.email;
            const user = await userCollection.findOne({ email: email });
            const isAdmin = user.role === 'admin';
            console.log(isAdmin);
            res.send({ admin: isAdmin });
        })

        app.put('/users/admin/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;
            const requester = req.decoded.email;
            const requesterUser = await userCollection.findOne({ email: requester });
            if (requesterUser.role === 'admin') {
                const filter = { email: email };
                const updateDoc = {
                    $set: { role: 'admin' },
                };
                const result = await userCollection.updateOne(filter, updateDoc);
                res.send(result);
            }
            else {
                res.status(403).send({ message: 'Forbidden' })
            }

        })

        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET)
            res.send({ result, token });
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



        app.post('/order', async (req, res) => {
            const order = req.body;
            const orderResult = await orderCollection.insertOne(order);
            res.send(orderResult);
        });

        app.get('/order', verifyJWT, async (req, res) => {
            const allOrders = await orderCollection.find().toArray();
            res.send(allOrders);
        })

        app.get('/order', verifyJWT, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;
            if (email === decodedEmail) {
                const query = { email: email };
                const cursor = orderCollection.find(query);
                const orders = await cursor.toArray();
                return res.send(orders);
            }
            else {
                return res.status(403).send({ message: 'Forbidden access' });
            }
        })

        app.get('/order/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const orders = await orderCollection.findOne(query);
            res.send(orders);
        })

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

        app.delete('/order/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const OrderResult = await orderCollection.deleteOne(query);
            res.send(OrderResult);
        })

        app.delete('/purchase/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const purchaseResult = await purchaseCollection.deleteOne(query);
            res.send(purchaseResult);
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