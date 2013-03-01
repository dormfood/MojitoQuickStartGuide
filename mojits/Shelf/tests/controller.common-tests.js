/*
 * Copyright (c) 2011-2013, Yahoo! Inc.  All rights reserved.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */


/*jslint anon:true, sloppy:true, nomen:true*/
/*global YUI,YUITest*/


YUI.add('ShelfController-tests', function(Y, NAME) {

    var suite = new YUITest.TestSuite(NAME),
        controller = null,
        MA = Y.mojito.MockActionContext,
        A = YUITest.Assert,
        M = YUITest.Mock;

    suite.add(new YUITest.TestCase({

        name: 'ShelfController tests',

        setUp: function() {
            A.isNull(controller);
            controller = Y.mojito.controllers.ShelfController;
            A.isNotNull(controller);
        },

        tearDown: function() {
            controller = null;
        },

        'test index method': function() {
			var ac = new MA({
				models: ['ShelfModel']
            });
			ac.models.get = function(model_name) {
				return ac.models[model_name];
			};
            ac.models.ShelfModel.expect({
				method: "get",
				args: [M.Value.Function],
				run: function(cb){
					cb([{
						name: "file001",
						title: "title001"
					}, {
						name: "file002",
						title: "title002"
					}]);
				}
			});
			ac.expect({
				method: "done",
				args: [M.Value.Object],
				run: function(obj) {
					console.log(obj);
					A.areSame(2, obj.tiles.length, "Wrong tile counts.");
					A.areSame("title001", obj.tiles[0].title, "Wrong title");
					A.areSame("read.html?name=file002", obj.tiles[1].link, "Wrong link");
				}
			});

            controller.index(ac);
        }

    }));

    YUITest.TestRunner.add(suite);

}, '0.0.1', {requires: [
    'mojito-test',
    'ShelfController',
    'oop'
]});
