# Blood Alert

This application is designed with the goal of offering diabetics the option of having an emergency contact (EC)alerted when the diabetic's blood sugar is out of range (OOR), but without needing constant false-positives (i.e. OOR but diabetic is aware and fine, and so alerting emergency contact is unneeded) by first checking with the diabetic and, only in the instance that they don't respond, alerting the EC.

You can _run_ the program by typing `node app` in the terminal. This program does not resolve. It listens for web requests and updates users indefinitely.

# Documentation and Code Quality

Not only is it likely that this code will be used by others, but it is also likely that it will be used by others who are not familiar with the codebase. Therefore, it is important that this codebase is well-documented and easy to understand. Please maintain the quality of this codebase.

To understand how the program works, you will need a decent understanding of **[Node.js](https://www.smashingmagazine.com/2019/02/node-api-http-es6-javascript/)**

### Where do I look to start fixing a bug?

- app.ts is the main file. It is the entry point for the program.
- app.ts connects to the DB and then:
  - begins the continual user-checking functionality of the program (`/checker`)
  - begins listening for web requests

### Documentation

TODO: add explanation of how the program works (where to look for what)
