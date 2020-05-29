import express, { Response, Request, NextFunction } from 'express';
import bodyParser from 'body-parser';
import { filterImageFromURL, deleteLocalFiles } from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );

  // Filtered Image endpoint
  app.get( "/filteredimage", async ( req: Request, res: Response, next: NextFunction ) => {
    const image_url: string = req.query.image_url;
    if (image_url && image_url.includes('http') && image_url.includes('://')) {
      filterImageFromURL(image_url).then(response => {
        console.log('File ' + response + ' sent');
        res.sendFile(response);
        req.query.image_url = response;
        next();
      })
      .catch(error => {
        console.log(error);
        res.status(500).send('Error downloading the file');
      });
    } else {
      console.log('Valid image_url missing');
      res.status(400).send('Valid image_url missing');
    }
  }, ( req: Request) => {
    setTimeout(() => {
      deleteLocalFiles([req.query.image_url]);
      console.log('Deleted file ' + req.query.image_url);
    }, 5000);
  });

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();