class Predict {
  constructor(){
    this.actualMessage = "";
    this.wordDataBase = [];
    this.responseDatabase = [];

    this.brain = null;

    this.trainingSample = [];

    //create random custom answers

    this.responseDatabase.push("Essayer de rallumer votre ordinateur");

    this.responseDatabase.push("Lancez votre antivirus");

    this.responseDatabase.push("Verifiez les paramatres reseau et proxy");


  }

  learnWords(message){
    message = message.replace(/'/g, " ");
    message = message.split( ' ' ).filter(function ( str ) {
      var word = str.match(/(\w+)/);
      return word && word[0].length > 2;
    }).join( ' ' );
    message = message.split(" ");
    for(var i = 0; i < message.length; i++){
      if(this.wordDataBase.indexOf(message[i]) == -1){
        this.wordDataBase.push(message[i]);
      }
    }
  }

  //let's set the way our program will learn from inputs
  inputToLearn(message, response){
    var expected = new Array(this.responseDatabase.length + 1).join('0').split('').map(parseFloat);
    expected[response - 1] = 1;
    message = message.replace(/'/g, " ");
    message = message.split( ' ' ).filter(function ( str ) {
      var word = str.match(/(\w+)/);
      return word && word[0].length > 2;
    }).join( ' ' );
    message = message.split(" ");
    /*for(var i = 0; i < message.length; i++){
      if(this.wordDataBase.indexOf(message[i]) == -1){
        this.wordDataBase.push(message[i]);
      }
    }*/
    var data = new Array(this.wordDataBase.length + 1).join('0').split('').map(parseFloat);
    for(var i = 0; i < message.length; i++){
      data[this.wordDataBase.indexOf(message[i])] += 1;
    }
    this.trainingSample.push([data, expected]);
  }

  getABrain(){
    this.brain = new Network(this.wordDataBase.length, this.wordDataBase.length + this.responseDatabase.length, this.responseDatabase.length );
  }

  train(){
    this.learnWords("Bonjour reseau est inaccessible et le navigateur internet ne s'ouvre pas lag et je crois que j'ai un virus l'ordinateur chauffe beaucoup mon pc est bloqué et ne comprend pas le pare feu windows et ne s'allume plus il y a un soucis et s'eteint sans arret c est incomprehensible reseau internet lumiere erreur google page chauffe froid bloque virus anti acceder lag ram");
    this.inputToLearn("l'ordinateur lag et je crois que j'ai un virus", 2);
    this.inputToLearn("le reseau est inaccessible et le navigateur internet ne s'ouvre pas", 3);
    this.inputToLearn("Bonjour, l'ordinateur chauffe beaucoup", 1);
    this.getABrain();
    if(!this.brain){
      console.log("Error! No brain found!");
    }else{
      this.brain.setClasses(this.responseDatabase);
      this.brain.trainClass(this.trainingSample);
    }
  }

  test(message){
    message = message.replace(/'/g, " ");
    message = message.split( ' ' ).filter(function ( str ) {
      var word = str.match(/(\w+)/);
      return word && word[0].length > 2;
    }).join( ' ' );
    message = message.split(" ");
    var data = new Array(this.wordDataBase.length + 1).join('0').split('').map(parseFloat);
    for(var i = 0; i < message.length; i++){
      if(this.wordDataBase.indexOf(message[i]) != -1){
        data[this.wordDataBase.indexOf(message[i])] += 1;
      }
    }
    this.brain.testClass(data);
  }

}
