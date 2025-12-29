// File origin: VS1LAB A3, A4

/**
 * This script defines the main router of the GeoTag server.
 * It's a template for exercise VS1lab/Aufgabe3
 * Complete all TODOs in the code documentation.
 */

/**
 * Define module dependencies.
 */

const express = require('express');
const router = express.Router();

/**
 * The module "geotag" exports a class GeoTagStore. 
 * It represents geotags.
 */
// eslint-disable-next-line no-unused-vars
const GeoTag = require('../models/geotag');

/**
 * The module "geotag-store" exports a class GeoTagStore. 
 * It provides an in-memory store for geotag objects.
 */
// eslint-disable-next-line no-unused-vars
const GeoTagStore = require('../models/geotag-store');

// App routes (A3)

/**
 * Route '/' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests cary no parameters
 *
 * As response, the ejs-template is rendered without geotag objects.
 */



// API routes (A4)

/**
 * Route '/api/geotags' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests contain the fields of the Discovery form as query.
 * (http://expressjs.com/de/4x/api.html#req.query)
 *
 * As a response, an array with Geo Tag objects is rendered as JSON.
 * If 'searchterm' is present, it will be filtered by search term.
 * If 'latitude' and 'longitude' are available, it will be further filtered based on radius.
 */

// TODO: ... your code here ...
   router.get('/api/geotags' , (req ,res) => {
    const store = req.app.locals.store;
    const searchterm = req.query.searchterm;
    const latitude = parseFloat(req.query.latitude);
    const longitude = parseFloat(req.query.longitude);

    let result;

    if(!isNaN(latitude) && !isNaN(longitude)) {
      result = store.searchNearbyGeoTags(latitude, longitude, searchterm);
    }
    //Es wird nach dem Begriff gefiltert
    else if (searchterm){
         result = store._geotags.filter(tag => 
            tag.name.toLowerCase().includes(searchterm.toLowerCase()) ||
            tag.hashtag.toLowerCase().includes(searchterm.toLowerCase())
         );
    }
    else {
      result = store._geotags;
    }

    res.json(result);

   })

/**
 * Route '/api/geotags' for HTTP 'POST' requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests contain a GeoTag as JSON in the body.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * The URL of the new resource is returned in the header as a response.
 * The new resource is rendered as JSON in the response.
 */

// TODO: ... your code here ...
   router.post('/api/geotags' , (req,res) => {
        const store = req.app.locals.store;
       
      //Daten aus dem Requst Body extrahieren
      const newGeoTag = req.body;

      //Interaktion mit dem Store
      const createdGeoTag = store.addGeoTag(newGeoTag);

      //Setzte neuen Pfad im Header
      res.location('/api/geotags/' + createdGeoTag._id);

      //Senden von Statuscode und Object als JSON
      res.status(201).json(createdGeoTag);

   });

/**
 * Route '/api/geotags/:id' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 *
 * The requested tag is rendered as JSON in the response.
 */

// TODO: ... your code here ...

router.get('/api/geotags/:id' , (req, res) => {
      const store = req.app.locals.store;
      const geotagId = parseInt(req.params.id);

      const geotag = store.getGeoTagById(geotagId);

      if(geotag) {
        res.json(geotag);
      }
      else{
        res.status(404).json({ error : "Geotag mit dieser ID nicht gefunen :("});
      }

});




/**
 * Route '/api/geotags/:id' for HTTP 'PUT' requests.
 * (http://expressjs.com/de/4x/api.html#app.put.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 * 
 * Requests contain a GeoTag as JSON in the body.
 * (http://expressjs.com/de/4x/api.html#req.query)
 *
 * Changes the tag with the corresponding ID to the sent value.
 * The updated resource is rendered as JSON in the response. 
 */

// TODO: ... your code here ...
router.put('/api/geotags/:id' , (req, res) => {
     const store = req.app.locals.store;
     const geotagId = parseInt(req.params.id);
     const updatedData = req.body; //Neue Infos vom Client

     const updatedTag = store.updateGeoTag(geotagId , updatedData)

     if(updatedTag){
      res.json(updatedTag); //Erfolg -> Gib das geänderte Object zurück
     }

     else{
      res.status(404).json({ error: "Tag nicht gefunden :("});
     }

});


/**
 * Route '/api/geotags/:id' for HTTP 'DELETE' requests.
 * (http://expressjs.com/de/4x/api.html#app.delete.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 *
 * Deletes the tag with the corresponding ID.
 * The deleted resource is rendered as JSON in the response.
 */

// TODO: ... your code here ...
router.delete('/api/geotags/:id' , (req, res) => {
      const store = req.app.locals.store;
      const geotagId = parseInt(req.params.id);

      const tagToDelete = store.getGeoTagById(geotagId);

      if(tagToDelete && store.removeGeoTag(geotagId)){
        res.status(200).json(tagToDelete); // Gelöschtes Obejekt zurückgeben
      }

      else{
        res.status(404).json({ error: "GeoTag konnte nicht gelöscht werden :("});
      }
});


//******* Vorbereitung ********* */

router.get('/', (req, res) => {
    const store = req.app.locals.store;

    // Standard-Koordinaten HKA (Platzhalter)


    res.render('index', {
        taglist: [],
        latitude: "",
        longitude: ""
    });
});

router.post('/tagging' , (req, res) => {
    const store = req.app.locals.store; //zentraler GeoTag Store
    const {Latitude, Longitude, PlaceName, Hashtag} = req.body; //Formulardaten aus dem Body

    //Neue GeoTag Instanz erstellen
    const lat = parseFloat(Latitude);
    const lon = parseFloat(Longitude);
    const newTag = new GeoTag(lat , lon , PlaceName, Hashtag || "");

    //Neuen GeoTag im Store speichern
    store.addGeoTag(newTag);

    //Nahegelegene GeoTags abrufen
    const nearbyTags = store.getNearbyGeoTags(lat, lon);

    //Render die Seite mit den neuen GeoTags
    res.render('index', {
    taglist: nearbyTags,
    latitude: parseFloat(Latitude),
    longitude: parseFloat(Longitude)
});


});

router.post('/discovery', (req, res) => {
    const store = req.app.locals.store;
    const { Latitude, Longitude, search } = req.body;

    // Stelle sicher, dass Koordinaten Zahlen sind
    const lat = parseFloat(Latitude);
    const lon = parseFloat(Longitude);

    // Suche Nearby Tags mit optionalem Keyword
    const results = store.searchNearbyGeoTags(lat, lon, search); // radius 10 wie vorher

    // Render das Template mit den gefilterten Tags
    res.render('index', {
    taglist: results,
    latitude: parseFloat(Latitude),
    longitude: parseFloat(Longitude)
});

});
module.exports = router;
