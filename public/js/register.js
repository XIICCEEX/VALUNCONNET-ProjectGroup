function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

window.onload = function () {
  const errorSpan = document.getElementById("errordisplay");
  const cancelBtn = document.getElementById("cancelBtn");
  const password = document.getElementById("password");
  const confirmPassword = document.getElementById("confirm_password");

  // ปุ่ม CANCEL ไปหน้า login
  if (cancelBtn) {
    cancelBtn.addEventListener("click", function () {
      window.location.href = "login.html";
    });
  }

  // ขึ้น error ถ้า server ส่ง ?error=1 
  if (errorSpan) {
    const error = getQueryParam("error");
    if (error === "1") {
      errorSpan.textContent = "Register failed. Please try again.";
    } else {
      errorSpan.textContent = "";
    }
  }

  // ใช้เช็ก password กับ confirm password ก่อน submit
  if (password && confirmPassword && errorSpan) {
    confirmPassword.addEventListener("input", function () {
      if (confirmPassword.value !== "" && confirmPassword.value !== password.value) {
        errorSpan.textContent = "Password and Confirm Password do not match.";
      } else {
        errorSpan.textContent = "";
      }
    });
  }
};