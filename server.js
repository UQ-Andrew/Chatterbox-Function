// express server setup
const express =  require('express');
const app = express();
app.use(express.json());

// mysql setup
var mysql = require('mysql2');

var database = mysql.createConnection({
    host: "localhost",
    port: "3306",
    user: "AndrewI",
    password: 'localhost',
    database: "deco2850"
});
  
database.connect(function(err) {
    if (err) {
        console.log(err);
        database = null;
        console.log("Not connected to database");
    } else {
        console.log("Connected to database!");
    }
});

app.post('/get_messages', async (req, res)=> {
    if (database == null) {
        return;
    }
    database.query(`SELECT * FROM messages WHERE chatID IN 
        (SELECT id FROM chats WHERE (user1 = '${req.body.user1}' AND user2 = '${req.body.user2}')
        OR (user1 = '${req.body.user2}' AND user2 = '${req.body.user1}'))`, function (err, result, fields) {
        if (err) {
            res.status(400).json({message: err.message});
        } else {
            res.status(200).json({'result': result});
        }
      });
});

app.post('/send_message', async (req, res)=> {
    if (database == null) {
        return;
    }
    database.query(`INSERT INTO messages (message, chatID, userID) VALUES 
    ('${req.body.message}', '${req.body.chatID}', '${req.body.userID}')`, function (err, result, fields) {
        if (err) {
            res.status(400).json({message: err.message});
        } else {
            res.status(200).json({'result': result});
        }
      });
});

// openAI setup
const OpenAI = require("openai");

const openai = new OpenAI({
    // PRIVATE API KEY GOES HERE
    apiKey: ''
});

// Going to localhost:5000 will open public/index.html
const port = 5000;

// All server files people see and get are in the 'public' folder
app.use(express.static('public'));

app.listen(port, ()=> {
    console.log("Server is active");
});

app.post('/api', async (req, res)=> {
    try {
        //const moderationCheck = await openai.moderations.create({ input: req.body.question });

        //if (moderationCheck.results[0].flagged == true) {
        //    res.status(400).json({message: moderationCheck.results[0]});

        const resp = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {"role": "system", "content": "Keep original meaning and convert messages to concise, office appropriate language for an " + req.body.culture},
                {"role": "user", "content": req.body.question}
            ],
        });

        res.status(200).json({message: resp.choices[0].message});
    } catch(e) {
        res.status(400).json({message: e.message});
    }
});