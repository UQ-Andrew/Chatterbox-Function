// express server setup
const express =  require('express');
const app = express();
const session = require('express-session');
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.use(express.json());

// Going to localhost:5000 will open public/index.html
const port = 5000;

// All server files people see and get are in the 'public' folder
app.use(express.static('public'));

app.listen(port, ()=> {
    console.log("Server is active");
});

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

app.post('/session', async (req, res)=> {
    let response = {};
    if (req.session.userid) {
        response.id = req.session.userid;
    }
    if (req.session.receiverid) {
        response.receiverid = req.session.receiverid;
    }
    res.status(200).json(response);
});

app.post('/set_receiver', async (req, res)=> {
    req.session.receiverid = req.body.receiverID;
    res.redirect('/');
});

app.post('/login', async (req, res)=> {
    if (database == null) {
        return;
    }
    // Users have id, name, picture, culture
    database.query("SELECT * FROM users WHERE name = ?", [req.body.name], function (err, result, fields) {
        if (err) {
            res.status(400).json({message: err.message});
        } else {
            if (result.length > 0) {
                req.session.userid = result[0].id;
                res.status(200).json({'result': result});
                res.redirect('/');
            } else {
                res.status(404).json({'result': result});
            }
        }
    });
});

app.post('/signup', async (req, res)=> {
    if (database == null) {
        return;
    }
    // Users have id, name, picture, culture
    userData = {name: req.body.name, culture: req.body.culture};
    database.query("INSERT INTO users SET ?", userData, function (err, result, fields) {
        if (err) {
            res.status(400).json({message: err.message});
        } else {
            // Should check to see if a user was actually inserted
            database.query("SELECT * FROM users WHERE name = ?", [req.body.name], function (err, result, fields) {
                if (err) {
                    res.status(400).json({message: err.message});
                } else {
                    if (result.length > 0) {
                        req.session.userid = result[0].id;
                        res.redirect('/');
                        res.status(200).json({'result': result});
                    } else {
                        res.status(404).json({'result': result});
                    }
                }
            });
        }
      });
});

app.post('/update_user', async (req, res)=> {
    if (database == null) {
        return;
    }
    // Users have id, name, picture, culture
    userData = {name: req.body.name, culture: req.body.culture, picture: req.body.picture};
    database.query("UPDATE users SET ? WHERE id = ?", [userData, req.body.id], function (err, result, fields) {
        if (err) {
            res.status(400).json({message: err.message});
        } else {
            res.status(200).json({'result': result});
        }
      });
});

app.post('/get_users', async (req, res)=> {
    if (database == null) {
        return;
    }
    // Users have id, name, picture, culture
    database.query(`SELECT * FROM users`, function (err, result, fields) {
        if (err) {
            res.status(400).json({message: err.message});
        } else {
            res.status(200).json({'result': result});
        }
      });
});

app.post('/get_messages', async (req, res)=> {
    if (database == null) {
        return;
    }
    // Messages have id, date, message, chatID, userID
    database.query("SELECT * FROM messages WHERE chatID = ?", [req.body.chatID], function (err, result, fields) {
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
    messageData = {message: req.body.message, chatID: req.body.chatID, userID: req.body.userID, 
        alternateMessage: req.body.alternateMessage};
    // Messages have id, date, message, chatID, userID, alternateMessage
    database.query("INSERT INTO messages SET ?", messageData, function (err, result, fields) {
        if (err) {
            res.status(400).json({message: err.message});
        } else {
            res.status(200).json({'result': result});
        }
      });
});

app.post('/update_relationship', async (req, res)=> {
    if (database == null) {
        return;
    }
    // Chats have id, user1, user2, user1to2Relationship, user2to1Relationship
    database.query("UPDATE chats SET ? WHERE id = ? AND user1 = ?", [{user1to2Relationship: req.body.relationship}, req.body.chatID, req.body.sender], function (err, result, fields) {
        if (err) {
            res.status(400).json({message: err.message});
        } else {
            if (result.affectedRows == 0) {
                database.query("UPDATE chats SET ? WHERE id = ? AND user2 = ?", [{user2to1Relationship: req.body.relationship}, req.body.chatID, req.body.sender], function (err, result, fields) {
                    if (err) {
                        res.status(400).json({message: err.message});
                    } else {
                        res.status(200).json({'result': result});
                    }
                });
            } else {
                res.status(200).json({'result': result});
            }
        }
    });
});

app.post('/get_chat', async (req, res)=> {
    if (database == null) {
        return;
    }
    // Chats have id, user1, user2, user1to2Relationship, user2to1Relationship
    // Users have id, name, picture, culture
    // Specifically checking user2 from users for user2 culture!
    database.query(`SELECT chats.\`id\` AS chatID, \`user1\`, \`user2\`, \`user2to1Relationship\`,
        \`user1to2Relationship\`, users.\`culture\` FROM chats, users
        WHERE users.\`id\` = ? AND ((user1 = ? AND user2 = ?) OR (user1 = ? AND user2 = ?))`,
        [req.body.user2, req.body.user1, req.body.user2, req.body.user2, req.body.user1],
        function (err, result, fields) {
        if (err) {
            res.status(400).json({message: err.message});
        } else if (result.length > 0) {
            res.status(200).json({'result': result});
        } else {
            database.query(`INSERT INTO chats (user1, user2)
            VALUES (?, ?)`, [req.body.user1, req.body.user2], function (err, result, fields) {
            
            database.query(`SELECT chats.\`id\` AS chatID, \`user1\`, \`user2\`, \`user2to1Relationship\`,
            \`user1to2Relationship\`, users.\`culture\` FROM chats, users
            WHERE users.\`id\` = ? AND (user1 = ? AND user2 = ?)`,
            [req.body.user2, req.body.user1, req.body.user2], function (err, result, fields) {
                if (err) {
                    res.status(400).json({message: err.message});
                } else {
                    res.status(200).json({'result': result});
                }
            });
        });
        }
      });
});

// openAI setup
const OpenAI = require("openai");

const openai = new OpenAI({
    // PRIVATE API KEY GOES HERE
    apiKey: ''
});

app.post('/api', async (req, res)=> {
    try {
        //const moderationCheck = await openai.moderations.create({ input: req.body.question });

        //if (moderationCheck.results[0].flagged == true) {
        //    res.status(400).json({message: moderationCheck.results[0]});
        userData = "";
        if (req.body.culture != null && req.body.relationship != null) {
            userData += req.body.culture + " " + req.body.relationship;
        } else if (req.body.culture != null) {
            userData += req.body.culture + " colleague";
        } else if (req.body.relationship != null) {
            userData += req.body.relationship;
        } else {
            userData += "Co-worker";
        }

        console.log("Keep original meaning and convert messages to concise, office appropriate " +
        "language for my " + userData);

        const resp = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {"role": "system", "content": "Keep original meaning and convert messages to concise, office appropriate " +
                "language for my " + userData},
                {"role": "user", "content": req.body.question}
            ],
        });

        res.status(200).json({message: resp.choices[0].message});
    } catch(e) {
        res.status(400).json({message: e.message});
    }
});