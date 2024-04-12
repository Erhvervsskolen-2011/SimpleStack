// Borrowed from https://github.com/mde/ejs/wiki/Using-EJS-with-Express

let express = require('express');
let app = express();

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index', {foo: 'FOO'});
});

let observations = [{id: Date(), condition: "fair"}, 
                    {id: Date(), condition: "good"}
                ]
app.get('/weather', (req, res) => {
    res.render('observations', {obs: observations})
})

app.listen(8080, () => console.log('Example app listening on port 8080!'));