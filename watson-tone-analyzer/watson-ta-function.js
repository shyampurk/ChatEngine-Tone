function process(request) {
    const base64Codec = require('codec/base64');
    const query = require('codec/query_string');
    const console = require('console');
    const xhr = require('xhr');
    const pubnub = require('pubnub');
    const auth = require('codec/auth');
    //console.log(request.message);
  
  /*
      {
  "tone_analyzer": [
    {
      "name": "tone-analyzer-bylat-tone-analy-1521124259114",
      "plan": "lite",
      "credentials": {
        "url": "https://gateway.watsonplatform.net/tone-analyzer/api",
        "username": "1d6be8af-4c31-43c1-8aba-20821aca98a9",
        "password": "P3pmjRwULfVc"
      }
    }
  ]
}

  */

    if (request.message.data.type == 'REQUEST')
    {
        console.log ("Request to analyze " + request.message.data.text);
        console.log ("Channel is " + request.message.channel);
      /*
        TODO: fill values
      */
        // Watson Tone Analyzer Service credential - User name
      let taUsername = '1d6be8af-4c31-43c1-8aba-20821aca98a9';
      // Watson Tone Analyzer Service credential -  Password
      let taPassword = 'P3pmjRwULfVc';

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
