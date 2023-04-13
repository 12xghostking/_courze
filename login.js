const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const path = require('path');
const cors = require('cors');
const stripe = require('stripe')('sk_test_51MjOQsSHaBzMkBVkC8uf3KuhfyzPHKKNdaEr2rvriiPCCdYaNtmZ5gDFQTmPiV7lhFQyJkX0c7YBCGXqEGulW6He00Kd21Ga8L');
const YOUR_DOMAIN = 'http://localhost:3000';
const connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'iamgreat000',
	database: 'courze'
});


const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public', { type: 'text/css' }));
app.get('/style.css', function (req, res) {
	res.setHeader('Content-Type', 'text/css');
	res.sendFile(path.join(__dirname + '/style.css'));
});
app.get('/login.js', function (req, res) {
	res.setHeader('Content-Type', 'application/javascript');
	res.sendFile(path.join(__dirname + '/login.js'));
});
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));
// http://localhost:3000/
app.get('/', function (request, response) {
	// Render login template
	response.sendFile(path.join(__dirname + '/login.html'));
});
// http://localhost:3000/auth
app.post('/auth', function (request, response) {
	// Capture the input fields
	let username = request.body.username;
	let password = request.body.password;
	// Ensure the input fields exists and are not empty
	if (username && password) {
		// Execute SQL query that'll select the account from the database based on the specified username and password
		connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function (error, results, fields) {
			// If there is an issue with the query, output the error
			if (error) throw error;
			// If the account exists
			if (results.length > 0) {
				// Authenticate the user
				request.session.loggedin = true;
				request.session.username = username;
				// Redirect to home page
				response.redirect('/home');
			} else {
				response.redirect('/incorrect');
			}
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.get('/home', function (request, response) {
	// If the user is logged in
	if (request.session.loggedin) {
		
		response.redirect(`${YOUR_DOMAIN}?username=` + request.session.username);
	} else {
		// Not logged in
		response.send('Please login to view this page!');
	}
});
app.get('/incorrect', function (request, response) {
	response.sendFile(path.join(__dirname + '/login1.html'));
});
app.post('/register', function (request, response) {
	let username = request.body.username;
	let password = request.body.password;
	let email = request.body.email;

	if (username && password && email) {
		connection.query('INSERT INTO accounts (username, password, email) VALUES (?, ?, ?)', [username, password, email], function (error, results, fields) {
			if (error) throw error;
			response.redirect('/');
			response.end();
		});
	} else {
		response.send('Please enter all required fields.');
		response.end();
	}
});
// Backend code

app.get('/api/courses', (req, res) => {
	connection.query('SELECT * FROM courses', (error, results) => {
		if (error) {
			console.error(error);
			res.status(500).json({ message: 'Failed to fetch courses' });
		} else {
			res.json(results);
		}
	});
});
app.get('/api/images/:filename', (req, res) => {
	const { filename } = req.params;
	res.sendFile(`${__dirname}/images/${filename}`);
});




app.post('/create-checkout-session', async (req, res) => {
	const { totalPrice } = req.body;
	const {username} = req.body;
	
	const session = await stripe.checkout.sessions.create({
	  line_items: [
		{
		  price_data: {
			currency: 'inr',
			unit_amount: totalPrice*100,
			product_data: {
			  name: 'Total cart cost',
			},
		  },
		  quantity: 1,
		},
	  ],
	  mode: 'payment',
    success_url: `${YOUR_DOMAIN}?username=${username}&success=true`,
    cancel_url: `${YOUR_DOMAIN}?username=${username}&canceled=true`,
  });

  res.redirect(303, session.url);
});


app.listen(4000);