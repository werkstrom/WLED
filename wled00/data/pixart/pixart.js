//Start up code
//if (window.location.protocol == "file:") {
//  let locip = prompt("File Mode. Please enter WLED IP!");
//  gId('curlUrl').value = locip;
//} else
//
//Start up code
gurl.value = location.host;
var aAr = [];
var curStp = 0;
var animTOId;
var isRep = 0;

const urlParams = new URLSearchParams(window.location.search);
if (gurl.value.length < 1){
  gurl.value = "Missing_Host";
}

function gen(returnArray = false){
  //Generate image if enough info is in place
  //Is host non empty
  //Is image loaded
  //is scale > 0
  if (((szX.value > 0 && szY.value > 0) || szDiv.style.display == 'none') && gurl.value.length > 0 && prw.style.display != 'none'){
    //regenerate
    let base64Image = prw.src;
    if (isValidBase64Gif(base64Image)) {
      im.src = base64Image;
      
      //If we only want a RGB, color array for writing to disk. Then we're done and can return
      if (returnArray) {
        return getPixelRGBValues(base64Image, true);// return the array and stop further execution of the function
      } else{
        getPixelRGBValues(base64Image);
      }
      imcn.style.display = "block";
      bcn.style.display = "";
    } else {
      let imageInfo = '<p><b>WARNING!</b> File does not appear to be a valid image</p>';
      imin.innerHTML = imageInfo;
      imin.style.display = "block";
      imcn.style.display = "none";
      JLD.value = '';
    }
  }
  
  if(gurl.value.length > 0){
    gId("sSg").setAttribute("fill", accentColor);
  } else{
    gId("sSg").setAttribute("fill", accentTextColor);
    let ts = tSg;
    ts.style.display = "none";
    ts.innerHTML = "";
    sID.style.display = "flex";
  }
}


// Code for copying the generated string to clipboard

cjb.addEventListener('click', async () => {
  let JSONled = JLD;
  JSONled.select();
  try {
    await navigator.clipboard.writeText(JSONled.value);
  } catch (err) {
    try {
      await d.execCommand("copy");
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  }
});

// Event listeners =======================

lSS.addEventListener("change", gen);
szY.addEventListener("change", gen);
szX.addEventListener("change", gen);
cFS.addEventListener("change", gen);
aS.addEventListener("change", gen);
brgh.addEventListener("change", gen);
cLN.addEventListener("change", gen);
haIDe.addEventListener("change", gen);
haUe.addEventListener("change", gen);
haNe.addEventListener("change", gen);
gurl.addEventListener("change", gen);
sID.addEventListener("change", gen);
prw.addEventListener("load", gen);
//gId("convertbutton").addEventListener("click", gen);

tSg.addEventListener("change", () => {
  sop = tSg.options[tSg.selectedIndex];
  szX.value = sop.dataset.x;
  szY.value = sop.dataset.y;
  gen();
});

gId("sendJSONledbutton").addEventListener('click', async () => {
  if (window.location.protocol === "https:") {
    alert('Will only be available when served over http (or WLED is run over https)');
  } else {
    postPixels();
  }
});

brgh.oninput = () => {
  brgV.textContent = brgh.value;
  let perc = parseInt(brgh.value)*100/255;
  var val = `linear-gradient(90deg, #bbb ${perc}%, #333 ${perc}%)`;
  brgh.style.backgroundImage = val;
}

cLN.oninput = () => {
  let cln = cLN;
  cLV.textContent = cln.value;
  let perc = parseInt(cln.value)*100/512;
  var val = `linear-gradient(90deg, #bbb ${perc}%, #333 ${perc}%)`;
  cln.style.backgroundImage = val;
}

frm.addEventListener("change", () => {
  for (var i = 0; i < hideableRows.length; i++) {
    hideableRows[i].classList.toggle("hide", frm.value !== "ha");
    gen();
  }
});

async function postPixels() {
  let ss = gId("sendSvgP");
  ss.setAttribute("fill", prsCol);
  let er = false;
  for (let i of httpArray) {
    try {
      const response = await fetch('http://'+gId('curlUrl').value+'/json/state', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: i
      });
      const data = await response.json();
    } catch (error) {
      console.error(error);
      er = true;
    }
  }
  if(er){
    //Something went wrong
    ss.setAttribute("fill", redColor);
    setTimeout(function(){ 
      ss.setAttribute("fill", accentTextColor);
    }, 1000);
  } else {
    // A, OK
    ss.setAttribute("fill", greenColor);
    setTimeout(function(){ 
      ss.setAttribute("fill", accentColor);
    }, 1000);
  }
}

//This is the code/call we should make to start the animation (or script later)
async function postAnim(scriptID) {
  let ss = gId("sendSvgP");
  ss.setAttribute("fill", prsCol);
  let er = false;
  let test = [`{"pixart":{"anim": "${scriptID}"}}`];
  console.log(test);
  for (let i of test) {
    try {
      const response = await fetch('http://'+gId('curlUrl').value+'/json/state', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: i
      });
      const data = await response.json();
    } catch (error) {
      console.error(error);
      er = true;
    }
  }
  if(er){
    //Something went wrong
    ss.setAttribute("fill", redColor);
    setTimeout(function(){ 
      ss.setAttribute("fill", accentTextColor);
    }, 1000);
  } else {
    // A, OK
    ss.setAttribute("fill", greenColor);
    setTimeout(function(){ 
      ss.setAttribute("fill", accentColor);
    }, 1000);
  }
}

//File uploader code
const dropZone = gId('drop-zone');
const filePicker = gId('file-picker');
const preview = prw;

// Listen for dragenter, dragover, and drop events
dropZone.addEventListener('dragenter', dragEnter);
dropZone.addEventListener('dragover', dragOver);
dropZone.addEventListener('drop', dropped);
dropZone.addEventListener('click', zoneClicked);

// Listen for change event on file picker
filePicker.addEventListener('change', filePicked);

// Handle zone click
function zoneClicked(e) {
  e.preventDefault();
  //this.classList.add('drag-over');
  //alert('Hej');
  filePicker.click();
}

// Handle dragenter
function dragEnter(e) {
  e.preventDefault();
  this.classList.add('drag-over');
}

// Handle dragover
function dragOver(e) {
  e.preventDefault();
}

// Handle drop
function dropped(e) {
  e.preventDefault();
  this.classList.remove('drag-over');

  // Get the dropped file
  const file = e.dataTransfer.files[0];
  updatePreview(file)
}

// Handle file picked
function filePicked(e) {
  // Get the picked file
  const file = e.target.files[0];
  updatePreview(file)
}

// Update the preview image
function updatePreview(file) {
  let nImg = ''
  // Use FileReader to read the file
  const reader = new FileReader();
  reader.onload = () => {
    // Update the preview image
    preview.src = reader.result;
    
    // Add a new image to lib
    const iTs = document.querySelectorAll('#lib img');
    let mxN = 0;
    iTs.forEach((img) => {
      const idN = parseInt(img.id.slice(1));
      if (idN > mxN) {
        mxN = idN;
      }
    });

    const lstImg = gId(`i${mxN}`); //Last image in library
    nNo = mxN + 1;
    let nID = `i${nNo}`; //New img ID
    const newImgAlt = `Library image ${nNo}`;
    lstImg.insertAdjacentHTML('afterend', `<img id="${nID}" src="${preview.src}" alt="Library image ${nNo}" title="Image ${nNo}" width="64" height="64">`);

    nImg = gId(nID);
    nImg.setAttribute("data-issel", 1);
    nImg.style.border = "2px solid #eee";
    nImg.addEventListener('click', clkImg);
    //Delete i0 if exists as i0 is only a placeholder to make the general code of inserting simple.
    toDel = gId("i0");
    if(toDel){
      toDel.parentNode.removeChild(toDel);
    }
    prw.style.display = "";
    lib.style.display = "";
  };
  reader.readAsDataURL(file);
  
  setFoc(nImg);
}

function setFoc(im){
  const iTs = document.querySelectorAll('#lib img');
  iTs.forEach((iTs) => {
    if(im.srcElement!=iTs){
      iTs.style.border = `2px solid #444`;
      iTs.setAttribute("data-isSel", 0);
    }else{
      //for the selected image
      iTs.style.border = "2px solid #eee";
      iTs.setAttribute("data-isSel", 1);
    }
  });
  
}

function clkImg(e){
  setFoc(e);
  prw.src = e.srcElement.src;
}

function isValidBase64Gif(string) {
  if (1==1 || base64gifPattern.test(string) || base64pngPattern.test(string) || base64jpgPattern.test(string) || base64webpPattern.test(string)) {
    return true;
  } else {
    //Not OK
    return false;
  }
}

var hideableRows = d.querySelectorAll(".ha-hide");
for (var i = 0; i < hideableRows.length; i++) {
  hideableRows[i].classList.add("hide");
}
frm.addEventListener("change", () => {
  for (var i = 0; i < hideableRows.length; i++) {
    hideableRows[i].classList.toggle("hide", frm.value !== "ha");
  }
});

function switchScale() {
  //let scalePath = gId("scaleDiv").children[1].children[0]
  let scaleTogglePath = scDiv.children[0].children[0]
  let color = scaleTogglePath.getAttribute("fill");
  let dd = '';
  if (color === accentColor) {
    color = accentTextColor;
    dd = scaleToggleOffd;
    szDiv.style.display = "none";
    // Set values to actual XY of image, if possible
  } else {
    color = accentColor;
    dd = scaleToggleOnd;
    szDiv.style.display = "";
  }
  //scalePath.setAttribute("fill", color);
  scaleTogglePath.setAttribute("fill", color);
  scaleTogglePath.setAttribute("d", dd);
  gen();
}

function switchRun() {
  let runTogglePath = rnDiv.children[0].children[0]
  let color = runTogglePath.getAttribute("fill");
  let dd = '';
  if (color === accentColor) {
    color = accentTextColor;
    dd = scaleToggleOffd;
    gId("rnTD").style.display = "none";
    gId("rnLstTR").style.display = "none";
  } else {
    color = accentColor;
    dd = scaleToggleOnd;
    gId("rnTD").style.display = "";
    gId("rnLstTR").style.display = "";
  }
  runTogglePath.setAttribute("fill", color);
  runTogglePath.setAttribute("d", dd);
  gen();
}

function setStpImg(e){
  i = e.srcElement.ownerSVGElement;
  selim = "";
  if(i){ //the path triggered the event
    nr = i.id.replace("loadImgSVG", "");
  } else{ //the SVG itself was clicked
    nr = e.srcElement.id.replace("loadImgSVG", "");
  }
  const imgs = gId("lib").getElementsByTagName("img");
  for (let i = 0; i < imgs.length; i++) {
    const issel = imgs[i].getAttribute("data-issel")
    if (issel == 1) {
      selim = imgs[i];
      break;
    }
  }
  td = gId(`stp${nr}ImgTD`);
  td.innerHTML = `<img id="stp${nr}Img" src="${selim.src}" alt="Step image ${nr}" title="Image: ${selim.title}" width="36" height="36" data-baseimg=${selim.id}>`; 
}

function addStpImg(e){
  i = e.srcElement.ownerSVGElement;
  selim = "";
  if(i){ //the path triggered the event
    nr = i.id.replace("addRowSVG", "");
  } else{ //the SVG itself was clicked
    nr = e.srcElement.id.replace("addRowSVG", "");
  }
  let nxnr = parseInt(nr) + 1;
  thisTR = gId(`stp${nr}`);
  
  //Replace with the next idno
  const regex = /XxX/g;
  const NewTRHTML = stpTR.replace(regex, (match) => {
    return nxnr;
  });

  var trs = Array.from(gId("rnLst").getElementsByTagName('tr'));
  var toMove = [];
  trs.forEach(function(i) {
    thisNr = parseInt(i.id.replace("stp", ""));
    if(thisNr>nr){
      toMove.push(thisNr);
    }
  });
  toMove.sort(function(a, b) {
    return b - a;
  })
  toMove.forEach(function(i){
    moveStep(i, i+1);
  });
  // Create a new TR element
  var newTR = document.createElement('tr');
  newTR.id = `stp${nxnr}`;
  newTR.setAttribute("data-json", "")
  newTR.style = "display: flex; align-items: center;";
  newTR.innerHTML = NewTRHTML;
  // Insert the new TR element after thisTR
  thisTR.parentNode.insertBefore(newTR, thisTR.nextSibling);
  gId(`loadImgSVG${nxnr}`).addEventListener('click', setStpImg);
  gId(`addRowSVG${nxnr}`).addEventListener('click', addStpImg);
  gId(`delRowSVG${nxnr}`).addEventListener('click', delStpImg);
}

function delStpImg(e){
  i = e.srcElement.ownerSVGElement;
  selim = "";
  if(i){ //the path triggered the event
    nr = i.id.replace("delRowSVG", "");
  } else{ //the SVG itself was clicked
    nr = e.srcElement.id.replace("delRowSVG", "");
  }
  gId(`stp${nr}`).remove();

  var trs = Array.from(gId("rnLst").getElementsByTagName('tr'));
  var toMove = [];
  trs.forEach(function(i) {
    thisNr = parseInt(i.id.replace("stp", ""));
    if(thisNr>nr){
      toMove.push(thisNr);
    }
  });
  toMove.sort();
  toMove.forEach(function(i){
    moveStep(i, i-1);
  });
}

function chkDelOK(){
  //Needs to be more than one row to delete rows
  if(2==1){
    gId(`stp${newN}Del`).style.display = "none";
  }else{
    gId(`stp${newN}Del`).style.display = "";
  }
}

function moveStep(oldN, newN){
  //Make sure calling this in the correct order so new always is empty first
  gId(`stp${oldN}`).id = `stp${newN}`;
  gId(`stp${oldN}Load`).id = `stp${newN}Load`;
  gId(`loadImgSVG${oldN}`).id = `loadImgSVG${newN}`;
  gId(`stp${oldN}ImgTD`).id = `stp${newN}ImgTD`;
  
  const imIs = gId(`empImgSVG${oldN}`);
  if(imIs){
    gId(`empImgSVG${oldN}`).id = `empImgSVG${newN}`
  }else{
    gId(`stp${oldN}Img`).id = `stp${newN}Img`;
  };
  
  gId(`stp${oldN}Dur`).id = `stp${newN}Dur`;
  gId(`stp${oldN}DurFld`).id = `stp${newN}DurFld`;
  gId(`stp${oldN}Add`).id = `stp${newN}Add`;
  gId(`addRowSVG${oldN}`).id = `addRowSVG${newN}`;
  gId(`stp${oldN}Del`).id = `stp${newN}Del`;
  gId(`delRowSVG${oldN}`).id = `delRowSVG${newN}`;
}

function generateSegmentOptions(array) {
  //This function is prepared for a name property on each segment for easier selection
  //Currently the name is generated generically based on index
  tSg.innerHTML = "";
  for (var i = 0; i < array.length; i++) {
    var option = cE("option");
    option.value = array[i].value;
    option.text = array[i].text;
    option.dataset.x = array[i].x;
    option.dataset.y = array[i].y;
    tSg.appendChild(option);
    if(i === 0) {
      option.selected = true;
      szX.value = option.dataset.x;
      szY.value = option.dataset.y;
    }
  }
}

// Get segments from device
async function getSegments() {
  cv = gurl.value;
  if (cv.length > 0 ){
    try {
      var arr = [];
      const response = await fetch('http://'+cv+'/json/state');
      const json = await response.json();
      let ids = json.seg.map(sg => ({id: sg.id, n: sg.n, xs: sg.start, xe: sg.stop, ys: sg.startY, ye: sg.stopY}));
      for (var i = 0; i < ids.length; i++) {
        arr.push({
            value: ids[i]["id"],
            text: ids[i]["n"] + ' (index: ' + ids[i]["id"] + ')',
            x: ids[i]["xe"] - ids[i]["xs"],
            y: ids[i]["ye"] - ids[i]["ys"]
        });
      }
      generateSegmentOptions(arr);
      tSg.style.display = "flex";
      sID.style.display = "none";
      gId("sSg").setAttribute("fill", greenColor);
      setTimeout(function(){ 
        gId("sSg").setAttribute("fill", accentColor);
      }, 1000);

    } catch (error) {
      console.error(error);
      gId("sSg").setAttribute("fill", redColor);
      setTimeout(function(){ 
        gId("sSg").setAttribute("fill", accentColor);
      }, 1000);
      tSg.style.display = "none";
      sID.style.display = "flex";
    }
  } else{
    gId("sSg").setAttribute("fill", redColor);
    setTimeout(function(){ 
      gId("sSg").setAttribute("fill", accentTextColor);
    }, 1000);
    tSg.style.display = "none";
    sID.style.display = "flex";
  }
}

//Initial population of segment selection
function generateSegmentArray(noOfSegments) {
  var arr = [];
  for (var i = 0; i < noOfSegments; i++) {
    arr.push({
      value: i,
      text: "Segment index " + i
    });
  }
  return arr;
}

//Animating according to list setup
function anim(){
  var localaAr = [];
  gId("sendSvgP").setAttribute("fill", inactiveColor);
  gId("sndRnDiv").removeEventListener("click", sendAnim);
  gId("sndRnDiv").title = "Sending disabled while animating";
  gId("playSVG").innerHTML=stopSVGPath;
  gId("prwRnDiv").removeEventListener("click", anim);
  gId("prwRnDiv").addEventListener('click',stopAnim);
  aAr = [];
  curStp = 0;
  var trs = Array.from(gId("rnLst").getElementsByTagName('tr'));
  trs.forEach(function(tr) {
    const stpId = tr.id.replace("stp", "");
    const imgTD = tr.getElementsByClassName("stpImgTD")[0];
    const imgTG =  imgTD.querySelector("img");
    const imgId = imgTG.getAttribute("data-baseimg");
    const durTD = tr.getElementsByClassName("stpDur")[0];
    const durTG =  durTD.querySelector("input");
    const dur = durTG.value * 10;
    aAr.push({ stpId: stpId, imgId: imgId, dur: dur });
  });
  curStp = 0;
  animateSteps(curStp);
}

function animateSteps(curStp) {
  if (curStp >= aAr.length || curStp < 0) {
    stopAnim();
    return;
  }
  var stp = aAr[curStp];
  gId(stp.imgId).click();
  if(curStp + 1 >= aAr.length && isRep == 1){
    nStp = 0;
  } else{
    nStp = curStp + 1;
  }

  animTOId = setTimeout(function() {
    animateSteps(nStp);
  }, stp.dur);
} 

document.addEventListener("dblclick", function() {
  stopAnim();
});

function stopAnim(){
  clearTimeout(animTOId);
  gId("playSVG").innerHTML=playSVGPath;
  
  gId("prwRnDiv").removeEventListener("click", stopAnim);
  gId("prwRnDiv").addEventListener('click', anim);
  gId("sendSvgP").setAttribute("fill", accentColor);
  gId("sndRnDiv").removeEventListener("click", sendAnim);
  gId("sndRnDiv").addEventListener("click", sendAnim);
  gId("sndRnDiv").title = "Send animation file to device";
}

function setRep(e){
  pth =  gId("repPath");
  console.log(e, pth.getAttribute("fill"), accentColor, inactiveColor);
  if(pth.getAttribute("fill") == accentColor){
    pth.setAttribute("fill", inactiveColor)
    isRep = 0;
  } else{
    pth.setAttribute("fill", accentColor)
    isRep = 1;
  };
}

async function sendAnim(e) {
  
  //set base data
  gId("sendSvgP").setAttribute("fill", inactiveColor);
  let rnID = gId("rnID").value
  let theJSONobj = {
    "description": rnID,
    "created": new Date().toLocaleString().substring(0, 16).replace(',', '')  
  };
  theJSONobj["repeat"] = isRep === 1 ? true : false;
  //Get all used images
  sAr = [];
  var trs = Array.from(gId("rnLst").getElementsByTagName('tr'));
  trs.forEach(function(tr) {
    const stpId = tr.id.replace("stp", "");
    const imgTD = tr.getElementsByClassName("stpImgTD")[0];
    const imgTG =  imgTD.querySelector("img");
    const imgId = imgTG.getAttribute("data-baseimg");
    const durTD = tr.getElementsByClassName("stpDur")[0];
    const durTG =  durTD.querySelector("input");
    const dur = durTG.value;
    sAr.push({ stpId: stpId, imgId: imgId, dur: dur });
  });

  //Create a command batch for each unique image (could be split into several commands to keep size of each command down)
  let cAr = [...new Set(sAr.map(item => item.imgId))];
  sets = []
  const result = await itcAr(cAr);
  theJSONobj["sets"] = result.map(row => row[2]); //only get the JSON objects

  //Create a step list from sAr, referencing the commands
  sAr.sort((a, b) => a.stpId - b.stpId);
  const stpAr = sAr.map((item, index) => {
    return {
      step: index + 1, //using index instead of stpId to assure no gaps in sequece
      commandId: item.imgId,
      duration: item.dur
    }
  });
  theJSONobj["steps"] = stpAr;
  const fileName = `/flow_${rnID}.json`;
  uploadAnimation(result, stpAr, rnID);
  //uploadJSON(JSON.stringify(theJSONobj), fileName);
  //uploadBitArray(result, stpAr, rnID);
}


async function itcAr(cAr) {
  const result = [];
  for (const i of cAr) {
    const res = await setImg(i);
    const comAr = httpArray.map((command, index) => {
      return {
        position: index + 1,
        command: JSON.parse(command)
      }
    });
    const rawAr = new Uint8Array(rawRGBArray)
    let tObj = {
      "id": i,
      "commands": comAr
    }
    result.push([i, rawAr, tObj]);
  }
  return result;
}

async function setImg(i) {
  return new Promise(resolve => {
    gId(i).click();
    //Bit of a dirty solution to make sure the image is rendered and the HTTParray is created.
    setTimeout(() => {
      resolve(i);
    }, 200);
  });
}

/*
function uploadJSON(jsonString, fileName) {
  var req = new XMLHttpRequest();
  var blob = new Blob([jsonString], {type: "application/json"});
  req.addEventListener('load', function(){
    console.log(`Writing ${fileName} succeeded. `, this.responseText, ' - ',  this.status);
    gId("sendSvgP").setAttribute("fill", greenColor);
    setTimeout(function(){ 
      gId("sendSvgP").setAttribute("fill", accentColor);
    }, 1000);
  });
  req.addEventListener('error', function(e){
    console.log('Error: ', e); console.log(' Status: ', this.status);
    gId("sendSvgP").setAttribute("fill", greenColor);
    setTimeout(function(){ 
      gId("sendSvgP").setAttribute("fill", accentColor);
    }, 2000);
  });
  req.open("POST", "/upload");
  var formData = new FormData();
  formData.append("data", blob, fileName);
  console.log(`Writing ${fileName} to device` );
  req.send(formData);
  return false;
}
*/




function uploadAnimation(result, stpAr, rnID){

  // Reworked functionality to better match WLED (SetPixel format and so on...)
  // Please read documentation on bit/byte usage in the resulting .bin file on the device
  // We should create one file with all the changes for each frame
  // First frame, should have index 0
  // If repeat is on, last frame should have index 255 and have the changes needed to display frameIndex 0

  stpAr.sort((a, b) => a.step - b.step);
  var commandArray = result.map(function(innerArr) {
    return [innerArr[0], innerArr[1]];
  });
  //Go through each step and generate all pixel values that needs to change from the previous frame
  let lastFrameArray = [];
  let framesArray = [];
  let firstFrameArray = [];
  let durationArray = [];
  stpAr.forEach(function (thisStep, index){
    durationArray.push([index, parseInt(thisStep.duration)]);
    const thisCommand = commandArray.find(row => row[0] === thisStep.commandId)[1];
    let changesArray = [];
    if(index == 0){
      //This is the first command row
      for (let i = 0; i < thisCommand.length; i += 3) {
        //In this array index = the frameID (first byte), i = the pixel index (byte 2 and 3), then comes the RGB values
        //First time all pixels are set
        changesArray.push([index, i/3, thisCommand[i], thisCommand[i+1], thisCommand[i+2]])
      };
      firstFrameArray = changesArray.slice(); //Save the first frame so we can reuse for comparison for repeat (i.e. frame id 255)
      lastFrameArray = changesArray.slice(); //Save the first frame so we can reuse for comparison for next frame (i.e. frame id 0)
    } else { 
      //All rows exept the first
      let thisFrameArray = [];
      for (let i = 0; i < thisCommand.length; i += 3) {
        thisFrameArray.push([index, i/3, thisCommand[i], thisCommand[i+1], thisCommand[i+2]]);
        let thisPixelLastFrame = lastFrameArray[i/3]; //could also be done using a lookup on the pixelID (second index) but since we have ALL pixels of the last frame we can use the index
        if(thisPixelLastFrame[2] != thisCommand[i] || thisPixelLastFrame[3] != thisCommand[i+1] || thisPixelLastFrame[4] != thisCommand[i+2]){
          //only set this pixel to change if the color is different on this pixel compared to last frame
          changesArray.push([index, i/3, thisCommand[i], thisCommand[i+1], thisCommand[i+2]])
        }
      }; 
      lastFrameArray = thisFrameArray.slice(); //Save the first frame so we can reuse for comparison for next frame (i.e. frame id 1)
    }
    framesArray.push(...changesArray);
  });

  //Set up diffs for last to first as step 255 if repeat
  if(isRep == 1){
    let changesArray = [];
    firstFrameArray.forEach(function (thisPixel, index){
      let thisPixelLastFrame = lastFrameArray[index];
      if(thisPixelLastFrame[2] != thisPixel[2] || thisPixelLastFrame[3] != thisPixel[3] || thisPixelLastFrame[4] != thisPixel[4]){
        //only set this pixel to change if the color is different on this pixel compared to last frame
        changesArray.push([255, index, thisPixel[2], thisPixel[3], thisPixel[4]]);
      }
    }); 
    framesArray.push(...changesArray);
  }
  //This is where we probably should make code that identifies entire steps that are now still identical (like with the packman ghost that can have several frames back and forth) where we could remove the change infor from all but the first change and then reffer to the first in a lookup.
  //But that is for another day

  //Create Uint8Arrays
  let framesSeqArray = [];
  framesArray.forEach(function(item, index){
    //Convert the 16bit pixel position value to 2 8bit values so we can write to the file easily
    const bit16num = item[1];
    const highByte = (bit16num >> 8) & 0xff; // Extract high byte
    const lowByte = bit16num & 0xff; // Extract low byte
    
    /* bit explanation
      00-03: Frame index Maximum of 255 frames allowed, last fram index reserved for "repeat" frame
      04-11: PixelIndex. Maximum of 65535 pixels adressable (LOL, should be plenty ;)
      12-15: Red value
      16-19: Green value
      20-23: Blue value
      White value not implemented. Will be handled on the device for now.
    */
    framesSeqArray.push(item[0], highByte, lowByte, item[2], item[3], item[4]);
  });

  let durationSeqArray = [];
  durationArray.forEach(function(item, index){
    //Convert the 16bit pixel position value to 2 8bit values so we can write to the file easily
    const bit16num = item[1];
    const highByte = (bit16num >> 8) & 0xff; // Extract high byte
    const lowByte = bit16num & 0xff; // Extract low byte
    
    /* bit explanation
      00-03: Frame index Maximum of 255 frames allowed, last fram index reserved for "repeat" frame
      04-11: Duration in 1/100 second. Maximum of 655.35 seconds which is almost 11 minutes (LOL, should be plenty ;)
    */
    durationSeqArray.push(item[0], highByte, lowByte);
  });

  //Writing Files
  const reqFrames = new XMLHttpRequest();
  const blobFrames = new Blob([new Uint8Array(framesSeqArray)], {type: 'application/octet-stream'});
  fileName = `/${rnID}.frm`; 
  reqFrames.fileName = fileName;
  console.log(`Writing ${fileName} to device` );
  addListenerToHTTP(reqFrames, fileName);
  reqFrames.open("POST", "/upload");
  var formDataFrames = new FormData();
  formDataFrames.append("data", blobFrames, fileName);
  reqFrames.send(formDataFrames);

  const reqDur = new XMLHttpRequest();
  const blobDur = new Blob([new Uint8Array(durationSeqArray)], {type: 'application/octet-stream'});
  fileName = `/${rnID}.ani`; 
  reqDur.fileName = fileName;
  console.log(`Writing ${fileName} to device` );
  addListenerToHTTP(reqDur, fileName);
  reqDur.open("POST", "/upload");
  var formDataDur = new FormData();
  formDataDur.append("data", blobDur, fileName);
  reqDur.send(formDataDur);

  return false;
}

function addListenerToHTTP(req, filename){
  //Cut this out to make the generatoin code more readble
  req.addEventListener('load', function(){
    console.log(`Writing ${filename} succeeded. `, this.responseText, ' - ',  this.status);
    gId("sendSvgP").setAttribute("fill", greenColor);
    setTimeout(function(){ 
      gId("sendSvgP").setAttribute("fill", accentColor);
    }, 1000);
  });
  req.addEventListener('error', function(e){
    console.log('Error: ', e); console.log(' Status: ', this.status);
    gId("sendSvgP").setAttribute("fill", greenColor);
    setTimeout(function(){ 
      gId("sendSvgP").setAttribute("fill", accentColor);
    }, 2000);
  });
}
/*
function uploadBitArray(result, stpAr, rnID){

  // We should create one file with all the changes for each frame
  //First frame, should have index 0
  //If repeat is on, last frame should have index 255 and have the changes needed to display frameIndex 0
  result.forEach(function(arr) {
    const req = new XMLHttpRequest();
    const blob = new Blob([new Uint8Array(arr[1])], {type: 'application/octet-stream'});
    fileName = `/fl_${rnID}_c${arr[0]}.bin`;
    req.fileName = fileName;
    req.addEventListener('load', function(){
      console.log(`Writing ${this.fileName} succeeded. `, this.responseText, ' - ',  this.status);
      gId("sendSvgP").setAttribute("fill", greenColor);
      setTimeout(function(){ 
        gId("sendSvgP").setAttribute("fill", accentColor);
      }, 1000);
    });
    req.addEventListener('error', function(e){
      console.log('Error: ', e); console.log(' Status: ', this.status);
      gId("sendSvgP").setAttribute("fill", greenColor);
      setTimeout(function(){ 
        gId("sendSvgP").setAttribute("fill", accentColor);
      }, 2000);
    });
    console.log(`Writing ${fileName} to device` );
    req.open("POST", "/upload");
    var formData = new FormData();
    formData.append("data", blob, fileName);
    req.send(formData);
  });
  //Upload stepFiles
  // JSON
  let stpJSONobj = {
    "raw":true,
    "on":true,
    "n": rnID,
    "created": new Date().toLocaleString().substring(0, 16).replace(',', '')  
  };
  stpAr.sort((a, b) => a.step - b.step);
  const commandIds = stpAr.map(obj => obj.commandId);
  const durations = stpAr.map(obj => parseInt(obj.duration));
  const trns = new Array(commandIds.length).fill(0);
  stpJSONobj["ps"] = commandIds;
  stpJSONobj["dur"] = durations;
  stpJSONobj["transition"] = trns;
  console.log("JSON playlist style: ", stpJSONobj);
  let stpfileName = `/fl_${rnID}stp.json`;
  var reqstpJ = new XMLHttpRequest();
  reqstpJ.addEventListener('load', function(){
    console.log(`Writing ${stpfileName} succeeded. `, this.responseText, ' - ',  this.status);
    gId("sendSvgP").setAttribute("fill", greenColor);
    setTimeout(function(){ 
      gId("sendSvgP").setAttribute("fill", accentColor);
    }, 1000);
  });
  reqstpJ.addEventListener('error', function(e){
    console.log('Error: ', e); console.log(' Status: ', this.status);
    gId("sendSvgP").setAttribute("fill", greenColor);
    setTimeout(function(){ 
      gId("sendSvgP").setAttribute("fill", accentColor);
    }, 2000);
  });
  var blobJ = new Blob([JSON.stringify(stpJSONobj)], {type: "application/json"});
  reqstpJ.open("POST", "/upload");
  var formDatastpJ = new FormData();
  formDatastpJ.append("data", blobJ, stpfileName);
  console.log(`Writing ${stpfileName} to device` );
  reqstpJ.send(formDatastpJ);
  //bin
  return false;
}
*/

var segmentData = generateSegmentArray(10);

generateSegmentOptions(segmentData);

seDiv.innerHTML =
'<svg id=getSegmentsSVG style="width:36px;height:36px;cursor:pointer" viewBox="0 0 24 24" onclick="getSegments()"><path id=sSg fill="currentColor" d="M6.5 20Q4.22 20 2.61 18.43 1 16.85 1 14.58 1 12.63 2.17 11.1 3.35 9.57 5.25 9.15 5.68 7.35 7.38 5.73 9.07 4.1 11 4.1 11.83 4.1 12.41 4.69 13 5.28 13 6.1V12.15L14.6 10.6L16 12L12 16L8 12L9.4 10.6L11 12.15V6.1Q9.1 6.45 8.05 7.94 7 9.43 7 11H6.5Q5.05 11 4.03 12.03 3 13.05 3 14.5 3 15.95 4.03 17 5.05 18 6.5 18H18.5Q19.55 18 20.27 17.27 21 16.55 21 15.5 21 14.45 20.27 13.73 19.55 13 18.5 13H17V11Q17 9.8 16.45 8.76 15.9 7.73 15 7V4.68Q16.85 5.55 17.93 7.26 19 9 19 11 20.73 11.2 21.86 12.5 23 13.78 23 15.5 23 17.38 21.69 18.69 20.38 20 18.5 20M12 11.05Z" /></svg>'

cjb.innerHTML = 
'<svg class="svg-icon" style="width:36px;height:36px" viewBox="0 0 24 24"> <path fill="currentColor" d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z" /> </svg>&nbsp; Copy to clipboard'; 

gId("sendJSONledbutton").innerHTML = 
'<svg class="svg-icon" style="width:36px;height:36px" viewBox="0 0 24 24"> <path id=sendSvgP fill="currentColor" d="M6.5 20Q4.22 20 2.61 18.43 1 16.85 1 14.58 1 12.63 2.17 11.1 3.35 9.57 5.25 9.15 5.88 6.85 7.75 5.43 9.63 4 12 4 14.93 4 16.96 6.04 19 8.07 19 11 20.73 11.2 21.86 12.5 23 13.78 23 15.5 23 17.38 21.69 18.69 20.38 20 18.5 20H13Q12.18 20 11.59 19.41 11 18.83 11 18V12.85L9.4 14.4L8 13L12 9L16 13L14.6 14.4L13 12.85V18H18.5Q19.55 18 20.27 17.27 21 16.55 21 15.5 21 14.45 20.27 13.73 19.55 13 18.5 13H17V11Q17 8.93 15.54 7.46 14.08 6 12 6 9.93 6 8.46 7.46 7 8.93 7 11H6.5Q5.05 11 4.03 12.03 3 13.05 3 14.5 3 15.95 4.03 17 5.05 18 6.5 18H9V20M12 13Z" /> </svg>&nbsp; Send to device';

//Sets SVGs because of minimfier
gId("repRnDiv").innerHTML = repSVG;
gId("prwRnDiv").innerHTML = playSVG;
gId("sndRnDiv").innerHTML = sendSVG;

gId("repPath").setAttribute("fill", accentColor);

//Sets first row, because of minifier :(
const regex = /XxX/g;
gId('stp1').innerHTML = stpTR.replace(regex, (match) => {
  return 1;
});
gId("rnTD").style.display = 'none'
gId("loadImgSVG1").addEventListener("click", setStpImg);
gId("addRowSVG1").addEventListener("click", addStpImg);
gId("delRowSVG1").addEventListener("click", delStpImg);
gId("sndRnDiv").addEventListener("click", sendAnim);
gId("prwRnDiv").addEventListener('click', anim);
//gId("repRnDiv").removeEventListener('click', setRep);
//gId("repRnDiv").addEventListener('click', setRep);

//After everything is loaded, check if we have a possible IP/host

if(gurl.value.length > 0){
  // Needs to be addressed directly here so the object actually exists
  gId("sSg").setAttribute("fill", accentColor);
}
