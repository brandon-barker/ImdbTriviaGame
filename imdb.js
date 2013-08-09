var movies = [],
    rounds = [],
    ready = false;

// Scrape IMDb Top 250 chart and store the titles in our movie array
var getTop250 = function () {
    require('node.io').scrape(function() {
        this.getHtml('http://www.imdb.com/chart/top?ref_=nb_mv_3_chttp', function(err, $) {
            //Handle any request / parsing errors
            if (err) this.exit(err);

            $('font').has('a[href^="/title/"]').each(function(elem) {
                var title = elem.children[0].children[0].data;
                var year = elem.text.replace('(', '').replace(')', '').replace('/I','');

                movies.push({ movie:title, year:year });
            });

            exports.ready = true;
            ready = true;
        });
    });
};

var setupRounds = function () {
    for (var i = 1; i <= 8; i++) {
        console.log('Setting up Round #' + i);

        // Get a random movie from the movie list
        var movie = movies[Math.floor(Math.random() * (movies.length / i))];

        var round = {
            number: i,
            title: decodeURIComponent(movie.movie),
            year: movie.year,
            answers: 0
        }

        rounds.push(round);
        console.log(round);
    }

    exports.rounds = rounds;
}

var clearRounds = function () {
    rounds = [];
    setupRounds();
    exports.rounds = rounds;
}


exports.getTop250 = getTop250;
exports.setupRounds = setupRounds;
exports.clearRounds = clearRounds;
exports.ready = ready;