// //initialize connection
const socket = io() //we can user io() on js because we load it in this file <script src="/socket.io/socket.io.js"></script>,chat.js will have access to io() function .

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')//messageFrom degen <form id="message-form"> <input></input> <button>Send </button> </form> formnin ishindegi input tangaimyz
const $messageFormButton = $messageForm.querySelector('button') //messageFrom degen <form id="message-form"> <input></input> <button>Send </button> </form> formnin ishindegi button tangaimyz
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages') //$messages degen <div>Ishine html template zasunem</div>

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML //document.querySelector('#message-template') degen osy goi: <script id="message-template" type="text/html"> osynyn ishinde <div> bar sonda
const locationTemplate = document.querySelector('#location-template').innerHTML //document.querySelector('#location-template') degen osy goi: <script id="location-template" type="text/html"> osynyn ishinde <div> bar sonda
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//How are we going to access to query  strings in the url localhost:3000?username=Alisher&room=House of Wax,in client-js access via location.search----> "?username=aleasherNN&room=House+of+wax"
/* parse those strings query strings and it send off to the server,parse via library which is in our chat.html <script src="https://cdnjs.cloudflare.com/ajax/libs/qs/6.6.0/qs.min.js"></script> */
const {username,room}=Qs.parse(location.search, {ignoreQueryPrefix: true})/* shtoby udalit ? ?username=Alisher&room=House of Wax.  it returns an object*/ 
/* destructuring Qs.parse(location.search, {ignoreQueryPrefix: true} is an object with properties username,room  */


const autoScroll = ()=>{
    /* get that new message element */
    /* need the height of the new message element,lastElementChild degen new message */
//$newMessage degen osy -- <span class="message__name">{{username}}</span><span class="message__meta">{{createdAt}}</span>
    const $newMessage = $messages.lastElementChild /* we grabbed a new message,we get the margin value,then added margin-bottom + heightOftheNewElement */

    //Get the height of last(new) message.How tall  the element is?Its standard content including extra margins
//margin-bottom kandai? 
    const newMessageStyles= getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom) /* 16px-di 16 Number-ga ainaldyrady */
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin /* 16+44=60(total height) $newMessage.offsetHeight marginde sanamaidy,al bizge sanay kerek,newMessageHeight degen -- 44 */

    /* get the visible height */
    const visibleHeight = $messages.offsetHeight /* $messages degen parent element <div>  */

    /* total height of the messages container,container height is larger than the visible height */
/*scrollHeight-gives us the total height we're able to scroll through  */
    const containerHeight= $messages.scrollHeight

    /* how far down we scrolled in order to do correct calculation */
/* scrollTop gives us number s samogo vverxa skolko spustilis */
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
         
    }
}


/*client prinimaet socket.on('message', (message) => { a serer 2 message eventa  */
//socket.emit('message', 'Welcome!') i io.emit('message', message) message degen input.value 
/* io.emit('message', message) message degen osy goi: const message = e.target.elements.message.value,input.value goi */
socket.on('message', (message) => { //socket.emit('message', 'Welcome!') i io.emit('message', message) s servera a zdes prinimaem event message
    console.log(message) // message degen object ishinde text property bar i createdAt!
    const html = Mustache.render(messageTemplate, { /*messageTemplate degen <div><p> {{message}} </p> <!-- {{message}} degen Welcome! goi --> </div>  */
       username: message.username,
       message: message.text, //message degen Welcome! goi kak tolko zahozhu k localhost:3000 viidet clienty message Welcome!
       createdAt: moment(message.createdAt).format('h:mm a') /*h:mm a= 7:59 pm. moment degen library index.html-da zagruzili,message.createdAt degen timestamp 123123123 */
       //messageTemplate  ishinde <p> {{message}} === message. </p>
    })
    $messages.insertAdjacentHTML('beforeend', html) /*$messages degen <div>Ishine html template zasunem</div>  */
    //<div><p> {{message}} </p> <!-- {{message}} degen Welcome! goi --> </div>
    autoScroll()
})

socket.on('locationMessage', (message)=>{ /* message degen object s property username,url,createdAt serverden io.emit('locationMessage', `https://google.com/maps?q=${coords.latitude},${coords.longitude}`) address koi mynda cliennte prinimaem */
    const html = Mustache.render(locationTemplate, {username: message.username,url: message.url, createdAt: moment(message.createdAt).format('h:mm a')}) /* html-de <a href="{{gps}}">My current location </a> deimyz */
    $messages.insertAdjacentHTML('beforeend',html) /*$messages degen <div id="messages"> osynyn ishine html template kirgizemiz </div>  */
    console.log(message)
    autoScroll()
})

socket.on('roomData', ({room,users})=>{
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })

    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if (error) { /* error degen bok soz goi  */
//if (filter.isProfane(message)) { //v filter objecte est method ,isProfane(message) proveryaet na matershinnyie slova esli truereturn callback('Profanity is not allowed!') // na cliente prinimaem 3im argumentom (error)=>{if(error){console.log(error)}}}
            return console.log(error) /* error degen callback('profanity isnt allowed') */
        }

        console.log('Message delivered!') /*event acknowledgment(s servera podverzhdaem shto sms usera dostavlon callbackom(), i u usera viidet console.log('Message delivered!')) */
    })
})

//when button is clicked then we'll use that geolocation API to fetch the users location
$sendLocationButton.addEventListener('click', ()=>{
//everything we need for geolocation lives on navigator.geolocation,osy bolsa zna4it podderzhivaet
    if(!navigator.geolocation) {return alert('Geolocation isn\'t supported by your browser')} /* if it doesnt exist zna4it browser usera ne podderzhvaet */
    $sendLocationButton.setAttribute('disabled','disabled') /* kak nazhali na click Send location buttton na vremya otrku4aem button shtoby ne spamil,kak otravit svoi gps togda zanovo vklu4im button */
//geolocation is supported,lets get their location to share it
const options = { enableHighAccuracy: false }
/* navigator degen window.navigator gps koi,sony vsem useram otrapvlyaem kotoryie v chate */
navigator.geolocation.getCurrentPosition(({coords})=>{ /* this callback funct wil gets called with position object,v positin objecte est property kotoryi my hotim share */
    socket.emit('sendLocation', {latitude: coords.latitude,longitude: coords.longitude},()=>{
        console.log('Location shared!')//callback() /* slushaem i prinimaem event sendLocation s usera, otrapvlyaem vsem drugim useram v chate gps 1-go usera i callbackom() podverzhdaem useru 1my shto ego gps otrpavleno druim useram,u 1go usera viiedet console.log('Location shared!') */
        $sendLocationButton.removeAttribute('disabled') /* kak nazhali na click Send location buttton na vremya otrku4aem button shtoby ne spamil,kak otravit svoi gps togda zanovo vklu4im button */
    })
},undefined,options) /*getCurrentPosition is asynchronous it takes some time to get location,it doesnt support async await promises */
})



/* otravlyaem na server username i room.username room degen===>const {username,room}=Qs.parse(location.search, {ignoreQueryPrefix: true}) */
socket.emit('join', {username,room}, (error)=>{ /* myna callback is event acnowledgment, from server-- callback(error) */
//maybe username is taken or there is no required data provided such as the username or room,
//in this case we'll show them message and we'll redirect them back to the original page,gde vvodya info
    if(error){
        alert(error)
        location.href = '/' /* send them to the root of the site,index.html,location.search degen query string.const {username,room}=Qs.parse(location.search, {ignoreQueryPrefix: true}) */
    }
})





















