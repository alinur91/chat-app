/*Keep track of our users in an array. we need to keep track of which userse are in which room with which user name */

const users = [] //budem dobovlyat i udalyat s etogo arraya kogda-nibud vnizu

//We will be creating 4 functions
//addUser-->allowing us to track a new user,removeUser()--->allowing us to stop tracking a user when user leaves,such us closing the chat room tab
//getUser()-->allows us to fetch an existing users data,getUsersInRoom()-->v specific roome vse usera spisok vozmem,shtoby v ui v sidebar render vse usera v specific roome

const addUser = ({id,username,room})=>{ /* username,room dege-->v chat.js(cliente) const {username,room}=Qs.parse(location.search, {ignoreQueryPrefix: true}), socket.emit('join', {username,room}) */
/* id is associated with individual socket,so every single connection to the server has unique ID generated for it */

    //Clean the data,trim, to lowercase isteimyz,and validate they provided username,room

    username = username.trim().toLowerCase() //trim, to lowercase isteimyz,and validate they provided username,room
    room = room.trim().toLowerCase()

    //Validate the data
    if(!username || !room){
        return {error: 'Username and room are required'} /*kogda vizivaesh addUser() is etot block true to vernet etot error object  */
    }

    /*Check for existing user, Name is unique for that room ,esli v roome House of Wax est imya tvoe,ti ne mozhesh join v etot room s etim imenem*/
    /* im looking for an existing user */
     const existingUser = users.find(user=>{
         /* if we found a match we wil return a true, i kogda addUser() vizivut s index.js im vernet error object */
//im gonna return a true when 2 following conditions have been met: 2 birdei atty user 1 roomda boly kerek 
/* user.room degen existing user,predidushi user i ego room dolzhen ravnyatsya,novomy useru s takim zhe roomom */
        return user.room === room && user.username === username /* user.username degen predidushi user a username degen novyi user */
        /* Eti usery dolzhnyi byt v 1roome s 1-im odinakovym usernameom togda,existingUser vernet true i kogda addUser() vizivut im vernet error: 'username is taken' */
         
     })

     if(existingUser) {return {error: 'username is taken'}}

//if the data is valid(usernmae,room ne pustoi,username unique for that room) and we can add them to the room,its time to store them
const user = {id,username,room}
     users.push(user)
     return {user} /* user degen(user:user) { user: { id: 28, username: 'alisher', room: 'house of wax' } */

}

/* Remove someone from the users array by their ID */

const removeUser = (id)=>{
/* try to find the index of a user who has the correct ID,it'll -1 for no match,0 or greater if there is a match */
//findIndex is very similar to find,but instead of getting the array item back(find),you get back the position of the array item,find nahodit sam element s arraya,a findIndex ego position
    const index = users.findIndex(user=>{user.id === id}) /* index -1 libo 0,1,2,3,4,-1 zna4it net takogo usera */

    if(index !==1){ /* we found a match. removeUser() shakyrganda esli v array users. nashli usera to vernem udalennogo usera */ 
//The splice() method(returns array) changes the contents of an array by removing or replacing existing elements and/or adding new elements in place.
 /* return object {id:'',username:'',room:''} ili undefined eseli ne nashel usera shtoby udalit */  
 return users.splice(index,1)[0] /* 1 degen the number of items we'd like to remove.removeUser() shakyrganda [{username:'bla',room:'blya'}] array vernet,nam nuzhen obj vnutri [0] */
//filter is another option for removing items,but filter would keep running even after it found a match,findIndex stops searching once the match is found,findIndex is faster thatn filter
    }
}


const getUser = id=> users.find( user=> user.id === id) /* user eto object kotoryi nahoditsya vnutri array users,find vernet undefined ili sam object user{} */
console.log(users)
const getUsersInRoom = (room)=>{
    room = room.trim().toLowerCase() /* v users array vse malenkimi bukvami i nado priravnyat */
//The filter() method creates a new array with all elements that pass the test implemented by the provided function.
    return users.filter(user=> user.room === room) /* usersInRoom vernet [{id:1,username:2,room:3},{id:2,username:4,room:6] */
}  /* v sidebare pokazhem v roome userov kakie */


module.exports = {addUser,removeUser,getUser,getUsersInRoom}