import { me } from "appbit";
import clock from "clock";
import { display } from "display";
import document from "document";
import * as fs from "fs";
import { inbox } from "file-transfer";
import * as jpeg from "jpeg";
import * as messaging from "messaging";
import { preferences } from "user-settings";

import * as util from "../common/utils";

const refreshMins = 60;

const SETTINGS_FILE = "settings.cbor";
const SETTINGS_TYPE = "cbor";

const labelTime = document.getElementById("labelTime");
const labelTimeShadow = document.getElementById("labelTimeShadow");
const imageBackground = document.getElementById("imageBackground");

let mySettings;
loadSettings();
me.onunload = saveSettings;

clock.granularity = "minutes";

clock.ontick = evt => {
  let today = evt.date;
  let hours = today.getHours();
  if (preferences.clockDisplay === "12h") {
    hours = hours % 12 || 12;
  } else {
    hours = util.zeroPad(hours);
  }
  let mins = util.zeroPad(today.getMinutes());
  let timeString = `${hours}:${mins}`;
  labelTime.text = timeString;
  labelTimeShadow.text = timeString;
  if (mySettings.lastDownload) {
     
    if (today - new Date(mySettings.lastDownload) >= refreshMins * 60 * 1000){
      console.log(`Last Download Older than ${refreshMins} mins - getting new image`);
      requestNewBackground();
    }
  } else {
    console.log("No Settings - requesting initial image")
    requestNewBackground();
  }
};

imageBackground.onclick = () => requestNewBackground();

function requestNewBackground() {
  
  let data = {
    command: "newBackground"
  };
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    console.log('Requesting new background')
    messaging.peerSocket.send(data);
  } else {
    console.log("Companion not ready - retrying")
    setTimeout(requestNewBackground, 500);
  }
}

inbox.onnewfile = () => {
  let fileName;
  do {
    fileName = inbox.nextFile();
    if (fileName) {
      if (mySettings.bg && mySettings.bg !== "") {
        fs.unlinkSync(mySettings.bg);
      }
      let outFileName = fileName + ".txi";
      jpeg.decodeSync(fileName, outFileName);
      fs.unlinkSync(fileName);
      mySettings.bg = `/private/data/${outFileName}`;
      mySettings.lastDownload = new Date().valueOf();
      mySettings.lastDownload = (Math.floor(mySettings.lastDownload/60000) * 60000)-1000;
      console.log(mySettings.lastDownload);
      applySettings();
    }
  } while (fileName);
};

function loadSettings() {
  try {
    mySettings = fs.readFileSync(SETTINGS_FILE, SETTINGS_TYPE);
    applySettings();
  } catch (ex) {
    mySettings = {};
  }
}

function saveSettings() {
  fs.writeFileSync(SETTINGS_FILE, mySettings, SETTINGS_TYPE);
}

function applySettings() {
  if (mySettings.bg) {
    imageBackground.image = mySettings.bg;
  }
}

// Message socket opens
messaging.peerSocket.onopen = () => {
  console.log("App Socket Open");
};

// Message socket closes
messaging.peerSocket.close = () => {
  console.log("App Socket Closed");
};
