const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const prometheus = require('prom-client');

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(express.static('public'))
app.set('view engine', 'pug');

// Create a Registry to register the metrics
const prometheusRegistry = new prometheus.Registry();

// Collect default metrics
prometheus.collectDefaultMetrics({
  app: 'node-application-monitoring-app',
  prefix: 'node_',
  timeout: 10000,
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
  register: prometheusRegistry
});

// Create a custom histogram metric
const httpRequestTimer = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.01, 0.03, 0.05, 0.07, 0.1, 0.3, 0.5, 0.7, 1] // 0.1 to 10 seconds
});

// Register the histogram
prometheusRegistry.registerMetric(httpRequestTimer);

// Custom middleware function to intercept all requests
app.use((req, res, next) => {
  // Start the HTTP request timer, saving a reference to the returned method
  const stopTimerAndReport = httpRequestTimer.startTimer();
  
  // Call the next middleware function
  next();

  // Save reference to the path so we can record it when ending the timer
  const route = req.route.path;

  // End timer and add labels
  stopTimerAndReport({ route, code: res.statusCode, method: req.method });
});

const data = require("./data/app-data");
data.seedSampleData();

const mvcController = require("./controllers/mvc-controller");
mvcController.setup(app, data);

const apiController = require("./controllers/api-controller");
apiController.setup(app, data);

const metricsController = require("./controllers/metric-controller");
metricsController.setup(app, prometheusRegistry);

let port = process.argv[2];
if (!port) port = process.env['PORT'];
if (!port) port = 8080;

app.listen(port, () => {
  console.log(`App started. Listening at http://localhost:${port}. Metrics available at http://localhost:${port}/metrics`);
})
.on('error', function(err) {
  if (err.errno === 'EADDRINUSE')
    console.error(`Port ${port} busy.`);
  else 
    throw err;
});
