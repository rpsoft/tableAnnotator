import http from 'http'

export default class HttpClient {
  constructor(config={}) {
    this.config = config;

    this.standardOptions = {
      host: (typeof location != "undefined") ? location.hostname : '',
      port: (typeof location != "undefined") ? 6541 : 0,
      method: 'GET',
      // path: '/graphql?query=' + escape( query ),
    //   headers: {'Access-Control-Allow-Origin' : '*',
		// 'Access-Control-Allow-Headers' : 'content-type',
		// 'Access-Control-Allow-Methods' : 'GET, POST, PUT, DELETE, PATCH, OPTIONS'},
    //   crossorigin:"anonymous",
    };


   console.log(this.standardOptions.host+" --- "+this.standardOptions.port)

    this.standardOptions = {
      ...this.standardOptions,
      ...config
    };
  }

  send(messageBody='', options={}) {

    return new Promise(
      (resolve, reject) => {
        http.request(
          // mix the this.standardOptions with method options
          {
            ...this.standardOptions,
            ...options
          },
          ( response ) => {
            var data = '';

            response.on('error', (err) => {
              reject('Communication error: ' + err);
              console.error(err);
            });

            response.on('data', (chunk) => {
              data += chunk;
            });

            response.on('end', () => {
              // console.log('http-client: ' + data);
              resolve(data);
            });
          }
        )
        .end(messageBody);
      }
    );
  }

  sendPost(messageBody='', options={}) {
    return new Promise(
      (resolve, reject) => {
        var standardOptions = {
          host: (typeof location != "undefined") ? location.hostname : '',
          port: (typeof location != "undefined") ? 6541 : 0,
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          }
        };

        var req = http.request({
          ...this.standardOptions,
          ...options
          }, function(res) {
          console.log('Status: ' + res.statusCode);
          console.log('Headers: ' + JSON.stringify(res.headers));
          res.setEncoding('utf8');
          res.on('data', function (body) {
            console.log('Body: ' + body);
          });
        });

        req.on('error', function(e) {
          console.log('problem with request: ' + e.message);
        });

        // write data to request body
        req.write(messageBody);

        req.end();
      }
    );
  }




}
