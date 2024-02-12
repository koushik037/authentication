export default(token,id,message) =>
    `
<!doctype html>
<html lang="en">
   <head>
      <meta charset="utf-8">
   </head>   
<body>

<h2>HTML Forms</h2>

<form action="/password-reset?token=${token}&id=${id}" method="post">
  <label for="fname">Enter your new password :</label><br>
  <input type="password" name="password"><br>
  <input type="submit" value="Submit">
</form> 
<h3 style="color:tomato">${message}</h3>
</body>
</html>
`

