// Borrowed from https://github.com/mde/ejs/wiki/Using-EJS-with-Express

const { Client } = require('pg');

const client = new Client({
	user: 'postgres',
	password: '12345678',
	host: 'localhost',
	port: '5432',
	database: 'postgres',
});

client
	.connect()
	.then(() => {
		console.log('Connected to PostgreSQL database');
	})
	.catch((err) => {
		console.error('Error connecting to PostgreSQL database', err);
});

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
    // let result;
    client.query('SELECT * FROM weather_observations ORDER BY id DESC', (err, result) => {
        if (err) {
            console.error('Error executing query', err);
        } else {
            console.log('Query result:', result.rows);
            res.render('observations', {obs: result.rows})
        }
    });
    
})

app.get('/weather/update', (req, res) => {

    const id = req.query.id
    // Hent et element i listen efter id. Svarer til SELECT i SQL
    // const obs = observations.find( o => o.id == id ) 
    const action = 'update'
    
    const sql = "SELECT * FROM weather_observations WHERE id = $1"
    const values = [id] 
    client.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error executing query', err);
        } else {
            console.log('Query result:', result.rows);
            res.render('observation_form', {obs: result.rows[0], action: action})
        }
    });
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
    
    // console.log("observations: ", observations)

    const id = req.body.id
    const condition = req.body.condition
    
    const sql =
        'UPDATE weather_observations SET condition = $2 WHERE id = $1 RETURNING *';
    const values = [id, condition];

    client.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting data', err);
        } else {
            console.log('Data inserted successfully');
        }
    });
	

    // console.log("observations': ", observations)

    res.redirect('/weather')
})

app.post('/weather/create', (req, res) => {
    console.log('req.body: ', req.body)
    console.log("observations: ", observations)

    const id = Date.now().valueOf()
    const condition = req.body.condition
    // const obs = {id: id, condition: condition}
    // observations.push(obs)

    const sql =
        'INSERT INTO weather_observations(id, condition) VALUES ($1, $2) RETURNING *    ';
    const values = [id, condition];

    client.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting data', err);
        } else {
            console.log('Data inserted successfully');
        }
    });
	
    // console.log("observations': ", observations)

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

// client
// 	.end()
// 	.then(() => {
// 		console.log('Connection to PostgreSQL closed');
// 	})
// 	.catch((err) => {
// 		console.error('Error closing connection', err);
// 	});