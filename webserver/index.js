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
// Som `id` bruger vi den numeriske værdi for `Date.now()`

let observations = [{id: Date.now().valueOf(), condition: "fair"}, 
                    {id: Date.now().valueOf()+1,   condition: "good"}
                ]


app.get('/weather', (req, res) => {
    res.render('observations', {obs: observations})
})

app.get('/weather/update', (req, res) => {

    const id = req.query.id
    // Hent et element i listen efter id. Svarer til SELECT i SQL
    const obs = observations.find( o => o.id == id ) 
    const action = 'update'
    res.render('observation_form', {obs: obs, action: action})
})

app.get('/weather/create', (req, res) => {
    // En nyt tomt object, som kan populere formen, 
    const obs = {id: '', condition: ''}
    const action = 'create'
    res.render('observation_form', {obs: obs, action: action})
})

app.get('/weather/delete', (req, res) => {
    const id = req.query.id
    // Hent et element i listen efter id. Svarer til SELECT i SQL
    const obs = observations.find( o => o.id == id ) 
    const action = 'delete'
    res.render('observation_form', {obs: obs, action: action})
})

// disse to linjer putter data i req.body
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.post('/weather/update', (req, res) => {
    console.log('req.body: ', req.body)
    // res.json(req.body)
    
    console.log("observations: ", observations)

    const id = req.body.id
    const condition = req.body.condition

    const obs = observations.find( o => o.id == id )
    obs.condition = condition

    console.log("observations': ", observations)

    res.redirect('/weather')
})

app.post('/weather/create', (req, res) => {
    console.log('req.body: ', req.body)
    console.log("observations: ", observations)

    const id = Date.now().valueOf()
    const condition = req.body.condition
    const obs = {id: id, condition: condition}
    observations.push(obs)

    console.log("observations': ", observations)

    res.redirect('/weather')
})

app.post('/weather/delete', (req, res) => {
    console.log('req.body: ', req.body)
    console.log("observations: ", observations)

    const id = req.body.id
    const i = observations.findIndex( o => o.id == id )
    // delete with splice (wierd...), see https://stackoverflow.com/questions/500606/deleting-array-elements-in-javascript-delete-vs-splice
    observations.splice(i, 1);

    console.log("observations': ", observations)

    res.redirect('/weather')
})


app.listen(8080, () => console.log('Example app listening on port 8080!'));