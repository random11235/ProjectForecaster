const { median, forEach } = require('mathjs');
const xCalculated = require('./monte_carlo.js');
const tDist = require( '@stdlib/stats-base-dists-triangular-pdf' );

const mode = a => {
    const count = {};
    
    a.forEach(e => {
      if (!(e in count)) {
        count[e] = 0;
      }
  
      count[e]++;
    });
  
    let bestElement = [];
    let bestCount = 0;
  
    Object.entries(count).forEach(([k, v]) => {
      if (v > bestCount) {
        bestElement = [];
        bestElement.push(k);
        bestCount = v;
      }
      else if (v == bestCount){
        bestElement.push(k);
      }
    });
        
       // return bestElement;

    return {mode:bestElement, count:bestCount};
}

test('mode of many iterations', () => {

    var answerArray = [];
    const modeTest = 1;
    var next = null;
    const min = 1;
    const max = 11;


    for (var i = 0; i<10000; i++){
        next = xCalculated.applyTriangularDistribution(min, max, modeTest);
        //console.log("\n",next);
        answerArray.push(next);
    }



    const answerArrayMedian = median(answerArray);
    const answerArrayMode = mode(answerArray);

    console.log("mode = ", parseInt(answerArrayMode.mode));
    console.log("count = ", answerArrayMode.count);
    console.log("median = ", answerArrayMedian);


    answerArray.sort();
    console.log("\n",answerArray);
   var nextNumber = answerArray[0];
   var nextNumberArray = [];
   var countOfNumber = 0;
    answerArray.forEach(element => {
      
      if (element != nextNumber ) {
        nextNumberArray.push(nextNumber + ":" + countOfNumber);
        nextNumber = element;
        countOfNumber = 1;
      }
      else
        countOfNumber++;
    });

    nextNumberArray.push(nextNumber + ":" + countOfNumber); 

    console.log("\n",nextNumberArray);  

    expect(parseInt(answerArrayMode.mode)).toBe(parseInt(modeTest));
  });
