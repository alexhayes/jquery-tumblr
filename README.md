# jquery-tumblr

jquery-tumblr is a plugin that parses a tumblr feed and outputs markup.

It was inspired by the work of [Chris Tran](https://chris-tran.com/blog/?p=236) however realy bares no resemblance to his code.

Note that the markup generated is similar to that of tumblr's default theme however posts are enclosed in ul/li tags rather than just div's.

## Example

```html
<div id="posts"></div>
	<script type="text/javascript">
	$(document).ready(function () {
		$('#posts')
			.tumblr({
				url: 'http://blog.thehiddenventure.com'
			})
			.tumblr('reload');
	});
	</script>
```

## Options

The following options are available:

- url: your tumblr url (ie. http://(YOUR NAME).tumblr.com )
- timeout: defaults to 10000
- perPage: The number of posts to return. The default is 20, and the maximum is 50.
- start: The post offset to start from. The default is 0.
- photoSize: The photo size to use, accepted values are 75, 100, 250, 400, 500 and 1280. Default is 400.
- videoSize: The video size to embed, accepted values are 250, 500 or false. If false, the tumblr 'video-player' parameter will be used.
- timeago: If true (default) then jquery-timeago will be used for post dates.
- shortLength: For captions and titles that are less than this length the css class 'short' will be added. Default is 50.
- mediumLength: For captions and titles that are less than this length the css class 'medium' will be added. Default is 100.

## Optional Requirements

[jquery-timeago](http://timeago.yarp.com/) - is needed if the timeago option is true (default).

## License

Copyright (c) 2011 Alex Hayes
Dual licensed under the MIT and GPL licenses.
