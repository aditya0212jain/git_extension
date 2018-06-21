console.log("this is client test");
function reqListener () {
  console.log(this.responseText);
}

var oReq = new XMLHttpRequest();
oReq.addEventListener("load", reqListener);
oReq.open("POST", "http://localhost:8080");
oReq.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
oReq.send(JSON.stringify({ line :11,character: 24 }));

function addSpans(){
  var outSpan = document.getElementsByClassName("blob-code-inner");
  for(j=0;j<outSpan.length;j++){
      var children = outSpan[j].childNodes;
      for (var i = 0; i < children.length; i++) {
          if(children[i].tagName==undefined){
            var span1 = document.createElement('span');
            span1.innerHTML = children[i].textContent;
            outSpan[j].replaceChild(span1,children[i]);
            //console.log(span1.tagName);
            //console.log(children[i]);
          }
          //document.getElementById("tag").innerHTML += "tag: " + children[i].tagName + "<br/>";
      }
  }
}
