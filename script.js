let body = document.querySelector('body');
let cards = document.querySelectorAll('.card');
let form = document.querySelector('.form');
let inputtype = document.querySelector('#input');
let message_list = document.querySelector('.message-list');
let title_card = document.querySelector('.title_card');
let dark_mode = document.querySelector('#dark-mode');
let trash = document.querySelector('#trash');
let typing_area = document.querySelector('.typing-area'); 
let multiple_chat = false;

let autoScroll = true;

function scrollToBottom() {
  if (autoScroll) {
    message_list.scrollTo(0, message_list.scrollHeight);
  }
}

message_list.addEventListener('scroll', () => {
  const atBottom = Math.abs(message_list.scrollHeight - message_list.scrollTop - message_list.clientHeight) <= 1;
  autoScroll = atBottom;
});

//api configuration;
let API_KEY ="AIzaSyDCqdSpgCedMhqkE7lX3XQkUTn5kHi6uBg";
let apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`
//api configuration

//lode data
function lodeData() {
  let ismode = localStorage.getItem('thimMode');
  let saveChat = localStorage.getItem('saveChat');
  
  if (ismode == '<i class="fa-solid fa-moon"></i>') {
    document.body.classList.toggle('isLight')
  }
  dark_mode.innerHTML = ismode ? ismode : '<i class="fa-solid fa-moon"></i>'  
  
  if (saveChat) {
    message_list.style.display = 'block';
    title_card.style.display = 'none';
  }
  message_list.innerHTML = saveChat || ''
}
lodeData()



function createDiv(content,...classname) {
  let div = document.createElement('div');
  div.classList.add('message',...classname);
  div.innerHTML = content;
  return div;
}

function showLodinganimation() {
   
   const html = `<div class="message_contain">
            <div class="img">
              <img id="gimini_img" src="./google-gemini-icon.png" alt="no_img">
            </div>
           
               <p class="text"></p>
       
                <div class="loding-indecator">
                  <div class="loding-bar"></div>
                  <div class="loding-bar"></div>
                  <div class="loding-bar"></div>
                </div>
          </div> <div onclick="copyText(this)" class = "copy" >
  <i class="fa-regular fa-copy"></i> </div> 
  </div>`;
   
   let lodingcreatediv = createDiv(html, 'receive_message','loding');
    message_list.appendChild(lodingcreatediv);
    scrollToBottom()
    apiResponsedata(lodingcreatediv);
 }
//loding animationgoing

//copy text;
function copyText(copy) {
  let copydata = copy.parentElement.querySelector('.text').innerText;
  if ('clipboard' in navigator) {
     navigator.clipboard.writeText(copydata);
     copy.innerHTML='<i class="fa-solid fa-circle-check"></i>';
     setTimeout(()=>{
       copy.innerHTML='<i class="fa-solid fa-copy"></i>';
     },1000)
  }
}

//handel out going
let usermessage = null;
function handeloutgoingchat() {
    usermessage = inputtype.value.trim(); 
  if(!usermessage || multiple_chat) return;
  multiple_chat = true;
  
 const html = `<div class="message_contain">
              <div class="img">
                <img src="./IMG_20240721_233341.jpg" alt="no_img">
                </div>
             <p>${usermessage}</p>
           </div>`;
  let creatediv = createDiv(html,'outgoing');
  message_list.appendChild(creatediv);
  inputtype.value='';
scrollToBottom()
  setTimeout(showLodinganimation,1000)
}
//handel out going 

//api Response data
async function apiResponsedata(lodingcreatediv) {
  let text = lodingcreatediv.querySelector('.text');
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          'role': 'user',
          "parts": [{ text: usermessage }]
       }]
      })
    })
    const data = await response.json();
    //token
    data.usageMetadata.candidatesTokenCount-1
    let responseData = data.candidates[0].content.parts[0].text;
    let regx = /gemini/gi;
    let replacedata = responseData.replaceAll(regx,'bot made by Lihan')
    typeAnimation(replacedata,text)
    //text.innerText = responseData;
  } catch (err) {
    multiple_chat=false;
    text.innerHTML=err.message + " Place Try Again"
  } finally {
    lodingcreatediv.classList.remove('loding');
   let loding_indecator =  lodingcreatediv.querySelector('.loding-indecator');
   loding_indecator.style.display='none';
  }
  localStorage.setItem('saveChat',message_list.innerHTML)
}
//loding animation

//type animation
function typeAnimation(responseData,text) {
  let responseDataSplit = responseData.split(' ');
  let count = 0;

  let setintarval = setInterval(()=>{
    text.innerText += (count === 0 ? '':' ') + responseDataSplit[count++];
    if (count === responseDataSplit.length) {
      clearInterval(setintarval)
      multiple_chat = false;
    }
      scrollToBottom()
    localStorage.setItem('saveChat',message_list.innerHTML)
  },80) 
}
//type animation


form.addEventListener('submit',(e)=>{
  e.preventDefault()
  message_list.style.display='block'
  handeloutgoingchat()
  title_card.style.display = 'none';
})


dark_mode.addEventListener('click',()=>{
  let isLight = document.body.classList.toggle('isLight');
  localStorage.setItem('thimMode',isLight ? '<i class="fa-solid fa-moon"></i>':'<i class="fa-solid fa-sun"></i>')
 dark_mode.innerHTML = isLight ? '<i class="fa-solid fa-moon"></i>':'<i class="fa-solid fa-sun"></i>';
});


trash.addEventListener('click',()=>{
 
  let confir = confirm('are you sure delete chat'); 
  if (confir) {
  localStorage.removeItem('saveChat');
  lodeData();
  message_list.style.display = 'none'
  title_card.style.display = 'block'; 
  }
})

//cards
cards.forEach((card)=>{
  card.addEventListener('click',(e)=>{
    let card_detels = e.target;
    
    let card_text = card_detels.querySelector('.card_text');
    inputtype.value = card_text.innerText
  })
})