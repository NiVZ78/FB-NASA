import { outbox } from "file-transfer";
import { Image } from "image";
import * as messaging from "messaging";
import { device } from "peer";
import { settingsStorage } from "settings";
import Jimp from "./jimp";

messaging.peerSocket.onmessage = function(evt) {
  if (evt.data.command === "newBackground") {
    getImage();
  }
};


function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}


function getImage() {
  
  let currYear = new Date().getFullYear().toString().substr(-2);
  let rYear = ('0'+getRndInteger(11,currYear)).slice(-2);
  let rWeek = ('0'+getRndInteger(1,52)).slice(-2);
  let rName = `potw${rYear}${rWeek}a.jpg`;
  console.log(`Trying Random Photo: ${rName}`);
  
  
  function ab2str(buf){
    return String.fromCharCode.apply(null, new Uint8Array(buf));
  }
  
  
  async function requestImage(url, resize) {
    
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const image = await Jimp.read(buffer);
  
    if (resize) image.resize(resize.width, resize.height);
    
    return encodeTXI(
      image.bitmap,
      {
        rle: 'auto',
        outputFormat: TXIOutputFormat.RGB565,
      },
    );
  }

  
  const myURL = "https://www.nasa.gov/sites/default/files/styles/image_card_4x3_ratio/public/thumbnails/image/potw1930a.jpg"
  const myResize = {width:150, height:112}
  
  requestImage(myUrl, myResize)
  .then(txi => {outbox.enqueue(`${Date.now()}.jpg`, txi)})
  
 /* 
 let imgURL = `https://www.nasa.gov/sites/default/files/styles/image_card_4x3_ratio/public/thumbnails/image/${rName}`;
   
    fetch(
      imgURL,
      {
        redirect: "follow"
      }
    )
      .then(response => {
        
        if (!response.ok) { 
          throw new Error("NON 2XX RESPONSE!")}
        else{
          return response.arrayBuffer()
        }
        
    })
      .then(buffer => {
          //let strBuf = ab2str(buffer)
          //console.log(strBuf)
          //let offsetBegin = strBuf.indexOf("<dc:title>");
          //offsetBegin=strBuf.indexOf('"x-default">', offsetBegin)+12;
          //let offsetEnd = strBuf.indexOf("</rdf:li>", offsetBegin);
          //console.log("START: " + offsetBegin)
          //console.log("END:   " + offsetEnd)
          //console.log("TITLE: " + strBuf.slice(offsetBegin, offsetEnd))
          return Image.from(buffer, "image/jpeg")    
    })
      .then(image =>
        image.export("image/jpeg", {
          background: "#000000",
          quality: 70
        })
      )
      .then(buffer => outbox.enqueue(`${Date.now()}.jpg`, buffer))
      .then(fileTransfer => {
        console.log(`Enqueued ${fileTransfer.name}`);
      })
      .catch(err =>{
            console.log(`ERROR: ${err}`)
            console.log(`Error fetching image ${rName} - trying again`);
            getImage();
        });
        */
  
  
  
  
  
  
}

// Message socket opens
messaging.peerSocket.onopen = () => {
  console.log("Companion Socket Open");
  //restoreSettings();
};

// Message socket closes
messaging.peerSocket.close = () => {
  console.log("Companion Socket Closed");
};