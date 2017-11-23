var Network = require('../Network.js').network;

class Predict {
  constructor(){
    this.actualMessage = "";
    this.actualAnswer = -1;
    this.wordDataBase = [];
    this.responseDatabase = [];
    this.badWordsDatabase = [];
    this.brain = null;

    this.trainingSample = [];


    //create ignorable wordDataBase

    this.badWordsDatabase.push("mon", "ton", "son", "notre", "votre", "leur", "ils", "nous", "vous", "elle", "ses", "mes", "un", "une", "le", "la", "des", "les");





  //learn words with a limit of 100 in our database
  this.learnWords = function(message){
    if(this.wordDataBase.length < 101){
      message = message.replace(/'/g, " ");
      for(var i = 0; i < this.badWordsDatabase.length; i++){
        message = message.replace(new RegExp(this.badWordsDatabase[i], "g"), ""); //remove ignorable words from our message
      }
      message = message.split( ' ' ).filter(function ( str ) {
        var word = str.match(/(\w+)/);
        return word && word[0].length > 1;
      }).join( ' ' );
      message = message.split(" ");

      for(var i = 0; i < message.length; i++){
        if(this.wordDataBase.indexOf(message[i]) == -1 && this.wordDataBase.length < 101){
          this.wordDataBase.push(message[i]);
        }
      }
    }
  };

  this.learnResponse = function(message){
    this.responseDatabase.push(message);
  };

  this.talk = function(message){
    this.learnResponse(message);
    if(this.actualAnswer != -1){
      this.inputToLearn(this.responseDatabase[this.actualAnswer], this.responseDatabase.length - 1); //we learn what answer we can give to a message
    }
    if(this.responseDatabase.length < 30){
      this.actualAnswer = Math.floor(Math.random() * (this.responseDatabase.length - 1)); // we generate a random answer
      return this.responseDatabase[this.actualAnswer];
      if(this.brain.outputs.length - this.responseDatabase.length > 5){
        this.updateMyBrain();
      }
    } else {
      if(!this.brain){ //if the neural network doesn't exist we create it
        this.getABrain();
        this.train();
      }
      var intelligentAnswer = this.test(message);
      return intelligentAnswer;
    }
  };

  //let's set the way our program will learn from inputs
  this.inputToLearn = function(message, response){
    var expected = new Array(100 + 1).join('0').split('').map(parseFloat);
    expected[response] = 1;
    this.learnWords(message);
    message = message.replace(/'/g, " ");
    message = message.split( ' ' ).filter(function ( str ) {
      var word = str.match(/(\w+)/);
      return word && word[0].length > 2;
    }).join( ' ' );
    message = message.split(" ");
    var data = new Array(100 + 1).join('0').split('').map(parseFloat);
      for(var i = 0; i < message.length; i++){
        if(this.wordDataBase.indexOf(message[i]) != -1){
          data[this.wordDataBase.indexOf(message[i])] += 1;
        }
      }
    this.trainingSample.push([data, expected]);
  };

  //create the neural network
  this.getABrain = function(){
    this.brain = new Network(100, 100 + this.responseDatabase.length, this.responseDatabase.length );
  };

  //train the neural network with the training samples we stored
  this.train = function(){
    if(!this.brain){
      this.getABrain();
      this.brain.setClasses(this.responseDatabase);
      this.brain.trainClass(this.trainingSample);
    }else{
      this.brain.setClasses(this.responseDatabase);
      this.brain.trainClass(this.trainingSample);

    }
  };

  //update the answers possibilities in the neural network
  this.updateMyBrain = function(){
    this.brain.updateOutputs(this.responseDatabase.length);
    this.brain.setClasses(this.responseDatabase);
    this.brain.trainClass(this.trainingSample);
  };

  //test what the network would answer to a message
  this.test = function(message){
    if(!this.brain){
      this.getABrain();
    }
    message = message.replace(/'/g, " ");
    message = message.split( ' ' ).filter(function ( str ) {
      var word = str.match(/(\w+)/);
      return word && word[0].length > 2;
    }).join( ' ' );
    message = message.split(" ");
    var data = new Array(100 + 1).join('0').split('').map(parseFloat);
    for(var i = 0; i < message.length; i++){
      if(this.wordDataBase.indexOf(message[i]) != -1){
        data[this.wordDataBase.indexOf(message[i])] += 1;
      }
    }
    var check = false;
    for(var i = 0; i < data.length; i++){
      if(data[i]){
        check = true;
      }
    }
    if(check){
      return this.brain.testClass(data);
    } else {
      return false;
    }
  };

  }

}

module.exports.predict = function(){return new Predict();};
