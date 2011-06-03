# jquery-tumblr

jquery-tumblr is a plugin that parses a tumblr feed and outputs markup.

It was inspired by the work of [Chris Tran](https://chris-tran.com/blog/?p=236) however realy bares no resemblance to his code.

Note that the markup generated is similar to that of tumblr's default theme however posts are enclosed in ul/li tags rather than just div's.

## Example

```html
<div id="loading">Loading...</div>
<div id="posts"></div>
<div id="pagination"></div>
	<script type="text/javascript">
	$(document).ready(function () {
		$('#posts')
			.tumblr({
				url:        'http://blog.thehiddenventure.com',
				pagination: '#pagination',
				loading:    '#loading'
			});
	});
	</script>
```

## Options

The following options are available:

- url: your tumblr url (ie. http://(YOUR NAME).tumblr.com )
- loading: A selector that specifies a element that can be shown when loading content from tumblr.
- pagination: A selector that specifies where the pagination will reside. If one does not exist, pagination is disabled.
- perPage: The number of posts to return. The default is 20, and the maximum is 50.
- start: The post offset to start from. The default is 0.
- paginationOptions: Other options to pass to jquery_pagination - See https://github.com/gbirke/jquery_pagination
- photoSize: The photo size to use, accepted values are 75, 100, 250, 400, 500 and 1280. Default is 400.
- videoSize: The video size to embed, accepted values are 250, 500 or false. If false, the tumblr 'video-player' parameter will be used.
- timeago: If true (default) then jquery-timeago will be used for post dates.
- shortLength: For captions and titles that are less than this length the css class 'short' will be added. Default is 50.
- mediumLength: For captions and titles that are less than this length the css class 'medium' will be added. Default is 100.
- fancybox: If true (default) then fancybox will be used when there are multiple photos. See photoThumbSize and photoLightboxSize
- photoThumbSize: If there are multiple photos, they will be output in a ul/li tags, this value will be the size of image used. Accepted values are 75, 100, 250, 400, 500 and 1280. Default is 75.
- photoLightboxSize: If there are multiple photos, this image size will be used for lightbox. Accepted values are 75, 100, 250, 400, 500 and 1280. Default is 1280.
- timeout: Ajax timeout defaults to 5000

## Optional Requirements

[jquery_pagination](https://github.com/gbirke/jquery_pagination.git) - is needed if you want pagination. Until an issue with jquery_pagination is resolved then you should use [my fork](https://github.com/alexhayes/jquery_pagination) 
[jquery-timeago](http://timeago.yarp.com/) - is needed if the timeago option is true (default).

## License

Copyright (c) 2011 Alex Hayes
Dual licensed under the MIT and GPL licenses.
