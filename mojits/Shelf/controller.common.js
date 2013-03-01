/*
 * Copyright (c) 2011-2013, Yahoo! Inc.  All rights reserved.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

/*global YUI*/


YUI.add('ShelfController', function (Y, NAME) {
    'use strict';

    /**
     * Display a clickable tile for each .md guide.
     * @param {ActionContext} ac The action context.
     */
    function index(ac) {
        var vudata = { // Mustache template data.
                tiles: []
            },
            model = ac.models.get('GuideModel'),
            afterGetBooks = function (books) {
                Y.each(books, function (book) {
                    book.link = 'read.html?name=' + encodeURIComponent(book.name);
                    vudata.tiles.push(book);
                });

		        ac.done(vudata);
			};

        model.getBooks(afterGetBooks);
    }

    /**
     * Display feed titles in a grid of scrollable tiles. Feed data from
     * ./definition.json.
     * @class ShelfController
     */
    Y.namespace('mojito.controllers')[NAME] = {
        index: index
    };

}, '0.0.1', {requires: [
    'mojito',
    'mojito-config-addon',
    'mojito-composite-addon',
    'mojito-models-addon',
	'GuideModel'
]});
