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
    // Array "tags" als dritten Parameter übergeben
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
   
    // Karte auf ermittelte Position setzen
    window.mapManager.initMap(lat, lng);
    // Marker für die aktuelle Position setzen
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

// Pagination: Aufgabe 4.3 
let currentPage = 1;
const itemsPerPage = 5;

function updateDiscoveryWidget(data) {  
  const resultsList = document.getElementById("discoveryResults");
  resultsList.innerHTML = "";

  data.tags.forEach(gtag => {  
    const li = document.createElement("li");
    li.textContent = `${gtag.name} (${gtag.latitude},${gtag.longitude}) ${gtag.hashtag}`;
    resultsList.appendChild(li);
  });

  createPaginationControls(data.pagination.pages);  

  const lat = parseFloat(document.getElementById("Latitude").value);
  const lng = parseFloat(document.getElementById("Longitude").value);
  
  if (window.mapManager) {
    const currentGeoTag = { latitude: lat, longitude: lng, name: "Current position" };
    const allTags = [currentGeoTag, ...data.tags];  
    window.mapManager.updateMarkers(lat, lng, allTags);
  }
}

// Pagination Controls erstellen
function createPaginationControls(pages) {  
  const controls = document.getElementById('paginationControls');
  const pageNumbers = document.getElementById('pageNumbers');
  
  if (!controls) return;
  
  pageNumbers.innerHTML = '';
  
  if (pages <= 1) {
    controls.style.display = 'none';
    return;
  }
  
  controls.style.display = 'flex';
  
  document.getElementById('prevPage').disabled = currentPage === 1;
  document.getElementById('prevPage').onclick = () => {
    if (currentPage > 1) changePage(currentPage - 1);
  };
  
  for (let i = 1; i <= pages; i++) {
    const btn = document.createElement('button');
    btn.className = 'page-number';
    btn.textContent = i;
    if (i === currentPage) btn.classList.add('active');
    btn.onclick = () => changePage(i);
    pageNumbers.appendChild(btn);
  }
  
  document.getElementById('nextPage').disabled = currentPage === pages;
  document.getElementById('nextPage').onclick = () => {
    if (currentPage < pages) changePage(currentPage + 1);
  };
}

function changePage(page) {  
  currentPage = page;
  fetchDiscoveryTags()
    .then(updateDiscoveryWidget)
    .catch(console.error);
}

function handleTaggingSubmit(event) {
  event.preventDefault();
  console.log("=== TAGGING START ===");

  const nameInput = document.getElementById("PlaceName");
  const hashtagInput = document.getElementById("Hashtag");
  const namePattern = /^[A-Za-z]{1,10}$/;
  
  if (!namePattern.test(nameInput.value)) {
    alert("Name muss 1-10 Buchstaben enthalten!");
    return;
  }

  const geoTagData = {
    latitude: parseFloat(document.getElementById("Latitude").value),
    longitude: parseFloat(document.getElementById("Longitude").value),
    name: nameInput.value,
    hashtag: hashtagInput.value
  };
  
  console.log("GeoTag zum Senden:", geoTagData);

  fetch('/api/geotags', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(geoTagData)
  })
  .then(response => {
    console.log("POST Response Status:", response.status);
    console.log("POST Response OK:", response.ok);
    
    if (!response.ok) {
      return response.text().then(text => {
        console.error("Server Error Response:", text);
        throw new Error(`Server Fehler ${response.status}: ${text}`);
      });
    }
    return response.json();
  })
  .then(newTag => {
    console.log('GeoTag erfolgreich erstellt:', newTag);
    document.getElementById("PlaceName").value = "";
    document.getElementById("Hashtag").value = "";
    
    currentPage = 1;  
    return fetchDiscoveryTags();
  })
  .then(data => {  
    console.log("Tags nach Tagging:", data);
    updateDiscoveryWidget(data);
  })
  .catch(error => {
    console.error('Tagging Fehler:', error);
    alert('Fehler beim Erstellen: ' + error.message);
  });
}

function handleDiscoverySubmit(event) {
  event.preventDefault();
  console.log("=== DISCOVERY START ===");
  
  currentPage = 1;  
  fetchDiscoveryTags()
    .then(data => {  
      console.log("Discovery Tags empfangen:", data);
      updateDiscoveryWidget(data);
    })
    .catch(error => {
      console.error('Discovery Fehler:', error);
    });
}

function fetchDiscoveryTags() {
  const lat = document.getElementById("hidden-latitude").value;
  const lng = document.getElementById("hidden-longitude").value;
  const searchTerm = document.getElementById("search").value;

  const params = new URLSearchParams();
  if (lat) params.append('latitude', lat);
  if (lng) params.append('longitude', lng);
  if (searchTerm) params.append('searchterm', searchTerm);
  
  params.append('page', currentPage);  
  params.append('limit', itemsPerPage); 

  const url = `/api/geotags?${params.toString()}`;
  console.log("Discovery URL:", url);
  
  return fetch(url)
    .then(response => {
      console.log("Discovery Response Status:", response.status);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    });
}

document.addEventListener("DOMContentLoaded", () => {
  updateLocation();

  // direkt alle GeoTags laden
  currentPage = 1;                // Pagination auf Seite 1
  fetchDiscoveryTags()
    .then(updateDiscoveryWidget)
    .catch(console.error);

  const tagForm = document.getElementById("tag-form");
  tagForm.addEventListener("submit", handleTaggingSubmit);

  const discoveryForm = document.getElementById("discoveryFilterForm");
  discoveryForm.addEventListener("submit", handleDiscoverySubmit);
});