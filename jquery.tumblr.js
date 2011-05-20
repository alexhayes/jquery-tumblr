/**
 * jQuery tumblr plugin
 * This jQuery plugin was inspired by the work of Chris Tran - https://chris-tran.com/blog/?p=236
 * @name jquery-tumblr-0.1.js
 * @author Alex Hayes - http://alution.com
 * @version 0.1
 * @date May 20, 2011
 * @category jQuery plugin
 * @copyright (c) 2011 Alex Hayes (alution.com)
 * @license Dual licensed under the MIT and GPL licenses.
 * @todo Add in pagination
 */
(function( $ ) {

	var methods = {
		
		/**
		 * Initialise the tumblr feed.
		 * 
		 * @param options     Valid params:
		 *                        - url: your tumblr url (ie. http://(YOUR NAME).tumblr.com )
		 *                        - timeout: defaults to 10000
		 *                        - perPage: The number of posts to return. The default is 20, and the maximum is 50.
		 *                        - start: The post offset to start from. The default is 0.
		 *                        - photoSize: The photo size to use, accepted values are 75, 100, 250, 400, 500 and 1280. Default is 400.
		 *                        - videoSize: The video size to embed, accepted values are 250, 500 or false. If false, the tumblr 'video-player' parameter will be used.
		 * 	                      - timeago: If true (default) then jquery-timeago will be used for post dates.
		 */
		init : function( options ) {
			var settings = {
				'timeout'   : 3000,
				'perPage'   : 20,
				'start'     : 0,
				'photoSize' : 400,
				'videoSize' : false,
				'timeago'   : true
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
					$(this).data('tumblr', {
						target  : $this,
						start   : settings.start,
						options : settings,
						posts   : posts
					});
				}
			});
		},
		
		/**
		 * Reload the tumblr feed.
		 */
		reload : function(start) {
			// Only make one ajax call - but load it for all matched elements...
			var $this = this, 
				data = this.data('tumblr'),
				params = {
					start: start == undefined ? data.start : start,
					num: data.options.perPage
				},
				url = data.options.url + '/api/read/json?' + $.param(params);				

			$.ajax({
				url: url,
				dataType: 'script',
				timeout: data.options.timeout,
				success: function() {
					$this.tumblr('handle_ajax_success', tumblr_api_read);
				},
				error: function (xhr, statusTxt, errorTxt) {
					// Unlikely that this will be supported because in probably 99.9% of cases it will be cross domain.
					$this.append(
						'<h2>Ooops...</h2>' +
						'<p>It looks like tumblr is having issues - it happens to the best of us. Don\'t worry it should be fixed soon!</p>' +
						'<p style="display: none;">' + errorTxt + ': ' + xhr.responseText + '</p>'
					);
				}
			});
			return this;
		},
		
		handle_ajax_success: function(tumblr_api_read) {
			return this.each(function() {
				var $this = $(this),
					data = $this.data('tumblr'),
					postIterator = 0;

				$this.empty();
				if ((tumblr_api_read == undefined) || (tumblr_api_read == null)) {
					$this.append('<div class="tumblr-error">Unable to load tumblr - its probably down...</div>');
					return;
				}
				
				$.each(tumblr_api_read.posts.slice(0, 10), function(i, post) {
					$this.tumblr('add_post', post, postIterator);
					postIterator++;
				});
				
				if(data.options.timeago) {
					$("abbr.timeago", data.posts).timeago();
				}
				$this.append(data.posts);
				
			});
		},

		add_post: function(post, i) {
			var $this = $(this),
				data = $this.data('tumblr'),
				oddeven = i%2 ? 'even' : 'odd',
				body = '',
				li = '';

			switch(post.type) {
				case "regular": {
					body = '<div class="title">' + post['regular-title'] + '</div>' +
                        	'<div class="description">' + post['regular-body'] + '</div>';
					break;
				}
				case "photo": {
					body = '<div class="media">';
					if(post['photo-link-url']) {
						body += '<a href="' + post['photo-link-url'] + '">';
					}
					body += '<img alt="' + $(post['photo-caption']).text() + '" src="' + post['photo-url-' + data.options.photoSize] + '">';
					if(post['photo-link-url']) {
						body += '</a>';
					}
					body += '<div class="caption">' + post['photo-caption'] + '</div>' +
						'</div>';
					break;
				}
				case "link": {
					body = '<div class="link"><a href="' + post['link-url'] + '">' + post['link-text'] + '</a></div>';
					if(post["link-description"]) {
						body += '<div class="description">' + post['link-description'] + '</div>';
					}
					break;
				}
				case "quote": {
					var extraClass = 'long';
					if(post['quote-text'].length < 100) {
						extraClass = 'short';
					}
					else if(post['quote-text'].length < 300) {
						extraClass = 'medium';
					}
					body = 
	                    '<div class="quote">' +
	                        '<div class="quote-text ' + extraClass + '">' + post['quote-text'] + '</div>' +
							'<div class="source">&mdash; ' + post['quote-source'] + '</div>' +
	                    '</div>';
					break;
				}
				case "conversation": {
					body = '<div class="caption">' + post['conversation-title'] + '</div>' +
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
					body =
                        // '<script src="http://assets.tumblr.com/javascript/tumblelog.js?537" language="javascript" type="text/javascript"></script>' + 
                    	'<div class="media">' + post['audio-player'] + '</div>' +
                        // '<script type="text/javascript">replaceIfFlash(9,"audio_player_459260683",\'\x3cdiv class=\x22audio_player\x22\x3e&lt;embed type="application/x-shockwave-flash" src="http://assets.tumblr.com/swf/audio_player_black.swf?audio_file=http://www.tumblr.com/audio_file/459260683/tumblr_ksc4i2SkVU1qz8ouq&amp;color=FFFFFF" height="27" width="207" quality="best"&gt;&lt;/embed&gt;\x3c/div\x3e\')</script>'
						'<div class="caption">' + post['audio-caption'] + '</div>'; 
					break;
				}
				case "video": {
					var player = 'video-player';
					if(data.options.videoSize) {
						player = 'video-player-' + data.options.videoSize;
					}
					body = 
                        '<div class="media">' + post[player] + '</div>' +
                        '<div class="caption">' + post['video-caption'] + '</div>';
					break;
				}
				default:
					break;			
			}
			
			// Add the li to the posts stack.
			li = 
				'<li class="tumblr-post tumblr-post-' + post.type + ' post-id-' + post.id + ' ' + oddeven + '">' +
					//'<div class="post">' +
		            	body +
		        		'<a href="' + post['url-with-slug'] + '" class="permalink" target="_blank">' +
		                	'<div class="footer for_permalink">' +
		                    	'<div class="date"><span class="posted">Posted</span> <abbr class="timeago" title="' + post['date'] + '">' + post['date'] + '</abbr></div>' +
		                   		'<div class="notes"></div>' +
								// '<div class="clear"></div>' +
		                	'</div>' +
						'</a>' +
						'<div class="footer">';

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
					li += '<li class="' + extraClass + '"><a href="' + data.options.url + '/tagged/' + tag +'" target="_blank">' + tag + '</a>' + tag_comma + '</li>';
				});
				li += '</ul></div>';
			}

			li += 		// '<div class="clear"></div>' +
		        		'</div>' +
	        		// '</div>' +
		        '</li>'
			
			data.posts.append(li);
			
		},

		destroy : function() {
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