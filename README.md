---
This is not an officially supported Google product.

---

# Paseos

Paseos is a web app for creating and sharing web journeys. A
web journey consists of one or more destinations on the web with
some accompanying travel notes.

You create a journey by listing a set of URLs to visit and adding
notes to show along the way.

# Setup

To setup this project:

1. Install [node.js](https://nodejs.org/en/).
1. Run `npm install`.

# Running

The project can be hosted locally by executing `npm start`.

# Test

To execute tests run `npm test`.

# Deployment

This project may be deployed to Google App Engine by running `deploy.sh`.

# Configure Firebase database

The project uses a local IndexedDB database by default. If you would
like to use a Firebase database instead then add a firebase-config.json
file at the root. You may use the template at firebase-config.template.json.
