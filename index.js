const express = require('express');
const mongoose = require('mongoose');
const app = express();
const User = require('./models/user');
const bcrypt = require('bcrypt')
const session= require('express-session')

mongoose.connect('mongodb://localhost:27017/authDemo',{  
useNewUrlParser: true,
useUnifiedTopology: true,
})
.then(()=>{
    console.log('Mongo connect open')
})
.catch(err=>{
    console.log('Oh no mongo connection error')
    console.log(err)
})


app.set('view engine','ejs');
app.set('views', './views');
app.use(express.urlencoded({extended:true}));//express.urlencoded 中间件仅用于解析内容类型为 x-www-form-urlencoded 的请求体
//app.use(session({secret:'notagoodsecret'}))
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
 
}))

//为了login的用户浏览器可以集中用户已经login了
const requireLogin = (req,res,next)=>{
    if(!req.session.user_id){
       return res.redirect('/login')
    }
    next();
}

app.get('/',(req,res)=>{
    res.send('This is the home page!')
})

app.get('/register',(req,res)=>{
    res.render('register');
})
app.post('/register',async(req,res)=>{
    const {username,password} = req.body;
    const user = new User({username,password});
  await user.save();
  req.session.user_id = user._id;
  res.redirect('/');
})

app.get('/login',(req,res)=>{
    res.render('login');
})
app.post('/login',async(req,res)=>{
 const {username,password} = req.body;
const foundUser = await User.findAndValidate(username, password);
 
 if(foundUser){
     req.session.user_id = foundUser._id;
     res.redirect('/secret')
 }else{
     res.redirect('/login')
 }
})
app.post('/logout',(req,res)=>{
   // req.session.user_id = null;
    req.session.destroy();
    res.redirect('/login');
})
app.get('/secret',requireLogin,(req,res)=>{
    //当login正确后，每次就能直接进入secret页面
   
    res.render('secret')
})
app.get('/tosecret',requireLogin,(req,res)=>{
    res.send('Top secret!')
})

app.listen(3000,()=>{
    console.log('Serving your app!')
})