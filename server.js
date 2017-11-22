 var path = require('path')

var express = require("express");
var app     = express();

var http = require('http');
var server = http.createServer(app);

var io = require('socket.io')(server);

var Predict = require('./Predict/Predict.js').predict;



app.use(express.static(path.join(__dirname, '/Views/public')));

server.listen(8080);

var predict = new Predict();

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
  socket.on('get', function(data){
    console.log(data.id);
    if(!supportData[data.id]){
      socket.emit('error', {message: "Le reseau " + data.id + " n'existe pas"});
    }else{
      var code = data.id;
      var response = "";
      response = supportData[code].test(data.message);
      code = checkForCode(response);
      while(code && supportData[code]){
        response = response.replace("*"+code+"*", supportData[code].test(data.message));
        console.log(code);
        code = checkForCode(response);
      }
      socket.emit('smartAnswer', {message: response});
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
