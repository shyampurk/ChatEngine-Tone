// create a new instance of ChatEngine
ChatEngine = ChatEngineCore.create({
    publishKey: 'pub-c-c0dccd06-bff6-45fa-bebe-b5b6ef894fe8',
    subscribeKey: 'sub-c-574ac71e-2857-11e8-8305-f27a6a4e1feb'
});


// create a bucket to store our ChatEngine Chat object
let toneChat;

// create a bucket to store 
let me;


// compile handlebars templates and store them for use later
//let peopleTemplate = Handlebars.compile($("#person-template").html());
//let meTemplate = Handlebars.compile($("#message-template").html());
//let userTemplate = Handlebars.compile($("#message-response-template").html());


var user_me = {};
user_me.first = 'Moderator';
user_me.last = '';
user_me.full = [user_me.first, user_me.last].join(" ");
user_me.uuid = 'toneBot-uuid';
user_me.avatar = 'person.png';
user_me.online = true;
user_me.lastSeen = Math.floor(Math.random() * 60);

// this is our main function that starts our chat app
const initChat = () =>
{

  ChatEngine.connect (user_me.uuid, user_me);
  console.log("Trying to init chat");

  ChatEngine.on('$.ready', function(data)
  {
    me = data.me;
    console.log(me);
    toneChat = new ChatEngine.Chat('tone');
    console.log("Found users: " + JSON.stringify(toneChat.users));

    // when we recieve messages in this chat, render them
    toneChat.on('message', (message) => {
        console.log("RECD " + message.data.text);
        //console.log("REQ " + message.data.text);
        //renderMessage(message);
        analyzeMessage(message);
    });

    toneChat.on('$.online.*', (data) => {   
        //$('#people-list ul').append(peopleTemplate(data.user));
        console.log (data.user.uuid + ' joined chat');

      });

      // when a user goes offline, remove them from the online list
      toneChat.on('$.offline.*', (data) => {
        //$('#people-list ul').find('#' + data.user.uuid).remove();
        console.log (data.uuid + ' left chat');
      });

      // wait for our chat to be connected to the internet
      toneChat.on('$.connected', () => {

          console.log('Connected to chat'); 


          // search for 50 old `message` events
          
         // toneChat.search({
           // event: 'message',
            //limit: 10
          //}).on('message', (data) => {
            
            //console.log(data)
            
            // when messages are returned, render them like normal messages
            //renderMessage(data, true);
            
           
            
          //});


        
      });

      // bind our "send" button and return key to send message
     // $('#sendMessage').on('submit', sendMessage)



  }); // end on ready

} // end of init function


// send a message to the Chat
const sendMessage = () => {

    // get the message text from the text input
   // let message = $('#message-to-send').val().trim();
    let message = "Hi I am too angry";
    console.log("Sending message");

    // if the message isn't empty
    if (message.length) {

      console.log(message);
      
        // emit the `message` event to everyone in the Chat
        toneChat.emit('message', {
            type: 'REQUEST',
            text: message,
            request_by: user_me.first + "-" + user_me.uuid
        });

        console.log('message sent');

        // clear out the text input
        //$('#message-to-send').val('');
    }
    
    // stop form submit from bubbling
    return false;
  
};



// render messages in the list
const renderMessage = (message, isHistory = false) => {

    // use the generic user template by default
    let template = userTemplate;

    console.log(message.sender.uuid + " said: " + message.data.text);


    // if I happened to send the message, use the special template for myself
    if (message.sender.uuid == me.uuid) {
        template = meTemplate;
    }


     let el = template({
        
        messageOutput: message.data.text,
        time: getCurrentTime(),
        user: message.sender.state
    });
  
    // render the message
    if(isHistory) {
      $('.chat-history ul').prepend(el); 
    } else {
      $('.chat-history ul').append(el); 
    }
  
    // scroll to the bottom of the chat
    scrollToBottom();

}; 


// scroll to the bottom of the window
const scrollToBottom = () => {
    $('.chat-history').scrollTop($('.chat-history')[0].scrollHeight);
};

// get the current time in a nice format
const getCurrentTime = () => {
    return new Date().toLocaleTimeString().replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3");
};



const analyzeMessage = (message, isHistory = false) => {

  // message.data.DocumentAnalysis - json object
  // DocumentAnalysis.tones is a list:
  //  tones.score
  //  tones.tone_id
  //  tones.tone_name
  //tone_categories.


  /*
  tone_id:
  For the emotion category:
   anger, disgust, fear, joy, and sadness
  For the language category: 
    analytical, confident, and tentative
  For the social category: 
    openness_big5, conscientiousness_big5, extraversion_big5, agreeableness_big5, and emotional_range_big5
  */

  let panels = [
    '#AllMessagesPanel', 
    '#JoyMessagesPanel',
    '#AngerMessagesPanel',
    '#FearMessagesPanel',
    '#SadMessagesPanel',
    '#AnalyticalMessagesPanel',
    '#ConfidentMessagesPanel',
    '#TentativeMessagesPanel',
    '#UncategorizedMessagesPanel'
  ];

  let badges = [
    '#AllMessagesCount', 
    '#JoyMessagesCount',
    '#AngerMessagesCount',
    '#FearMessagesCount',
    '#SadMessagesCount',
    '#AnalyticalMessagesCount',
    '#ConfidentMessagesCount',
    '#TentativeMessagesCount',
    '#UncategorizedMessagesCount'
  ]
  
  let ToneIDs = ['All', 'joy', 'anger', 'fear', 'sadness', 'analytical', 'confident', 'tentative', 'Uncategorized'];

  let TonesRecd = message.data.tone_analysis.document_tone.tones;

  let TonesLength = TonesRecd.length;
  
  console.log (TonesRecd);
  console.log (TonesLength + " Tones found");


  let htmltag0 = "<p data-toggle='popover' title='Tone' data-content=' "
  
  let htmltag2 = " 'data-trigger='hover' data-placement='top'>"
 

  $(panels[0]).append(message.data.text + '<br />');
  $(badges[0]).text(Number($(badges[0]).text()) + 1);

  if (TonesLength == 0)
  {
    //$(panels[panels.length - 1]).append(message.data.text + '<br />'); 

    $(panels[panels.length - 1]).append( htmltag0 +  "No tones found" + htmltag2 +  message.data.text + '</p>');
    $(badges[badges.length - 1]).text(Number($(badges[badges.length - 1]).text()) + 1);  

  }
  else
  {
    for (var i = 0; i < TonesLength; i++)
    {
      for (var j = 0; j < ToneIDs.length; j++)
      {
        if ( (TonesRecd[i].tone_id == ToneIDs[j]) && (TonesRecd[i].score > 0.5) )
        {
          //console.log( "i= " + i + "j= " + j + " Recd tone= " + TonesRecd[i].tone_id + " Comparing with " + ToneIDs[j])
          let tonesPop = "";
          for (var k = 0; k < TonesLength; k++)
          {
            tonesPop = tonesPop + TonesRecd[k].tone_name + ": "  + TonesRecd[k].score.toFixed(2) + "  ";
          }
          
          $(panels[j]).append( htmltag0 + tonesPop + htmltag2 + message.data.text + '</p>');
          $(badges[j]).text(Number($(badges[j]).text()) + 1);
          //console.log($(badges[j]).value);
          //console.log(htmltag0 + htmltag1 + tonesPop + htmltag2 + htmltag3 + message.data.text + '</p>')
        }

      }

    }  
  }

  $('[data-toggle="popover"]').popover();

};



// boot the app
initChat();







