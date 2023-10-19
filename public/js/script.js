// Json files to load
// const dataURLs = ['./data/rude.json', './data/medium.json', './data/polite.json'];

const userID = 7; // Replace in the future with something (maybe php) for logins
let chatID = 1; // Change for whatever chat is loaded, know which chat to load through get_chat()
let receiverCulture = "Australian"; // Edit with info from get_chat()
let relationship = "Boss"; // Edit with info from get_chat()

const rude = {"a": ["apeshit", "arse", "arsehole", "ass", "asshat", "asshole"],
    "b": ["bastard", "bitch", "bloody", "bullshit"],
    "c": ["cock", "crap", "cunt"],
    "d": ["damn", "dick", "dickhead", "die"],
    "f": ["fuck", "fucking"],
    "g": ["goddamn", "godsdamn"],
    "h": ["hell", "horseshit"],
    "k": ["kill"],
    "m": ["motherfucker"],
    "n": ["nigga"],
    "p": ["piss", "prick", "pussy"],
    "s": ["shit", "shite", "slut", "spastic"],
    "t": ["twat"],
    "w": ["wanker", "whore"]};

const medium = {"a": ["ask"],
    "c": ["call", "come"],
    "d": ["do"],
    "f": ["find"],
    "g": ["get", "give", "go"],
    "l": ["look"],
    "m": ["make"],
    "n": ["no"],
    "s": ["say"],
    "t": ["take", "talk", "tell", "try"],
    "u": ["use"],
    "w": ["work", "write"]};

const polite = {"a": ["appreciate"],
    "c": ["can", "could"],
    "e": ["excuse"],
    "h": ["help"],
    "i": ["i", "if"],
    "k": ["kind"],
    "m": ["may"],
    "p": ["pardon", "please"],
    "r": ["respect"],
    "s": ["sorry"],
    "t": ["thank", "thanks", "thankyou"],
    "w": ["welcome", "would"]};

$(document).ready(function() {
    $("body").addClass("js");

    let lastDate = new Date(0);

    get_chat(userID, 1).then(jsonInfo => {
        chatID = jsonInfo.chatID;
        receiverCulture = jsonInfo.culture;
        if (jsonInfo.user2 == userID) {
            relationship = jsonInfo.user2to1Relationship;
        } else {
            relationship = jsonInfo.user1to2Relationship;
        }

        get_messages(chatID).then(jsonMessages => {
            const chatBox = $(".chat-box:first-of-type");
            chatBox.html("");
    
            for (let message of jsonMessages) {
                const curDate = new Date(message.date);
                if ((curDate - lastDate.getTime()) > 60000) {
                    lastDate.setTime(curDate.getTime());
                    chatBox.append(`<p> ${new Intl.DateTimeFormat('en-GB', 
                        { dateStyle: 'medium', timeStyle: 'short'}).format(lastDate)} </p>`);
                }
    
                chatBox.append(`<div><div ${(message.userID == userID) ? "class='personal'" : ""}>
                <p>${message.message}</p>
                </div></div>`);
            }
            
            chatBox[0].scrollTop = chatBox[0].scrollHeight;
        });
    });

    //lastDate = new Date($(".chat-box > p:last-of-type").html());

    $('#input').keyup(function (event) {

        const message = $('#input').val();

        // Ending up using a wierd array structure where every second element is a sentence ending (., !, ?, or \n)
		const sentencesEndings = message.split(/([.!?\n]+)/);

        $('#output-container').addClass("hidden");
        $('#output-container').html("<p id='output'></p>");

        // Length Warning
        if (message.length > 200) {
            $('#output-container').removeClass("hidden");
            $('#output').append("<i>Warning: A long message may not be properly read, " + 
                "Consider organising a meetup. </i><br><br>");
        }


        /*get_jsons(dataURLs).then(jsonList => {
            // jsonList = [rude, medium, polite]?
            const rude = jsonList[0];
            console.log(rude);
            const medium = jsonList[1];
            console.log(medium);
            const polite = jsonList[2];
            console.log(polite);*/

        let messagePoint = 0;

        for (let i = 0; i < sentencesEndings.length; i++) {

            /* Old thing for debugging
            console.log("messagePoint: %d, sentence length: %d, sentence: %s", 
                messagePoint, sentencesEndings[i].length, sentencesEndings[i]);*/

            if ((sentencesEndings % 2) != 0) {
                // Sentence
                let words = sentencesEndings[i].toLowerCase().match(/\b(\w+)\b/g);

                if (search_string_with_dict(words, rude)) {
                    // Very rude word found in this sentence
                    $('#output-container').removeClass("hidden");
                    $('#output').append("Warning, this sentence may be rude: <b>" + sentencesEndings[i] + "</b><br>");
                    return;
                } else if (search_string_with_dict(words, medium) && !search_string_with_dict(words, polite)) {
                    // Maybe somewhat rude sentence found, probably subject to false positives and negatives
                    // e.g. A command like 'Work on that' or 'no' without words like 'could', 'thank' or 'please'
                    $('#output-container').removeClass("hidden");
                    $('#output').append("Warning, this sentence may be slightly rude: <i>" + sentencesEndings[i] + "</i><br>");
                    return;
                } else {
                    //$('#output').append(sentencesEndings[i]);
                }
            } else {
                // Sentence Ending, i.e. one or more '.', '?', '!', or '\n' characters
                //$('#output').append(sentencesEndings[i]);
            }

            messagePoint += sentencesEndings[i].length;
        }
    });

    $("#email").submit(function (event) {
        if ($('#input').val().length > 0) {
            const chatBox = $(".chat-box:first-of-type");
            send_message($('#input').val(), 1, userID);

            const now = Date.now();
            if ((now - lastDate.getTime()) > 60000) {
                lastDate.setTime(now);
                chatBox.append(`<p> ${new Intl.DateTimeFormat('en-GB', 
                    { dateStyle: 'medium', timeStyle: 'short'}).format(lastDate)} </p>`);
            }

            chatBox.append(`<div><div class="personal">
                <p>${$('#input').val()}</p>
                </div></div>`);
            
            $('#input').val("");

            $('#output-container').addClass("hidden");
            $('#output-container').html("<p id='output'></p>");
            
            chatBox[0].scrollTop = chatBox[0].scrollHeight;
        }
        
        event.preventDefault();
    });

    $("#ai_check").click(function (event) {
        if ($('#input').val().length > 0) {
            send_to_server($('#input').val(), relationship, receiverCulture).then(jsonMessage => {
                $('#input').val(jsonMessage.content);
            });
        }
        event.preventDefault();
    });
});

/**
 * Asyncronous function for loading multiple json files. 
 * Adapted from https://stackoverflow.com/questions/74125487/load-multiple-json-then-execute-funtion
 * @param jsonList A list of url json files to load, e.g. ['./data/rude.json', './data/medium.json', ...]
 * @returns A list of loaded json files, e.g. [Object, Object, ...]
 */
async function get_jsons(jsonList) {
    let arrayData = [];
    for (const url of jsonList) {
        try {
            const data = await fetch(url);
            const json = await data.json();
            arrayData.push(json);
        } catch(error) {
            alert(error);
        }
    }
    return arrayData;
}

/** 
 * Function which searches a string to see if any of the words in a json file match,
 * @param words A array of words to check
 * @return 1 if match found, else 0
*/
function search_string_with_dict(words, json) {
    //let words = search.toLowerCase().match(/\b(\w+)\b/g);

    if (words == null) {
        return 0;
    }

    for (let i = 0; i < words.length; i++) {
        if (json[words[i][0]]) {
            //check
            if (binary_string_search(json[words[i][0]], words[i]) >= 0) {
                return 1;
            }
        }
    }
    return 0;
}

/**
 * Binary search an array of strings
 * @param arr The sorted array to search
 * @param el The target to find
 * @returns The index where whatever was being search for was found, 
 *          or a negative index where the item would be placed if it was being added to the sorted array
 */
function binary_string_search(arr, el) {
    let m = 0;
    let n = arr.length - 1;
    while (m <= n) {
        let k = (n + m) >> 1;
        let cmp = el.localeCompare(arr[k]);
        if (cmp > 0) {
            m = k + 1;
        } else if(cmp < 0) {
            n = k - 1;
        } else {
            return k;
        }
    }
    return ~m;
}
/**
 * Function to send data to OPENAI server and get a more appropriate message back
 * Used https://www.freecodecamp.org/news/how-to-create-a-chatbot-with-the-chatgpt-api/ as help
 * @param {String} inputText What to send to the server
 */
async function send_to_server(inputText, relationship, culture) {
    if (inputText.trim().length === 0) {
        return
    }

    let response = await fetch('http://localhost:5000/api', 
    {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            'question': inputText,
            'relationship': relationship,
            'culture': culture
        })
    });
        
    const data = await response.json()

    // data.message is the actual message sent back from the server, in this case chatGPT response
    if (data.message) {
        return data.message;
    }
}

/**
 * Function to find chat information given two user ids
 * @param senderID userID of the sender
 * @param receiverID userID of the receiver
 */
async function get_chat(senderID, receiverID) {
    let response = await fetch('http://localhost:5000/get_chat', 
    {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            'user1': senderID,
            'user2': receiverID
        })
    });
        
    const data = await response.json();

    // data.result is the server response
    if (data.result) {
        return data.result[0];
    }
}

/**
 * Function to send users to the server, then get back all messages between them
 * @param chatID Id of the chat to get all the messages for
 */
async function get_messages(chatID) {
    let response = await fetch('http://localhost:5000/get_messages', 
    {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            'chatID': chatID
        })
    });
        
    const data = await response.json();

    // data.result is all the messages
    if (data.result) {
        return data.result;
    }
}

/**
 * Function to send a message to a chat
 * @param {String} message 
 * @param chatID 
 * @param user user ID
 */
async function send_message(message, chatID, user) {
    let response = await fetch('http://localhost:5000/send_message', 
    {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            'message': message,
            'chatID': chatID,
            'userID': user
        })
    });
        
    const data = await response.json();

    // data.result is the server response
    if (data.result) {
        return data.result;
    }
}