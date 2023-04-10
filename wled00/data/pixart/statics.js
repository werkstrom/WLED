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
var addRowSVG = '<svg id=addRowSVG style="width:36px;height:36px;cursor:pointer" viewBox="0 0 24 24"><path fill="#eee" d="M2,16H10V14H2M18,14V10H16V14H12V16H16V20H18V16H22V14M14,6H2V8H14M14,10H2V12H14V10Z"/></svg>'
var delRowSVG = '<svg id=delRowSVG style="width:36px;height:36px;cursor:pointer" viewBox="0 0 24 24"><path fill="#eee" d="M2,6V8H14V6H2M2,10V12H11V10H2M14.17,10.76L12.76,12.17L15.59,15L12.76,17.83L14.17,19.24L17,16.41L19.83,19.24L21.24,17.83L18.41,15L21.24,12.17L19.83,10.76L17,13.59L14.17,10.76M2,14V16H11V14H2Z"/></svg>'
var empImgSVG = '<svg d=empImgSVG style="width:36px;height:36px;cursor:pointer" viewBox="0 0 24 24"><path d="M15,5H17V3H15M15,21H17V19H15M11,5H13V3H11M19,5H21V3H19M19,9H21V7H19M19,21H21V19H19M19,13H21V11H19M19,17H21V15H19M3,5H5V3H3M3,9H5V7H3M3,13H5V11H3M3,17H5V15H3M3,21H5V19H3M11,21H13V19H11M7,21H9V19H7M7,5H9V3H7V5Z"/></svg>'
var loadImgSVG = '<svg id=loadImgSVG style="width:36px;height:36px;cursor:pointer" viewBox="0 0 24 24"><path fill="#eee" d="M15 3h4V0l5 5-5 5V7h-4V3m6 8.94V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.06c-.06.33-.06.67-.06 1a8 8 0 0 0 8 8c.33 0 .67 0 1-.06M19 18l-4.5-6-3.5 4.5-2.5-3L5 18h14Z"/></svg>'

var sSg = gId("getSegmentsSVGpath");
var sRnSVG = gId("sendRunnerSVGpath");

var stpTR = '<td id="stpXxXLoad" class="stpIconTD"><svg id=loadImgSVGXxX style="width:36px;height:36px;cursor:pointer" viewBox="0 0 24 24"><path fill="#eee" d="M15 3h4V0l5 5-5 5V7h-4V3m6 8.94V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.06c-.06.33-.06.67-.06 1a8 8 0 0 0 8 8c.33 0 .67 0 1-.06M19 18l-4.5-6-3.5 4.5-2.5-3L5 18h14Z"/></svg></td>' +
  '<td id="stpXxXImgTD" class="stpIconTD"><svg id=empImgSVGXxX style="width:36px;height:36px;cursor:pointer" viewBox="0 0 24 24"><path fill="#eee" d="M15,5H17V3H15M15,21H17V19H15M11,5H13V3H11M19,5H21V3H19M19,9H21V7H19M19,21H21V19H19M19,13H21V11H19M19,17H21V15H19M3,5H5V3H3M3,9H5V7H3M3,13H5V11H3M3,17H5V15H3M3,21H5V19H3M11,21H13V19H11M7,21H9V19H7M7,5H9V3H7V5Z"/></svg></td>' +
  '<td id="stpXxXDur" class="stpDur" style="vertical-align: middle;">Duration:&nbsp;<input class="flxTFld" type="number" id="stpXxXDurFld" value="500" min="0">&nbsp;ms</td>' +
  '<td id="stpXxXAdd" class="stpIconTD"><svg id=addRowSVGXxX style="width:36px;height:36px;cursor:pointer" viewBox="0 0 24 24"><path fill="#eee" d="M2,16H10V14H2M18,14V10H16V14H12V16H16V20H18V16H22V14M14,6H2V8H14M14,10H2V12H14V10Z"/></svg></td>' +
  '<td id="stpXxXDel" class="stpIconTD"><svg id=delRowSVGXxX style="width:36px;height:36px;cursor:pointer" viewBox="0 0 24 24"><path fill="#eee" d="M2,6V8H14V6H2M2,10V12H11V10H2M14.17,10.76L12.76,12.17L15.59,15L12.76,17.83L14.17,19.24L17,16.41L19.83,19.24L21.24,17.83L18.41,15L21.24,12.17L19.83,10.76L17,13.59L14.17,10.76M2,14V16H11V14H2Z"/></svg></td>'