# open-dash-diy
Open-Dash Node.js core

Open-Dash Node.js Install Instructions

Prerequisites:
-Install Git (or download git zip file and expand)
-Install Node.js https://nodejs.org/en/download/
-Install the Open-Dash SmartApp API and remember to enable oauth, get TOKEN and API URL

If Installing on a Raspberry Pi 2/3
Raspberry Pi / Rasbian ships with an old version of node.
sudo su
apt-get update
apt-get upgrade

apt-get remove node

curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -
sudo apt-get install -y nodejs

apt-get autoremove

Create Folder on OS you want to run from

Command Line / Terminal
"git clone https://github.com/open-dash/open-dash-diy.git" 

change into folder "open-dash-diy"

Install node_modules via npm for Open-Dash
run "npm install"

Create Data Folder and JSON Files for Project
run "node install.js"

If upgrading a legacy installation, stop Open-Dash and back up the `data/` folder,
then run `node upgrade.js` from the project root. This fills missing `api` and
`dashDevId` fields in existing dashboards; adding new devices does not migrate
saved records. The command also writes `data/dashboards.bak` (overwriting any
previous backup at that path), so keep your own backup before running it.
Run Open-Dash with a separate dashboard password (at least 16 characters)
in the service environment: `OPEN_DASH_PASSWORD`, and optionally
`OPEN_DASH_USERNAME` (default `dashboard`). Keep these values out of tracked
files and command history. Then run `node index.js`.

Every page, asset, and API requires the browser's HTTP Basic login. The
SmartThings token is only an upstream credential and does not authenticate
visitors. Missing dashboard credentials return HTTP 503; invalid credentials
return HTTP 401. Changing the password requires a server restart.

Use HTTPS when accessing the dashboard over a network, since Basic credentials
are only encoded in transit. For direct API writes, supply Basic authorization
and an `Origin` header matching the dashboard URL. Browser requests supply this
automatically. Cross-origin and origin-less mutations are rejected.

Open Browser to "http://localhost:3000"

Running Tests
The test suite lives in `test/` and runs with Node's built-in test runner
(no extra dependencies). Run it with:
run "npm test"
This executes `node --test "test/**/*.test.js"` against every `*.test.js` file
in the `test/` directory.

Go To Settings

Insert your Client ID and Client Secret from the SmartApp Install Process

Click Save

Connect with SmartThings and authorize devices.

After completing the oauth2 process, you should see weather start to populate upper right near menu.  If so, you are connected to SmartThings Open-Dash API SmartApp

Go To Menu -> SmartThings

Click "Get Devices From SmartThings"

After a few seconds, should populate the table with all your subscribed to devices

Click "Save Devices" to save them to the local JSON file

Repeat for each tab.

Go to Menu -> Dashboards

Create new dashboard

Type in a Name and Click Add

Click on Newly created dashboard

Click "edit" next to Dashboard Name in Header

Select devices to add to Dashboard

Click add Devices

click Edit next to a device to change the template, order, name or enable/disable it

View Dashboard by clicking the dashboard name next to "edit"

All devices right now come in with the default template that just shows all attributes and their values.  Go back into the edit screen and edit each device to pick the right template for the type of device.

From there you can edit Styles and Templates or import/export them.

Customize to your delight and enjoy!

Submit bugs, issues and feature requests on the github repo "Issues" area.
