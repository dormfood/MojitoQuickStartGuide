/*
 * Copyright (c) 2011-2013, Yahoo! Inc.  All rights reserved.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

/*global YUI*/


YUI.add('ShelfModel', function (Y, NAME) {
    'use strict';

    /**
     * Gets the titles of all the guides.
     * @return {Array} An array with book titles in string.
     */
    function getGuides(callback) {
        var fs = require('fs');

        return fs.readdirSync(__dirname + '/../../../guides');
    }

	/**
     * Reads the proper title H1 title from a guide.
     * @param {String} guide file name.
     * @return {String} guide name.
     */
    function getGuideTitle(filename, callback) {
        var fs = require('fs'),
            content;
            // Creates a reading string since we only want very few lines from the file
			//             stream = fs.createReadStream(__dirname + '/../../../guides/' + filename, { encoding: 'utf-8' }),
			// soFar = "",
			// guidename = "";

		// stream.on('data', function (chunk) {
		//             soFar.concat(chunk);
		//             if (soFar.match(/#+/g) && soFar.match(/#+/g).length == 2) { // Found a string enclosed by #+
		//                 guidename = soFar.match(/#+.*#+/)[0].replace(/#+/g, ""); // Extract heading content
		//                 // close stream
		//                 stream.destroy();
		//                 // Return with guide name
		//                 callback(guidename);
		//             }
		//         });

        content = fs.readFileSync(__dirname + '/../../../guides/' + filename);
        return String(content).match(/#+.*#+/)[0].replace(/#+/g, ""); // Extract heading content
    }

    /**
     * Gets book titles from a book pile.
     * @param {Function} callback The callback function to invoke.
     * @return {Array} objects with "name" of book titles.
     */
    function get(callback) {
        var self = this,
            names = getGuides(),
            books = [],
            book = {};

       	Y.each(names, function (name) {
            if (name.match(/\.md$/)) { // Only catch the .md files
				book.name = name.replace(/\.md$/, "");
				book.title = getGuideTitle(name);
	            books.push(Y.clone(book));
            }
        });

		callback(books);
    }

    /**
     * Get book titles.
     * @class ReadModelRss
     */
    Y.mojito.models[NAME] = {
        get: get,
        test: {
            getGuides: getGuides
        }
    };

}, '0.0.1', {requires: [
    'mojito',
	'oop'
]});
