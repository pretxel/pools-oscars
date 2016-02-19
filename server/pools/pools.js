Categories = new Meteor.Collection("categories");
Predictions = new Meteor.Collection("predictions");
var og = Meteor.npmRequire('open-graph');


replaceAll = function(text, search, replacement) {
    return text.replace(new RegExp(search, 'g'), replacement);
}


Meteor.startup(function () {
    // code to run on server at startup
    if (Categories.find({}).fetch().length == 0){
    	// Create Data by default
    	console.log("Insert Data by default");
    	Meteor.call('insertDataByDefault', handlerInsertData);
    }else{
    	console.log("There are items on MongoDB");
    }
   

});


function handlerInsertData(error, result){
	console.log(result);
	Meteor.call('getCategories', function (err, result) {
	 console.log(err != undefined ? err : "" );	
	 });
}


function searchImage(url,callback){
	var response;
	og(url, function(err, meta){
		//console.log(meta.image.url);
		response = meta;
		callback(null,response);
	})
	// callback(null,response);
}


Meteor.methods({
	getOMDB: function (url) {
    // check(arg1, String);
    var result_g;
    var uri = encodeURIComponent(url);
    try {
    	result_g = HTTP.get("http://www.omdbapi.com/?t="+uri+"&y=&plot=short&r=json");
    } catch (e) {
    	console.log(e);
    }
    
    return result_g;
},
resetDB: function (opt) {
    // check(arg1, String);
    if (opt!= undefined){
    	if (opt.category == 1){
    		Categories.remove({});
    		Meteor.call('insertDataByDefault', handlerInsertData);
    	}
    	if (opt.prediction == 1){
    		Predictions.remove({});
    	}
    }else{
    	return "Miss opt variable";
    }
    return "Success";
},
insertPrediction: function (data) {
    // check(arg1, String);
    if (data!= undefined){
    	Predictions.insert(data);
    }else{
    	return "Miss opt variable";
    }
    return "Success";
},
getPredictions: function (data) {
    // check(arg1, String);
    var predictions = Predictions.find({}).fetch();

    predictions.forEach(function(prediction, index, array){

    	if(prediction.points == undefined){
    		prediction.points = 0;
    	}

    });


    return predictions;
},
getCategories: function(){
	var categories = Categories.find().fetch();
	categories.forEach(function(category, index, array){
		var isNewRegister = false;
		var name_radio = category.name_radio;
		if (category.nominates != undefined){
			if (category.nominates.length > 0){
				category.nominates.forEach(function(element, index, array){
					var url = "http://www.omdbapi.com/?t="+element.name+"&y=&plot=short&r=json"; 
					
					try {
						
						element.name_underline = replaceAll(element.name.toLowerCase()," ","_");
						element.name_radio = name_radio;
						// var result = Meteor.call('getOMDB', element.name, function(error, result){
						// 	element.img_movie = result.data.Poster;
						// 	element.url_imdb = "http://www.imdb.com/title/" + result.data.imdbID;
						// 	element.summary = result.data.Plot;
						// 	// console.log(result.data.Poster);
						// });

						var key = "AIzaSyAdjBxfdbsJws_K4tD_KonYekSXOkj_RpE";
						var key2 = "AIzaSyDLar8qEue9piXbO-avZABbCr1rJSWSvJc";
						var key3 = "AIzaSyCTacsVlWzU7vXVjArwbBxJaIwxEckSVkM";
						var key4 = "AIzaSyD9ca_6y5aDDMI1pRLrRd74bCwcVCRMy9I";
						var cx = "016719678409975085383:hb4ihq5tpwy";
					    var query = encodeURIComponent(element.name);
					    if (element.url_imdb == undefined){
					    	console.log("No hay imagen, se va consultar API Google Custom Search");
					    	var wrapperGET  = Meteor.wrapAsync( HTTP.get ),
							wrapperGETSync = wrapperGET( "https://www.googleapis.com/customsearch/v1?key="+key4+"&cx="+cx+"&q="+query, {} );

							// console.log(wrapperGETSync.data.items.length);
							element.url_imdb = wrapperGETSync.data.items[0].link;

							var searchImageSync = Meteor.wrapAsync(searchImage);
							var result = searchImageSync(element.url_imdb);
							element.img_movie = result.image.url;
							element.summary = result.description;
						
							isNewRegister = true;

					    }else{
					    	isNewRegister = false;
					    }

											
		            return true;
		        } catch (e) {
		          // Got a network error, time-out or HTTP error in the 400 or 500 range.
		          console.log(e);
		          return false;
		      }
		  });
			
			if (isNewRegister){
				Categories.update({name_category: category.name_category}, {$set: { nominates: category.nominates }});
			}
			
			}


		}
	});
	// console.log(categories);	
	return categories;
}
});

