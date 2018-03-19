function process(request) {
    const base64Codec = require('codec/base64');
    const query = require('codec/query_string');
    const console = require('console');
    const xhr = require('xhr');
    const pubnub = require('pubnub');
    const auth = require('codec/auth');
    //console.log(request.message);
  
  
    if (request.message.data.type == 'REQUEST')
    {
        console.log ("Request to analyze " + request.message.data.text);
        console.log ("Channel is " + request.message.channel);
      /*
        TODO: fill values
      */
        // Watson Tone Analyzer Service credential - User name
      let taUsername = 'YOUR_WATSON_TONE_ANALYZER_USERNAME';
      // Watson Tone Analyzer Service credential -  Password
      let taPassword = 'YOUR_WATSON_TONE_ANALYZER_PASSWORD';

      let taUrl = 'https://gateway.watsonplatform.net/tone-analyzer/api/v3/tone?version=2017-09-21'

        /*
          TODO: end fill values
        */
        
         // bot auth
        var taAuth = auth.basic(taUsername,taPassword);

        let payload = JSON.stringify({ "text":request.message.data.text });
        //let payload = JSON.stringify({ "text":"Wow this is a wonderful day!" });
       
        let httpOptions = {
            "method": "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization":taAuth
            },
            body: payload           
        };

        //let url = ltUrl + '?' + query.stringify(queryParams);
        //console.log(url);
        //console.log(payload);
        
        
        return xhr.fetch(taUrl, httpOptions)
            .then(response => {
                      //request.message.sender = senderName;
                          //console.log ("Response is" + response);
                          //console.log ("Stringified response is: " + JSON.stringify(response));

                          var parsedResponse = JSON.parse(response.body);
                          console.log ("Stringified parsedresponse is: " + JSON.stringify (parsedResponse));
                          //console.log("Analysis of tone:" + parsedResponse);
                          //request.message.data.target_text = parsedResponse.translations[0].translation;
                          request.message.data.tone_analysis = parsedResponse;
                          request.message.data.type = "ANALYSIS"
                          pubnub.publish
                          ({
                              channel: request.message.channel,
                              message: request.message
                              
                          });

 
                        console.log("Tone analysis published");
                        return request.ok();
                  }, e => {
            console.log(e);
            return request.ok();
        })
        .catch((e) => {
            console.error(e);
            return request.ok();
        });

    }

    else

    {   
       console.log("Not a request");
       return request.ok();

    }

    console.log("Returning");
    return request.ok();
}
