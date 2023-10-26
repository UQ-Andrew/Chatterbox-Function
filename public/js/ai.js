$(document).ready(function() {
    $("#ai_check").click(function (event) {
        if ($('#input').val().length > 0) {
            switch_to_double_input();

            $('#ai_input > p').html("<div class='loader'></div>");
            send_to_server($('#input').val(), relationship, receiverCulture).then(jsonMessage => {
                if (jsonMessage.content) {
                    $('#ai_input > p').html(jsonMessage.content);
                    $('#ai_input > button').prop("disabled", false);
                    $('#move_btn').prop("disabled", false);
                } else {
                    $('#ai_input > p').html("<span style='display:block;font-size:2em;color:red;text-align:center;'>&#10006;</span>");
                    sleep(3000).then(() => {
                        switch_to_single_input();
                    });
                }
            });
            $('#output-container').addClass("hidden");
        }
        event.preventDefault();
    });

    $("#move_btn").click(function (event) {
        switch_to_single_input();
        $('#input').val($('#ai_input > p').html());
    });

    $("#ai_input > button").click(function (event) {
        const message = $('#ai_input > p').html();
        const chatBox = $(".chat-box:first-of-type");
        send_message(message, receiverID, userID, null);

        const now = Date.now();
        if ((now - lastDate.getTime()) > 60000) {
            lastDate.setTime(now);
            chatBox.append(`<p> ${new Intl.DateTimeFormat('en-GB', 
                { dateStyle: 'medium', timeStyle: 'short'}).format(lastDate)} </p>`);
        }

        chatBox.append(`<div><div class="personal">
            <p>${message}</p>
            </div></div>`);
        $('#input').val("");

        switch_to_single_input();

        $('#output-container').addClass("hidden");
        $('#output-container').html("<p id='output'></p>");
        
        chatBox[0].scrollTop = chatBox[0].scrollHeight;
    });
});

function switch_to_double_input() {
    $("#ai_check").addClass("hidden");
    $('#ai_input').removeClass("hidden");
    $('#ai_input > button').prop("disabled", true);
    $('#move_btn').removeClass("hidden");
    $('#move_btn').prop("disabled", true);
    $("#email > div").addClass("double_open");
}

function switch_to_single_input() {
    $("#move_btn").addClass("hidden");
    $('#ai_input').addClass("hidden");
    $("#ai_check").removeClass("hidden");
    $("#email > div").removeClass("double_open");
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

    let response = await fetch('./api', 
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