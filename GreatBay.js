
//Great Bay Bidding Program
//David Kanwisher




const inquirer = require('inquirer');
const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: "Great_Bay_DB"
})


connection.connect(); //initial database connection








//~~Initial round selector~~//

function newRound() {

    inquirer.prompt([
    {
            type: 'list',
            name: 'prompt',
            message: 'What can I help you with?',
            choices: ['POST AN ITEM', "BID ON AN ITEM"]
    }

    ]).then(function(answers) {

        if (answers.prompt === 'POST AN ITEM') {
            postItemRound();
        }else{
            bidRound();
        }
    });

}









//~~List a new item function~~//


function postItemRound(){

    inquirer.prompt([
        {
                type: 'input',
                name: 'item',
                message: 'What is the name of the item you would like to sell?',
                validate: function(value) {
                    let pass = value.match(/^\d*[a-zA-Z][a-zA-Z0-9 ]*$/); //Zero or more ASCII digits; One alphabetic ASCII character; Zero or more alphanumeric ASCII characters; allows space if not first character
                    if (pass) { //would return null if match test didn't pass, otherwise returns array that is true

                        return true;
                    }

                    return "Please enter a proper name";
                }
        },
        {
                type: 'list',
                name: 'condition',
                message: "What is the condition of your item?",
                choices: ['Used', 'New']
        },
        {
                type: 'input',
                name: 'zipcode',
                message: 'Please enter your 5 digit zipcode',
                validate: function(value) {
                    let pass = value.match(/^\d{5}$/); //require 5 digit zip code
                    if (pass) {
                        return true;
                    }
                    return "Please revise your zipcode";
                }

        },
        {
                type: 'input',
                name: 'bid',
                message: "Please enter a starting bid between 1 and 100",
                validate: function(value) {
                    let pass = value.match(/^[1-9][0-9]?$|^100$/);
                    if (pass) {
                        return true;
                    }
                    return "Please enter a number between 1 and 100";
                }
        }
           
    ]).then(function(answers) {
            
        connection.query("INSERT INTO greatbaytable SET ?", 
            {
                Item: answers.item,
                Cond: answers.condition,
                Zipcode: parseInt(answers.zipcode),
                Bid: parseInt(answers.bid)
            }, function(err, res) 
        {});

            console.log("\nYour item has been listed!!!!\n")
            playAgain();
    });  
}









//~~Item bid function~~//



function bidRound() {

    connection.query('SELECT * FROM greatbaytable', function(error, results) {
        inquirer.prompt([
            {
                type: "list",
                name: "bidItemSelection",
                message: "Which item would you like to bid on?",
                choices: function(value) {
                    let choiceArray = [];
                    for (i = 0; i < results.length; i++) {
                        choiceArray.push(results[i].Item)
                    }
                    return choiceArray;
                }

            },
            {
                type: "input",
                name: "userBid",
                message: "How much would you like to bid?",
                validate: function(value) {
                    let pass = value.match(/^[1-9][0-9]*$/);
                    if (pass) {
                        return true;
                    }
                    return "\nPlease Enter a number between 1 and 10000\n"
                }


            }

        ]).then(function(answers) {

            connection.query("SELECT * FROM greatbaytable WHERE Item=?", [answers.bidItemSelection], function(err, res) { //selects row of item selected
                let highestBid = res[0].Bid;
                let userBid = parseInt(answers.userBid);
                if (userBid > highestBid) {
                    console.log("You are now the highest bidder!");
                    connection.query("UPDATE greatbaytable SET ? WHERE ?", [ //selects row of item selected and updates bid
                        {
                            Bid: userBid
                        },
                        {
                            Item: answers.bidItemSelection
                        }
                        ], function(err, res) {});
                    playAgain();

                }else {
                    console.log("\nYour bid was not high enough!\n");
                    playAgain();
                }

            }); //query
        }); //then function
    });//query
} //else statement







//~~~Restart rounds~~~//


function playAgain() { 
    inquirer.prompt([{
        type: "list",
        name: "exit",
        message: "What would you like to do next?",
        choices: ["Continue", "Exit"]
    }]).then(function(answers) {
        if (answers.exit === "Continue") {
            newRound();
        } else {
            connection.end();
            console.log("\nConnection ended. Thank you for bidding\n");
        }
    });
}








newRound(); //starts the initial program