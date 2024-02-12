export default (message)=>`
<!doctype html>
<html lang="en">
   <head>
      <meta charset="utf-8">
   </head>   
<body>

<h2>HTML Forms</h2>

<form action="/login" method="post">
  <label for="fname">Email  :</label><br>
  <input type="email" id="fname" name="email" ><br>
  <label for="lname">password :</label><br>
  <input type="password" id="lname" name="password"><br><br>
  <input type="submit" value="Submit">
</form> 
<a href="/forgetpassword">Forget password</a>
<h3 style="color:tomato">${message}</h3>
</body>
</html>
`

