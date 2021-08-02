window.addEventListener('DOMContentLoaded', (event) => {
    console.log("DOM Loaded!");

    // Query DOM
    var createSessionButton = document.getElementById("createSession");
    var joinSessionButton = document.getElementById("joinSession");

    // declare connection 
    // TODO: change to const socket = io.connect('https://ades-ca3-backend.herokuapp.com'); before deploying

    var socket = io.connect('https://ades-ca3-backend.herokuapp.com');
    var socketConnected = false;

    // variables for game logic
    const X_CLASS = 'x', CIRCLE_CLASS = 'circle';
    var player;

    const winningCombos = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ]

    createSessionButton.addEventListener('click', function () {

        // retrieve and save username
        var usernameInput = document.getElementById("username");
        var playerName = usernameInput.value;
        console.log(playerName);

        if (playerName != "") {
            // connect to web socket
            socket.on('connect', function () {
                socketConnected = true;
                console.log('Connected to socket!');
            });

            // sends username back to server
            socket.emit("createSess", {
                name: playerName
            });

            // Pass name and type back to Player class
            player = new Player(playerName, X_CLASS, true);

            // listens for "session-created" event  
            socket.on("session-created", function (data) {
                var room = data.room;
                var p1_name = data.name;
                console.log('player 1: ' + p1_name + " joined " + room + "!");

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
            
                                    <p class="d-flex justify-content-center" id="sessTxt">Your Room ID is: ${data.room}</p>
            
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

                socket.on("joined", function (data) {
                    console.log('player 2: ' + data.name + " joined " + data.room + "!");
                    var game = new Game(data.room);
                    game.displayBoard();
                });
            });
        } else {
            alert("Please enter a username!");
        }
    });

    joinSessionButton.addEventListener('click', function () {
        // retrieve and save username
        var usernameInput = document.getElementById("username");
        var playerName = usernameInput.value;

        if (playerName != "") {
            // Change design when "Join Game" button is clicked
            document.getElementById("lobby").innerHTML = `
                <div class='container' style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);">
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
            var roomID = document.getElementById("session");

            join.addEventListener('click', function () {
                // Store value of session id
                var roomCode = roomID.value;

                // pass session id and name back to server
                if (roomCode != '') {
                    socket.emit("join-session", {
                        player2Name: playerName,
                        room: roomCode
                    });

                    player = new Player(playerName, CIRCLE_CLASS, false);

                    socket.on("joined", function (data) {
                        console.log("You joined " + data.room + "!");

                        game = new Game(data.room);
                        game.displayBoard();
                    });

                    socket.on("errorInJoining", function (data) {
                        alert(data.error);
                    });

                } else {
                    alert('Please enter a valid game ID.');
                }
            });

            var close = document.getElementById("close");

            close.addEventListener('click', function () {
                //revert back to main page when cancel button is clicked
                location.reload();
            });
        }

    });

    // classes to handle/store player info
    class Player {
        constructor(name, type, turn) {
            this.name = name;
            this.type = type;
            this.currentTurn = turn;
        }

        swapTurn = () => {
            this.currentTurn = !this.currentTurn
        }

        getTurn = () => {
            return this.currentTurn;
        }

        getPlayerName() {
            return this.name;
        }

        getPlayerType() {
            return this.type;
        }
    }

    class Game {
        constructor(roomID) {
            this.roomID = roomID;
            this.moves = 0;
        }

        getRoomID = () => {
            return this.roomID;
        }

        // method to do game logic
        displayBoard = () => {
            alert("Player 1 and 2 connected!");

            document.getElementById('lobby').innerHTML = `                
                <div class="board" id="board">
                    <div id = "1" class="cell" data-cell></div>
                    <div id = "2" class="cell" data-cell></div>
                    <div id = "3" class="cell" data-cell></div>
                    <div id = "4" class="cell" data-cell></div>
                    <div id = "5" class="cell" data-cell></div>
                    <div id = "6" class="cell" data-cell></div>
                    <div id = "7" class="cell" data-cell></div>
                    <div id = "8" class="cell" data-cell></div>
                    <div id = "9" class="cell" data-cell></div>
                </div>
                <div class="winning-message" id="winningMessage">
                    <div data-winning-message-text></div>
                    <button id="continueButton">Continue</button>
                </div>
            `;

            const cellElements = document.querySelectorAll('[data-cell]');
            const board = document.getElementById('board');
            const winningMessageElement = document.getElementById('winningMessage');
            const continueButton = document.getElementById('continueButton');
            const winningMessageTextElement = document.querySelector('[data-winning-message-text]');
            var xTurn;
            // continueButton.addEventListener('click', restartGame);

            startGame();

            function startGame() {
                xTurn = player.getTurn();
                console.log(player.getPlayerName());
                console.log(xTurn);

                if (!xTurn) {
                    board.classList.add('disabled');
                } else {
                    for (var i = 0; i < cellElements.length; i++) {
                        cellElements[i].addEventListener('click', handleClick, { once: true });
                    }

                    function handleClick(e) {
                        var cell = e.target;
                        var tileClicked = cell.id;
                        console.log("tileClicked id", tileClicked);

                        const currentClass = xTurn ? X_CLASS : CIRCLE_CLASS;
                        console.log(currentClass);
                        cell.classList.add(currentClass);

                        socket.emit("updated", {
                            tile: tileClicked,
                            type: currentClass
                        });

                        player.swapTurn();
                        xTurn = player.getTurn();

                        console.log(xTurn);
                        board.classList.add('disabled');

                        if (checkWin(currentClass)) {
                            endGame(false);
                        } else if (isDraw()) {
                            endGame(true);
                        }
                    }
                }

                socket.on('swap', function (data) {
                    var cellID = data.tile;
                    console.log(data.type);
                    var updatedTile = document.getElementById(cellID);
    
                    updatedTile.classList.add(data.type);
                    player.swapTurn();
                    xTurn = player.getTurn();
                    console.log(xTurn);

                    board.classList.remove("disabled");
                    startGame();
                });
            }
            

            function checkWin(currentClass) {
                return winningCombos.some(combination => {
                    return combination.every(index => {
                        return cellElements[index].classList.contains(currentClass);
                    })
                })
            }

            function endGame(draw) {
                if (draw) {
                    winningMessageTextElement.innerText = 'Draw!'
                } else {
                    winningMessageTextElement.innerText = `${xTurn ? player.getPlayerName : "X's"} Wins!`
                }
                winningMessageElement.classList.add('show');
            }

            function isDraw() {
                return [...cellElements].every(cell => {
                    return cell.classList.contains(X_CLASS) || cell.classList.contains(CIRCLE_CLASS);
                })
            }

            // function restartGame() {
            //     cellElements.forEach(cell => {
            //         cell.classList.remove(X_CLASS);
            //         cell.classList.remove(CIRCLE_CLASS);
            //         cell.removeEventListener('click', startGame.handleClick);
            //     })
            //     winningMessageElement.classList.remove('show');

            //     startGame();
            // }

            socket.on("user-disconnected", function () {
                alert("The other player disconnected");
                location.reload();
            });
        }
    }
});