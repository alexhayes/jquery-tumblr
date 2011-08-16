/**
 * jQuery tumblr plugin
 * This jQuery plugin was inspired by the work of Chris Tran - https://chris-tran.com/blog/?p=236
 * @name jquery-tumblr-0.2.js
 * @author Alex Hayes - http://alution.com
 * @version 0.3
 * @date Aug 17, 2011
 * @category jQuery plugin
 * @copyright (c) 2011 Alex Hayes (alution.com)
 * @license Dual licensed under the MIT and GPL licenses.
 * @todo Add ability to define hooks for user defined markup.
 */
(function( $ ) {

	var methods = {
		
		/**
		 * Initialise the tumblr feed.
		 * 
		 * @param options     Valid params:
		 *                        - url: your tumblr url (ie. http://(YOUR NAME).tumblr.com )
		 *                        - loading: A selector that specifies a element that can be shown when loading content from tumblr.
		 *                        - pagination: A selector that specifies where the pagination will reside. If one does not exist, pagination is disabled.
		 *                        - perPage: The number of posts to return. The default is 20, and the maximum is 50.
		 *                        - start: The post offset to start from. The default is 0.
		 *                        - paginationOptions: Other options to pass to jquery_pagination - See https://github.com/gbirke/jquery_pagination
		 *                        - photoSize: The photo size to use, accepted values are 75, 100, 250, 400, 500 and 1280. Default is 400.
		 *                        - videoSize: The video size to embed, accepted values are 250, 500 or false. If false, the tumblr 'video-player' parameter will be used.
		 * 	                      - timeago: If true (default) then jquery-timeago will be used for post dates.
		 *                        - shortLength: For captions and titles that are less than this length the css class 'short' will be added. Default is 50.
		 *                        - mediumLength: For captions and titles that are less than this length the css class 'medium' will be added. Default is 100.
		 *                        - fancybox: If true (default) then fancybox will be used when there are multiple photos. See photoThumbSize and photoLightboxSize
		 *                        - photoThumbSize: If there are multiple photos, they will be output in a ul/li tags, this value will be the size of image used. Accepted values are 75, 100, 250, 400, 500 and 1280. Default is 75.
		 *                        - photoLightboxSize: If there are multiple photos, this image size will be used for lightbox. Accepted values are 75, 100, 250, 400, 500 and 1280. Default is 1280.
		 *                        - timeout: Ajax timeout defaults to 5000
		 */
		init : function( options ) {
			var settings = {
				'loading'            : false,
				'pagination'         : false,
				'perPage'            : 20,
				'start'              : 0,
				'paginationOptions'  : {},
				'photoSize'          : 400,
				'videoSize'          : false,
				'timeago'            : true,
				'shortLength'        : 50,
				'mediumLength'       : 100,
				'fancybox'           : true,
				'photoThumbSize'     : 75,
				'photoLightboxSize'  : 500,
				'timeout'            : 10000
		    };
			var that = this;
			
			return this.each(function() {        
				// If options exist, lets merge them with our default settings
				var $this = $(this),
					data = $this.data('tumblr'),
					posts = $('<ul class="tumblr-posts"/>');

				// If the plugin hasn't been initialized yet
				if ( ! data ) {
					if ( options ) { 
						$.extend( settings, options );
					}
					if( settings.pagination ) {
						settings.pagination = $(settings.pagination);
						if( settings.pagination.length < 1 ) {
							settings.pagination = false;
						}
					}
					if( settings.loading ) {
						settings.loading = $(settings.loading);
						if( settings.loading.length < 1 ) {
							settings.loading = false;
						}
					}
					$(this).data('tumblr', {
						target           : $this,
						start            : settings.start,
						options          : settings,
						posts            : posts,
						pagination_setup : false 
					});
				}
				$this.tumblr('load');
			});
		},
		
		/**
		 * Load the tumblr feed.
		 * 
		 * @param Int page    The page number to load (starts at 0).
		 */
		load: function(page) {

			// Show all the loaders and slide up the content.
			this.each(function() {
				var $this = $(this),
					data = $this.data('tumblr');
				if(data.options.loading) {
					data.options.loading.show();
				}
				$this.slideUp();
			});

			var $this = this, 
				data = this.data('tumblr'),
				params = {
					start: page == undefined ? data.start * data.options.perPage : page * data.options.perPage,
					num: data.options.perPage
				},
				url = data.options.url + '/api/read/json?' + $.param(params);				

			$.ajax({
				url: url,
				dataType: 'script',
				timeout: data.options.timeout,
				success: function() {
					$this.tumblr('handleAjaxSuccess', tumblr_api_read);
				},
				error: function (xhr, statusTxt, errorTxt) {
					// Unlikely that this will be supported because in probably 99.9% of cases it will be cross domain. Will only work if they have setup a tunnel...
					$this.append(
						'<h2>Ooops...</h2>' +
						'<p>It looks like tumblr is having issues - it happens to the best of us. Don\'t worry it should be fixed soon!</p>' +
						'<p style="display: none;">' + errorTxt + ': ' + xhr.responseText + '</p>'
					);
				}
			});
			return this;
		},
		
		handleAjaxSuccess: function(tumblr_api_read) {
			return this.each(function() {
				var $this = $(this),
					data = $this.data('tumblr'),
					posts = data.posts,
					postIterator = 0;

				data.posts.empty();
				$this.empty();
				if ((tumblr_api_read == undefined) || (tumblr_api_read == null)) {
					$this.append('<div class="tumblr-error">Unable to load tumblr - its probably down...</div>');
					return;
				}
				
				$.each(tumblr_api_read.posts, function(i, post) {
					$this.tumblr('addPost', post, postIterator);
					postIterator++;
				});
				
				if(data.options.timeago && $("abbr.timeago", data.posts).length > 0) {
					$("abbr.timeago", data.posts).timeago();
				}
				if(data.options.fancybox && $("a.lightbox", data.posts).length > 0) {
					$("a.lightbox", data.posts).fancybox();
				}
				$this.html(data.posts);
				if(data.options.loading) {
					data.options.loading.hide();
				}
				$this.slideDown();
				
				if(data.options.pagination && !data.pagination_setup) {
					data.pagination_setup = true;
					$.extend(
						data.options.paginationOptions, 
						{
					        items_per_page : data.options.perPage,
					        callback       : function(new_page_index, pagination_container) {
					        	$this.tumblr('load', new_page_index);	
					        }
						}
					);
					data.options.pagination.pagination(tumblr_api_read['posts-total'], data.options.paginationOptions);
				}
			});
		},

		addPost: function(post, i) {
			var $this = $(this),
				data = $this.data('tumblr'),
				oddeven = i%2 ? 'even' : 'odd',
				body = '',
				li = '';

			switch(post.type) {
				case "regular": {
					var extraClass = $this.tumblr('getCssTextLength', post['regular-title']);
					body = '<div class="title ' + extraClass + '">' + post['regular-title'] + '</div>';
					if(post['regular-body']) {
						body += '<div class="description">' + post['regular-body'] + '</div>'; 
					}
					break;
				}
				case "photo": {
					body = '<div class="media">';
					if(post['photos'].length > 0) {
						body += '<ul class="photos">';
						$.each(post['photos'], function(i, photo) {
							var oddeven = i%2 ? 'even' : 'odd';
							var alt = '';
							if(photo['photo-caption'] != undefined) {
								alt = ' alt="' + photo['photo-caption'] + '"'; 
							}
							body += '<li class="' + oddeven + '">' +
									'<a href="' + photo['photo-url-' + data.options.photoLightboxSize] + '" rel="post-' + post['id'] + '" class="lightbox">' +
										'<img src="' + photo['photo-url-' + data.options.photoThumbSize] + '"' + alt + '>' +
									'</a>' +
								'</li>';
						});
						body += '</ul>';
					} else {
						if(post['photo-link-url']) {
							body += '<a href="' + post['photo-link-url'] + '">';
						}
						body += '<img alt="' + $(post['photo-caption']).text() + '" src="' + post['photo-url-' + data.options.photoSize] + '">';
						if(post['photo-link-url']) {
							body += '</a>';
						}
					}
					if(post['photo-caption']) {
						body += '<div class="description">' + post['photo-caption'] + '</div>';
					}
					body += '</div>';
					break;
				}
				case "link": {
					var extraClass = $this.tumblr('getCssTextLength', post['link-text']);
					body = '<div class="link ' + extraClass + '"><a href="' + post['link-url'] + '">' + post['link-text'] + '</a></div>';
					if(post["link-description"]) {
						body += '<div class="description">' + post['link-description'] + '</div>';
					}
					break;
				}
				case "quote": {
					var extraClass = $this.tumblr('getCssTextLength', post['quote-text']);
					body = 
	                    '<div class="quote">' +
	                        '<div class="quote-text ' + extraClass + '">' + post['quote-text'] + '</div>' +
							'<div class="source">&mdash; ' + post['quote-source'] + '</div>' +
	                    '</div>';
					break;
				}
				case "conversation": {
					var extraClass = $this.tumblr('getCssTextLength', post['conversation-title']);
					body = '<div class="caption ' + extraClass + '">' + post['conversation-title'] + '</div>' +
						'<div class="conversation">' + '<ul>';
					
					var users = [];
					$.each(post['conversation'], function(i, item) {
						if( $.inArray(users, item['name']) == -1 ) {
							users.push(item['name']);
						}
						var user = $.inArray(users, item['name']) + 1;
						body += 
							'<li class="odd">' + 
								'<span class="label user-' + user + '">' + item['label'] + '</span>' +
								'<span class="phrase">' + item['phrase'] + '</span>' +
	                        '</li>';
					});
					body += '</div>';
					break;
				}
				case "audio": {
					body = '<div class="media">' + post['audio-player'] + '</div>';
					if(post['audio-caption']) {
						body += '<div class="description">' + post['audio-caption'] + '</div>';	
					}
					break;
				}
				case "video": {
					var player = 'video-player';
					if(data.options.videoSize) {
						player = 'video-player-' + data.options.videoSize;
					}
					body = '<div class="media">' + post[player] + '</div>';
					if(post['video-caption']) {
						body += '<div class="description">' + post['video-caption'] + '</div>';
					}
					break;
				}
				default:
					break;			
			}
			
			// Add the li to the posts stack.
			li = 
				'<li class="tumblr-post tumblr-post-' + post.type + ' post-id-' + post.id + ' ' + oddeven + '">' +
					'<div class="post-body">' +
		            	body +
		            '</div>' +
					'<div class="post-footer">' +
                    	'<div class="date"><span class="posted">Posted</span> <abbr class="timeago" title="' + post['date'] + '">' + post['date'] + '</abbr></div>' +
						'<div class="permalink">' +
							'<a href="' + post['url-with-slug'] + '" class="permalink" target="_blank"><span class="permalink-icon">&#167;</span> <span class="permalink-text">Permalink</span></a>' +
	                	'</div>';

			if(post.tags) {
				li += '<div class="tags"><span class="tagged">Tagged </span> <ul>';
				$.each(post.tags, function(i, tag) {
					var tag_comma = '<span class="tag-commas">, </span>';
					var extraClass = '';
					if(i == post.tags.length - 1 ) {
						extraClass = 'last';
						tag_comma = '';
					}
					else if(i == 0) {
						extraClass = 'first';
					}
					li += '<li class="' + extraClass + '"><a href="' + data.options.url + '/tagged/' + tag +'" target="_blank">#' + tag + '</a>' + tag_comma + '</li>';
				});
				li += '</ul></div>';
			}

			li += '</div>' +
		        '</li>';

			data.posts.append(li);
		},

		getCssTextLength: function(text) {
			var $this = $(this),
				data = $this.data('tumblr'),
				shortLength = data.options.shortLength,
				mediumLength = data.options.mediumLength;

			var extraClass = 'long';
			if(text != null && text.length < shortLength) {
				extraClass = 'short';
			}
			else if(text != null && text.length < mediumLength) {
				extraClass = 'medium';
			}
			return extraClass;
		},

		destroy: function() {
			return this.each(function(){
				var $this = $(this),
					data = $this.data('tumblr');
				// Namespacing FTW
				$(window).unbind('.tumblr');
				data.posts.remove();
				$this.removeData('tumblr');
			});
		},
	};

	$.fn.tumblr = function( method ) {
    	// Method calling logic
		if ( methods[method] ) {
			return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.tooltip' );
		}
	};
})( jQuery );
