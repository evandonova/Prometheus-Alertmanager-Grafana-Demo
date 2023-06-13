function setup(app, prometheusRegistry) {
    // Prometheus metrics route
    app.get('/metrics', async (req, res) => {
      res.setHeader('Content-Type', prometheusRegistry.contentType);
      res.send(await prometheusRegistry.metrics());
    });
}

module.exports = { setup };