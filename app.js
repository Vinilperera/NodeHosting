const express = require('express');
const { MongoClient } = require("mongodb");
const ejs = require('ejs');

const app = express();

// Replace the uri string with your connection string.
const uri = "mongodb+srv://Watchflix:P9rVbkZgzRN9Gdj5@cluster0.biflqxw.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri);

app.use(express.static('public'));
app.use('/css', express.static(__dirname + 'public.css'))

// Set up EJS as the template engine
app.engine('html', ejs.renderFile);
app.set('view engine', 'ejs');

// Route to display the movies
app.get('/', async(req, res) => {
    try {
        const database = client.db('Movie');
        const datasets = database.collection('dataset');
        const cursor = datasets.aggregate([{ $sample: { size: 6 } }]);
        const movies = [];
        await cursor.forEach(movie => {
            movies.push({
                _id: movie._id,
                imdbId: movie.imdbId,
                Title: movie.Title,
                Genre: movie.Genre,
                Poster: movie.Poster,
                Sentiment: movie.Sentiment
            });
        });

        // Render the index.html template with the movies data
        res.render('index', { movies });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

// Start the server
async function start() {
    try {
        await client.connect();
        console.log('Connected to MongoDB Atlas');

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
        });
    } catch (err) {
        console.error(err);
    }
}

start();