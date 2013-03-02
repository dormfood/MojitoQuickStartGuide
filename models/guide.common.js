/*
 * Copyright (c) 2011-2013, Yahoo! Inc.  All rights reserved.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

/*global YUI*/


YUI.add('GuideModel', function (Y, NAME) {
    'use strict';
    var ResourcePath = __dirname + '/../guides/'

    /**
     * Gets the titles of all the guides.
     * @return {Array} An array with book titles in string.
     */
    function getGuides(callback) {
        var fs = require('fs');

        return fs.readdirSync(ResourcePath);
    }

	/**
     * Reads the proper title H1 title from a guide.
     * @param {String} guide file name.
     * @return {String} guide name.
     */
    function getGuideTitle(filename, callback) {
        var fs = require('fs'),
            content;

        content = fs.readFileSync(ResourcePath + filename);
        return fetchGuideTitle(String(content)).title; // Extract heading content
    }

	/**
     * Gets book titles from a book pile.
     * @param {Function} callback The callback function to invoke.
     * @return {Array} objects with "name" of book titles.
     */
    function getBooks(callback) {
        var self = this,
            names = getGuides(),
            books = [],
            book = {};

       	Y.each(names, function (name) {
            var book = {};
            if (name.match(/\.md$/)) { // Only catch the .md files
                book.name = name.replace(/\.md$/, "");
                book.title = getGuideTitle(name);
                books.push(book);
            }
        });

        callback(books);
    }

    /**
     * Strip HTML tags from the content string provided.
     * @param {String} content The content.
     * @return {String} Plain text.
     */
    function stripTags(content) {
        return content.replace(/<\/?\w+[\s\S]*?>/gmi, ' ');
    }

    /**
     * Paginate the content by sub-topics,
     * then paginate them into either 16 lines long or 160 words long.
     * @param {String} content The content.
     * @return {Array.(String)} paginated content strings
     */
    function paginate(content) {
        var restContent = content,
            currentSection,
            lines,
            words,
            pages = [],
            newPage = true;  // if it's a start of a new page

        // Topic divide
        while (restContent) {
            // Topic starts with at least one "#"
            //currentSection = restContent.split(/\n##[^#]/)[0];
            currentSection = restContent.split(/\n#[^#]/)[0] || restContent.split(/\n##[^#]/)[0];
            // Originally was '##' not '###'
            if (restContent.split(/\n###/)[1]) {// More stuff coming up
                restContent = "###" + restContent.split(/\n###/).slice(1).join('\n###');
            } else {
                restContent = "";
            }

            if (!currentSection.match(/\w+/)) { // Empty Page
                continue;
            }

            // Weight divide
	        while (currentSection) {
	            // 16 lines
	            lines = currentSection.split(/\n/g).slice(0, 16).join('\n');
	            // 160 words (approximately)
	            words = currentSection.split(/ /g).slice(0, 160).join(' ');
	        
	            if (lines.length < words.length) {
	                // Take 16 lines
                    if (!lines.match(/\w+/g)) {// Empty Page
                        continue;
                    }
                    if (newPage) {
                        pages.push(lines);
                        newPage = false;
                    } else {
                        pages.push("_continued from last page..._\n\n" + lines);
                    }
	                currentSection = currentSection.replace(lines, "");
	            } else {
	                // Take 160 words
                    if (!words.match(/\w+/g)) {// Empty Page
                        continue;
                    }
                    if (newPage) {
                        pages.push(words);
                        newPage = false;
                    } else {
                        pages.push("_continued from last page..._\n\n" + words);
                    }
	                currentSection = currentSection.replace(words, "");
	            }
	        }
            newPage = true;
        }

        return pages;
    }

	/**
     * Reads the proper title H1 title from a guide.
     * @param {String} guide content.
     * @return {Object} guide title and remaining content.
     */
    function fetchGuideTitle(content) {
        var title = String(content).match(/#+.*#+/)[0];

        content = String(content).replace(title, "");

        return {
                   title: title.replace(/#+/g, ""), // Extract heading content
                   content: content
               };
    }

    /**
     * Handle result data processing.
     * @param {String} title Title
     * @param {String} content Raw content
     * @return {Array.<Object>} Content separated into pages with white spaces removed.
     */
    function processResponse(name, content) {
        var pages,
            i,
            page,
            list = [],
            guide_title_result,
            title = "",
            error = null;

        guide_title_result = fetchGuideTitle(content);
        title = guide_title_result.title;
        content = guide_title_result.content;
        pages = paginate(String(content));

        for (i in pages) {
            if (pages.hasOwnProperty(i)) {

                page = {
                    title: Y.Lang.trim(title),
                    content: stripTags(pages[i])
                };

                if (page.title && page.content) {
                    list.push(page);
                } else {
                    Y.log('skipping page ' + i + ': missing data', 'warn');
                }
            }
        }

        return list;
    }

    /**
     * Reads a markdown file.
     * @param {String} title Name of the topic.
     * @param {Function} callback Function to callback.
     */
    function getContent(title, callback) {
        var pathLib = require('path'),
            fsLib = require('fs'),
            // Generate path
            path = pathLib.join(ResourcePath, title);

        return fsLib.readFile(path, callback);
    }

    /**
     * Checks the existence of a topic.
     * @param {String} title Name of the topic.
     * @param {Function} callback Function to callback.
     */
    function checkTitle(title, callback) {
        var pathLib = require('path'),
            fsLib = require('fs'),
            // Generate path
            path = pathLib.join(ResourcePath, title);

        fsLib.exists(path, callback);
    }

    /**
     * Gets content of the .md file.
     * @param {Object} feedmeta Metadata for the selected feed.
     * @param {Function} callback The callback function to invoke.
     */
    function getBook(feedmeta, callback) {
        var title = feedmeta.title + ".md", // .md file name
            afterGetContent = function (err, content) {
                var list = [],
                    error = null;

                // Error?
                if (err) {
                    error = 'Ooo, content is damaged in ' + title;
                } else {
                    list = processResponse(title, content);
                }

                // Pass feedmeta through.
                callback(error, list);
            },
            afterCheckTitle = function (good) {
                var error = null;
                if (good) {
	                getContent(title, _afterGetContent);
                } else {
                    error = 'Ooo, could not fetch content for ' + title;

                    // Sends back error
                    callback(error);
                }
            }

        // Check the existence of the topic
        checkTitle(title, _afterCheckTitle);
    }

    /**
     * Fetch normalized RSS feed data as JSON via YQL.
     * @class ReadModelBookContent
     */
    Y.mojito.models[NAME] = {
        getBook: getBook,
        getBooks: getBooks,
        test: {
            processResponse: processResponse,
            checkTitle: checkTitle,
            getContent: getContent,
            paginate: paginate,
            stripTags: stripTags,
            fetchGuideTitle: fetchGuideTitle,
            getGuides: getGuides
        }
    };

}, '0.0.1', {requires: [
    'mojito',
    'yql',
    'jsonp-url'
]});
