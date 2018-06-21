if (jQuery == null || jQuery == undefined) {
  document.addEventListener("pjax:success", function(){
    window.postMessage({type:"codecov"},"*");
  });
} else
{
  jQuery(document).ready(function(){
    (document).on('pjax:success', function(){
      window.postMessage({type:"codecov"},"*");
    });
  });
}
