// File origin: VS1LAB A3

/**
 * This script is a template for exercise VS1lab/Aufgabe3
 * Complete all TODOs in the code documentation.
 */

/** * 
 * A class representing geotags.
 * GeoTag objects should contain at least all fields of the tagging form.
 */
class GeoTag {

    /**
     * Constructor for a new GeoTag.
     * @param {number} latitude Latitude of the location
     * @param {number} longitude Longitude of the location
     * @param {string} name Name of the place
     * @param {string} hashtag Optional hashtag
     */
    constructor(latitude, longitude, name, hashtag = "") {
        this.latitude = parseFloat(latitude);   // sicherstellen, dass es eine Zahl ist
        this.longitude = parseFloat(longitude);
        this.name = name;
        this.hashtag = hashtag;
    }

}

module.exports = GeoTag;
