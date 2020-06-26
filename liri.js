require("dotenv").config();

var keys = require("./keys.js");

var Spotify = require("node-spotify-api");

var spotify = new Spotify(keys.spotify);

var inquirer = require("inquirer");

var axios = require("axios");

var moment = require("moment");

var fs = require("fs");

var search = "";
var concert = "";
var song = "";
var movie = "";
var concertURL = "https://rest.bandsintown.com/artists/";
var concertApiKey = "/events?app_id=codingbootcamp";
var movieURL = "https://www.omdbapi.com/?apikey=6fe7b0d6&t=";

var movie = "";

function concertDisplay(data) {
  var name = data.venue.name;
  var location = data.venue.location;
  var dateTime = data.datetime;
  dateTime = dateTime.split("T");
  var date = moment(dateTime, "YYYY-MM-DD HH:mm:ss").format("MM/DD/YYYY");
  console.log("*---------------*");
  console.log(`Venue Name: ${name}`);
  console.log(`Location: ${location}`);
  console.log(`Date of Event: ${date}`);
  console.log("*---------------*");
}

function concertFunction(concertURL) {
  axios.get(concertURL).then(function (response) {
    var data = response.data;
    for (var i = 0; i < data.length; i++) {
      concertDisplay(data[i]);
    }
  });
}

function spotifyDisplay() {
  spotify
    .search({ type: "track", query: song })
    .then(function (response) {
      var items = response.tracks.items;

      console.log("*---------------*");
      var artist = items[0].artists;
      for (var j = 0; j < artist.length; j++) {
        console.log(artist[j].name);
      }
      console.log(items[0].name);
      var link = items[0].external_urls;
      console.log(link.spotify);
      console.log(items[0].album.name);
      console.log("*---------------*");
    })
    .catch(function (err) {
      console.log("this is an error");
    });
}

function movieFunction() {
  axios.get(movieURL + movie).then(function (response) {
    result = response.data;
    console.log("*---------------*");
    console.log(`Title: ${result.Title}`);
    console.log(`Date Released: ${result.Released}`);
    console.log(`IMDB Rating: ${result.Ratings[0].Value}`);
    console.log(`Rotten Tomatoes Rating: ${result.Ratings[1].Value}`);
    console.log(`Country Produced: ${result.Country}`);
    console.log(`Language: ${result.Language}\n`);
    console.log(`Plot: ${result.Plot}\n`);
    console.log(`Actors: ${result.Actors}`);
    console.log("*---------------*");
  });
}

function nobodyFunction() {
  axios.get(movieURL + movie).then(function (response) {
    result = response.data;
    console.log("*---------------*");
    console.log(`Title: ${result.Title}`);
    console.log(`Date Released: ${result.Released}`);
    console.log(`IMDB Rating: N/A`);
    console.log(`Rotten Tomatoes Rating: N/A`);
    console.log(`Country Produced: ${result.Country}`);
    console.log(`Language: ${result.Language}\n`);
    console.log(`Plot: ${result.Plot}\n`);
    console.log(`Actors: ${result.Actors}`);
    console.log("*---------------*");
  });
}

inquirer
  .prompt([
    {
      type: "list",
      name: "search",
      message: "What would you like to do?",
      choices: [
        "concert-this",
        "spotify-this-song",
        "movie-this",
        "do-what-it-says",
      ],
    },
  ])
  .then(function (answer) {
    search = answer.search;

    if (search === "concert-this") {
      inquirer
        .prompt([
          {
            type: "input",
            name: "concert",
            message: "Which artist or band would you like to search?",
          },
        ])
        .then(function (answer) {
          concert = answer.concert;
          concertURL = `${concertURL}${concert}${concertApiKey}`;
          concertFunction(concertURL);
        });
    }
    if (search === "spotify-this-song") {
      inquirer
        .prompt([
          {
            type: "input",
            name: "song",
            message: "What song would you like to search?",
          },
        ])
        .then(function (answer) {
          if (answer.song !== "") {
            song = answer.song;
            spotifyDisplay();
          } else {
            song = "the sign";
            spotifyDisplay();
          }
        });
    }
    if (search === "movie-this") {
      inquirer
        .prompt([
          {
            type: "input",
            name: "movieSearch",
            message: "What movie would you like to search?",
          },
        ])
        .then(function (answer) {
          if (answer.movieSearch !== "") {
            console.log("empty search '" + answer.movieSearch + "'");
            movie = answer.movieSearch;
            movieFunction();
          } else {
            console.log("Movie ==> " + answer.movieSearch);
            movie = "mr nobody";
            nobodyFunction();
          }
        });
    }
    if (search === "do-what-it-says") {
      inquirer
        .prompt([
          {
            type: "input",
            name: "doIt",
            message:
              'Please type one of the the following commands: "concert-this,<artist/band name here>", "spotify-this-song,<song name here>", "movie-this,<movie name here>"',
          },
        ])
        .then(function (answer) {
          fs.writeFile("random.txt", answer.doIt, function (err) {
            if (err) {
              return console.log(err);
            }

            fs.readFile("random.txt", "utf8", function (error, data) {
              if (error) {
                return console.log(error);
              }

              var dataArr = data.split(",");

              if (dataArr[0] === "concert-this") {
                concert = dataArr[1];
                concertURL = `${concertURL}${concert}${concertApiKey}`;
                concertFunction(concertURL);
              }
              if (dataArr[0] === "spotify-this-song") {
                song = dataArr[1];
                spotifyDisplay();
              }
              if (dataArr[0] === "movie-this") {
                movie = dataArr[1];
                movieFunction();
              }
            });
          });
        });
    }
  });
