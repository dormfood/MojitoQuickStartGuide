/*
 * Copyright (c) 2011-2013, Yahoo! Inc.  All rights reserved.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

/*jslint anon:true*/
/*global YUI*/

YUI.add('ReadController', function(Y, NAME) {
    'use strict';


    /**
     * Compose the data for the view.
     * @method compose
     * @private
     * @param {Object} feedmeta Feed meta.
     * @param {Array.<Object>} pages Individual pages of topic.
     * @return {Object} Data for view renderer (mustache.js).
     */
    function compose(feedmeta, pages) {
        var vu = {
                feedname: feedmeta.title,
                pages: pages || [],
                navdots: []
            },
            n = Math.max(0, vu.pages.length);

        Y.each(vu.pages, function(page, i) {
            var curr = feedmeta.start + i,
                prev = curr - 1 < 1 ? n : curr - 1,
                next = curr + 1 > n ? 1 : curr + 1;

            if (page.title && page.content) {
                page.pageno = i + 1;
                page.totalpage = n;
                page.prev = '&start=' + prev;
                page.next = '&start=' + next;
                page.css_style = "medium";
                vu.navdots.push({});

            } else {
                Y.log('page ' + i + ' is missing data', 'warn');
            }
        });
        return vu;
    }

    /**
     * Something went wrong, render something.
     * @method fail
     * @private
     * @param {String} error The error message.
     * @param {ActionContext} ac The action context.
     */
    function fail(error, ac) {
        ac.done({pages: [{title: 'oh noes!', content: error}]});
    }

    /**
     * Load guide title in url, get data, display.
     * @method index
     * @param {ActionContext} ac The action context to operate on.
     */
    function index(ac) {
        var bookmeta = {},
            model = ac.models.get('GuideModel'),
            error,
            afterGetContent = function (error, content) {
                var vu;

                // Check to see if there's an error
                if (error) {
                    fail(error, ac);
                } else {
                    // Process the content so it can be displayed
                    vu = compose(bookmeta, content);
                    ac.done(vu);
                }
            };

        // Fill in feed metas
        bookmeta.title = ac.params.merged('name');

        // Ask model for content, or display error.
        model.getBook(bookmeta, afterGetContent);
    }

    /**
     * Display feed data in a horizontally flickable scrollview.
     * @class ReadController
     */
    Y.namespace('mojito.controllers')[NAME] = {
        index: index,
        test: {
            compose: compose
        }
    };

}, '0.0.1', {requires: [
    'mojito',
    'mojito-config-addon',
    'mojito-models-addon',
    'mojito-params-addon',
    'GuideModel'
]});
