const chartsCache = {};

function drawHistogram(id, durations, linePercentile = 85) {
    if (chartsCache[id]) {
        chartsCache[id].destroy();
        chartsCache[id] = null;
    }
    const lineValue = Math.round(percentile(durations, linePercentile/100, true));
    const ctx = document.getElementById(id).getContext('2d');
    const histogram = {};
    for (const val of durations) {
        histogram[val] = (histogram[val] || 0) + 1;
    }
    const keys = sortNumbers(Object.keys(histogram));
    const labels = keys.map(n => n.toString());
    const data = keys.map(key => histogram[key]);

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
                    value: lineValue.toString(),
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