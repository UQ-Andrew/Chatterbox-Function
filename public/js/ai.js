$(document).ready(function() {
    $("#ai_check").click(function (event) {
        if ($('#input').val().length > 0) {
            send_to_server($('#input').val(), relationship, receiverCulture).then(jsonMessage => {
                $('#input').val(jsonMessage.content);
            });
            rude_check();
        }
        event.preventDefault();
    });
});

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