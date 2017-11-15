// random.txt
var fileName = "random.txt";
var fs = require("fs");
// twitter module declaration
var Twitter = require("twitter");

// node-spotify-api module declaration
var Spotify = require("node-spotify-api");

// request module declaration
var Request = require("request");

// import necessary keys
var applicableKeys = require("./keys.js");

// list of parameters used to request API information
var myParam = process.argv.slice(3);

// Argument related to what client to search for information

var applicableCalls = ["my-tweets","spotify-this-song","movie-this"];

var myOps = process.argv[2] === undefined ? "" : (process.argv[2]).toLowerCase();
console.log(myOps);

var actOps = [];

// readMe object describing the Application
var readMe = {
	line1: "--------------------------------------------------------------------------------------",
	line2: "ARGUMENTS:",
	line3: "node app.js [readme | my-tweets[, <Screen_name>] | spotify-this-song[, <track_name>] | movie-this[, <movie_name>]]",
	line4: "--------------------------------------------------------------------------------------",
	line5: "DESCRIPTION:",
	line6: "Application that allows you to gather data from Twitter, Spotify, and IMDB"
}

// required object for npm twitter module
var twittClient = new Twitter({
	consumer_key: applicableKeys.twttrKeys.TWITTER_CONSUMER_KEY,
	consumer_secret: applicableKeys.twttrKeys.TWITTER_CONSUMER_SECRET,
	access_token_key: applicableKeys.twttrKeys.TWITTER_ACCESS_TOKEN_KEY,
	access_token_secret: applicableKeys.twttrKeys.TWITTER_ACCESS_TOKEN_SECRET
});

// required object for npm node-spotify-api module
var spotifyClient = new Spotify({
	id: applicableKeys.spotKeys.SPOTIFY_CLIENT_ID,
	secret: applicableKeys.spotKeys.SPOTIFY_CLIENT_SECRET
});

// required API key for OMDB
var OMDBKeys = applicableKeys.OMDBKeys.OMDB_API_KEY;

// error check function

var myErrors = function(error) {
	if (error) {
		return console.log('Error occurred: ' + error);
	}
}

var spotifyThis = function(ParamORE) {
	spotifyClient.search({ type: 'track', query: ParamORE.join("%20") }, function(error, spotData) {
		myErrors(error);
		maxTracks = spotData.tracks.items.length < 20 ? spotData.tracks.items.length : 20;
		for (var i = 0; i < maxTracks; i++) {
			//	- Artist(s):
			console.log("---------------------------------------------------");
			console.log("ARTIST:")
			console.log(spotData.tracks.items[i].album.artists[0].name);
			
			//  - Song's name:
			console.log("TRACK NAME:")
			console.log(spotData.tracks.items[i].name);
			
			//  - A preview link of the song:
			console.log("SAMPLE URL:")
			console.log(spotData.tracks.items[i].preview_url);
			
			//  - The album that the song is from:
			console.log("ALBUM:")
			console.log(spotData.tracks.items[i].album.name);				
		}
	});
}

var tweetThis = function(paraTweet) {
	twittClient.get('statuses/user_timeline', {screen_name: paraTweet.join("%20")}, function(error, tweetsData, response) {
		myErrors(error);
		var maxTweets = tweetsData.length < 20 ? tweetsData.length : 20;
		for(var i = 0; i < maxTweets;i++ ) {
			console.log("\n@"+tweetsData[i].user.screen_name);
			console.log(tweetsData[i].text);
		}
	});
}

var omdbThis = function(paraMovies) {
	queryURL="http://www.omdbapi.com/?i=tt3896198&apikey=" + OMDBKeys+"&t=" + paraMovies.join("%20");
	console.log(queryURL);
	Request(queryURL, function(error, response, OMDBData){
		myErrors(error);
		bodyJSON = JSON.parse(OMDBData);
		console.log(JSON.stringify(bodyJSON,null,2));
		// Title of the movie
		console.log("Title:",bodyJSON.Title);
		
		// Year the movie came out
		console.log("Release Date:",bodyJSON.Year);
		
		// IMDB Rating of the movie
		console.log("Rated:",bodyJSON.Rated);
		
		// Rotten Tomatores Rating of the movie
		console.log(bodyJSON.Ratings[1].Source+":",bodyJSON.Ratings[1].Value);
		
		// Country where the movie was produced
		console.log("Country of Origin:",bodyJSON.Country);
		
		// Language of the movie
		console.log("Language:",bodyJSON.Language);
		
		// Plot of the movie
		console.log("Plot:",bodyJSON.Plot);
		
		// Actors in the movie
		console.log("Actors:",bodyJSON.Actors);
	});	
}

fs.readFile(fileName,"utf8",function(error,genData){
	actOps = genData.split(",");
	if(applicableCalls.indexOf(myOps) === -1 || myOps === 'do-what-it-says') {
		myOps = actOps[0];
		myParam = [];
		myParam.push(actOps[1]);
	}
	spotifyThis(myParam);
});



switch(myOps){
	case 'readme':
		for(key in readMe) {
			console.log(readMe[key]);
		}
		break;
	case 'my-tweets':
		tweetThis(myParam);
		break;
	case 'spotify-this-song':
		spotifyThis(myParam);
		break;
	case 'movie-this':
		omdbThis(myParam);
		break;
	case 'do-what-it-says':
		console.log("...");
		break;
	default:
		console.log(myOps," is not a proper operational argument");
}
