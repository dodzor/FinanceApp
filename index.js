const http = require('http');
const path = require('path');
const fs = require('fs');

const server = http.createServer((req, res) => {
//     if (req.url === '/') {
//         fs.readFile(path.join(__dirname, 'public', 'index.html'), (err, content) => {
//             if (err) throw err;
//             res.writeHead(200, { 'Content-Type': 'text/html' });
//             res.end(content);
//         }); 
//     }

    const clientIp = req.connection.remoteAddress;
    // console.log(clientIp);

    let filePath = path.join(
        __dirname,
        'public',
        req.url === '/' ? 'index.html' : req.url
    );

    let extname = path.extname(filePath);
    let contentType = 'text/html';

    switch(extname) {
    case '.js':
        contentType = 'text/javascript';
        break;
    case '.css':
        contentType = 'text/css';
        break;
    case '.json':
        contentType = 'application/json';
        break;
    case '.png':
        contentType = 'image/png';
        break;
    case '.jpg':
        contentType = 'image/jpg';
        break;
    }

    fs.readFile(filePath, (err, content) => {
        if (err) {
            // console.log(filePath);
            if (err.code == 'ENOENT') {
                // Page not found
                fs.readFile(path.join(__dirname, 'public', '404.html'), (err, content) => {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(content, 'utf8');
                });
                console.log('page not found..');
            } else {
                // Some server error
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            // Test for new IP
            // fs.readFile('ips.json', (err, content) => {
            //     // console.log(err);
            //     // console.log(JSON.parse(content));
            //     let ips = JSON.parse(content);

            //     ips.forEach(function(ip){
            //         if (clientIp === ip) {
            //            console.log('ip found');
            //         }
            //         else {
            //             ips.push(clientIp);
            //             // console.log(ips);
            //             fs.writeFile('ips.json', JSON.stringify(ips), 'utf-8', (err, contentW) => {
            //                 if (err) {
            //                     res.writeHead(500);
            //                     res.end(`Server Eroor: ${err.code}`);
            //                 } else {
            //                     res.writeHead(200, { 'Content-Type': 'application/json'});
            //                     res.end(contentW, 'utf-8');
            //                 }
                        
            //             });
            //         }
            //     })
            // });


            // Success
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf8');
        }
    });

});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
