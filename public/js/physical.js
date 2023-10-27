let moving = false;

/**
 * Function to get login/session data
 */
async function set_receiver(receiverID) {
    let response = await fetch('./set_receiver', 
    {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            'receiverID': receiverID
        })
    });
        
    const data = await response;

    if (data) {
        return data;
    }
}

$(document).ready(function() {
    $("body").addClass("js");

    // Setting up users
    get_users().then(jsonUsers => {
        const contacts = $("#contact-list:first-of-type");
        contacts.html("");
        for (let user of jsonUsers) {
            const left = 20 + Math.random() * 60;
            const top = 20 + Math.random() * 60;
            contacts.append(`<div class="individual_contact ${user.team}" id="${user.id}" style="left:${left}%;top:${top}%;">
            ${(user.picture != null) ? '<img src="' + user.picture + '" alt="Profile picture">' : '<img src="images/inverse_profile.png" alt="Profile picture">'}
            </div>`);
        }

        $(".individual_contact").on("click", function(event) {
            const receiverID = $(this).attr('id');
            set_receiver(receiverID);
            window.location.href = './';
        });

        $("body > section").click(function (event) {
            moving = true;

            const contacts = $("#contact-list:first-of-type").children('.' + this.className);
            const offset = $(this).offset();
            const width = $(this).width();
            const height = $(this).height();
            for (let user of contacts) {
                $(user).css({
                    left: function( index, value ) {
                        return offset.left + width / 2 + (Math.random() * 50 - 25) * contacts.length;
                    },
                    top: function( index, value ) {
                      return offset.top + height / 2 + (Math.random() * 50 - 25) * contacts.length;
                    }
                  });
            }
            sleep(1000).then(() => {
                moving = false;
            });
        });

        update_user_position();
    });
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function update_user_position() {
    sleep(1000).then(() => {
        get_users().then(jsonUsers => {
            if (moving == false) {
                const contacts = $("#contact-list:first-of-type").children();
                for (let user of contacts) {
                    $(user).css({
                        left: function( index, value ) {
                        return parseFloat( value ) + Math.random() * 20 - 10;
                        },
                        top: function( index, value ) {
                        return parseFloat( value ) + Math.random() * 20 - 10;
                        }
                    });
                }
            }
            update_user_position();
        });
    });
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