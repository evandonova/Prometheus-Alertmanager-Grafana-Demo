# Demo with Prometheus, Alertmanager and Grafana
**Prometheus** + **Alertmanager** + **Grafana** configurations for the "**Contact Book**" app, modified to **export metrics**.

## The "Contact Book" App
**Original** used JS app here: https://github.com/nakov/ContactBook:

<kbd>
  <img src="https://github.com/evandonova/Prometheus-Alertmanager-Grafana-Demo/assets/69080997/2f1e1741-4032-4721-8cfa-fd718fe30f81" width="450" height="350" />
</kbd>

<kbd>
  <img src="https://github.com/evandonova/Prometheus-Alertmanager-Grafana-Demo/assets/69080997/2b36657d-75c6-45c6-b14c-e9a9d823258c" width="450" height="350" />
</kbd>
<br><br/>

Modified the app to **export default and custom metrics** on `/metrics`, using [prom-client](https://www.npmjs.com/package/prom-client):
<br><br/>
<kbd>
  <img src="https://github.com/evandonova/Prometheus-Alertmanager-Grafana-Demo/assets/69080997/9a84597e-de5f-4057-b85f-00cddce74611" width="550" height="380" />
</kbd>
<br><br/>
**Custom metrics** export the **duration of HTTP requests to different endpoints in seconds**. They are saved in a **histogram** with buckets from 0.01 to 1 seconds and keep each request's method, route and status code.

### Run the App
To run the app, first **install its dependencies**:
```
npm install
```
Then, **start the app** itself:
```
npm start
```
The app is started on **http://localhost:8080**.

## Run Prometheus Server with Configuration File
When the app is started, **run Prometheus** to collect and monitor app data.
To do this, you should:
  1) Have **Prometheus installed**
  2) Get the **Prometheus configuration file** [prometheus-contact-book.yaml](https://github.com/evandonova/Prometheus-Alertmanager-Grafana-Demo/blob/main/configs/prometheus-contact-book.yaml) from the current repo's config directory
  3) Place the **configuration file** in you **local Prometheus installation directory**
  4) **Start the Prometheus server** with the configuration file:
   ```
   .\prometheus --config.file .\prometheus-contact-book.yaml 
   ```
  5) Navigate to **http://localhost:9090** where the Prometheus server is
  6) Now you can execute **different expressions** to **monitor app metrics** in a table or graph:
  <kbd>
  <img src="https://github.com/evandonova/Prometheus-Alertmanager-Grafana-Demo/assets/69080997/837dcba5-ce05-487e-8384-dc0ac000e71a" width="600" height="300" />
  </kbd>
  <br><br/>
  <kbd>
  <img src="https://github.com/evandonova/Prometheus-Alertmanager-Grafana-Demo/assets/69080997/a24e9e8c-8546-46ca-8a9a-732cc1c8a468" width="600" height="475" />
  </kbd>
  
## Run Prometheus + Alertmanager to Handle Alerts
For this demo, we will fire alerts if an endpoint is accessed for more than 3 times within the last 5 minutes.
To do this, you should:
  1) Have **Prometheus and Alertmanager installed**
  2) Get the **Alertmanager configuration file** [alertmanager-contact-book.yaml](https://github.com/evandonova/Prometheus-Alertmanager-Grafana-Demo/blob/main/configs/alertmanager-contact-book.yaml)
  3) Place the file in the **Alertmanager installation directory** and paste your [**Webhook.site**](https://webhook.site) **URL** in the `webhook_configs` section
  4) **Start** **Alertmanager** with the configuration file:
  ```
  .\alertmanager --config.file .\alertmanager-contact-book.yml
  ```
  5) Navigate to **http://localhost:9093** to see Alertmanager
  6) Get the **Prometheus configuration file** [prometheus-contact-book-alerts.yaml](https://github.com/evandonova/Prometheus-Alertmanager-Grafana-Demo/blob/main/configs/prometheus-contact-book-alerts.yaml) and the alerting rules file [alert-rules-contact-book.yaml](https://github.com/evandonova/Prometheus-Alertmanager-Grafana-Demo/blob/main/configs/alert-rules-contact-book.yaml) from the current repo's config directory
  7) Place both files in the **Prometheus installation directory**
  8) **Start the Prometheus server** with the new configuration file and navigate to **http://localhost:9090**:
  ```
  .\prometheus --config.file .\prometheus-contact-book-alerts.yaml 
  ```
  9) **Access any app page** for **several** (at least 3) **times** in a **5-minute time period**. Prometheus will **scrape metrics occasionally** and if the value of the `http_request_duration_seconds_count` **metric has changed more than 3 times**, it will **fire an alert**. You can see the alert on the "**Alerts**" **page**:
  <kbd>
  <img src="https://github.com/evandonova/Prometheus-Alertmanager-Grafana-Demo/assets/69080997/371cc4fb-6d37-472e-823b-d502a5ac2ed6" width="600" height="400" />
  </kbd>
  <br><br/>
  
  10) **Alert** will be send to **Alertmanager**:
  <kbd>
  <img src="https://github.com/evandonova/Prometheus-Alertmanager-Grafana-Demo/assets/69080997/834b91a2-2d2e-4bc1-b1b6-9d367118080e" width="600" height="400" />
  </kbd>
  <br><br/>
  
  11) **Alertmanager** will **send the alert** to the **Webhook.site URL** you provided after a while:
  <kbd>
  <img src="https://github.com/evandonova/Prometheus-Alertmanager-Grafana-Demo/assets/69080997/7762e758-05aa-4c6f-9c31-7f78778129fa" width="600" height="380" />
  </kbd>
    
## Run Grafana to Visualize App Data
Use **Grafana** to **visualize metric data from Prometheus** in the form of histograms, time series, charts, tables, etc.
In this demo, we have **manually created histograms** for visualizing the `http_request_duration_seconds_bucket` **metric** for the **separate endpoints** that our app has:

<kbd>
<img src="https://github.com/evandonova/Prometheus-Alertmanager-Grafana-Demo/assets/69080997/c5ea1f7c-3cde-4c36-8e03-93af384c70ab" width="600" height="350" />
</kbd>
<br><br/>

You can **install Grafana** and **create a dashboard** you like.

You can also **import this sample Grafana dashboard**: go to [Dashboards] 🠲 [New] 🠲 [Import] and use the [grafana-sample-dashboard.json](https://github.com/evandonova/Prometheus-Alertmanager-Grafana-Demo/blob/main/configs/grafana-sample-dashboard.json) file.

Note that you should have created a **Prometheus data source** for Grafana to obtain the metric data from.

