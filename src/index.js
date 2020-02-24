const express =require('express') //load in library
const path = require('path') // load in core module path(zna4it ne nuznno v terminale pisat npm i path)
const http = require('http') // load in core module http(zna4it ne nuznno v terminale pisat npm i htttp)
const socketio = require('socket.io') //load in library.library dlya vzaimodeistvei mezhdu client-server,server-client,dlya chata
const Filter = require('bad-words')   /* npm i bad-words@3.0.0 */
const {generateMessage,generateLocationMessage} = require('./utils/messages')
const {addUser,removeUser,getUser,getUsersInRoom} = require('./utils/users')

//set up socket.io
/* index.js degen za server otvechaet */

const app = express() /* create our express app */
//we created server outside of the express library.When we're creating a node server it cant use both express and socket.io
const server = http.createServer(app)  /* this is gonna allow us to create a new server,and pass my express application */

//create a new instance of socket.io to configure websocket to work with our server
const io = socketio(server) /* socketio expects it to be called with the raw http server */
/* now our server supports web sockets */

const port = process.env.PORT || 3000 //environment variables

const publicPathDirectory =path.join(__dirname,'../public') /* prolozhivaem put k public foldery,tam u nas html fily i govorim app.use(express.static(publicPathDirectory)) shtoby automatom express app opredelil put k public foldery */


//nastroit server vnizu
app.use(express.static(publicPathDirectory)) /* prolozhivaem put k public foldery,tam u nas html fily i govorim app.use(express.static(publicPathDirectory)) shtoby automatom express app opredelil put k public foldery */


// //we need to load in the client side of the socket.io library. <script src="/socket.io/socket.io.js"></script>
io.on('connection', (socket) => { //socket is object contains information about that new connection
    console.log('New WebSocket connection')

    

    /* socket.emit('join', {username,room}) */
    socket.on('join', ({username,room},callback)=>{ /* options degen {user: {id:1,username:'',room:''}} */
//socket.id degen-thats the unique identifier for that particular connection,socket degen object,
//this is the parent scope for all our event listeners,which means inside sendMessage event,im gonna be able to user getUser(socket.id) to get user by their socket.id(object), zatem na etom objecte est property usernmae,room
     const {error,user} =  addUser({id: socket.id, username,room}) /* shtoby dobavit v users array */
/* addUser invoke vernet libo object {error: 'username is taken'} ili object {user: {id:15,username:'ali',room:'vannila sky'}} */
    if(error) {
       return callback(error) /* letting client know what went wrong,(error)=>console.log(error) eto na client-side js budret, return zna4it stops function exec, code down below wont run */
    }



//we're going to use socket.io features given to us to join these individual rooms,socket.join,join methods we can use only on the server
/* socket.join() allows us to join a given chat room and we pass to the name of the room we're trying to join */
socket.join(user.room) /* emits to to specific room,tolko v room chate nashe sms uvidyat */
// socket.emit-->sends sms to specific client, io.emit--->sends event to every connected client, socket.broadcast.emit--->sends an event to every connected client except sebya(socket)
// io.emit() variation of this------->io.to.emit--->vsem na specific roome, variation of this--->socket.broadcast.emit--->is socket.broadcast.to.emit-->sends everyone in that room krome sebya

socket.emit('message', generateMessage('Admin','Welcome!')) //otrpavlyaem specific clienty V specific ROOME event message i 'kosh keldiniz'/v chat.js prinimaem event socket.on('message',message=> console.log(message))
    socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`)) //broadcast degen otrapit vsem message event V specific ROOME,krome sebya shto new user has joined

//we need to emit new event from the server to the client when the room list changes.Its going to happen when smone joins and when someone leaves.
//Kogda user s chata vihodit libo zahodit spisok userov menyaetsya
io.to(user.room).emit('roomData', {
    room: user.room,
    users: getUsersInRoom(user.room)
})

    callback() //call callback after all of these complete,letting the client know they're able to join
})

    socket.on('sendMessage', (message, callback) => { //we have callback funct to run when client sends new message(input.value)
        const user = getUser(socket.id)

        const filter = new Filter() //new instance(object) of Filter constr funct,v filter objecte est method ,isProfane(message) proveryaet na matershinnyie slova

        if (filter.isProfane(message)) { //v filter objecte est method ,isProfane(message) proveryaet na matershinnyie slova esli true
            return callback('Profanity is not allowed!') // na cliente prinimaem 3im argumentom (error)=>{if(error){console.log(error)}}
        }
/* message event has 4 occurances:'Welcome!','A new user has joined!',io.emit('message', user input.value),'A user has left!'  */
/*Keep track of our users in an array. we need to keep track of which userse are in which room with which user name */
        io.to(user.room).emit('message', generateMessage(user.username,message)) // //soobshenie 1-go usera i inputa otrpavlyaem vsem useram io.emit
        callback() // event acknowledgment(s servera podverzhdaem shto sms usera dostavlon callbackom(), i u usera viidet console.log('Message delivered!'))
    }) // generateMessage() when we invoke this function it will return an object{}

    socket.on('sendLocation', (coords, callback) => { /* callback degen event acknowledgment(podtverdit) shto soobsheni prynal */
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`)) /* socket.on('locationMessage', (gps)=>{console.log(gps)}) deimyz clientte */
        callback() /* slushaem i prinimaem event sendLocation s usera, otrapvlyaem vsem drugim useram v chate gps 1-go usera i callbackom() podverzhdaem useru 1my shto ego gps otrpavleno druim useram,u 1go usera viiedet console.log('Location shared!') */
    })

    socket.on('disconnect', () => { /* kogda 1user vihodit s chata uvedomlyaem vsex userov eventom message */
//i should clean up the user when they disconnect,users arrayden nado za4istit
     const user= removeUser(socket.id) /* socket.id degen parentinen keldi io.on('connection', socket=>{}) */
/* there is a chance that the person whos disconnecting was never actually part of the room,esli naprimer vvel invalid data(same username or voobshe ne vvel dannyi) i polu4il error i zakryl vkladky drugie polu4it sms shto on vishel s chata,no on dazhe ne zahodil v chat tak tak ne venyi dannyi vvel */
        if(user){ /* user undefined bolady esli s users arraye ne bilo ego poetomy etot code ne run */
            io.to(user.room).emit('message', generateMessage('Admin',`${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port, () => { //server degen const server = http.createServer(express()) osy
    console.log(`Server is up on port ${port}!`)
})









































