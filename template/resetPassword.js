export default(token,id,message) =>
    `
<!doctype html>
<html lang="en">
   <head>
      <meta charset="utf-8">
   </head>   
<body>
<nav>
<ul style="list-style-type: none;">
<li style ="display:inline"><a style ="color:green"href="/project/authenticationdemo/registration">Login</a></li>
</ul>
</nav>

<h2>HTML Forms</h2>

<form action="/project/authenticationdemo/password-reset?token=${token}&id=${id}" method="post">
  <label for="fname">Enter your new password :</label><br>
  <input type="password" name="password"><br>
  <input type="submit" value="Submit">
</form> 
<h3 style="color:tomato">${message}</h3>
</body>
</html>
`

