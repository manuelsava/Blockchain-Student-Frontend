const express = require("express");
var cors = require("cors");
const app = express();

const path = require("path");

const port = process.env.PORT || 3001;

app.use(cors());

if(process.env.NODE_ENV === 'production' || 'development') {
    app.use(express.static('build'));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'build', 'index.html'))
    })
}


app.listen(port, (err) => {
    if(err) return console.log(err);
    console.log("server running on port ", port);
})
