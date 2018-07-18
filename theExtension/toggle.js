/**
 * @file Manages the test side by side feature of the extension
 * @author Aditya Jain
 */

 /** @module toggle */

/**
*Adds the test button to all the production files
*@function
*/
function toggleSide(currentFile){
  console.log("in");
  var tab_counter = document.getElementById("files_tab_counter");
  var fileinfo = document.getElementsByClassName("file-info");

  var fileName = [];
  var prodFile = [];
  var testFile = [];
  //getting the names of the files
  getNames(tab_counter,fileName,prodFile,testFile,fileinfo);

  for(i=0;i<prodFile.length;i++){
    var index = prodFile[i];
    //adding the button for the index
    addTestButtons(index,fileName);
  }

}

/**
*Makes the production and test files side by side and vice versa if they exists
*@function
*@param {Object} btn the button which called it
*@param {Object} objectForSpan for enabling the span
*/
function showTest(btn,objectForSpan){
  console.log("in");
  if(btn.parentElement.parentElement.parentElement.hasAttribute("style")==true){
    //if the files are already side by side
    //remove their style and set them normal
    var div = btn.parentElement.parentElement.parentElement;
    div.removeAttribute("style");
    var id = div.id;
    var id2 = id[id.length-1];
    id2 = parseInt(id2) +1;
    var div2 = document.getElementById("diff-"+id2);
    div2.removeAttribute("style");
  }
  else{
    //make the view full-width
    document.body.classList.add("full-width");
    var btnValue = btn.value;
    var tab_counter = document.getElementById("files_tab_counter");
    var fileinfo = document.getElementsByClassName("file-info");

    var tab_counter = document.getElementById("files_tab_counter");
    var fileinfo = document.getElementsByClassName("file-info");
    var fileName = [];
    var prodFile = [];
    var testFile = [];
    var divContainer = [];
    //get the names of the files
    getNames(tab_counter,fileName,prodFile,testFile,fileinfo);

    var hasTest=false;
    var testIndex;
    var testInner;
    //storing the file name
    var pf = btnValue.substring(0,btnValue.lastIndexOf('.'));
    var myRegex3 = new RegExp('^'+(pf)+'(_)*(t|T)(e|E)(s|S)(t|T)$|^(t|T)(e|E)(s|S)(t|T)(_)*'+pf+'$');
    for(j=0;j<testFile.length;j++){
      var index2 = testFile[j];
      var testTemp = fileName[index2];
      testTemp = testTemp.substring(0,testTemp.lastIndexOf('.'));
      if(myRegex3.test(testTemp)==true){
        testIndex = index2;
        hasTest = true;
        var div = document.getElementById("diff-"+testIndex);
        testInner = div.innerHTML;
        testFile.splice(j,1);
        break;
      }
    }

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


    for(i=0;i<parseInt(tab_counter.innerHTML);i++){
      var div = document.getElementById("diff-"+i);
      if((i==mainIndex&&mainIndex<testIndex)||(i==(mainIndex-1)&&mainIndex>testIndex)){
        //style the div so that they are side by side
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
  var tu = document.getElementById(btn.id);
  //tu.addEventListener('click',function() {showTest(this)});
  //enable the clicking after the rearranging
  addClick(objectForSpan);
}

/**
*Add test button for the indexed file
*@function
*@param {number} index index of the file to which the button is to be attached
*@param {string[]} fileName contains names of all the files
*/
function addTestButtons(index,fileName){
  console.log("in");
  var div0 = document.getElementById("diff-"+index);
  var fileAction = div0.getElementsByClassName("file-actions")[0];
  var btnGroup = fileAction.getElementsByClassName("BtnGroup")[0];
  //creating the button element
  var btn = document.createElement("BUTTON");;
  var t = document.createTextNode("Test");
  btn.appendChild(t);
  btn.classList.add("btn");
  btn.classList.add("btn-sm");
  btn.classList.add("BtnGroup-item");
  //getting the filename and setting as value for the button
  var t = fileName[index];
  btn.setAttribute("value",t);
  var text = "test"+index;
  btn.setAttribute("id",text);
  btn.setAttribute("style","width:60px;")
  //inserting the test button
  fileAction.insertBefore(btn,fileAction.childNodes[0]);
}

/**
*Adds the sort button in the pull pages
*@function
*@param {Object} objectForSpan object to be passed for enabling span
*/
function placeSortButton(objectForSpan){
  console.log("in");
  var d1 = document.getElementsByClassName("diffbar")[0];
  var btn1 = document.createElement("BUTTON");
  var btn2 = document.createElement("BUTTON");
  var text1 = document.createTextNode("Production First");
  btn1.appendChild(text1);
  var text2 = document.createTextNode("Test First");
  btn2.appendChild(text2);
  btn1.setAttribute("class","btn btn-sm");
  btn1.setAttribute("type","submit");
  btn2.setAttribute("class","btn btn-sm");
  //btn1.setAttribute("onclick","sort(0);this.parentElement.parentElement.parentElement.removeAttribute('open');");
  //on click the btn will call productionFirst
  btn1.addEventListener("click",function(){productionFirst(objectForSpan);},false);
  btn1.setAttribute("id","productionFirstButton");
  btn2.setAttribute("id","testFirstButton");
  //btn2.setAttribute("onclick","sort(1);this.parentElement.parentElement.parentElement.removeAttribute('open');");
  btn2.addEventListener("click",function(){testFirst(objectForSpan);},false);
  var div3 = document.createElement("div");
  div3.setAttribute("style","left:-83px");
  div3.setAttribute("class","Popover-message text-left p-3 mx-auto Box box-shadow-large");
  div3.appendChild(btn2);
  div3.appendChild(btn1);
  var div2 = document.createElement("div");
  div2.setAttribute("class","Popover");
  div2.appendChild(div3);
  var sum = document.createElement("summary");
  sum.setAttribute("class","btn-link muted-link select-menu-button js-menu-target");
  var text3 = document.createTextNode("Sort");
  var strong = document.createElement("strong");
  strong.appendChild(text3);
  sum.appendChild(strong);
  var detail = document.createElement("details");
  detail.setAttribute("class","details-reset");
  detail.appendChild(div2);
  detail.appendChild(sum);
  var div1 = document.createElement("div");
  div1.setAttribute("class","diffbar-item");
  div1.appendChild(detail);
  d1.insertBefore(div1,d1.childNodes[3]);
}

/**
*Adds the listeners for the test buttons and also calls the addSpans function
*@function
*@param {Object} objectForSpan object to be passed for enabling span
*/
function addClick(objectForSpan) {
  console.log("in");
  var n = document.getElementById("files_tab_counter");
  for(i=0;i<parseInt(n.innerHTML);i++){
    var t = document.getElementById("test"+i);
    if(t!=null){
      //adding the listener for click on the test buttons
      t.addEventListener('click',function() {showTest(this,objectForSpan)});
    }
  }
  addSpans(objectForSpan.method,objectForSpan.repo,[objectForSpan.branchBase,objectForSpan.branchHead]);
}

/**
*Called when the production button in the sort menu is clicked
*@function
*@param {Object} objectForSpan object to be passed for enabling span
*/
function productionFirst(objectForSpan){
  console.log("in");
  //sorts the files
  sort(0);
  //closing the sort menu
  var idtemp = document.getElementById("productionFirstButton");
  idtemp.parentElement.parentElement.parentElement.removeAttribute('open');
  //enabling the listeners for all the clicks now
  addClick(objectForSpan);
}

/**
*Called when the test button in the sort menu is clicked
*@function
*@param {Object} objectForSpan object to be passed for enabling span
*/
function testFirst(objectForSpan){
  console.log("in");
  //sorts the files
  sort(1);
  //closing the sort menu
  var idtemp = document.getElementById("testFirstButton");
  idtemp.parentElement.parentElement.parentElement.removeAttribute('open');
  //enabling the listeners for all the clicks now
  addClick(objectForSpan);
}
