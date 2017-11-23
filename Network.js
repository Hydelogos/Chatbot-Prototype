class Neuron{
  constructor(weights){
    this.in = 1;
    this.out = 1;
    this.weights = [];
    for(var i = 0; i < weights; i++){
      var test = Math.random();
      if(test == 0){
        test+=0.1;
      }
      this.weights.push(test);
    }

  this.updateWeightsNumber = function(number){
    for(var i = 0; i < number; i++){
      var test = Math.random()/1000 ;
      if(test == 0){
        test+=0.1;
      }
      this.weights.push(test);
    }
  }
  }
}

class Network{
  constructor(input, hidden, output){
    this.bias = [];
    this.inputs = [];
    this.hiddens = [];
    this.outputs = [];
    this.target = [];
    this.classes = [];
    this.bias.push(new Neuron(hidden));
    this.bias.push(new Neuron(output));
    this.learningRate = 0.1;
    this.error = 0;
    for(var i = 0; i < input; i++){
      this.inputs.push(new Neuron(hidden));
    }
    for(var i = 0; i < hidden; i++){
      this.hiddens.push(new Neuron(output));
    }
    for(var i = 0; i < output; i++){
      this.outputs.push(new Neuron(0));
    }


  this.updateOutputs = function(number){
    for(var i = 0; i < this.hiddens.length; i++){
      this.hiddens[i].updateWeightsNumber(number - this.outputs.length);
    }
    for(var i = 0; i < number - this.outputs.length; i++){
      this.outputs.push(new Neuron(0));
    }
    this.reset();
    console.log("outputs " +this.classes);
  }



  this.setClasses = function(classes){
    this.classes = classes;
  }




  this.trainClass = function(data){
    var random = 0;
    var max = data.length - 1;
    var wrong = true;
    var check = 0;
    var turns = 0;
    var waiting = [];

    for(var i = 0; i < data.length; i++){
      var startingPoint = []
      for(var a = 0; a < this.outputs.length; a++){
        startingPoint.push(0);
      }
      startingPoint= data[i][1];
      waiting.push(startingPoint);
    }
    while(wrong){
      check = 0;
      turns += 1;
      for(var i = 0; i < 10000; i++){
        random = (Math.floor(Math.random() * (max - 0 + 1)) + 0);
        this.checkForNan();
        this.setInputAndResult(data[random][0], waiting[random]);
        this.checkForNan();
        this.hiddenClassCalculation();
        this.checkForNan();
        this.outputClassCalculation();
        this.checkForNan();
        this.backPropagateClass();
        this.checkForNan();
      }
      /*for(var i = 0; i < data.length; i++){
        this.setInputAndResult(data[i][0], waiting[i]);
        this.hiddenClassCalculation();
        this.outputClassCalculation();
        if(this.outputs[waiting[i].indexOf(1)].out >= 0.2){
          console.log("check");
          check += 1;
        }
      }
      console.log("---Fin---");
      if(check == data.length){
        wrong = false;
      }*/
      wrong = false;
      if(turns > 20 && wrong){
        return;
        this.reset();
        turns = 0;
      }
    }
  }

  this.reset = function(){
    var test = 0;
    for(var i = 0; i < this.inputs.length; i++){


      for(var j = 0; j < this.hiddens.length; j++){
        test = Math.random();
        if(test == 0){
          test+=0.1;
        }
        this.inputs[i].weights[j] = test;
        test = Math.random();
        if(test == 0){
          test+=0.1;
        }
        this.bias[0].weights[j] = test;
        for(var k = 0; k < this.outputs.length; k++){
          test = Math.random();
          if(test == 0){
            test+=0.1;
          }
          this.hiddens[j].weights[k] = test;
          test = Math.random();
          if(test == 0){
            test+=0.1;
          }
          this.bias[1].weights[k] = test;
        }
      }
    }
}

  this.checkForNan = function(){/*
    for(var i = 0; i < this.inputs.length; i++){

      if(isNaN(this.inputs[i].out)){
        console.log("input " + i + " est NaN");
        throw new Error("");
      }
      for(var j = 0; j < this.hiddens.length; j++){
        if(isNaN(this.inputs[i].weights[j])){
          console.log("poids " + j + " de input " + i +" est NaN");
          throw new Error("");
        }
        if(isNaN(this.hiddens[j].out)){
          console.log("hidden " + j + " est NaN");
          throw new Error("");
        }
        for(var k = 0; k < this.outputs.length; k++){
          if(isNaN(this.hiddens[j].weights[k])){
            console.log("poids " + k + " de hidden " + j +" est NaN");
            throw new Error("");
          }
          if(isNaN(this.outputs[k].out)){
            console.log("output " + k + " est NaN");
            throw new Error("");
          }
        }
      }
    }*/
  }

  this.setInputAndResult = function(input, expected){
    var max = 300;
    var min = 0;
    var normalized = []
    this.target = expected;
    for(var i = 0; i < this.inputs.length; i++){
      this.inputs[i].in = input[i];
      this.inputs[i].out = input[i];
    }
  }

  this.learnClass = function(input, expected, turns){
      this.target = expected;
      for(var i = 0; i < this.inputs.length; i++){
        this.inputs[i].in = input[i];
        this.inputs[i].out = input[i];
      }



      for(var i = 0; i < turns; i++){
        this.hiddenClassCalculation();
        this.outputClassCalculation();
        this.backPropagateClass();
      }
      this.logResult();
  }



  this.testClass = function(input){
    for(var i = 0; i < this.inputs.length; i++){
      this.inputs[i].in = input[i];
      this.inputs[i].out = input[i];
    }
    this.hiddenClassCalculation();
    this.outputClassCalculation();
    return this.logResult();
  }

  this.hiddenClassCalculation = function(){
    for(var i = 0; i < this.hiddens.length; i ++){
      var inData = 0;
      for(var y = 0; y < this.inputs.length; y++){
        inData += this.inputs[y].weights[i] * this.inputs[y].out;
      }
      inData += -this.bias[0].in * this.bias[0].weights[i];
      this.hiddens[i].in = inData;
      /*if(inData < 0){
        inData *= 0.01;
      }*/
      this.hiddens[i].out = 1 / (1 - Math.exp(inData));
    }
  }



  this.outputClassCalculation = function(){
    var sumExp = 0;
    var max = 0;
    for(var i = 0; i < this.outputs.length; i ++){
      var inData = 0;
      for(var y = 0; y < this.hiddens.length; y++){
        inData += this.hiddens[y].weights[i] * this.hiddens[y].out;
      }
      if(inData > max){
        max = inData;
      }
    }
    for(var i = 0; i < this.outputs.length; i ++){
      var inData = 0;
      for(var y = 0; y < this.hiddens.length; y++){
        inData += this.hiddens[y].weights[i] * this.hiddens[y].out;
      }
      inData += -this.bias[1].in * this.bias[1].weights[i];
      this.outputs[i].in = inData - max;
      sumExp += Math.exp(inData - max);
    }
    for(var i = 0; i < this.outputs.length; i ++){
      this.outputs[i].out = Math.exp(this.outputs[i].in) / sumExp;
    }

  }







  this.backPropagateClass = function(){
    this.hiddenToInputClass();
    this.outputToHiddenClass();
  }





  this.hiddenToInputClass = function(){
    /*var sumExp = 0;
    for(var k = 0; k < this.outputs.length; k++){
      sumExp += Math.exp(this.outputs[k].in);
    }
    for(var i = 0; i < this.inputs.length; i++){
      var tiers1 = 0;
      var tiers2 = 0;
      var tiers3 = 0;
      var final = 0;
      for(var j = 0; j < this.hiddens.length; j++){
        tiers1 = 0;
        for(var k = 0; k < this.outputs.length; k++){
          tiers1 += -1*((this.target[k] * (1/this.outputs[k].out)) + (1 - this.target[k]) * (1/(1 - this.outputs[k].out))) * (Math.exp(this.outputs[k].in) * (sumExp - Math.exp(this.outputs[k].in ) ) / Math.pow(sumExp, 2)) * this.hiddens[j].weights[k];
        }
        tiers2 = this.hiddens[j].out * (1 - this.hiddens[j].out);
        tiers3 = this.inputs[i].out;
        final = tiers1 * tiers2 * tiers3;
        this.inputs[i].weights[j] = this.inputs[i].weights[j] - (this.learningRate * final);
        this.inputs[i].weights[j]
      }
    }*/
    for(var i = 0; i < this.inputs.length; i++){
      for(var j = 0; j < this.hiddens.length; j++){
        var final = 0;
        for(var k = 0; k < this.outputs.length; k++){
          final += (this.outputs[k].out - this.target[k]) * (this.hiddens[j].weights[k]) * (this.hiddens[j].out * (1 - this.hiddens[j].out));
        }
        this.inputs[i].weights[j] = this.inputs[i].weights[j] - (this.learningRate * final);
      }
    }
    for(var j = 0; j < this.hiddens.length; j++){
      var final = 0;
      for(var k = 0; k < this.outputs.length; k++){
        final += (this.outputs[k].out - this.target[k]) * (this.hiddens[j].weights[k]) * (this.hiddens[j].out * (1 - this.hiddens[j].out));
      }
      this.bias[0].weights[j] = this.bias[0].weights[j] - (this.learningRate * final);
    }
  }

  this.outputToHiddenClass = function(){
    /*var sumExp = 0;
    for(var k = 0; k < this.outputs.length; k++){
      sumExp += Math.exp(this.outputs[k].in);
    }
    for(var i = 0; i < this.hiddens.length; i++){
      var tiers1 = 0;
      var tiers2 = 0;
      var tiers3 = 0;
      var final = 0;
      for(var j = 0; j < this.outputs.length; j++){

        tiers1 = (-this.target[j]/this.outputs[j].out);

        tiers2 = Math.exp(this.outputs[j].in) * (sumExp - Math.exp(this.outputs[j].in)) / Math.pow(sumExp, 2);
        tiers3 = this.hiddens[i].out;
        final = tiers1 * tiers2 * tiers3;
        this.hiddens[i].weights[j] = this.hiddens[i].weights[j] - (this.learningRate * final);
      }
    }*/
    var final = 0;
    var final2 = 0;
    for(var i = 0; i < this.hiddens.length; i++){
      for(var j = 0; j < this.outputs.length; j++){
        final = (this.outputs[j].out - this.target[j]) * this.hiddens[i].out;
        this.hiddens[i].weights[j] = this.hiddens[i].weights[j] - (this.learningRate * final);
      }
    }
    for(var j = 0; j < this.outputs.length; j++){
      final2 = (this.outputs[j].out - this.target[j]);
      this.bias[1].weights[j] = this.bias[1].weights[j] - (this.learningRate * final2);
    }
  }

  this.getResult = function(){
    var result = [];
    for(var i = 0; i < this.outputs.length; i++){
      result.push(this.outputs[i].out * 35);
    }
    return result;
  }

  this.logResult = function(){
    var test = 0;
    var result = 0;
    for(var i = 0; i < this.outputs.length; i++){
      if(this.outputs[i].out > test){
        test = this.outputs[i].out;
        result = i;
      }
    }
    return this.classes[result];
  }
  }

}

module.exports.network = function(inputs, hidden, outputs){return new Network(inputs, hidden, outputs)};
