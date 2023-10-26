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
        if (jsonSession.userid) {
            window.location.href = './';
        }
    });
});

/**
 * Function to get user data for a name
 * @param {String} name name of the user to login for (Is unique)
 */
async function login(name) {
    let response = await fetch('./login', 
    {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            'name': name
        })
    });
        
    const data = await response.json();

    // data.result is the sql result, i.e. user info if there is any (e.g. [{id: ..., name: ...}]), otherwise []
    if (data.result) {
        return data.result;
    }
}

/**
 * Function to insert a new user
 * @param {String} name name of the user to signup for (Is unique)
 * @param {String} culture culture of the user
 */
async function signup(name, culture) {
    let response = await fetch('./signup', 
    {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            'name': name,
            'culture': culture
        })
    });
        
    const data = await response.json();

    // data.result is the sql result
    if (data.result) {
        return data.result;
    }
}

/**
 * Function to update user info
 * @param {String} id unique identifying user id which cannot be changed
 * @param {String} name name of the user
 * @param {String} culture culture of the user
 * @param {String} picture url or image location for the picture to use as a profile picture
 */
async function update_user(name, culture) {
    let response = await fetch('./update_user', 
    {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            'id': id,
            'name': name,
            'culture': culture,
            'picture': picture
        })
    });
        
    const data = await response.json();

    // data.result is the sql result
    if (data.result) {
        return data.result;
    }
}