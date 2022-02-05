const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const fileUpload = require("express-fileupload");
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload());





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.to6vq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
async function run() {

    try {
        await client.connect();
        // console.log("hi db")
        const database = client.db("Assignment-11");
        const serviseCllection = database.collection("Servises");
        const usersCollection = database.collection("users");
        const orderCollection = database.collection("order")
        const reviewCollection = database.collection("reviews");



        // GET API 

        app.get('/order', async (req, res) => {
            const cursor = orderCollection.find({});
            const order = await cursor.toArray();
            res.send(order);

        })
        app.get('/Servises', async (req, res) => {
            const cursor = serviseCllection.find({});
            const services = await cursor.toArray();
            res.send(services);

        })


        // GET Single Service   no


        app.get("/order/:id", (req, res) => {
            console.log(req.params.id);
            orderCollection
                .find({ _id: ObjectId(req.params.id) })
                .toArray((err, results) => {
                    res.send(results[0]);
                });
        });
        app.get("/Servises/:id", (req, res) => {
            console.log(req.params.id);
            serviseCllection
                .find({ _id: ObjectId(req.params.id) })
                .toArray((err, results) => {
                    res.send(results[0]);
                });
        })

        // POST API 
        app.post('/Servises', async (req, res) => {
            const Service = req.body;
            console.log('hit the post api', Service);

            const result = await serviseCllection.insertOne(Service);
            console.log(result);
            res.json(result)
        });


        // Post a new order
        app.post("/order", async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.json(result);
        });

        app.post("/reviews", async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.json(result);
        });


        // add new user from registration form
        app.post("/users", async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        });

        //update product
        app.put("/update/:id", async (req, res) => {
            const id = req.params.id;
            const updatedName = req.body;
            const filter = { _id: ObjectId(id) };

            productsCollection
                .updateOne(filter, {
                    $set: {
                        name: updatedName.name,
                    },
                })
                .then((result) => {
                    res.send(result);
                });
        });

        // get all order by email query

        app.get("/order/:email", async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const orders = orderCollection.find(query);
            const result = await orders.toArray();
            res.json(result);
        });

        // Check if the user is admin or not
        app.get("/users/:email", async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === "admin") {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        });

        // DELETE API

        app.delete('/Servises/:id', async (req, res) => {
            const id = req.params.id;
            const query2 = { _id: ObjectId(id) };

            const result = await serviseCllection.deleteOne(query2);

            console.log('deleting user with id ', result);

            res.json(result);
        })
        app.delete("/order/:id", async (req, res) => {
            console.log(req.params.id);

            orderCollection
                .deleteOne({ _id: ObjectId(req.params.id) })
                .then((result) => {
                    res.send(result);
                });
        });
    }
    finally {
        // await client.close();
    }

}


run().catch(console.dir);


app.get("/", (req, res) => {
    res.send("hi there")
})


app.listen(port, () => {
    console.log("I am in port", port)
})