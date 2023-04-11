//elements
var gurl = gId('curlUrl'); 
var szX = gId("sizeX"); 
var szY = gId("sizeY");
var szDiv = gId("sizeDiv"); 
var prw = gId("preview");
var lib = gId("lib");
var sID = gId('segID');
var JLD = gId('JSONled');
var tSg = gId('targetSegment');
var brgh = gId("brightnessNumber");

var seDiv = gId("getSegmentsDiv")
var cjb = gId("copyJSONledbutton");
var frm = gId("formatSelector");
var cLN = gId("colorLimitNumber");
var haIDe = gId("haID");
var haUe = gId("haUID");
var haNe = gId("haName");
var aS = gId("addressingSelector");
var cFS = gId("colorFormatSelector");
var lSS  = gId("ledSetupSelector");
var imin = gId('image-info');
var imcn = gId('image-container');
var bcn = gId("button-container");
var im = gId('image');
//var ss = gId("sendSvgP");
var scDiv = gId("scaleDiv");
var rnDiv = gId("runDiv");
var w = window;
var canvas = gId('pixelCanvas');
var brgV = gId("brightnessValue");
var cLV = gId("colorLimitValue");
var sndRnDivgId = gId("sndRnDiv");
//vars
var httpArray = [];
var fileJSON = '';

var hideableRows = d.querySelectorAll(".ha-hide");
for (var i = 0; i < hideableRows.length; i++) {
  hideableRows[i].classList.add("hide");
}

var accentColor = '#eeeeee';
var inactiveColor = '#444444'
var accentTextColor = '#777';
var prsCol = '#ccc';
var greenColor = '#056b0a';
var redColor = '#6b050c';

var scaleToggleOffd = "M17,7H7A5,5 0 0,0 2,12A5,5 0 0,0 7,17H17A5,5 0 0,0 22,12A5,5 0 0,0 17,7M7,15A3,3 0 0,1 4,12A3,3 0 0,1 7,9A3,3 0 0,1 10,12A3,3 0 0,1 7,15Z";
var scaleToggleOnd = "M17,7H7A5,5 0 0,0 2,12A5,5 0 0,0 7,17H17A5,5 0 0,0 22,12A5,5 0 0,0 17,7M17,15A3,3 0 0,1 14,12A3,3 0 0,1 17,9A3,3 0 0,1 20,12A3,3 0 0,1 17,15Z";

var repSVG = '<svg id="repSVG" style="width:36px;height:36px;cursor:pointer" viewBox="0 0 24 24"><path id="repPath" fill="#444" d="M17,17H7V14L3,18L7,22V19H19V13H17M7,7H17V10L21,6L17,2V5H5V11H7V7Z"/></svg>'
var playSVG = '<svg id=playSVG style="width:36px;height:36px;cursor:pointer" viewBox="0 0 24 24"><path fill="#eeeeee" d="M8,5.14V19.14L19,12.14L8,5.14Z"/></svg>'
var stopSVGPath = '<path id="stopSVGPath" fill="#eee" d="M18,18H6V6H18V18Z"/>'
var playSVGPath = '<path id="playSVGPath" fill="#eee" d="M8,5.14V19.14L19,12.14L8,5.14Z"/>'
var sendSVG = '<svg class="svg-icon" style="width:36px;height:36px;cursor:pointer" viewBox="0 0 24 24"> <path id=sendSvgP fill="#eee" d="M6.5 20Q4.22 20 2.61 18.43 1 16.85 1 14.58 1 12.63 2.17 11.1 3.35 9.57 5.25 9.15 5.88 6.85 7.75 5.43 9.63 4 12 4 14.93 4 16.96 6.04 19 8.07 19 11 20.73 11.2 21.86 12.5 23 13.78 23 15.5 23 17.38 21.69 18.69 20.38 20 18.5 20H13Q12.18 20 11.59 19.41 11 18.83 11 18V12.85L9.4 14.4L8 13L12 9L16 13L14.6 14.4L13 12.85V18H18.5Q19.55 18 20.27 17.27 21 16.55 21 15.5 21 14.45 20.27 13.73 19.55 13 18.5 13H17V11Q17 8.93 15.54 7.46 14.08 6 12 6 9.93 6 8.46 7.46 7 8.93 7 11H6.5Q5.05 11 4.03 12.03 3 13.05 3 14.5 3 15.95 4.03 17 5.05 18 6.5 18H9V20M12 13Z" /> </svg>'

var sSg = gId("getSegmentsSVGpath");
var sRnSVG = gId("sendRunnerSVGpath");

var stpTR = '<td id="stpXxXLoad" class="stpIconTD"  title="Set selected image to step"><svg id=loadImgSVGXxX style="width:36px;height:36px;cursor:pointer" viewBox="0 0 24 24"><path fill="#eee" d="M15 3h4V0l5 5-5 5V7h-4V3m6 8.94V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.06c-.06.33-.06.67-.06 1a8 8 0 0 0 8 8c.33 0 .67 0 1-.06M19 18l-4.5-6-3.5 4.5-2.5-3L5 18h14Z"/></svg></td>' +
  '<td id="stpXxXImgTD" class="stpImgTD"><svg id=empImgSVGXxX style="width:36px;height:36px;cursor:pointer" viewBox="0 0 24 24"><path fill="#eee" d="M15,5H17V3H15M15,21H17V19H15M11,5H13V3H11M19,5H21V3H19M19,9H21V7H19M19,21H21V19H19M19,13H21V11H19M19,17H21V15H19M3,5H5V3H3M3,9H5V7H3M3,13H5V11H3M3,17H5V15H3M3,21H5V19H3M11,21H13V19H11M7,21H9V19H7M7,5H9V3H7V5Z"/></svg></td>' +
  '<td id="stpXxXDur" title="Duration in ms" class="stpDur" style="vertical-align: middle;">Duration:&nbsp;<input class="durFld" type="number" id="stpXxXDurFld" value="500" min="0">&nbsp;ms</td>' +
  '<td id="stpXxXAdd" title="Add new step below" class="stpIconTD"><svg id=addRowSVGXxX style="width:36px;height:36px;cursor:pointer" viewBox="0 0 24 24"><path fill="#eee" d="M2,16H10V14H2M18,14V10H16V14H12V16H16V20H18V16H22V14M14,6H2V8H14M14,10H2V12H14V10Z"/></svg></td>' +
  '<td id="stpXxXDel" title="Delete step" class="stpIconTD"><svg id=delRowSVGXxX style="width:36px;height:36px;cursor:pointer" viewBox="0 0 24 24"><path fill="#eee" d="M2,6V8H14V6H2M2,10V12H11V10H2M14.17,10.76L12.76,12.17L15.59,15L12.76,17.83L14.17,19.24L17,16.41L19.83,19.24L21.24,17.83L18.41,15L21.24,12.17L19.83,10.76L17,13.59L14.17,10.76M2,14V16H11V14H2Z"/></svg></td>'