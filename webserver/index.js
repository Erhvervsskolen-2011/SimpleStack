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
    const action = 'delete'    
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

// disse to linjer putter data i req.body
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.post('/weather/update', (req, res) => {
    console.log('req.body: ', req.body)
    
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
	
    res.redirect('/weather')
})

app.post('/weather/create', (req, res) => {
    console.log('req.body: ', req.body)
    // console.log("observations: ", observations)

    const id = Date.now().valueOf()
    const condition = req.body.condition
    
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
	
    res.redirect('/weather')
})

app.post('/weather/delete', (req, res) => {
    console.log('req.body: ', req.body)

    const id = req.body.id

    const sql = "DELETE FROM weather_observations WHERE id = $1"
    const values = [id] 
    client.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error executing query', err);
        } else {
            console.log('sql: ', sql);
            console.log('body: ', req.body);
            console.log('id: ', id);
            console.log('Query result:', result.rows);
        }
    });
    
    res.redirect('/weather')
})

app.listen(8080, () => console.log('Example app listening on port 8080!'));
