//require
const express = require('express');
const cors = require('cors');
const { ObjectId, MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

// port
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// mongodb
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@react-project.3kp3z2m.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

async function run() {
    try {
        // Connect the client to the server (optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        const db = client.db("ipitlibary");
        const bookCollections = db.collection("Books");

        // Insert a book to db: Post Method
        app.post("/upload-book", async (req, res) => {
            try {
                const data = req.body;
                const result = await bookCollections.insertOne(data);
                res.status(201).json(result.ops[0]);
            } catch (error) {
                console.error("Error inserting book:", error);
                res.status(500).json({ message: "Internal server error" });
            }
        });

        // Get all books from db
        app.get("/all-books", async (req, res) => {
            try {
                const books = await bookCollections.find().toArray();
                res.json(books);
            } catch (error) {
                console.error("Error fetching books:", error);
                res.status(500).json({ message: "Internal server error" });
            }
        });

        // Update a book
        app.patch("/book/:id", async (req, res) => {
            try {
                const id = req.params.id;
                const updateBookData = req.body;
                const filter = { _id: new ObjectId(id) };
                const options = { returnOriginal: false };
                const result = await bookCollections.findOneAndUpdate(filter, { $set: updateBookData }, options);
                res.json(result.value);
            } catch (error) {
                console.error("Error updating book:", error);
                res.status(500).json({ message: "Internal server error" });
            }
        });

        // Delete a book
        app.delete("/book/:id", async (req, res) => {
            try {
                const id = req.params.id;
                const filter = { _id: new ObjectId(id) };
                const result = await bookCollections.deleteOne(filter);
                res.json({ deletedCount: result.deletedCount });
            } catch (error) {
                console.error("Error deleting book:", error);
                res.status(500).json({ message: "Internal server error" });
            }
        });

        // Get a single book
        app.get("/book/:id", async (req, res) => {
            try {
                const id = req.params.id;
                const filter = { _id: new ObjectId(id) };
                const book = await bookCollections.findOne(filter);
                res.json(book);
            } catch (error) {
                console.error("Error fetching book:", error);
                res.status(500).json({ message: "Internal server error" });
            }
        });

        console.log("Connected to MongoDB!");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

run().catch(console.error);

app.listen(port, () => {
    console.log(`Backend is running on port ${port}`);
});
