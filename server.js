 var path = require('path')
 var fs = require("fs");

var express = require("express");
var app     = express();

var http = require('http');
var server = http.createServer(app);

var io = require('socket.io')(server);

var Predict = require('./Predict/Predict.js').predict;
var Network = require('./Network.js').network;



app.use(express.static(path.join(__dirname, '/Views/public')));

server.listen(8080);

var predict = new Predict(new Network());

var supportData = {};

app.get('/chat', function (req, res) {
  res.sendFile(__dirname + '/Views/Chat/index.html');
});

app.get('/support', function (req, res) {
  res.sendFile(__dirname + '/Views/Support/index.html');
});

 app.get('/client', function (req, res) {
     res.sendFile(__dirname + '/Views/Client/index.html');
 });


io.on('connection', function (socket) {
	var data = {};
	  for(var key in supportData){
		  data[key] = {};
		  data[key]["wordDataBase"] = supportData[key].wordDataBase;
		  data[key]['responseDatabase'] = supportData[key].responseDatabase;
		  data[key]['trainingSample'] = supportData[key].trainingSample;
	  }
  socket.emit('load', {dataBase: data});
  console.log("Nouveau connecte");
  socket.on('talk', function (data) {
    var theResponse = predict.talk(data.message);
    socket.emit('answer', {response: theResponse} );
  });
  socket.on('addPredict', function (data) {
    if(supportData[data.id]){
      socket.emit('error', {message: "Cet id existe déjà!"});
    }else{
      supportData[data.id] = new Predict();
      socket.emit('validate', {message: "Le nouveau reseau " + data.id + " a été créé"} );
    }
  });
  socket.on('addOutput', function (data) {
    if(!supportData[data.networkId]){
      socket.emit('error', {message: "Le reseau " + data.networkId + " n'existe pas"});
    }else{
      supportData[data.networkId].learnResponse(data.newOutput);
      socket.emit('validate', {message: "La nouvelle sortie " + data.newOutput + " a été créé"} );
    }
  });
  socket.on('addInputs', function (data) {
    console.log(data.networkId + " et " + data.outputId);
    if(!supportData[data.networkId] || !supportData[data.networkId].responseDatabase[data.outputId]){
      socket.emit('error', {message: "Le reseau " + data.networkId + " n'existe pas ou la reponse n'existe pas."});
    }else{
      for(var i = 0; i < data.inputs.length; i++){
        supportData[data.networkId].inputToLearn(data.inputs[i], data.outputId);

      }
      socket.emit('validate', {message: "Les entrées pour la sortie " + supportData[data.networkId].responseDatabase[data.outputId] + " ont été créé"} );
    }
  });
  socket.on('validate', function (data) {
    for(var i in supportData){
      supportData[i].train();
    }
    socket.emit('validate', {message: "Les réseau ont été entrainé."} );
  });
  socket.on('save', function(data){
	  var data = {};
	  for(var key in supportData){
		  data[key] = {};
		  data[key]["wordDataBase"] = supportData[key].wordDataBase;
		  data[key]['responseDatabase'] = supportData[key].responseDatabase;
		  data[key]['trainingSample'] = supportData[key].trainingSample;
	  }

	  var json = JSON.stringify(data);
	  fs.writeFile('myData.json', json, 'utf8', function(){
		  socket.emit('validate', {message: "La base de données est sauvegardée."} );
	  });
  });
  socket.on('load', function(data){
	fs.readFile('myData.json', 'utf8', function readFileCallback(err, data){
		if (err){
			console.log(err);
		} else {
			supportData = {};
			data = JSON.parse(data);
			for(var key in data){
				supportData[key] = new Predict();
				console.log(data[key]);
				supportData[key].wordDataBase = data[key]['wordDataBase'];
				supportData[key].responseDatabase = data[key]['responseDatabase'];
				supportData[key].trainingSample = data[key]['trainingSample'];
				supportData[key].train();
			}
			socket.emit('validate', {message: "La Base de données est chargée."} );
			socket.emit('load', {dataBase: data});
		}
	});
  });
  socket.on('get', function(data){
    if(!supportData[data.id]){
      socket.emit('error', {message: "Le reseau " + data.id + " n'existe pas"});
    }else{
      var temp = data.message.replace(/'/g, " ").split(" ").filter(function ( str ) {
        var word = str.match(/(\w+)/);
        return word && word[0].length > 2;
      });
      var code = data.id;
      var response = "";
      response = supportData[code].test(data.message);
      if(response){
        for(var i = 0; i < supportData[code].wordDataBase.length; i++){
          if(temp.indexOf(supportData[code].wordDataBase[i]) !== -1){
            temp.splice(temp.indexOf(supportData[code].wordDataBase[i]), 1);
          }
        }
        code = checkForCode(response);
        while(code && supportData[code]){
          var input = supportData[code].test(data.message);
          if(input){
            for(var i = 0; i < supportData[code].wordDataBase.length; i++){
              if(temp.indexOf(supportData[code].wordDataBase[i]) !== -1){
                temp.splice(temp.indexOf(supportData[code].wordDataBase[i]), 1);
              }
            }
            response = response.replace("*"+code+"*", supportData[code].test(data.message));
            console.log(code);
            code = checkForCode(response);
          }else{
            socket.emit('unknown', {id: code, word: temp[temp.length - 1]});
            return;

          }
        }
        socket.emit('smartAnswer', {message: response});
      } else {
        socket.emit('unknown', {id: code, word: temp[temp.length - 1]});
      }
    }
  });
  socket.on('answer', function(data){
    var test = supportData[data.id].test(data.message);
    if(test){

      supportData[data.id].inputToLearn(data.word, supportData[data.id].responseDatabase.indexOf(test));
      supportData[data.id].inputToLearn(data.message, supportData[data.id].responseDatabase.indexOf(test));
      supportData[data.id].updateMyBrain();
      supportData[data.id].train();
      socket.emit('smartAnswer', {message: "Merci de m'avoir expliqué ce qu'est " + data.word});
    }else{
      supportData[data.id].learnResponse(data.message);
      supportData[data.id].inputToLearn(data.word, supportData[data.id].responseDatabase.indexOf(data.message));
      supportData[data.id].inputToLearn(data.message, supportData[data.id].responseDatabase.indexOf(data.message));
      supportData[data.id].updateMyBrain();
      socket.emit('smartAnswer', {message: "Merci de m'avoir expliqué ce qu'est " + data.word});
      supportData[data.id].train();
    }
  });
});


var checkForCode = function(message){
  var test = message.match('\\*(.*)\\*');
  console.log(test);
  if(test && test[1]){
    return test[1];
  }
  return false;
};
