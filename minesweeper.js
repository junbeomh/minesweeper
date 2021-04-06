let myBoard = []

function createBoard(width, height, numOfBombs) {
    let board = document.getElementById('board')
    let i = 0;
    let choices = [];
    for (let y = 0; y < height; y++) {
        let row = document.createElement('tr');
        board.appendChild(row)
        let rowArray = []
        for (let x = 0; x < width; x++) {
            choices.push([y, x]);
            rowArray[x] = 0;
            let col = document.createElement('td');
            row.appendChild(col);
            col.id = y.toString() + " " + x.toString();
            col.class = "cols";
            col.innerHTML = " ";
            col.onmousedown = mark(col);
            i++;
        }
        myBoard[y] = rowArray;
    }

    for (let i = 0; i < numOfBombs; i++) {
        let index = Math.floor(Math.random() * choices.length)
        choice = choices[index];
        choices.splice(index, 1);
        myBoard[choice[0]][choice[1]] = 1;
    }
}

function reveal(x, y) {
    let neighborCount = countNeighborCells(x, y);
    let cell = document.getElementById(y + " " + x);
    if ("cols revealed" == cell.class) {
        console.log("already revealed");
        return
    }
    if ("cols flag" == cell.class) {
        cell.class = "clols revealed";
        cell.innerHTML = " ";
    }
    cell.class = "cols revealed";
    if (neighborCount > 0) {
        cell.innerHTML = neighborCount;
        cell.style.backgroundColor = "rgb(150, 150, 150)";
        increaseScore()
    } else if (neighborCount == 0) {
        cell.innerHTML == " "
        cell.style.backgroundColor = "rgb(150, 150, 150)";
        increaseScore()
        revealAdjacent(x, y);
    } else {
        cell.innerHTML = "X";
        cell.style.backgroundColor = "tomato";
    }
    numOfUnrevealed--;
}

function revealAdjacent(x, y) {
    for (let yOffset = -1; yOffset <= 1; yOffset++) {
        for (let xOffset = -1; xOffset <= 1; xOffset++) {
            let i = yOffset + y;
            let j = xOffset + x;
            if (j > -1 && j < w && i > -1 && i < h) {
                if (myBoard[i][j] == 0 && document.getElementById(i + " " + j).class != "cols revealed") {
                    reveal(j, i);
                    //document.getElementById(i + " " + j).style.backgroundColor = "white";
                }
            }
        }
    }
}

function mark(col) {
    return function () {
        if (isGameEnded) {
            return
        } else if (event.button == 2 && col.class == "cols" && numOfFlags > 0) {
            col.innerHTML = "F";
            col.style.backgroundColor = "rgb(255, 208, 0)";
            col.class = "cols flag";
            numOfFlags--;
            document.getElementById("numOfFlags").innerHTML = "Flags remaining: " + numOfFlags;

        } else if (event.button == 2 && col.class == "cols flag") {
            col.innerHTML = " ";
            col.style.backgroundColor = "white";
            col.class = "cols"
            numOfFlags++;
            document.getElementById("numOfFlags").innerHTML = "Flags remaining: " + numOfFlags;
        } else if (col.class == "cols") {
            console.log("!");
            let xy = col.id.split(" ");
            let y = parseInt(xy[0]);
            let x = parseInt(xy[1]);
            reveal(x, y);
            if (myBoard[y][x] == 1) {
                endGame();
            }
        }
        if (numOfUnrevealed <= numOfBombs) {
            console.log("!!@!@");
            endGame();
        } else {
            console.log(numOfUnrevealed);
            console.log(numOfBombs);
        }
    }
}

function countNeighborCells(x, y) {
    x = parseInt(x);
    y = parseInt(y);
    count = 0;

    if (myBoard[y][x] == 1) {
        return -1;
    }

    for (i = -1; i <= 1; i++) {
        for (k = -1; k <= 1; k++) {
            if (y + i > -1 && y + i < h) {
                neighborCell = myBoard[y + i][x + k];
                if (neighborCell == 1) {
                    count++
                }
            }
        }
    }
    return count;
}

function playExplosionSound() {
    let explosionSound = new Audio('./explosion.mp3');
    explosionSound.play();
}

function endGame() {
    playExplosionSound();
    isGameEnded = true;
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            if (myBoard[y][x] == 1) {
                // setTimeout(reveal(x, y), 200);
                reveal(x, y);
            }
        }
    }
    setTimeout(function() {
        saveUser(score);
    }, 100);
    setTimeout(function () {
        showLeaderBoad();
        hideBoard();
    }, 500);
}

function showLeaderBoad() {
    setTimeout(retrieveUsers, 500);
    document.getElementById('leaderBoard').style.display = 'block';
}

function hideBoard() {
    document.getElementById('board').style.display = 'none';
}

function askUserName() {
    userName = prompt('What is your name?')
    return userName;
}

function increaseScore() {
    score++;
    document.getElementById('score').innerHTML = score;
}

function timer() {
    if (!isGameEnded) {
        second++;
        if (second == 60) {
            second = 0;
            minute++;
        }
        document.getElementById('timer').innerHTML = minute + " : " + second;
    }
}

function saveUser(score) {
    userName = askUserName();
    if (userName == null) {
        return;
    }

    userDatabase = firebase.database().ref().child('users');
    userDatabase.update({
        [userName]: {
            score: score
        }
    });
}

function retrieveUsers() {
    let leaderBoard = document.getElementById('userList');
    let userData = []
    let userDatabase = firebase.database().ref('users');
    userDatabase.orderByChild('score').limitToLast(5).on('child_added', function (snapshot) {
        userData.push([snapshot.key, snapshot.val().score]);
    });

    setTimeout(function () {
        let j = 1;
        for (let i = userData.length - 1; i > -1; i--) {
            let userLi = document.createElement('li');
            leaderBoard.appendChild(userLi);
            console.log(userData[i]);
            userLi.innerHTML = j + ". " + userData[i][0] + ": " + userData[i][1];
            j++;
        }
    }, 300);
}

function revealAllBombs() {
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            if (myBoard[y][x] == 1) {
                // setTimeout(reveal(x, y), 200);
                reveal(x, y);
            }
        }
    }
}

function restart() {
    location.reload();
}

function removeElementById(elementId){
    let element = document.getElementById(elementId);
    element.parentNode.removeChild(element);
}

function setDifficulty(difficulty) {
    isGameEnded = false;
    if (difficulty == 1) {
        numOfBombs = 30;
    } else if (difficulty == 2) {
        numOfBombs = 50;
    } else {
        numOfBombs = 70;
    }
    createBoard(w, h, numOfBombs);
    numOfFlags = numOfBombs;
    document.getElementById('numOfFlags').innerHTML = "Flags remaining: " + numOfFlags;
    removeElementById('difficultyButtonContainer');
}


    let w = 15;
    let h = 15;
    let numOfUnrevealed = w * h;
    let numOfBombs = 60;
    let score = 0;
    let isGameEnded = true;
    let numOfFlags = numOfBombs;
    let second = 0;
    let minute = 0;
    let playerName = "";

    revealAllBombs();
    setInterval(timer, 1000);