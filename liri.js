require("dotenv").config();

var keys = require("./keys");

var Spotify = require("node-spotify-api");

var request = require("request");

var moment = require("moment");

var fs = require("fs");

var spotify = new Spotify(keys.spotify);

var writeToLog = function (data) {

  fs.appendFile("log.txt", JSON.stringify(data) + "\n", function (err) {
    if (err) {
      return console.log(err);
    }

    console.log("log.txt was updated!");
  });
};

var getArtistNames = function (artist) {
  return artist.name;
};

var help = function () {
  console.log("********************************");
  console.log(" ");
  console.log("node liri concert-this ARTIST/BAND NAME");
  console.log("--- Will show you the upcoming concerts for the mentioned Artist/Band");
  console.log(" ");
  console.log("node liri spotify-this-song SONG NAME");
  console.log("--- Will provide details about the mentioned song.");
  console.log(" ");
  console.log("node liri movie-this MOVIE NAME");
  console.log("--- Will provide details about the mentioned movie.");
  console.log(" ");
  console.log("node liri help");  
  console.log("-- Will print this message again.");
  console.log(" ");
  console.log("********************************");
};

var getMeSpotify = function (songName) {
  if (songName === undefined) {
    songName = "What's my age again";
  }

  spotify.search({ type: "track", query: songName }, function (err, data) {
    if (err) {
      console.log("Error occurred: " + err);
      return;
    }

    var songs = data.tracks.items;
    var data = [];

    for (var i = 0; i < songs.length; i++) {
      data.push({
        "artist(s)": songs[i].artists.map(getArtistNames),
        "song name: ": songs[i].name,
        "preview song: ": songs[i].preview_url,
        "album: ": songs[i].album.name
      });
    }

    console.log(data);
    writeToLog(data);
  });
};

var getMyBands = function (artist) {
  var queryURL = "https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp";

  request(queryURL, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var jsonData = JSON.parse(body);

      if (!jsonData.length) {
        console.log("No results found for " + artist);
        return;
      }

      var logData = [];

      logData.push("Upcoming concerts for " + artist + ":");

      for (var i = 0; i < jsonData.length; i++) {
        var show = jsonData[i];

        logData.push(
          show.venue.city +
          "," +
          (show.venue.region || show.venue.country) +
          " at " +
          show.venue.name +
          " " +
          moment(show.datetime).format("MM/DD/YYYY")
        );
      }

      console.log(logData.join("\n"));
      writeToLog(logData.join("\n"));
    }
  });
};

var getMeMovie = function (movieName) {
  if (movieName === undefined) {
    movieName = "Troy";
  }

  var urlHit = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=full&tomatoes=true&apikey=trilogy";

  request(urlHit, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var jsonData = JSON.parse(body);

      var data = {
        "Title:": jsonData.Title,
        "Year:": jsonData.Year,
        "Rated:": jsonData.Rated,
        "IMDB Rating:": jsonData.imdbRating,
        "Country:": jsonData.Country,
        "Language:": jsonData.Language,
        "Plot:": jsonData.Plot,
        "Actors:": jsonData.Actors,
        "Rotten Tomatoes Rating:": jsonData.Ratings[1].Value
      };

      console.log(data);
      writeToLog(data);
    }
  });
};

var doWhatItSays = function () {
  fs.readFile("random.txt", "utf8", function (error, data) {
    console.log(data);

    var dataArr = data.split(",");

    if (dataArr.length === 2) {
      pick(dataArr[0], dataArr[1]);
    }
    else if (dataArr.length === 1) {
      pick(dataArr[0]);
    }
  });
};

var pick = function (caseData, functionData) {
  switch (caseData) {
    case "concert-this":
      getMyBands(functionData);
      break;
    case "spotify-this-song":
      getMeSpotify(functionData);
      break;
    case "movie-this":
      getMeMovie(functionData);
      break;
    case "help":
      help(functionData);
      break;
    case "do-what-it-says":
      doWhatItSays();
      break;
    default:
      console.log(" ");
      console.log(" ");
      console.log("TYPE node liri help TO DISPLAY AVAILABLE COMMANDS.");
  }
};

var runThis = function (argOne, argTwo) {
  pick(argOne, argTwo);
};

runThis(process.argv[2], process.argv.slice(3).join(" "));
