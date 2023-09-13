// Json files to load
// const dataURLs = ['./data/rude.json', './data/medium.json', './data/polite.json'];

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

    $('#message').keyup(function (event) {

        const message = $('#message').val();

        // Ending up using a wierd array structure where every second element is a sentence ending (., !, ?, or \n)
		const sentencesEndings = message.split(/([.!?\n]+)/);

        $('#output-container').addClass("hidden");
        $('#output-container').html("<p id='output'></p>");

        // Length Warning
        if (message.length > 1000) {
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
        //});
    });

    $("#email").submit(function (event) {
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