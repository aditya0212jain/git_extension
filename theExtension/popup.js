function sendInfo(){
chrome.runtime.sendMessage({method:"gitClone",type:"https"});
}

function justForTest(){
  chrome.runtime.sendMessage({method:"gitCloneRequestFromPopup"});
}
//document.getElementById('tryit').addEventListener("click",function(){justForTest()});
console.log(document.getElementsByClassName('p'));
document.addEventListener("DOMContentLoaded",function(event){
  console.log(document.getElementById('tryit'));
  document.getElementById('tryit').addEventListener("click",function(){justForTest()});
})
