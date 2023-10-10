// express server setup
const express =  require('express')
const app = express()
app.use(express.json())

// openAI setup
const OpenAI = require("openai")

const openai = new OpenAI({
    // PRIVATE API KEY GOES HERE
    apiKey: ''
});

// Going to localhost:5000 will open public/index.html
const port = 5000

// All server files people see and get are in the 'public' folder
app.use(express.static('public'))

app.listen(port, ()=> {
    console.log("Server is active")
})

app.post('/api', async (req, res)=> {
    try {
        const resp = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{"role": "user", "content": req.body.question}],
        });

        res.status(200).json({message: resp.choices[0].message});
    } catch(e) {
        res.status(400).json({message: e.message});
    }
})