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
     * Choose text display size.
     * @method size
     * @private
     * @param {Number} tlen page title character count.
     * @param {Number} dlen page description character count.
     * @return {String} Predefined css class.
     */
    function size(tlen, dlen) {
        var weighted = (tlen * 1.4) + dlen * 2;
        return ((weighted > 500) && 'medium') ||
            ((weighted > 300) && 'large') ||
            ((weighted > 200) && 'x-large') || 'xx-large';
    }

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
                page.css_style = size(page.title.length, page.content.length);
                vu.navdots.push({});

            } else {
                Y.log('page ' + i + ' is missing data', 'warn');
            }
        });
        //Y.log(vu);
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
        var feedmeta = {},
            model = ac.models.get('GuideModel'),
            error;

        // Fill in feed metas
        feedmeta.title = ac.params.merged('name');

        // Process the content so it can be displayed
        function afterGetContent(error, content) {
            var vu = compose(feedmeta, content);

            // Return composed view if no error
            return error ? fail(error, ac) : ac.done(vu);
        }

        // Ask model for content, or display error.
        return error ? fail(error, ac) : model.getBook(feedmeta, afterGetContent);
    }

    /**
     * Display feed data in a horizontally flickable scrollview.
     * @class ReadController
     */
    Y.namespace('mojito.controllers')[NAME] = {
        index: index,
        test: {
            size: size,
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
