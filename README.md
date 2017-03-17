# open-dash-node
Open-Dash Node.js core

Open-Dash Node.js Install Instructions

Prerequisites:
-Install Git (or download git zip file and expand)
-Install Node.js https://nodejs.org/en/download/
-Install the Open-Dash SmartApp API and remember to enable oauth, get TOKEN and API URL

Create Folder on OS you want to run from

Command Line / Terminal
"git clone https://github.com/open-dash/open-dash-node.git" 

change into folder "open-dash-node"

Install node_modules via npm for Open-Dash
run "npm install"

Create Data Folder and JSON Files for Project
run "node install.js"

If upgrading, run "node upgrade.js"
Run Open-Dash
"node index.js"

Open Browser to "http://localhost:3000"

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
