const client = require('prom-client');

// Create a Registry to register the metrics
const register = new client.Registry();

// Collect default metrics
client.collectDefaultMetrics({
  app: 'node-application-monitoring-app',
  prefix: 'node_',
  timeout: 10000,
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
  register
});

// Create a custom histogram metric
const httpRequestTimer = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.01, 0.03, 0.05, 0.07, 0.1, 0.3, 0.5, 0.7, 1] // 0.1 to 10 seconds
});

// Register the histogram
register.registerMetric(httpRequestTimer);

function setup(app, data) {
  // Prometheus metrics route
  app.get('/metrics', async (req, res) => {
    // Start the HTTP request timer, saving a reference to the returned method
    const end = httpRequestTimer.startTimer();
    // Save reference to the path so we can record it when ending the timer
    const route = req.route.path;
      
    res.setHeader('Content-Type', register.contentType);
    res.send(await register.metrics());

    // End timer and add labels
    end({ route, code: res.statusCode, method: req.method });
  });

  app.get('/', function(req, res) {
    const end = httpRequestTimer.startTimer();
    const route = req.route.path;
    let contacts = data.getContacts();
    let model = { contacts };
    res.render('home', model);

    end({ route, code: res.statusCode, method: req.method });
  });

  app.get('/contacts', function(req, res) {
    const end = httpRequestTimer.startTimer();
    const route = req.route.path;
    let contacts = data.getContacts();
    let model = { contacts };
    res.render('contacts', model);

    end({ route, code: res.statusCode, method: req.method });
  });

  app.get('/contacts/create', function(req, res) {
      const end = httpRequestTimer.startTimer();
      const route = req.route.path;
      let model = {
        firstName: "", lastName: "",
        email: "", phone: "", comments: ""
      };
      res.render('create-contact', model);

      end({ route, code: res.statusCode, method: req.method });
  });

  app.post('/contacts/create', function(req, res) {
    const end = httpRequestTimer.startTimer();
    const route = req.route.path;

    let result = data.addContact(
      req.body.firstName, req.body.lastName,
      req.body.email, req.body.phone, req.body.comments);
    if (result.errMsg) {
      let model = {
        firstName: req.body.firstName, lastName: req.body.lastName,
        email: req.body.email, phone: req.body.phone,
        comments: req.body.comments,
        errMsg: result.errMsg
      };
      return res.render('create-contact', model);
    } else {
      res.redirect('/contacts');
    }

    end({ route, code: res.statusCode, method: req.method });
  });

  app.get('/contacts/search', function(req, res) {
    const end = httpRequestTimer.startTimer();
    const route = req.route.path;

    model = { keyword: "" };
    if (req.query.keyword) {
      model.keyword = req.query.keyword;
      let contacts = data.findContactsByKeyword(req.query.keyword);
      model.contacts = contacts;
    }

    res.render('search-contacts', model);
    end({ route, code: res.statusCode, method: req.method });
  });

  app.get('/contacts/:id', function(req, res) {
    const end = httpRequestTimer.startTimer();
    const route = req.route.path;

    let contact = data.findContactById(req.params.id);
    if (contact.errMsg) {
      model = {errText: 'Contact Not Found', 
        errDetails: contact.errMsg};
      res.render('error', model);
    }
    else { 
      let model = { contact };
	    res.render('contact-details', model);
    }

    end({ route, code: res.statusCode, method: req.method });
  });

  app.get('/contacts/find/:keyword', function(req, res) {
    const end = httpRequestTimer.startTimer();
    const route = req.route.path;

    let contacts = data.findContactByKeyword(req.params.keyword);
    let model = { contacts };
	  res.render('contacts', model);

    end({ route, code: res.statusCode, method: req.method });
  });
}

module.exports = { setup };
