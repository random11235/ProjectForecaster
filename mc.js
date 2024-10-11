(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const chartsCache = {};

function drawHistogram(id, durations, linePercentile = 85) {
    if (chartsCache[id]) {
        chartsCache[id].destroy();
        chartsCache[id] = null;
    }
    const ctx = document.getElementById(id).getContext('2d');
    const histogram = {};
    for (const val of durations) {
        histogram[val] = (histogram[val] || 0) + 1;
    }
    var obj = require('./monte_carlo.js');
    const keys = obj.sortNumbers(Object.keys(histogram));
    const labels = keys.map(n => n.toString());
    const data = keys.map(key => histogram[key]);
    const lineValue = Math.round(obj.percentile(durations, linePercentile/100, true));
    const lineIndex = labels.findIndex(val => lineValue < val) - 0.5;

    chartsCache[id] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                borderWidth: 1,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
            }]
        },
        options: {
            title: {
                display: true,
                text: "Duration histogram"
            },
            legend: {
                display: false
            },
            tooltips: {
                mode: 'disabled'
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Frequency of occurrences'
                    }
                }],
                xAxes: [
                    {
                        scaleLabel: {
                            display: true,
                            labelString: 'Calendar weeks'
                        }
                    }
                ]
            },
            annotation: {
                drawTime: 'afterDraw',
                annotations: [{
                    type: 'line',
                    mode: 'vertical',
                    value: lineIndex,
                    scaleID: 'x-axis-0',
                    borderColor: 'red',
                    borderWidth: 2,
                    borderDash: [2, 2],
                    label: {
                        enabled: true,
                        content: `p${linePercentile}`,
                        position: 'top',
                        yAdjust: 10,
                        fontSize: 10,
                        backgroundColor: 'rgba(0,0,0,0.6)',
                    }
                }]
            }
        }
    });
}

function drawBurnDowns(id, burnDowns) {
    if (chartsCache[id]) {
        chartsCache[id].destroy();
        chartsCache[id] = null;
    }
    const ctx = document.getElementById(id).getContext('2d');
    const max = Math.max(...burnDowns.map(b => b.length));
    const labels = []
    for (let i = 1; i <= max; i++) {
        labels.push(i.toString());
    }
    const datasets = burnDowns.map(burnDown => ({
        label: { mode: 'disabled' },
        data: burnDown,
        fill: false,
        borderWidth: 1,
        pointRadius: 0,
        pointHoverRadius: 0,
    }));

    chartsCache[id] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            title: {
                display: true,
                text: "First 100 burn downs"
            },
            legend: {
                display: false
            },
            tooltips: {
                mode: 'disabled'
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Remaining tasks'
                    }
                }],
                xAxes: [
                    {
                        scaleLabel: {
                            display: true,
                            labelString: 'Week number'
                        }
                    }
                ]
            }
        }
    });
}

function drawScatterPlot(id, values, linePercentile = 85) {
    if (chartsCache[id]) {
        chartsCache[id].destroy();
        chartsCache[id] = null;
    }
    var obj = require('./monte_carlo.js');
    const data = values.slice(0, 500).map((val, index) => ({x: index, y: val}))
    const lineValue = Math.round(obj.percentile(values, linePercentile/100, true));
    const ctx = document.getElementById(id).getContext('2d');

    chartsCache[id] = new Chart(ctx, {
        type: 'scatter',
        data: {
            //labels: labels,
            datasets: [{
                data: data,
                //borderWidth: 1,
                pointBackgroundColor: 'rgba(54, 162, 235, 0.2)',
                pointBorderColor: 'rgba(54, 162, 235, 1)',
            }]
        },
        options: {
            title: {
                display: true,
                text: "Effort scatter plot (first 500 runs)"
            },
            legend: {
                display: false
            },
            tooltips: {
                mode: 'disabled'
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Effort in person-weeks'
                    }
                }]
            },
            annotation: {
                drawTime: 'afterDraw',
                annotations: [{
                    type: 'line',
                    mode: 'horizontal',
                    value: lineValue,
                    scaleID: 'y-axis-1',
                    borderColor: 'red',
                    borderWidth: 2,
                    borderDash: [2, 2],
                    label: {
                        enabled: true,
                        content: `p${linePercentile}`,
                        fontSize: 10,
                        backgroundColor: 'rgba(0,0,0,0.6)',
                    }
                }]
            }
        }
    });
}

module.exports = {

    drawHistogram : function(parameter1,parameter2,parameter3){
        return drawHistogram(parameter1,parameter2,parameter3);
    },
    drawBurnDowns : function(parameter1,parameter2){
        return drawBurnDowns(parameter1,parameter2);
    },
    drawScatterPlot: function(parameter1,parameter2,parameter3){
        return drawScatterPlot(parameter1,parameter2,parameter3);
    }

}
},{"./monte_carlo.js":2}],2:[function(require,module,exports){
/**
 * Returns the value at a given percentile in a sorted numeric array.
 * "Linear interpolation between closest ranks" method
 * @param {Array} arr sorted numeric array
 * @param {Number} p percentile number between 0 (p0) and 1 (p100)
 * @param {Boolean} sort if true, the array will be sorted for you
 * @returns the value at a given percentile
 */
function percentile(arr, p, sort = false) {
    if (arr.length === 0) return 0;
    if (typeof p !== 'number') throw new TypeError('p must be a number');
    if (sort) sortNumbers(arr);
    if (p <= 0) return arr[0];
    if (p >= 1) return arr[arr.length - 1];

    const index = (arr.length - 1) * p,
        lower = Math.floor(index),
        upper = lower + 1,
        weight = index % 1;

    if (upper >= arr.length) return arr[lower];
    return arr[lower] * (1 - weight) + arr[upper] * weight;
}

/**
 * Sorts a numeric array
 * @param {Array} array numeric array
 */
function sortNumbers(array) {
    return array.sort((a, b) => a - b);
}

/**
 * Generates a random integer between "min" and "max"
 * @param {Number} min minimum number (inclusive)
 * @param {Number} max maximum number (inclusive)
 * @returns random integer
 */
function randomInteger(min, max) {
    return Math.floor(Math.random() * (max + 1 - min)) + min;
}

/**
 * Retrieves a random element from an array
 * @param {Array} array array of item
 */
function randomElement(array) {
    return array[randomInteger(0, array.length - 1)];
}

/**
 * Generates an average of random sample elements from a numeric array
 * @param {Array} array numeric array
 * @param {Number} minNumberOfItems minimum number of random samples to average
 * @param {Number} maxNumberOfItems maximum number of random samples to average
 * @returns the average for the random samples selected
 */
function randomSampleAverage(array, minNumberOfItems, maxNumberOfItems) {
    if (array.length == 0) return 0;
    const numberOfItems = randomInteger(minNumberOfItems, maxNumberOfItems);
    let total = 0;
    for (let i = 0; i < numberOfItems; i++) {
        total += randomElement(array);
    }
    return (total / numberOfItems);
}

/**
 * Calculates the estimated error rate/range for the given numeric array
 * @param {Array} array numeric array
 * @returns estimated error rate/range between 0 and 100
 */
function errorRate(array) {
    if (array.length <= 1) return 0;
    const sortedArray = sortNumbers([...array]);
    const min = Math.min(...sortedArray);
    const max = Math.max(...sortedArray);

    const group1 = [...sortedArray].filter((_val, index) => index % 2 != 0)
    const g1avg = group1.reduce((a, b) => a + b, 0) / group1.length;

    const group2 = [...sortedArray].filter((_val, index) => index % 2 == 0)
    const g2avg = group2.reduce((a, b) => a + b, 0) / group2.length;

    const avgError = Math.abs(g1avg - g2avg)

    return Math.round(100 * avgError / (max - min));
}

/**
 * Calculates the "S-curve" distribution of individual contributors for the given simulation data
 * @param {*} simulationData simulation data
 * @returns numeric array with exactly 100 elements, and each position in the array represents the number of individual contributors for that percentage of completion in the project
 */
function calculateContributorsDistribution(simulationData) {
    const { minContributors, maxContributors, sCurveSize } = simulationData;
    const curveSize = Math.max(0, Math.min(50, sCurveSize));
    const curveTailStart = 100 - curveSize;
    const contributorsRange = [];
    // The range is in 0.1 granularity to enable cases such as "5.5" max contributors for cases where someone is ramping up, for example
    // We don't need a higher granularity than this for any practical scenario
    for (let i = minContributors; i <= maxContributors; i += 0.1) {
        contributorsRange.push(i);
    }
    const contributorsDistribution = [];
    const get = p => Math.min(maxContributors, Math.max(minContributors, Math.round(percentile(contributorsRange, p))));
    for (let i = 0; i < 100; i++) {
        if (i < curveSize) contributorsDistribution.push(get(i / curveSize));
        else if (i < curveTailStart) contributorsDistribution.push(maxContributors);
        else contributorsDistribution.push(get((100 - i) / curveSize));
    }
    return contributorsDistribution;
}

function median(numbers) {
    const sorted = Array.from(numbers).sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
        return (sorted[middle - 1] + sorted[middle]) / 2;
    }

    return sorted[middle];
}

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

function applyTriangularDistribution(min, max, mode)
{
    const randomNumber = Math.random();
    var output = null;

    if (randomNumber <= (mode - min)/(max-min)){
        output = min + Math.sqrt(randomNumber*(max-min)*(mode-min));
    }
    else{
        output = max - Math.sqrt((1-randomNumber)*(max-min)*(max-mode));
    }

    return Math.round(output);

}

function solveForXonTriangularDistributionByFollowingOutline( min, max, mode, testX){

    //var pdf = require( '@stdlib/stats-base-dists-triangular-pdf' );


    // calculate length of PD outline, i.e. how long is the function above zero the triangle abc where a is the min, b is the mac 
    // and c is the count of the mode, i.e. not the mode itself but how many times it occurred.
    const topOfTriangle = max - min;//2/(max - min);
    const leftSideLength = Math.sqrt(Math.pow(topOfTriangle, 2) + Math.pow((parseInt(mode) - min), 2));
    const rightSideLength = Math.sqrt(Math.pow(topOfTriangle, 2) + Math.pow((max - parseInt(mode)), 2))
    const length = leftSideLength + rightSideLength;

    //testX = leftSideLength;
    var randomWalk;

   // if (randomWalk === undefined)
   // {
        // take a random walk along that function
        randomWalk = Math.random() * length;
   // }

   // console.log("testX = ", testX);
   // console.log("randomWalk = ", randomWalk);

    //tells me the probability of randomWalk for a given triangle of max, min and mode 
    //const distributionOutput = pdf( parseFloat(mode), min, max, parseFloat(mode)); 

    var x = mode;

    // 
    if ( randomWalk < leftSideLength) //LHS
    {
        // Given a PD abc we need thetaLeft, the angle on the 'a' corner of the triangle abc using sin(theta) = opposite/ hypotenuse
        const thetaLeft = Math.asin(topOfTriangle / leftSideLength);

        // Now we have to calculate x, the point on the x axis that the randomWalk intersects if we draw a line directly down to it.  
        // xLength is the length of the line from the point on the PD outline to x.
        //const yAtX = randomWalk * Math.sin(thetaLeft);

        // Using this length we can use the cosign identity to work out x.  Min is added as the triangle intersects there.
        x = randomWalk * Math.cos(thetaLeft) + min;
       // console.log("left");
    }
    else {//RHS
        const thetaRight = Math.asin(topOfTriangle / rightSideLength);
        const lengthRhsHypotenuse = randomWalk - leftSideLength;
        //const yRhs = lengthRhsHypotenuse * Math.sin(thetaRight);

        const lengthFromMode = lengthRhsHypotenuse * Math.cos(thetaRight);
        x = parseInt(mode) + lengthFromMode;

        //console.log("right");

    }

    //console.log("left side length = ", leftSideLength);
    //console.log("right side length = ", rightSideLength);
    //console.log("length = ", length);
    return Math.round(x);
}

/**
 * Executes a single round of Monte Carlo burn down simulation for the given simulation data
 * @param {*} simulationData simulation data
 * @returns simulation result for this round
 */
function simulateBurnDown(simulationData) {
    //  Caches the "S-curve" distribution in the first run
    if (!simulationData.contributorsDistribution) {
        simulationData.contributorsDistribution = calculateContributorsDistribution(simulationData);
    }
    const { tpSamples, ltSamples, splitRateSamples, risks, numberOfTasks, totalContributors, maxContributors, contributorsDistribution } = simulationData;

    // Retrieve a random split rate for this round
    const randomSplitRate = randomSampleAverage(splitRateSamples, 1, splitRateSamples.length * 3) || 1.0;

    // Calculate random impacts for this round
    let impactTasks = 0;
    for (const risk of risks) {
        if (Math.random() <= risk.likelihood) {
            impactTasks += randomInteger(risk.lowImpact, risk.highImpact);
        }
    }

    // Calculate the number of tasks for this round
    const totalTasks = Math.round((numberOfTasks + impactTasks) * randomSplitRate);

    // Extend the duration by a random sample average of lead times
    const leadTime = randomSampleAverage(ltSamples, Math.round(ltSamples.length * 0.1), Math.round(ltSamples.length * 0.9)) || 0;
    let durationInCalendarWeeks = Math.round(leadTime / 7);
    
    let weekNumber = 0
    let effortWeeks = 0;
    const burnDown = [];
    let remainingTasks = totalTasks;

   // let logpdf = import('@stdlib/stats-base-dists-triangular-logpdf');
    //var logpdf = require( '@stdlib/stats-base-dists-triangular-pdf' );
   
    //const { mode } = require('mathjs');
    //const { median } = require('mathjs');
    const medianSamples = median(tpSamples);
    const modeSamples = mode(tpSamples);
    var modeSelection = null;
    var modeCount = 0;
   // if (modeSamples.mode.length > 1)
        modeSelection = medianSamples;  // using the max count median seems a good best guess even if it's not necessarily 100% accurate
   // else
//        modeSelection = modeSamples.mode;

    modeCount = modeSamples.count;
    

    const min = Math.min(...tpSamples);
    const max = Math.max(...tpSamples);
    var outputTest=[];
    // Run the simulation
    while (remainingTasks > 0) {
        burnDown.push(Math.ceil(remainingTasks));


        const randomTp = applyTriangularDistribution(min, max, modeSelection);
       // const randomTp = (solveForXonTriangularDistributionByFollowingOutline(min, max, modeSelection, modeCount));
       // Math.floor(distributionOutput * randomX);


        //const randomTp = randomElement(tpSamples);

        
        //console.log("randomTp = ", randomTp);

        outputTest.push(randomTp);
        const percentComplete = Math.max(0, Math.min(99, Math.round((totalTasks - remainingTasks) / totalTasks * 100)));
        const contributorsThisWeek = contributorsDistribution[percentComplete];
        const adjustedTp = (randomTp * (contributorsThisWeek / totalContributors));
        remainingTasks -= adjustedTp;
        durationInCalendarWeeks++;
        weekNumber++;
        effortWeeks += contributorsThisWeek;
    }
   // console.log("median of output = ", median(outputTest));
   // console.log("mode of output = ", mode(outputTest).mode);
    burnDown.push(0);
    return {
        totalTasks,
        durationInCalendarWeeks,
        leadTime,
        effortWeeks,
        burnDown,
    }
}


/**
 * Run a full Monte Carlo simulation for the given data
 * @param {*} simulationData simulation data
 * @returns result of the simulation
 */
function runMonteCarloSimulation(simulationData) {
    simulationData = {...simulationData};
    for (const risk of simulationData.risks) {
        if (risk.likelihood >= 1) risk.likelihood /= 100;
    }

    const { numberOfSimulations } = simulationData;
    const burnDowns = [];
    const simulations = [];
    for (let i = 0; i < numberOfSimulations; i++) {
        const res = simulateBurnDown(simulationData);
        simulations.push({
            durationInCalendarWeeks: res.durationInCalendarWeeks,
            totalTasks: res.totalTasks,
            leadTime: res.leadTime,
            effortWeeks: res.effortWeeks,
        });
        if (i < 100) {
            burnDowns.push(res.burnDown);
        }
    }

   const durationHistogram = sortNumbers(simulations.map(s => s.durationInCalendarWeeks));
   const tasksHistogram = sortNumbers(simulations.map(s => s.totalTasks));
   const ltHistogram = sortNumbers(simulations.map(s => s.leadTime));
   const effortHistogram = sortNumbers(simulations.map(s => s.effortWeeks));

    let resultsTable = [];
    let p = 100;
    while (p >= 0) {
        const duration = percentile(durationHistogram, p / 100);
        const tasks = percentile(tasksHistogram, p / 100);
        const leadTime = percentile(ltHistogram, p / 100);
        const effort = percentile(effortHistogram, p / 100);
        resultsTable.push({
            Likelihood: p,
            Duration: Math.round(duration),
            TotalTasks: Math.round(tasks),
            Effort: Math.round(effort),
            LT: Math.round(leadTime)
        });
        p -= 5;
    }

    const tpErrorRate = errorRate(simulationData.tpSamples);
    const ltErrorRate = errorRate(simulationData.ltSamples);

    return {
        simulations,
        burnDowns,
        tpErrorRate,
        ltErrorRate,
        resultsTable,
    }
}

module.exports = {

    runMonteCarloSimulation : function(parameter){
        return runMonteCarloSimulation(parameter);
    },
    percentile : function(parameter1, parameter2, parameter3){
        return percentile(parameter1, parameter2, parameter3);
    },
    sortNumbers : function(parameter1){
        return sortNumbers(parameter1);
    },
    solveForXonTriangularDistributionByFollowingOutline : function(parameter1, parameter2, parameter3){
        return solveForXonTriangularDistributionByFollowingOutline(parameter1, parameter2, parameter3);
    },
    applyTriangularDistribution : function(parameter1, parameter2, parameter3){
        return applyTriangularDistribution(parameter1, parameter2, parameter3);
    }


}

},{}],3:[function(require,module,exports){
$(window).on("load", function () {
    $('[data-toggle="tooltip"]').tooltip({ delay: 500 });

    function parseSamples(selector) {
        let val = $(selector).val() || '';
        if (val.trim().length === 0) return [];
        return val.split(/[\s\n,]/).map(s => s.trim().length > 0 ? Number(s.trim()) : NaN).filter(n => n != NaN).filter(n => n >= 0);
    }
    function parseRisks(selector) {
        const risks = [];
        $(selector).find('tbody').find('.risk-row').each((_index, el) => {
            const $el = $(el);
            const risk = {
                likelihood: $el.find("input[name='likelihood']").val(),
                lowImpact: $el.find("input[name='lowImpact']").val(),
                highImpact: $el.find("input[name='highImpact']").val(),
                description: $el.find("input[name='description']").val(),
            };
            if (risk.likelihood && (risk.lowImpact || risk.highImpact)) {
                if (!risk.lowImpact) risk.lowImpact = '1';
                else if (!risk.highImpact) risk.highImpact = risk.lowImpact;
                risk.likelihood = parseInt(risk.likelihood) || 0;
                risk.lowImpact = parseInt(risk.lowImpact) || 0;
                risk.highImpact = parseInt(risk.highImpact) || 0;
                risks.push(risk);
            }
        });
        return risks;
    }
    const $riskRowTemplate = $('#risk-row-template').clone();
    function addRisk() {
        const $row = $riskRowTemplate.clone();
        $row.insertBefore($('#add-risk-row'));
        return $row;
    }
    function fillRisk(risk, $row) {
        $row.find("input[name='likelihood']").val(risk.likelihood);
        $row.find("input[name='lowImpact']").val(risk.lowImpact);
        $row.find("input[name='highImpact']").val(risk.highImpact);
        $row.find("input[name='description']").val(risk.description);
    }
    const $probabilitiesRowTemplate = $('#probabilities').find('.probabilities-row').clone();
    function addProbabilityRow() {
        const $row = $probabilitiesRowTemplate.clone();
        $row.insertBefore('#show-more-row');
        return $row;
    }
    function clearProbabilities() {
        $('.probabilities-row').remove();
    }

    function share() {
        if (readSimulationData()) {
            navigator.clipboard.writeText(location.href);
            $('#share').popover('show');
            setTimeout(() => $('#share').popover('dispose'), 5000);
        }
    }
    let currentlyLoadedHash = null;
    function readSimulationData() {
        const simulationData = {
            projectName: $('#projectName').val(),
            numberOfSimulations: parseInt($('#numberOfSimulations').val()),
            confidenceLevel: parseInt($('#confidenceLevel').val()) || 85,
            tpSamples: parseSamples('#tpSamples'),
            ltSamples: parseSamples('#ltSamples'),
            splitRateSamples: parseSamples('#splitRateSamples'),
            risks: parseRisks('#risks'),
            numberOfTasks: parseInt($('#numberOfTasks').val()),
            totalContributors: Number(Number($('#totalContributors').val()).toFixed(1)),
            minContributors: Number(Number($('#minContributors').val()).toFixed(1)),
            maxContributors: Number(Number($('#maxContributors').val()).toFixed(1)),
            sCurveSize: parseInt($('#sCurveSize').val()),
            startDate: $('#startDate').val() || undefined
        };
        if (!simulationData.tpSamples.some(n => n >= 1)) {
            alert("Must have at least one weekly throughput sample greater than zero");
            return false;
        }
        if (simulationData.splitRateSamples.length > 0 && simulationData.splitRateSamples.some(n => n > 10 || n < 0.2)) {
            alert("Your split rates don't seem correct.\nFor a 10% split rate in a project, you should put '1.1', for example. Please correct before proceeding");
            return false;
        }
        simulationData.minContributors = simulationData.minContributors || simulationData.totalContributors;
        simulationData.maxContributors = simulationData.maxContributors || simulationData.totalContributors;
        const hash = '#' + btoa(JSON.stringify(simulationData));
        currentlyLoadedHash = hash;
        location.hash = hash;
        return simulationData;
    }
    function runSimulation() {
        const simulationData = readSimulationData();
        if (!simulationData) return;
        loadDataFromUrl();

        $('#results-main').show();
        const $results = $('#results');
        $results.val('');
        const write = str => $results.val($results.val() + str);
        $('#res-effort').val('Running...');

        var obj = require('./monte_carlo.js');

        setTimeout(() => {
            // Run the simulation
            const startTime = Date.now();
            const result = obj.runMonteCarloSimulation(simulationData);
            const elapsed = Date.now() - startTime;
            $results.val('');

            // Report the results
            const confidenceLevel = simulationData.confidenceLevel;
            const reportPercentile = confidenceLevel / 100;
            const effort = Math.round(obj.percentile(result.simulations.map(s => s.effortWeeks), reportPercentile, true));
            const duration = Math.round(obj.percentile(result.simulations.map(s => s.durationInCalendarWeeks), reportPercentile, true));
            $('#res-summary-header').text(`Project forecast summary (with ${confidenceLevel}% of confidence):`);
            $('#res-effort').val(effort);
            $('#res-duration').val(duration);
            let endDate = '(No start date set)';
            if (simulationData.startDate) {
                endDate = moment(simulationData.startDate).add(duration, 'weeks').format("MMM Do YYYY");
            }
            $('#res-endDate').val(endDate);

            // Probabilities
            clearProbabilities();
            $('#show-more-row').show();
            $('#show-more').show();
            const addProbability = (res) => {
                const comment = res.Likelihood > 80 ? 'Almost certain' : res.Likelihood > 45 ? 'Somewhat certain' : 'Less than coin-toss odds';
                const style = res.Likelihood > 80 ? 'almost-certain' : res.Likelihood > 45 ? 'somewhat-certain' : 'not-certain';
                const $row = addProbabilityRow();
                const $cells = $row.find('td');
                $cells.addClass(style);
                $cells.eq(0).text(res.Likelihood + '%');
                $cells.eq(1).text(res.Effort.toString());
                $cells.eq(2).text(res.Duration.toString());
                $cells.eq(3).text(res.TotalTasks.toString());
                if (simulationData.startDate) {
                    $cells.eq(4).text(moment(simulationData.startDate).add(res.Duration, 'weeks').format("MMM Do YYYY"));
                }
                $cells.eq(5).text(comment);
            }
            result.resultsTable.slice(0, 9).forEach(addProbability);
            $('#show-more').off('click').on('click', () => {
                result.resultsTable.slice(9).forEach(addProbability);
                $('#show-more').off('click').hide();
                $('#show-more-row').hide();
            });

            var objCharts = require('./draw-charts.js');
            objCharts.drawHistogram('res-duration-histogram', result.simulations.map(s => s.durationInCalendarWeeks), confidenceLevel);
            objCharts.drawBurnDowns('res-burn-downs', result.burnDowns);
            objCharts.drawScatterPlot('res-effort-scatter-plot', result.simulations.map(s => s.effortWeeks), confidenceLevel);

            write(`Project forecast summary (with ${confidenceLevel}% of confidence):\n`);
            write(` - Up to ${effort} person-weeks of effort\n`);
            write(` - Can be delivered in up to ${duration} calendar weeks\n`);
            if (simulationData.startDate) {
                write(` - Can be delivered by ${endDate}\n`);
            }
            write(`\n\n`);
            write(`-----------------------------------------------------\n`);
            write(`                       DETAILS\n`);
            write(`-----------------------------------------------------\n`);
            write(`Elapsed time: ${elapsed} ms (${Math.round(simulationData.numberOfSimulations / elapsed * 1000)} simulations per second)\n`);
            write('All probabilities:\n')
            write(`  Likelihood\tDuration\tTasks\tEffort          \tComment\n`);
            for (const res of result.resultsTable) {
                const comment = res.Likelihood > 80 ? 'Almost certain' : res.Likelihood > 45 ? 'Somewhat certain' : 'Less than coin-toss odds';
                write(`  ${res.Likelihood}%      \t${res.Duration} weeks \t${res.TotalTasks}\t${res.Effort} person-weeks  \t(${comment})\n`);
            }
            write(`\n`);
            write(`Error rates:\n - Weekly throughput: ${result.tpErrorRate}%\n - Task lead-times: ${result.ltErrorRate}%\n`);
            write(`  (Aim to keep these below 25% by adding more sample data. (< 10% Great, < 25% Good)\n`);
            write(`   This is the measure of how two random groups of your sample data would align when forecasting.\n`);
            write(`   Anything below 25% is good, but lower is better. It grows if there is too little data\n`);
            write(`   and ALSO if the process changes over time and you use too much data.)\n`);
        }, 100);

    }
    function loadDataFromUrl() {
        try {
            currentlyLoadedHash = location.hash;
            const simulationData = JSON.parse(atob(location.hash.trim().substring(1)));
            for (const name of Object.getOwnPropertyNames(simulationData)) {
                const $el = $('#' + name);
                if ($el.is('input,textarea')) {
                    $el.val(typeof (simulationData[name]) == 'Array' ? simulationData[name].join(',') : simulationData[name]);
                }
            }
            $('#risks').find('.risk-row').remove();
            if (simulationData.risks && simulationData.risks.length > 0) {
                for (const risk of simulationData.risks) {
                    fillRisk(risk, addRisk());
                }
            }
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }
    if (location.hash && location.hash.trim().length > 1) {
        if (loadDataFromUrl()) {
            runSimulation();
        }
    }
    window.onhashchange = function () {
        if (currentlyLoadedHash != location.hash) {
            location.reload();
        }
    }

    $('#addRisk').on('click', addRisk);
    $('#share').on('click', share);
    $('#run').on('click', runSimulation);

});
},{"./draw-charts.js":1,"./monte_carlo.js":2}]},{},[3,2,1]);
