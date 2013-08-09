$(function() {
    var socket = io.connect('http://brandonbarker.net:3000');

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
            Game.ready = false;
            Game.round = 1;
            $.get('/game/stop/');
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
            $('#year').val('');
            $('.question').text('In which year was the movie "' + question + '" released?');
            $('.round-count').text('Round ' + Game.round + ' of 8.')
            $('.game').show();
            $('.waiting-for-player').hide();
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
        $("#player").attr('disabled', 'disabled');
        $("#join").addClass('disabled');
        $("#waiting").show();
        //$("#playerInfo").hide();
        $("#welcome").html("Hello, " + Player.userName + "!");
    })

    $("#answerBtn").click(function (e) {
        e.preventDefault();
        Game.answerQuestion($("#year").val());
        $('.waiting-for-player').show();
    });

    $("#get-started").click(function (e) {
        e.preventDefault();
        $(".intro").hide();
        $(".player-info").show();
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
            $(".player-info").hide();
            $(".game").show();
            Game.start();
        } else {
            console.log('1 or more players have left, resetting game...');
            Game.ready = false;
            $("#waiting").show();
            $(".player-info").show();
            $(".game").hide();
            $(".intro").hide();
            Game.stop();
        }
    });
});