// File origin: VS1LAB A3

/**
 * This script is a template for exercise VS1lab/Aufgabe3
 * Complete all TODOs in the code documentation.
 */

/**
 * A class for in-memory-storage of geotags
 * 
 * Use an array to store a multiset of geotags.
 * - The array must not be accessible from outside the store.
 * 
 * Provide a method 'addGeoTag' to add a geotag to the store.
 * 
 * Provide a method 'removeGeoTag' to delete geo-tags from the store by name.
 * 
 * Provide a method 'getNearbyGeoTags' that returns all geotags in the proximity of a location.
 * - The location is given as a parameter.
 * - The proximity is computed by means of a radius around the location.
 * 
 * Provide a method 'searchNearbyGeoTags' that returns all geotags in the proximity of a location that match a keyword.
 * - The proximity constrained is the same as for 'getNearbyGeoTags'.
 * - Keyword matching should include partial matches from name or hashtag fields. 
 */
class InMemoryGeoTagStore{

    constructor() {
        this._geotags  = []; //private array for geotags
        this._nextId = 0;  //für eindeutige ID's
    }
    /** Add geotag to the store
     * @param {*} geoTag  A geoTag Object
     */

    addGeoTag(geotag){
        geotag._id = this._nextId++;
        this._geotags.push(geotag);

        return geotag;
    }

    /** Remove geotags by name
     * @param {*} name Name to remove
     */

    removeGeoTag(id) {
        const initialLength = this._geotags.length;
        this._geotags = this._geotags.filter(tag => tag._id !== id);
        return this._geotags.length < initialLength ;  //true wenn erfolgreich gelöscht wurde
    }
    /** 
    * Returns all GeoTags in proximity of a given location.
     * @param {*} latitude Latitude to search around
     * @param {*} longitude Longitude to search around
     * @param {*} radius Radius in degrees
     * @returns Array of GeoTags
     */
    getNearbyGeoTags(latitude, longitude, radius = 0.1) {  
        return this._geotags.filter(tag => {
            const dx = Math.abs(tag.latitude - latitude);
            const dy = Math.abs(tag.longitude - longitude);
            return Math.sqrt(dx*dx + dy * dy) <= radius;    //Wenn beide Differenzen kleiner oder gleich radius sind, ist der Tag nahe genug
        });
    }

    /**
     * Returns all GeoTags in proximity matching a given keyword.
     * Partial matches in name OR hashtag.
     * @param {*} latitude 
     * @param {*} longitude 
     * @param {*} keyword 
     * @param {*} radius 
     * @returns Array of GeoTags
     */
    searchNearbyGeoTags(latitude, longitude, keyword, radius = 0.01) {
        const nearby = this.getNearbyGeoTags(latitude, longitude, radius);  //erst wird die obere funktion aufgerufen um alle nearby tags zu bekommen
        if (!keyword || keyword.trim() === "") return nearby;               //Wenn keyword leer -> Gib alle zurück

        const search = keyword.toLowerCase();                               // soll nicht case-sensitiv sein

        return nearby.filter(tag => 
            tag.name.toLowerCase().includes(search) ||                      //include sucht den Begriff in name oder hashtag
            tag.hashtag.toLowerCase().includes(search)
        );
    }

    getGeoTagById(id){
        return this._geotags.find(tag => tag._id ===id);
    }
    
    updateGeoTag(id, updatedData) {
        const index = this._geotags.findIndex(tag => tag._id === id);
        if (index !== -1) {
            // Behalte die ID bei, überschreibe den Rest
            this._geotags[index] = { ...updatedData, _id: id };
            return this._geotags[index];
        }
        return null;
    }

}

module.exports = InMemoryGeoTagStore