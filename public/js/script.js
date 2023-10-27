
let userID = 7; // Replace in the future with something (maybe php) for logins
let receiverID = 1;
let chatID = 1; // Edited with info from get_chat()
let receiverCulture = null; // Edited with info from get_chat()
let relationship = null; // Edited with info from get_chat()
let lastDate = new Date(0);

const typeCounterTime = 30;
let typeCounter = 0;

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

/**
 * Function to get login/session data
 */
async function get_session() {
    let response = await fetch('./session', 
    {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: '{}'
    });
        
    const data = await response.json();

    if (data) {
        return data;
    }
}

$(document).ready(function() {
    $("body").addClass("js");

    get_session().then(jsonSession => {
        if (jsonSession.id) {
            userID = jsonSession.id;
        }

        if (jsonSession.receiverid) {
            receiverID = jsonSession.receiverid;
        }

        // Setting up users
        get_users().then(jsonUsers => {
            const contacts = $("#contact-list:first-of-type");
            contacts.html("");
            for (let user of jsonUsers) {
                if (user.id != userID) {
                    contacts.append(`<div class="individual_contact" id="${user.id}">
                    ${(user.picture != null) ? '<img src="' + user.picture + '" alt="Profile picture">' : '<img src="images/inverse_profile.png" alt="Profile picture">'}
                    <p>${user.name}</p>
                    </div>`);
                } else {
                    $("#user_name").html(user.name);
                    $("#user_email").html((user.email != null) ? user.email : "");
                    $("#user_profile").attr("src",(user.picture != null) ? user.picture : "images/icon _profile circle_.png");
                    $("#team").val(user.team);
                }
            }
            $(".individual_contact").on("click", function(event) {
                lastDate = new Date(0);
                receiverID = $(this).attr('id');
                get_chat(userID, receiverID).then(jsonInfo => {
                    chatID = jsonInfo.chatID;
                    receiverCulture = jsonInfo.culture;
                    if (jsonInfo.user2 == userID) {
                        relationship = jsonInfo.user2to1Relationship;
                    } else {
                        relationship = jsonInfo.user1to2Relationship;
                    }
                    $("#relationship").val(relationship);
            
                    get_messages(chatID).then(jsonMessages => {
                        write_messages_to_chatbox(jsonMessages);
                        
                        $(".chat-box:first-of-type")[0].scrollTop = $(".chat-box:first-of-type")[0].scrollHeight;
                    });
                });
            });
        });

        // Getting chat messages
        get_chat(userID, receiverID).then(jsonInfo => {
            chatID = jsonInfo.chatID;
            receiverCulture = jsonInfo.culture;
            if (jsonInfo.user2 == userID) {
                relationship = jsonInfo.user2to1Relationship;
            } else {
                relationship = jsonInfo.user1to2Relationship;
            }
            $("#relationship").val(relationship);

            get_messages(chatID).then(jsonMessages => {
                write_messages_to_chatbox(jsonMessages);
                
                $(".chat-box:first-of-type")[0].scrollTop = $(".chat-box:first-of-type")[0].scrollHeight;
                poll_chat_database()
            });
        });
    });

    $('#input').keyup(function (event) {
        if(event.which === 13 && !event.shiftKey) {
            event.preventDefault();
        
            $(this).closest("form").submit();
            return;
        }
        if (relationship == "Friend") {
            return;
        }
        typeCounter = typeCounterTime;
        typing_slower()
    });

    $('#search').keyup(function (event) {
        const search = $(this).val();
        const contacts = $("#contact-list > .individual_contact");
        if (search.length == 0) {
            contacts.removeClass("hidden");
            return;
        }
        const regex = new RegExp(`(${search})`, "gi");
        for (let contact of contacts) {
            $(contact).addClass("hidden");
            if ($(contact).children("p").eq(0).html().match(regex)) {
                $(contact).removeClass("hidden");
            }
        }
    });

    $("#email").submit(function (event) {
        const message = $('#input').val();
        if (message.length > 0) {
            const chatBox = $(".chat-box:first-of-type");
            if (!$('#output-container').hasClass("rude")) {
                moderationCheck(message).then(jsonMessage => {
                    if (jsonMessage.flagged == true) {
                        $('#output-container').removeClass("hidden");
                        $('#output-container').addClass("rude");
                        $('#output-container').html("<p id='output'></p>");
                        $('#output').append("Warning, <b>This was flagged by automatic moderation, do you truly wish to send this?</b><br>");
                        chatBox.children("div").last().remove();
                        return;
                    } else {
                        send_message(message, receiverID, userID, null);
                        $('#input').val("");
                    }
                });
            } else {
                $('#input').val("");
                send_to_server(message, relationship, receiverCulture).then(jsonMessage => {
                    send_message(message, receiverID, userID, jsonMessage.content);
                });
            }

            const now = Date.now();
            if ((now - lastDate.getTime()) > 60000) {
                lastDate.setTime(now);
                chatBox.append(`<p> ${new Intl.DateTimeFormat('en-GB', 
                    { dateStyle: 'medium', timeStyle: 'short'}).format(lastDate)} </p>`);
            }

            chatBox.append(`<div><div class="personal">
                <p>${$('#input').val()}</p>
                </div></div>`);

            $('#output-container').addClass("hidden");
            $('#output-container').html("<p id='output'></p>");
            
            chatBox[0].scrollTop = chatBox[0].scrollHeight;
        }
        
        event.preventDefault();
    });

    $("#relationship").on("change", function (event) {
        relationship = $("#relationship").val();
        update_relationship(chatID, userID, relationship);
    });
    $("#team").on("change", function (event) {
        //team = $("#team").val();
        update_team(userID, $(this).val());
    });
});

function write_messages_to_chatbox(jsonMessages) {
    const chatBox = $(".chat-box:first-of-type");
    chatBox.html("");
    let curDate;

    for (let message of jsonMessages) {
        curDate = new Date(message.date);
        if ((curDate - lastDate.getTime()) > 60000) {
            lastDate.setTime(curDate.getTime());
            chatBox.append(`<p> ${new Intl.DateTimeFormat('en-GB', 
                { dateStyle: 'medium', timeStyle: 'short'}).format(lastDate)} </p>`);
        }

        if (message.alternateMessage == null || message.userID == userID) {
            chatBox.append(`<div><div ${(message.userID == userID) ? "class='personal'" : ""}>
            <p>${message.message}</p>
            </div></div>`);
        } else {
            chatBox.append(`<div><div>
            <p>${message.alternateMessage}</p>
            <p class="hidden">${message.message}</p>
            <span style="width: 100%;
            display: block;
            background-color: salmon;
            border-radius: 5px;
            cursor: pointer;" onclick="switch_message(this)">Warning: See original message</span>
            </div></div>`);
        }
    }
}

function switch_message(button) {
    const message = $(button).parent();
    if ($(button).html() == "Warning: See original message") {
        $(button).html("See updated message");
        message.css('background-color', 'salmon');
        message.children('p').eq(0).addClass('hidden');
        message.children('p').eq(1).removeClass('hidden');
    } else {
        $(button).html("Warning: See original message");
        message.removeAttr('style');
        message.children('p').eq(1).addClass('hidden');
        message.children('p').eq(0).removeClass('hidden');
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function poll_chat_database() {
    sleep(8000).then(() => {
        get_messages(chatID).then(jsonMessages => {
            if (jsonMessages[jsonMessages.length - 1].message != 
                $(".chat-box:first-of-type > div:last-of-type > div > p:last-of-type").html()) {
                let scrolled = false;

                lastDate = new Date(0);
                const chatBox = $(".chat-box:first-of-type");
                if (chatBox[0].scrollHeight - chatBox[0].scrollTop - chatBox[0].clientHeight < 1) {
                    scrolled = true;
                }
                write_messages_to_chatbox(jsonMessages);
                
                if (scrolled) {
                    chatBox[0].scrollTop = chatBox[0].scrollHeight;
                }
            }
            poll_chat_database();
        });
    });
}

function typing_slower() {
    if (typeCounter > 0) {
        typeCounter -= 1;
        sleep(10).then(() => {
            if (typeCounter == typeCounterTime) {
                return;
            } else {
                typing_slower();
            }
        });
    } else {
        rude_check()
    }
}

function rude_check() {
    const message = $('#input').val();

    // Ending up using a wierd array structure where every second element is a sentence ending (., !, ?, or \n)
    const sentencesEndings = message.split(/([.!?\n]+)/);

    $('#output-container').addClass("hidden");
    $('#output-container').html("<p id='output'></p>");

    // Length Warning
    if (message.length > 200) {
        $('#output-container').removeClass("hidden");
        $('#output').append("<i>A long message may not be properly read, " + 
            "Consider organising a meetup.</i><br><br>");
    } else {
        
    }

    let messagePoint = 0;

    for (let i = 0; i < sentencesEndings.length; i++) {

        if ((sentencesEndings % 2) != 0) {
            // Sentence
            let words = sentencesEndings[i].toLowerCase().match(/\b(\w+)\b/g);

            if (search_string_with_dict(words, rude)) {
                // Very rude word found in this sentence
                $('#output-container').removeClass("hidden");
                $('#output-container').addClass("rude");
                $('#output').append("Warning, this sentence may be rude: <b>" + sentencesEndings[i] + "</b><br>");
                return;
            } else if (search_string_with_dict(words, medium) && !search_string_with_dict(words, polite)) {
                // Maybe somewhat rude sentence found, probably subject to false positives and negatives
                // e.g. A command like 'Work on that' or 'no' without words like 'could', 'thank' or 'please'
                $('#output-container').removeClass("hidden");
                $('#output-container').addClass("rude");
                $('#output').append("Warning, this sentence may be slightly rude: <i>" + sentencesEndings[i] + "</i><br>");
                return;
            } else {
                //$('#output').append(sentencesEndings[i]);
            }
        }

        messagePoint += sentencesEndings[i].length;
    }
}

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
 * Function to get all users
 */
async function get_users() {
    let response = await fetch('./get_users', 
    {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: '{}'
    });
        
    const data = await response.json();

    // data.result is the server response
    if (data.result) {
        return data.result;
    }
}

/**
 * Function to find chat information given two user ids
 * @param senderID userID of the sender
 * @param receiverID userID of the receiver
 */
async function get_chat(senderID, receiverID) {
    let response = await fetch('./get_chat', 
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
    let response = await fetch('./get_messages', 
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
async function send_message(message, chatID, user, alternateMessage) {
    let response = await fetch('./send_message', 
    {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            'message': message,
            'chatID': chatID,
            'userID': user,
            'alternateMessage': alternateMessage
        })
    });
        
    const data = await response.json();

    // data.result is the server response
    if (data.result) {
        return data.result;
    }
}

/**
 * Function to update a relationship
 * @param chatID The chat in which to update a relationship
 * @param senderID
 * @param {String} newRelationship 
 */
async function update_relationship(chatID, senderID, newRelationship) {
    let response = await fetch('./update_relationship',
    {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            'chatID': chatID,
            'sender': senderID,
            'relationship': newRelationship
        })
    });
        
    const data = await response.json();

    // data.result is the server response
    if (data.result) {
        return data.result;
    }
}

/**
 * Function to update which team the user is in
 * @param userID The user to update
 * @param {String} team The team to be placed in
 */
async function update_team(userID, team) {
    let response = await fetch('./update_team',
    {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            'userID': userID,
            'team': team
        })
    });
        
    const data = await response.json();

    // data.result is the server response
    if (data.result) {
        return data.result;
    }
}