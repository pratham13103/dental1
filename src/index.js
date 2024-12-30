const express = require("express")
const path = require("path")
const app = express()
// const ejs = require("ejs")
const LogInCollection = require("./mongo")
const port = process.env.PORT || 3000
app.use(express.json())

app.use(express.urlencoded({ extended: false }))

const publicPath = path.join(__dirname)
console.log(publicPath);

app.set('view engine', 'ejs')
app.set('views', publicPath);
app.use(express.static(publicPath))


// ejs.registerPartials(partialPath)


app.get('/register', (req, res) => {
    res.render('register')
})
app.get('/', (req, res) => {
    res.render('login')
})



// app.get('/index', (req, res) => {
//     res.render('index')
// })

app.post('/register', async (req, res) => {
    
    // const data = new LogInCollection({
    //     name: req.body.name,
    //     password: req.body.password
    // })
    // await data.save()

    const data = {
        name: req.body.name,
        password: req.body.password
    }

    const checking = await LogInCollection.findOne({ name: req.body.name })

   try{
    if (checking.name === req.body.name && checking.password===req.body.password) {
        res.send("user details already exists")
    }
    else{
        await LogInCollection.insertMany([data])
    }
   }
   catch{
    res.send("wrong inputs")
   }

    res.status(201).render("index", {
        naming: req.body.name
    })
})


app.post('/login', async (req, res) => {
    try {
        const check = await LogInCollection.findOne({ name: req.body.name });

        if (!check) {
            return res.send("User not found");  // User does not exist
        }

        if (check.password === req.body.password) {
            // Password matches, proceed with login
            res.status(201).sendFile(path.join(publicPath, 'index.html'));
        } else {
            res.send("Incorrect password");  // Incorrect password
        }
    } catch (e) {
        res.send("Error occurred while processing the login");
    }
});




app.listen(port, () => {
    console.log('port connected');
})