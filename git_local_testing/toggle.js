function toggleSide(currentFile){
  var tab_counter = document.getElementById("files_tab_counter");
  var fileinfo = document.getElementsByClassName("file-info");
  //var filePath = []function sort(pattern){

  var tab_counter = document.getElementById("files_tab_counter");
  var fileinfo = document.getElementsByClassName("file-info");
  //var filePath = []
  var fileName = [];
  var prodFile = [];
  var testFile = [];
  var divContainer = [];

  getNames(tab_counter,fileName,prodFile,testFile,fileinfo);

  for(i=0;i<prodFile.length;i++){
    var index = prodFile[i];
    addButton(index,fileName);
  }

}

function showTest(btn){
  document.body.classList.add("full-width");
  console.log(btn.innerHTML);
  console.log(btn.value);
  var btnValue = btn.value;

  var tab_counter = document.getElementById("files_tab_counter");
  var fileinfo = document.getElementsByClassName("file-info");
  //var filePath = []function sort(pattern){

  var tab_counter = document.getElementById("files_tab_counter");
  var fileinfo = document.getElementsByClassName("file-info");
  //var filePath = []
  var fileName = [];
  var prodFile = [];
  var testFile = [];
  var divContainer = [];

  getNames(tab_counter,fileName,prodFile,testFile,fileinfo);

  var hasTest=false;
  var testIndex;
  var testInner;
  var pf = btnValue.substring(0,btnValue.lastIndexOf('.'));
  var myRegex3 = new RegExp((pf)+'(_)*(t|T)(e|E)(s|S)(t|T)|(t|T)(e|E)(s|S)(t|T)(_)*'+pf);

  for(j=0;j<testFile.length;j++){
    var index2 = testFile[j];
    var testTemp = fileName[index2];
    if(myRegex3.test(testTemp)==true){
      testIndex = index2;
      hasTest = true;
      var div = document.getElementById("diff-"+testIndex);
      testInner = div.innerHTML;
      testFile.splice(j,1);
      break;
    }
  }

  var p1 = document.getElementById("aditya");
  var p2 = document.getElementById("tab_c");

  //p1.innerHTML = testIndex;

  var mainIndex;
  for(i=0;i<fileName.length;i++){
    if(i!=testIndex){
      if(btnValue==fileName[i]){
        pushDiv(i,divContainer);
        pushDiv(testIndex,divContainer);
        mainIndex = i;
      }else{
        pushDiv(i,divContainer);
      }
    }
  }

  //p2.innerHTML = mainIndex;
  for(k=0;k<4;k++){
    console.log(divContainer[k]);
  }

  for(i=0;i<parseInt(tab_counter.innerHTML);i++){
    var div = document.getElementById("diff-"+i);
    if((i==mainIndex&&mainIndex<testIndex)||(i==(mainIndex-1)&&mainIndex>testIndex)){
      div.style.display ="inline-block";
      div.style.width = "49.5%";
      div.style.verticalAlign = "top";
      div.innerHTML = divContainer[i];
      var div2 = document.getElementById("diff-"+(i+1));
      div2.style.display ="inline-block";
      div2.style.width = "49.5%";
      div2.style.verticalAlign = "top";
      div2.innerHTML = divContainer[i+1];
      i++;
      continue;
    }else{
    div.innerHTML = divContainer[i];
    }
  }


}


function addButton(index,fileName){
  var div0 = document.getElementById("diff-"+index);
  var fileAction = div0.getElementsByClassName("file-actions")[0];
  var btnGroup = fileAction.getElementsByClassName("BtnGroup")[0];
  var btn = document.createElement("BUTTON");
  var t = document.createTextNode("Show Test");
  btn.appendChild(t);
  btn.classList.add("btn");
  btn.classList.add("btn-sm");
  btn.classList.add("BtnGroup-item");
  btn.setAttribute("onclick","showTest(this)");
  var t = fileName[index];
  btn.setAttribute("value",t);
  btnGroup.appendChild(btn);
}

function placeBtn(){
  var d1 = document.getElementsByClassName("diffbar")[0];
  var sortProd = document.createElement("BUTTON");
  var textnode = document.createTextNode("Sort test first");
  sortProd.appendChild(textnode);
  sortProd.classList.add("btn");
  sortProd.classList.add("btn-sm");
  sortProd.classList.add("diffbar-item");
  sortProd.setAttribute("onclick","sort(1)");
  d1.insertBefore(sortProd, d1.childNodes[5]);
  var sortProd = document.createElement("BUTTON");
  var textnode = document.createTextNode("Sort production first");
  sortProd.appendChild(textnode);
  sortProd.classList.add("btn");
  sortProd.classList.add("btn-sm");
  sortProd.classList.add("diffbar-item");
  sortProd.setAttribute("onclick","sort(0)");
  d1.insertBefore(sortProd,d1.childNodes[5]);
}


window.onload = function () {toggleSide();placeBtn()};
