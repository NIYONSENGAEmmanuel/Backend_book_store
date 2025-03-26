import express from "express";
import cors from "cors";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Configuration
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB successfully!");

    const booksCollections = client.db("BookInventory").collection("books");

    // GET all books
    app.get("/all-books", async (req, res) => {
      try {
        const books = await booksCollections.find().toArray();
        res.status(200).json(books);
      } catch (err) {
        console.error("Error fetching books:", err);
        res.status(500).json({ message: "Failed to fetch books" });
      }
    });

    // GET a single book by ID
    app.get("/book/:id", async (req, res) => {
      const id = req.params.id;
      try {
        const book = await booksCollections.findOne({ _id: new ObjectId(id) });
        if (!book) {
          return res.status(404).json({ message: "Book not found" });
        }
        res.status(200).json(book);
      } catch (err) {
        console.error("Error fetching book:", err);
        res.status(500).json({ message: "Failed to fetch book" });
      }
    });

    // POST a new book
    app.post("/upload-book", async (req, res) => {
      const data = req.body;
      try {
        const result = await booksCollections.insertOne(data);
        res.status(200).json(result); // Return result as JSON
      } catch (err) {
        console.error("Error uploading book:", err);
        res.status(500).json({ message: "Failed to upload book" });
      }
    });

    // PUT (update) a book by ID
    app.put("/update-book/:id", async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;
      try {
        const result = await booksCollections.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedData }
        );
        if (result.matchedCount === 0) {
          return res.status(404).json({ message: "Book not found" });
        }
        res.status(200).json({ message: "Book updated successfully!" });
      } catch (err) {
        console.error("Error updating book:", err);
        res.status(500).json({ message: "Failed to update book" });
      }
    });

    // DELETE a book by ID
    app.delete("/delete-book/:id", async (req, res) => {
      const id = req.params.id;
      try {
        const result = await booksCollections.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
          return res.status(404).json({ message: "Book not found" });
        }
        res.status(200).json({ message: "Book deleted successfully!" });
      } catch (err) {
        console.error("Error deleting book:", err);
        res.status(500).json({ message: "Failed to delete book" });
      }
    });

    app.get("/", (req, res) => {
      res.send("Server is running...");
    });

  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
  }
}

run().catch(err => console.error("MongoDB Connection Error:", err));

// Start the server
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});
