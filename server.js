const express = require("express");
const app = express();
const port = 4000;

const { query } = require('./database');

app.use((req,res,next) => {
    res.on("finish", () => {
        console.log(`Request: ${req.method} ${req.originalUrl} ${res.statusCode}`);
    });
    next();
})
app.use(express.json());

app.get("/", (req, res)=>{
    res.send("Welcome to the api");
});

app.get('/books', async (req, res)=>{
    try{
        const allBooks = await query(`SELECT * FROM books`);
        res.status(200).json(allBooks.rows);
    } catch(error) {
        console.error(error);
    }
});

app.get('/books/:bookId', async (req, res)=>{
    const bookId = parseInt(req.params.bookId);
    try{
        const book = await query(`SELECT * FROM books WHERE id=$1`, [bookId]);

        if (book.rows.length > 0)
        {
            res.status(200).json(book.rows[0]);
        }
        else{
            res.status(404).send({message:"book not found"});
        }
    } catch(error) {
        console.error(error);
    }
});

app.post('/books', async (req, res)=>{
    const {bookTitle, author, genre, quantity} = req.body;

    try{
        const newBook = await query(
            `INSERT INTO books (bookTitle, author, genre, quantity) VALUES ($1, $2, $3, $4) RETURNING *`,
            [bookTitle, author, genre, quantity]
        );
        res.status(201).json(newBook.rows[0]);
    }catch(error)
    {
        console.error(error);
    }

});

// patch
app.patch('/books/:bookId', async (req, res)=>{
    const bookId = parseInt(req.params.bookId, 10);
    const {bookTitle, author, genre, quantity} = req.body;

    const fieldNames = [
        "bookTitle",
        "author",
        "genre",
        "quantity"
    ].filter( (name) => req.body[name]);

    let updatedValues = fieldNames.map(name => req.body[name]);
    const setValuesSQL = fieldNames.map((name, i) => {
        return `${name} = $${i+1}`
    }).join(', ');

    try{
        const updatedBook = await query(
            `UPDATE books SET ${setValuesSQL} WHERE id=$${fieldNames.length + 1} RETURNING *`,
            [...updatedValues, bookId]
          );
        
        if (updatedBook.rows.length > 0){
            res.status(201).json(updatedBook.rows[0]);
        } else {
            res.status(404).send({message: "book not found"});
        }
    }catch(error)
    {
        res.status(500).send({message:error.message});
        console.error(error);
    }

});

// delete
app.delete('/books/:bookId', async (req, res)=>{
    const bookId = parseInt(req.params.bookId);
    try{
        const book = await query(`DELETE FROM books WHERE id=$1`, [bookId]);

        if (book.rowCount > 0)
        {
            res.status(200).send({message: "Book deleted Successfully"});
        }
        else{
            res.status(404).send({message:"Book not found"});
        }
    } catch(error) {
        console.error(error);
    }
});

app.listen(port, ()=>{
    console.log(`Server is running at http://localhost:${port}`);
})