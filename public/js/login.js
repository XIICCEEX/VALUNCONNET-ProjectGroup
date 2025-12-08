function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

window.onload = function () {
  const errorSpan = document.getElementById("errordisplay");

  
  if (!errorSpan) return;

  const error = getQueryParam("error");

  
  if (error === "1") {
    errorSpan.textContent = "Username หรือ รหัสผ่าน ไม่ถูกต้อง";
  } else {
    errorSpan.textContent = "";
  }
};