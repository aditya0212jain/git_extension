/**
 * @file Manages the sorting feature of the extension
 * @author Aditya Jain
 */

 /** @module jumble */

/**
*Function which sorts the files according to the test and production classification
*@function
*@param {number} pattern 0 -> profuction first and 1 -> test firt
*/
function sort(pattern){
  console.log("in");
  var tab_counter = document.getElementById("files_tab_counter");
  var fileinfo = document.getElementsByClassName("file-info");

  var tab_counter = document.getElementById("files_tab_counter");
  var fileinfo = document.getElementsByClassName("file-info");
  var fileName = [];
  var prodFile = [];
  var testFile = [];
  var divContainer = [];

  //getting the filenames , names of the production files and names of the test files in the respective arrays by giving the
  //fileinfo and tab_counter(which contains the no. of files)
  getNames(tab_counter,fileName,prodFile,testFile,fileinfo);

  //sorting the files according to the patter
  //and storing their contents in the divContainer variable
  sortDiv(prodFile,fileName,pattern,divContainer,testFile);

  //content of the divContainer replacing the original div elements thus finishing sorting
  show(parseInt(tab_counter.innerHTML),divContainer);

}

/**
*Function to get the filenames
*@function
*@param {Object} tab_counter used for getting the number of files
*@param {string[]} fileName given an empty array, gets the array of names of all the files in the PR
*@param {string[]} prodFile given an empty array, gets the array of names of all the production files
*@param {string[]} testFile given an empty array, gets the array of names of all the test files
*@param {Object} fileinfo array containing all the information regarding the files
*/
function getNames(tab_counter,fileName,prodFile,testFile,fileinfo){
  console.log("in");
  for(i=0;i<parseInt(tab_counter.innerHTML);i++){
    var myRegex = /(.*)(<a)(.*)(>)(.*)(<\/a>)(.*)/g;
    if(fileinfo[i]!=undefined){
    let str = fileinfo[i].innerHTML;
    let path = myRegex.exec(str);
    fileName.push(path[5].split('\\').pop().split('/').pop())
    var testornot = fileName[i].toLowerCase();
    //searching if the name contains test in its name
    //@TODO make a better pattern for searching test files
    if(testornot.search("test")===-1){
      prodFile.push(i);
    }else{
      testFile.push(i);
    }
  }
  }
}

/**
*Function to sort the files according to the pattern
*@function
*@param {string[]} prodFile names of all production files
*@param {string[]} fileName names of all the files
*@param {number} patter 0 -> profuction first and 1 -> test firt
*@param {Object[]} divContainer after execution will contain the sorted files
*@param {string[]} testFile names of all the files
*/
function sortDiv(prodFile,fileName,pattern,divContainer,testFile){
  console.log("in");
  for(i=0;i<prodFile.length;i++){
    var index = prodFile[i];
    var hasTest=false;
    var testIndex;
    //below getting the filename without the extension of the file
    var pf = fileName[index].substring(0,fileName[index].lastIndexOf('.'));
    //regex for testing if the file is test for the file
    var myRegex3 = new RegExp('^'+(pf)+'(_)*(t|T)(e|E)(s|S)(t|T)$|^(t|T)(e|E)(s|S)(t|T)(_)*'+pf+'$');
    if(pattern==0){             ///pattern == 0 meaning production code before then test
    pushDiv(index,divContainer);//push the index of the file first if patter is 0
    }
    // now find the test file
    // if it exists then push its index in the container
    for(j=0;j<testFile.length;j++){
      var index2 = testFile[j];
      var testTemp = fileName[index2];
      testTemp = testTemp.substring(0,testTemp.lastIndexOf('.'));
      if(myRegex3.test(testTemp)==true){
        testIndex = index2;
        hasTest = true;
        pushDiv(index2,divContainer);
        testFile.splice(j,1);
        break;
      }
    }
    //now if pattern is 1 then push the production file index after pushing the test index
    if(pattern==1){
      pushDiv(index,divContainer);
    }
  }
  //adding the remaining test files
  for(i=0;i<testFile.length;i++){
      var remainingIndex = testFile[i];
      pushDiv(remainingIndex,divContainer);
  }

}

/**
*Function which sorts the files according to the test and production classification
*@function
*@param {number} index index of the file to push in the divContainer
*@param {Object[]} divContainer array in which the contents the files are being pushed
*/
function pushDiv(index,divContainer){
  console.log("in");
  var div = document.getElementById("diff-"+index);
  divContainer.push(div.innerHTML);
}

/**
*Function which sorts the files according to the test and production classification
*@function
*@param {number} n number of total files
*@param {Object[]} divContainer array in which the contents the files are being stored in the sorted manner
*/
function show(n,divContainer){
  console.log("in");
  for(i=0;i<n;i++){
      var div = document.getElementById("diff-"+i);
      //changing the html of the original page
      div.innerHTML = divContainer[i];
  }
}
