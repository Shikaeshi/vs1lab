// File origin: VS1LAB A2

/* eslint-disable no-unused-vars */

// This script is executed when the browser loads index.html.

// "console.log" writes to the browser's console.
// The console window must be opened explicitly in the browser.
// Try to find this output in the browser...
console.log("The geoTagging script is going to start...");

/**
 * TODO: 'updateLocation'
 * A function to retrieve the current location and update the page.
 * It is called once the page has been fully loaded.
 */
function updateLocation() {
  const latInput = document.getElementById("Latitude");
  const lngInput = document.getElementById("Longitude");

  const hiddenLat = document.getElementById("hidden-latitude");
  const hiddenLng = document.getElementById("hidden-longitude");

  const mapDiv = document.getElementById("map");
  let tags = [];
  const tagsData = mapDiv.getAttribute("data-tags");

  if (tagsData) {
    try {
      tags = JSON.parse(tagsData);
      console.log("Geladene Tags:", tags);
    } catch (e) {
      console.error("Fehler beim Parsen der GeoTags:", e);
    }
  }
  
  // Prüfen, ob im Formular schon Koordinaten stehen
  const hasLat = latInput && latInput.value.trim() !== "";
  const hasLng = lngInput && lngInput.value.trim() !== "";
  console.log("hat schon Koordinaten?", hasLat, hasLng);

  // Falls beide Koordinaten schon da sind:
  if (hasLat && hasLng) {
    const lat = parseFloat(latInput.value);
    const lng = parseFloat(lngInput.value);

    // MmapManager anlegen, falls noch nicht vorhanden
    if (!window.mapManager) {
      window.mapManager = new MapManager();
    }

    // Karte auf aktuelle Position setzen
    window.mapManager.initMap(lat, lng);
const currentGeoTag = {
      latitude: lat,
      longitude: lng,
      name: "Current position",
    };

    const allTags = [currentGeoTag, ...tags];
    // Marker für die aktuelle Position setzen
    // Array 'tags' als dritten Parameter übergeben
    window.mapManager.updateMarkers(lat, lng, allTags); 
    
    // Platzhalter entfernen
    removePlaceholderImage();
    return;
  }

  // Falls noch keine Koordinaten im Formular sind:
  // Hole aktuelle Position über LocationHelper
  LocationHelper.findLocation(function (helper) {
    const lat = parseFloat(helper.latitude);
    const lng = parseFloat(helper.longitude);

    // Sichtbare Formularfelder mit den neuen Koordinaten füllen
    latInput.value = lat;
    lngInput.value = lng;

    // Versteckte Felder mit neuen Koords füllen für Server
    if (hiddenLat) hiddenLat.value = lat;
    if (hiddenLng) hiddenLng.value = lng;

    // MapManager anlegen, falls noch nicht vorhanden
    if (!window.mapManager) {
      window.mapManager = new MapManager();
    }
    const currentGeoTag = {
      latitude: lat,
      longitude: lng,
      name: "Current position",
    };
    const allTags = [currentGeoTag, ...tags];

    // Marker für die aktuelle Position setzen
    //window.mapManager.updateMarkers(lat, lng, [currentGeoTag]);
    // Karte auf ermittelte Position setzen
    window.mapManager.initMap(lat, lng);

    window.mapManager.updateMarkers(lat, lng, allTags);

    // Platzhalter entfernen
    removePlaceholderImage();
  });
}

function removePlaceholderImage() {
  const img = document.querySelector(".discovery__map img") || document.querySelector("img");
  if (img) {
    const caption = img.nextElementSibling;
    img.remove();
    if (caption && caption.tagName && caption.tagName.toLowerCase() === "p") {
      caption.remove();
    }
  }
}

// Wait for the page to fully load its DOM content, then call updateLocation
document.addEventListener("DOMContentLoaded", () => {
  updateLocation();
});
});
