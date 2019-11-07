import http from 'http'

export default class HttpClient {
  constructor(config={}) {
    this.config = config;

    this.standardOptions = {
      host: "sephirhome.ddns.net",
      port: (typeof location != "undefined") ? 6541 : 0,
      method: 'GET',
    };


    // console.log(this.standardOptions.host+" --- "+this.standardOptions.port)

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

        var data = JSON.stringify(messageBody)

        options = {
          hostname: "sephirhome.ddns.net",
          port: (typeof location != "undefined") ? 6541 : 0,
          path: options.path,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
          }
        }

        const req = http.request(options, res => {
          console.log(`statusCode: ${res.statusCode}`)

          res.on('data', d => {
            console.log(d)
          })
        })

        req.on('error', error => {
          console.error(error)
        })

        req.write(data)
        req.end()

      }
    );
  }




}
