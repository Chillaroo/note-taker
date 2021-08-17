const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const PORT = 3001;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

app.get('/', (req, res) =>
    res.sendFile(path.join(__dirname, '/public/index.html'))
);

app.get('/api/notes', (req, res) => {
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
        if (err) {
            console.err(err);
        } else {
            res.json(JSON.parse(data));
        }
    })
});

app.get('/notes', (req, res) =>
    res.sendFile(path.join(__dirname, '/public/notes.html'))
);

//POST request to add a note
app.post('/api/notes', (req, res) => {

    // Destructuring assignment for new items in req.body
    const { title, text, id } = req.body;

    // If all required properties are present
    if (title && text) {
        // Variable for the object we will save
        const newNote = {
            title,
            text,
            id: uuidv4()
        };

        // Obtain existing notes
        fs.readFile('./db/db.json', 'utf8', (err, data) => {
            if (err) {
                console.err(err);
            } else {
                // Convert string into JSON object
                let parsedNotes = JSON.parse(data);
                // Add a new note
                parsedNotes.push(newNote);
                // Write updated notes back to the file
                fs.writeFile('./db/db.json', JSON.stringify(parsedNotes, null, 4), (writeErr) =>
                    writeErr
                        ? console.err(writeErr)
                        : console.info('Successfully updated notes!')
                );
            }
        });

        const response = {
            status: 'success',
            body: newNote
        }

        console.log(response);
        res.json(newNote);
    } else {
        res.json('Error in posting note');
    }
});

// Delete a note
app.delete('/api/notes/:id', (req, res) => {

    // Obtain existing notes
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
        if (err) {
            console.err(err);
        } else {
            // Convert string into JSON object
            let parsedNotes = JSON.parse(data);

            // Delete a note
            let noteId = req.params.id;

            for (let i = 0; i < parsedNotes.length; i++) {
                const currentNote = parsedNotes[i];
                if (currentNote.id === noteId) {
                    parsedNotes.splice(i, 1);
                }
            }
            // Write updated notes back to the file
            fs.writeFile('./db/db.json', JSON.stringify(parsedNotes, null, 4), (writeErr) =>
                writeErr
                    ? console.err(writeErr)
                    : res.send('Successfully deleted notes!')
            );
        }
    });
});

app.listen(PORT, () =>
    console.log(`App listening at http://localhost:${PORT} 🚀`)
);



