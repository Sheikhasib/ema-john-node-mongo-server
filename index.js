const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const cors = require('cors');
const app = express();
// const bodyParser = require('body-parser');
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express());
app.use(express.json());
// app.use(bodyParser.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fiz9x.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });



async function run () {
    try{
        await client.connect();
        // console.log('connected successfully');
        const database = client.db('online_shop');
        const productCollection = database.collection('products');
        const orderCollection = database.collection('orders');

        //GET products API
        app.get('/products', async(req, res) => {
            // console.log(req.query);
            const cursor = productCollection.find({});
            const page = req.query.page;
            const size = parseInt(req.query.size);
            let products;
            const count = await cursor.count();
            if(page){
                products = await cursor.skip(page*size).limit(size).toArray();
            }
            else{
                products = await cursor.toArray();
            }
                       
            res.send({
                count,
                products
            });
        });
        
        // use POST to get data by keys
        app.get('/product/:keys', async(req, res) => {
            console.log(req.params.keys);
            const allKeys = req.params.keys;
            const keys = allKeys.split(',');
            console.log(keys);
            const query = {key: {$in: keys}};
            const products = await productCollection.find(query).toArray();
            res.json(products);
        })

        // Add Order API
        app.post('/orders', async(req, res) => {
            const order = req.body;
            console.log('order', order);
            const result = await orderCollection.insertOne(order);
            res.json(result);
        })
    }
    finally{
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Ema-John server is running');
});

app.listen(port, () => {
    console.log('Server running at port', port);
})