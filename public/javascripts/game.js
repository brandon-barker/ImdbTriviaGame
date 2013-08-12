$(function() {
    // Taken from http://stackoverflow.com/questions/17257237/decode-mixed-ascii-codes-from-a-string-in-javascript
    function decodeHtmlNumeric( str ) {
        return str.replace( /&#([0-9]{1,7});/g, function( g, m1 ){
            return String.fromCharCode( parseInt( m1, 10 ) );
        }).replace( /&#[xX]([0-9a-fA-F]{1,6});/g, function( g, m1 ){
                return String.fromCharCode( parseInt( m1, 16 ) );
            });
    }

    var socket = io.connect('http://localhost:3000');

    var Game = {
        players: [],
        ready: false,
        round: 1,
        start: function () {
            Game.ready = true;
            $("#waiting").hide();
            $(".player-info").hide();
            $(".game").show();

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
            Player.score = 0;
            $("#waiting").show();
            $(".player-info").show();
            $(".game").hide();
            $(".intro").hide();
            $(".results").hide();
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
            $('.question').text('In which year was the movie "' + decodeHtmlNumeric(question) + '" released?');
            $('.round-count').text('Round ' + Game.round + ' of 8')
            $('.game').show();
            $('.waiting-for-player').hide();
        },
        answerQuestion: function(answer) {
            $.get('/get/answer/' + Player.userName + '/' + Game.round + '/' + answer, function (correct) {
                if (correct) {
                    Player.addPoints();
                } else {
                    Player.deductPoints();
                }

                console.log("Player (" + Player.userName + ") score: " + Player.score);
                $(".score").text(Player.score);

                Game.disableAnswerField();
                socket.emit("answerQuestion", Game.round);
            });
        },
        enableAnswerField: function() {
            $("#answerBtn").removeClass('disabled');
        },
        disableAnswerField: function() {
            $("#answerBtn").addClass('disabled');
        },
        showResults: function(players) {
            $("#waiting").hide();
            $(".player-info").hide();
            $(".game").hide();
            $(".intro").hide();
            var me = players[Player.id];
            var opponent;

            for (var i in players) {
                console.log(players[i].id + ' ' + Player.id);
                if (players[i].id !== Player.id) {
                    opponent = players[i];
                }
            }

            if (me.score > opponent.score) {
                // Congrats! You won!
                $('.results-success').show();
            }
            if (me.score < opponent.score) {
                // Haha! You lost!
                $('.results-fail').show();
            }
            if (me.score == opponent.score) {
                // Lame, you drew
                $('.results-draw').show();
            }

            $('.stats-me-id').text(me.id);
            $('.stats-me-username').text(me.userName);
            $('.stats-me-score').text(me.score);
            $('.stats-opponent-id').text(opponent.id);
            $('.stats-opponent-username').text(opponent.userName);
            $('.stats-opponent-score').text(opponent.score);
            $('.results').show();
        }
    };

    var Player = {
        id: '',
        userName: '',
        score: 0,
        join: function () {
            Game.players.push(this);
            socket.emit("addPlayer", this);
        },
        addPoints: function() {
            Player.score = Player.score + 5;
            socket.emit("logPoints", this);
        },
        deductPoints: function() {
            Player.score = Player.score - 3;
            socket.emit("logPoints", this);
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
        //$("#welcome").html("Hello, " + Player.userName + "!");
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

    socket.on('playerId', function(id) {
        Player.id = id;
        console.log(Player.userName + ' with id ' + Player.id);
    });

    socket.on('nextRound', function () {
        console.log('Moving onto the next round...');
        Game.round++;
        Game.startRound();
    });

    socket.on('gameOver', function (players) {
        console.log('Game over! Well played!');
        Game.stop();
        Game.showResults(players);
    });

    socket.on('playerLeft', function(player) {
        Game.players.splice(player, 1);
    });

    socket.on('ready', function(ready) {
        if (ready) {
            console.log('Game has 2 players, ready to start!');
            Game.start();
        } else {
            console.log('1 or more players have left, resetting game...');
            Game.stop();
        }
    });
});
