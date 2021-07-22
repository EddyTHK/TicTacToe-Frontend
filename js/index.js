window.addEventListener('DOMContentLoaded', (event) => {
    console.log("DOM Loaded!");

    // Query DOM
    var createSessionButton = document.getElementById("createSession");
    var joinSessionButton = document.getElementById("joinSession");

    // declare connection 
    // TODO: change to const socket = io.connect('https://ades-ca3-backend.herokuapp.com'); before deploying

    const socket = io.connect('http://localhost:4000');
    var socketConnected = false;

    // function to be run when session id is matching
    function displayGame() {
        alert("Player 1 and 2 connected!");

        document.getElementById('lobby').innerHTML = `                
            <div class="board circle" id="board">
                <div class="cell" datacell></div>
                    <div class="cell" datacell></div>
                    <div class="cell" datacell></div>
                    <div class="cell" datacell></div>
                    <div class="cell" datacell></div>
                    <div class="cell" datacell></div>
                    <div class="cell" datacell></div>
                    <div class="cell" datacell></div>
                    <div class="cell" datacell></div>
                </div>
                <div class="winning-message">
                    <div data-winning-message-text>X wins!</div>
                    <button id="restartBtn">Restart</button>
                </div>
            `;

        socket.on("errorInJoining", function () {
            alert("Invalid session id!");
        });

        socket.on("user-disconnected", function () {
            alert("The other player disconnected");
        });
    }

    createSessionButton.addEventListener('click', function () {

        // retrieve and save username
        var usernameInput = document.getElementById("username");
        var playerName = usernameInput.value;

        if (playerName != "") {
            // connect to web socket
            socket.on('connect', function () {
                socketConnected = true;
                console.log('Connected! ID: ' + socket.id);
            });

            // sends username back to server
            socket.emit("createSess", playerName);

            socket.on("session-created", function (data) {
                var p1_id = data.id;
                var p1_name = data.name;
                console.log("Player 1 id: " + p1_id);
                console.log("Player 1 name: " + p1_name);

                document.getElementById("lobby").innerHTML =

                    // Displays loading page when username is entered and createSessionButton is clicked
                    `
                        <div class="container" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);">
                            <div class="row">
                                <div class="col-sm-12 d-flex justify-content-center">
                                    <div class="spinner-border" style="width: 3rem; height: 3rem;" role="status">
                                        <span class="sr-only">Loading...</span>
                                    </div>
                                </div>
                            </div>
            
                            <div class="row">
                                <div class="col-md-4"></div>
                                <div class="col-md-4">
                                    <br>
                                    <p class="d-flex justify-content-center">Waiting for player 2 to join....</p>
            
                                    <p class="d-flex justify-content-center" id="sessTxt">Your ID is: ${data.id}</p>
            
                                    <div class="text-center pt-4">
                                        <button id='close' class="btn btn-secondary">Cancel</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;

                var close = document.getElementById("close");

                close.addEventListener('click', function () {
                    //revert back to main page when cancel button is clicked
                    location.reload();
                });
            });
        } else {
            alert("Please enter a username!");
        }
    });

    socket.on("game", function (data) {
        console.log(data.join);
        if (data.join == true) {
            displayGame();
        }else {
            alert("failed");
        }
    });

    joinSessionButton.addEventListener('click', function () {
        // retrieve and save username
        var usernameInput = document.getElementById("username");
        var playerName = usernameInput.value;

        // Change design when "Join Game" button is clicked
        document.getElementById("lobby").innerHTML = `
            <div class='centered container mx-auto'>
                <div class="row">
                    <div class="col-sm-4"></div>
                    <div class="col-sm-4">
                        <form onsubmit="return false">
                            <div class="form-group">
                                <label for="session">Enter sessionID: </label>
                                <input id="session" class="form-control" type="text" name="session" placeholder="session ID" required>
                            </div>

                            <div class="d-flex justify-content-center">
                                <button id='join' class='btn btn-primary text-center btn-block'>Join</button>
                            </div>
                            <div class="d-flex justify-content-center pt-3">
                                <button id='close' class='btn btn-secondary text-center btn-block'>Close</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        var join = document.getElementById("join");
        var sessCode = document.getElementById("session");

        join.addEventListener('click', function () {
            // Store value of session id
            var lobbyCode = sessCode.value;

            // pass session id and name back to server
            if (playerName != '') {
                socket.emit("join-session", {
                    id: lobbyCode,
                    name: playerName
                });

                socket.on("joined", function () {
                    socket.emit("gameStart");

                    displayGame();
                });

            }
        });

        var close = document.getElementById("close");

        close.addEventListener('click', function () {
            //revert back to main page when cancel button is clicked
            location.reload();
        });

    });
});