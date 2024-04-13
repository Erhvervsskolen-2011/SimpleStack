// Borrowed from https://github.com/mde/ejs/wiki/Using-EJS-with-Express

let express = require('express');
let app = express();

app.set('view engine', 'ejs');

// fra første demo... bruges ikke rigtigt af denne demo
app.get('/', (req, res) => {
  res.render('index', {foo: 'FOO'});
});

// Denne Array simulerer en engentlig datakilde
// Data indlæses når web-sitet startes med f.eks. `node index.js`
// Alle ændringer forsvinder når scriptet stopper

let observations = [{id: Date.now().toPrecision(), condition: "fair"}, 
                    {id: Date.now().valueOf()+1,   condition: "good"}
                ]


app.get('/weather', (req, res) => {
    res.render('observations', {obs: observations})
})

app.get('/weather/edit', (req, res) => {

    const id = req.query.id
    const obs = observations.find( o => o.id == id ) 

    // console.log('obs: ' + JSON.parse(JSON.stringify(obs)))

    // console.log('req.path: ' + JSON.parse(JSON.stringify(req.path)))
    // const path = req.path
    // const action = 'path.slice(path.lastIndexOf('/')+1)'
    // console.log(action)
    const action = 'edit'
    res.render('observation_form', {obs: obs, action: action})
})

app.listen(8080, () => console.log('Example app listening on port 8080!'));