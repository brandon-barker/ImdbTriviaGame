$(function() {
    var socket = io.connect('http://localhost:3000');

    var Game = {
        players: [],
        ready: false,
        round: 1,
        start: function () {
            var startGame = $.get('/game/start/');
            startGame.done(function (data) {
               if (!data) {
                   // IMDb Top 250 list isn't ready yet...
               } else {
                   Game.startRound();
               }
            });
        },
        stop: function () {
            this.ready = false;
            this.round = 1;
        },
        startRound: function() {
            Game.ready = true;
            Game.enableAnswerField();
            $("#starting").hide();
            $.get('/get/question/' + Game.round, function (question) {
                Game.setQuestion(question);
            });
        },
        setQuestion: function(question) {
            console.log(question);
            $('.question').text('When was the movie "' + question + '" released?');
            $('.round-count').text('Round ' + Game.round + ' of 8.')
            $('.game').show();
        },
        answerQuestion: function(answer) {
            $.get('/get/answer/' + Player.userName + '/' + Game.round + '/' + answer, function (correct) {
                Game.disableAnswerField();
                socket.emit("answerQuestion", Game.round);

                if (correct) {
                    Player.score = Player.score + 5;
                } else {
                    Player.score = Player.score - 3;
                }
                console.log("Player (" + Player.userName + ") score: " + Player.score);
            });
        },
        enableAnswerField: function() {
            $("#answerBtn").removeClass('disabled');
        },
        disableAnswerField: function() {
            $("#answerBtn").addClass('disabled');
        }
    };

    var Player = {
        userName: '',
        score: 0,
        join: function () {
            Game.players.push(this);
            socket.emit("addPlayer", this);
        }
    };

    $("#join").click(function (e) {
        e.preventDefault();
        Player.userName = $("#player").val();
        Player.join();
        $("#playerInfo").hide();
        $("#welcome").html("Welcome, " + Player.userName + "!");
    })

    $("#answerBtn").click(function (e) {
        e.preventDefault();
        Game.answerQuestion($("#year").val());
    });

    socket.on('nextRound', function () {
        console.log('Moving onto the next round...');
        Game.round++;
        Game.startRound();
    });

    socket.on('gameOver', function () {
        console.log('Game over! Well played!');
        Game.stop();
    });

    socket.on('playerLeft', function(player) {
        Game.players.splice(player, 1);
    });

    socket.on('ready', function(ready) {
        if (ready) {
            console.log('Game has 2 players, ready to start!');
            Game.ready = true;
            $("#waiting").hide();
            $("#starting").show();
            Game.start();
        } else {
            console.log('1 or more players have left, resetting game...');
            Game.ready = false;
            $("#waiting").show();
            $("#starting").hide();
            Game.stop();
        }
    });
});