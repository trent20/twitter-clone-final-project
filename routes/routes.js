const { User, Tweet } = require('../models/models');
const { v4: uuidv4 } = require('uuid');
const { Router } = require('express');
const router = Router()
const jwt = require('jsonwebtoken');
process.env.SECRET_KEY = 'aSecret'

router.get('/', function(req, res) {
  let cookies = req.cookies
  let keys = Object.keys(cookies)
  if(keys.length === 0){
    res.render('login')
  } else if(keys.length === 2) {
    let token = req.cookies.token
    console.log(token)
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded)=>{
      if(decoded){
        res.redirect(`/users/${decoded.username}`)
      }
      if(err){
        console.log(err)
        res.redirect('/error')
      }
    })
  } else {
    res.redirect('/')
  } 
})

router.get('/new-user',async function(req, res){
  res.render('createUser')
})

router.post('/createUser', async function(req, res){
    let body = req.body

    let user = await User.findOne({
      where: {
        username : body.username,
        password: body.password
      }
    })
    if(!user) {
      let newUser = await User.create({
        username: body.username,
        password: body.password
      })
      console.log(newUser.toJSON())
      res.redirect('/')
    } else {
      console.log('user exists')
      res.redirect('/user-exists')
    }
})

router.post('/createTweet', async function(req, res) {
  let { content } = req.body
  let cookies = req.cookies
  let keys = Object.keys(cookies)
  if(keys.length === 0) {
    res.redirect('/')
  } else if(keys.length === 2){  
    let userToken = cookies.token
    jwt.verify(userToken, process.env.SECRET_KEY, async (err, decoded) => {
      if(err){
        console.log(err)
      }
      if(decoded){
        console.log(content)
        let user = await User.findOne({
          where: {
            username: decoded.username,
            password: decoded.password
          }
        })

        if(user){
          let tweet = await Tweet.create({
            content: content,
            timeCreated: new Date(),
            UserId: user.id
          })
          console.log(tweet.toJSON())
          res.redirect(`/newsfeed`)
        } else {
          res.redirect('/error')
        }      
      }
    })
  } else {
    res.redirect('/')
  }  
})

router.post('/login', async function(req, res) {
  let body = req.body
  let userName = body.username
  let id = uuidv4()
  let user = await User.findOne({
      where: {
        username: userName
      }
    }).then(user => {
      if(user){
        if(user.password === req.body.password){
          let tokenUsername = jwt.sign(body, process.env.SECRET_KEY)
          res.cookie('SID', id, {
            expires: new Date(Date.now() + 86400000),
            httpOnly: true
          })
          res.cookie('token',tokenUsername, {
            expires: new Date(Date.now() + 86400000),
            httpOnly: true
          })
          let loggedIn = true
          console.log(loggedIn)
          let userData = {user}
          let userDataValues = userData.user.dataValues
          console.log(userDataValues)
          let username = userDataValues.username         
          res.redirect(`/users/${username}`)
        } else {
          res.redirect('/error')
        }
      } else {
        res.redirect('/error')
      }
  })
})

router.get('/users/:username', async function(req, res) {
  let username = req.params.username
  let cookies = req.cookies
  let cookieKeys = Object.keys(cookies)
  if(cookieKeys.length === 0) {
    res.redirect('/')
  } else if(cookieKeys.length === 2){
    if(username) {
      let user = await User.findOne({
        where: {
          username
        }
      })
      .then(async function (user) {
        if(user) {
          let tweets = await Tweet.findAll({
            where: {
              UserId: user.id
            },
            include: User
          })
          let loggedIn = true
          let userData = {user}
          res.render('userpage-template', {loggedIn:loggedIn, userData, tweets: tweets})
        } else {
          res.redirect('/error')
        }
      }).catch(err => {
        console.log("error: " + err)
      })
    } else {
      res.redirect('/error')
    }
  } else {
    res.redirect('/')
  }
});

router.get('/logout', function(req, res){
  res.cookie('SID','',{
    httpOnly:true,
    expires: new Date(Date.now())
  })
  res.cookie('token','',{
    httpOnly:true,
    expires: new Date(Date.now())
  })
  res.redirect('/')
});

router.get('/user-exists', function(req, res) {
  res.render('userExists')
});

router.get('/newsfeed', async function(req, res) {
  let cookies = req.cookies
  let keys = Object.keys(cookies)
  if(keys.length === 0){
    res.redirect('/error')
  } else {
    let tweets = await Tweet.findAll({
      include: User
    });
    let data = {tweets}
    res.render('newsFeed', data)
  }
})

router.get('/error', function(req, res){
  res.render('error')
})


module.exports = router
