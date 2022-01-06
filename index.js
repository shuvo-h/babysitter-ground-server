// require and import 
const express = require('express');
const cors = require('cors')
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const { all } = require('express/lib/application');
require('dotenv').config();

const stripe = require("stripe")('sk_test_51JvkxdG4X8YjniOp7MII0fze13d04jXWWLpuFePeTrNTMUlx4epwekqrNBTN8ktbM0lU9rhKbbtC1i2JWhd3fnAE00i7a1CHd2');
// const stripe = require("stripe")(process.env.STRIPE_SECRET);
// console.log(`${process.env.STRIPE_SECRET}`);

// app and port 
const app = express();
const port = process.env.PORT || 5000;

// middle wear 
app.use(cors());
app.use(express.json());

// user info 
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uc5dq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// server run function 
async function run(){
    try{
        await client.connect();

        const database = client.db("babySitterGround");
        const servicesCollection = database.collection("Services");
        const babysDayCollection = database.collection("BabysDay");
        const parentsCollection = database.collection("Parents");
        const sittersCollection = database.collection("Sitters");
        const bookingCollection = database.collection("Bookings");
        const teamMemberCollection = database.collection("TeamMembers");
        const blogCollection = database.collection("Blogs");
        
        // GET API (to get all services)
        app.get("/services", async(req,res)=>{
            const query = {};
            const cursor = servicesCollection.find(query)
            const allServices = await cursor.toArray();
            res.json(allServices)
        })

        // POST API (to insert a new service info)
        app.post("/services", async(req,res)=>{
            const serviceInfo = req.body;
            const result = await servicesCollection.insertOne(serviceInfo);
            res.json(result)
        })

        // DELETE API (to delete a service by id)
        app.delete("/service/:serviceId", async(req,res)=>{
            const serviceID = req.params.serviceId;
            const query = {_id: ObjectId(serviceID)};
            const result = await servicesCollection.deleteOne(query);
            res.json(result);
        })

        app.get("/babysday", async(req,res)=>{
            const query = {};
            const cursor = babysDayCollection.find(query)
            const allBabysDay = await cursor.toArray();
            res.json(allBabysDay)
        })

        // GET API (to get all parents)
        app.get("/parents", async(req,res)=>{
            const query = {};
            const cursor = parentsCollection.find(query);
            const allParents = await cursor.toArray();
            res.json(allParents);
        })
        
        // POST API (to insert a new parent info)
        app.post("/parents", async(req,res)=>{
            const parentsInfo = req.body;
            const result = await parentsCollection.insertOne(parentsInfo);
            res.json(result)
        })

        // DELETE API (to delete a parent by id)
        app.delete("/parents/:parentId", async(req,res)=>{
            const parentsID = req.params.parentId;
            const query = {_id: ObjectId(parentsID)};
            const result = await parentsCollection.deleteOne(query);
            res.json(result);
        })

        // GET API (to get all sitters)
        app.get("/allSitters", async(req,res)=>{
            const query = {};
            const cursor = sittersCollection.find(query);
            const allSitters = await cursor.toArray();
            res.json(allSitters);
        })

        // POST API (to insert a new sitter)
        app.post("/sitters", async(req,res)=>{
            const sitterInfo = req.body;
            const result = await sittersCollection.insertOne(sitterInfo);
            res.json(result)
        })

         // DELETE API (to delete a sitter by id)
         app.delete("/sitters/:sitterId", async(req,res)=>{
            const sitterID = req.params.sitterId;
            const query = {_id: ObjectId(sitterID)};
            const result = await sittersCollection.deleteOne(query);
            res.json(result);
        })

         // GET API (to get all booking)
         app.get("/booking", async(req,res)=>{
            const query = {};
            const cursor = bookingCollection.find(query)
            const allBooking = await cursor.toArray();
            res.json(allBooking)
        })
        
         // POST API (to get parent specifiq booking list)
         app.post("/booking-list", async(req,res)=>{
            const parentEmail = req.body;
            const cursor = bookingCollection.find(parentEmail);
            const bookingList = await cursor.toArray()
            res.json(bookingList)
        })

        // POST API (to insert a new booking info)
        app.post("/booking", async(req,res)=>{
            const bookingInfo = req.body;
            const result = await bookingCollection.insertOne(bookingInfo);
            res.json(result)
        })

        // DELETE API (to delete a booking by id)
        app.delete("/booking/:bookingId", async(req,res)=>{
            const bookingID = req.params.bookingId;
            const query = {_id: ObjectId(bookingID)};
            const result = await bookingCollection.deleteOne(query);
            res.json(result);
        })
        
        // update payment status and add payment info to booking 
        app.put("/booking",async(req,res)=>{
            const paymentInfo = req.body;
            const filterBookingID = {_id: ObjectId(paymentInfo.bookingId)};
            
            const options = { upsert: true };
            const updateDoc = { $set: paymentInfo};
            const result = await bookingCollection.updateOne(filterBookingID, updateDoc, options);
            res.json(result);
        })

        // GET API (to get all team members)
        app.get("/teamMembers", async(req,res)=>{
            const query = {};
            const cursor = teamMemberCollection.find(query);
            const allMembers = await cursor.toArray();
            res.json(allMembers);
        })

        // payment API 
        app.post("/create-payment-intent", async (req, res) => {
            const paymentInfo = req.body;
            const amount = paymentInfo.price*100;
            
            // Create a PaymentIntent with the order amount and currency
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: "usd",
                payment_method_types: ["card"]
                // automatic_payment_methods: {
                //     enabled: true,
                // },
            });
        
            res.json({clientSecret: paymentIntent.client_secret,});
        });

        app.get("/blogs", async(req,res)=>{
            const blogs = blogCollection.find({});
            const allbblogs = await blogs.toArray()
            res.json(allbblogs)
        })
        app.post("/addBlog", async(req,res)=>{
            const blogInfo = req.body;
            const result = await blogCollection.insertOne(blogInfo);
            res.json(result)
        })
        

    }finally{
        // await client.close();
    }
}
run().catch(console.dir);

// initial test server run 
app.get('/',(req,res)=>{
    res.send("Running babySitter Server!")
})

// port listen  
app.listen(port,()=>{
    console.log("Server is running on port ",port);
})