var restify = require('restify');
var unirest = require('unirest');
var cheerio = require('cheerio');

var server = restify.createServer();
server.use(restify.bodyParser());
server.use(restify.CORS());
server.use(restify.fullResponse());

// Needed this for OPTIONS preflight request: https://github.com/mcavage/node-restify/issues/284
function unknownMethodHandler(req, res) {
	if (req.method.toUpperCase() === 'OPTIONS') {
		console.log('Received an options method request from: ' + req.headers.origin);
		var allowHeaders = ['Accept', 'Accept-Version', 'Content-Type', 'Api-Version', 'Origin', 'X-Requested-With', 'Authorization'];

		if (res.methods.indexOf('OPTIONS') === -1) {
			res.methods.push('OPTIONS');
		}

		res.header('Access-Control-Allow-Credentials', false);
		res.header('Access-Control-Expose-Headers', true);
		res.header('Access-Control-Allow-Headers', allowHeaders.join(', '));
		res.header('Access-Control-Allow-Methods', res.methods.join(', '));
		res.header('Access-Control-Allow-Origin', req.headers.origin);
		res.header('Access-Control-Max-Age', 1209600);

		return res.send(204);
	}
	else {
		return res.send(new restify.MethodNotAllowedError());
	}
}
server.on('MethodNotAllowed', unknownMethodHandler);

server.get('/search/:query/:filetype', searchGithub);

server.listen(8000, function() {
	console.log('%s listening at %s', server.name, server.url);
});

/**
 * Search Github
 *
 */
function searchGithub(req, res, next) {
	var query = req.params.query || '';
	var filetype = req.params.filetype || '';
	console.log('Got request for searching "' + query + '" in language "' + filetype + '"');
	if(req.headers.accept === 'application/json') {
		searchGithubJson(query, filetype, function(jsonResponse) {
			res.send(jsonResponse);
	});
	} else {
		searchGithubHtml(query, filetype, function(htmlResponse) {
			res.setHeader('Content-Type', 'text/html');
			res.writeHead(200);
			res.end(htmlResponse);
		});
	}

}

function cleanupCode(code) {
	code = code.replace(/\n\s*\n/g, "\n");
	code = code.replace(/\n{\s|\d}*\n/g, "\n");
	code = code.replace(/\s+\d+\s+/g, "");
	code = code.replace(/\n\s*\n/g, "\n");
	return code;
}


function searchGithubJson(query, filetype, callback) {
	unirest.get('https://github.com/search?l=' + filetype + '&q=' + query + '&ref=cmdform&type=Code')
	.end(function(resp) {
		var $ = cheerio.load(resp.body);
		
		var results = [];
		
		
		
		$('.code-list-item', '#code_search_results').find('.title').find('a').each(function(i, elem) {
			if(results[Math.floor(i/2)] === undefined || results[i/2] === null) {
				results[Math.floor(i/2)] = {
					repo: null,
					repoName: null,
					file: null,
					code: null
				};
			}
			if(i%2 === 0) {
				results[Math.floor(i/2)].repo = 'https://www.github.com' + $(this).attr('href');
				results[Math.floor(i/2)].repoName = $(this).attr('href');
			} else {
				results[Math.floor(i/2)].file = 'https://www.github.com' + $(this).attr('href');
			}
		});
		
		$('.code-list-item', '#code_search_results').find('.bubble').find('.file-code').each(function(i, elem) {
			results[i].code = cleanupCode($(this).text());
		});
		
		callback.call(this, results);
	});
}

function searchGithubHtml(query, filetype, callback) {
	searchGithubJson(query, filetype, function(jsonResponse) {
		var style = '<style>';
		style +=	'body {';
		style +=		'background: #f3f3f3;';
		style +=	'}';
		style +=	'a {';
		style +=		'text-decoration: none';
		style +=	'}';
		style +=	'a:visited {';
		style +=		'text-decoration: none';
		style +=		'background: yellow';
		style +=	'}';
		style +=	'.code {';
		style +=		'font-family: consolas';
		style +=		'font-size: 12px;';
		style +=		'color: #d14';
		style +=	'}';
		style +=	'.repoName {';
		style +=		'font-family: helvetica, arial;';
		style +=		'color: black';
		style +=	'}';
		style +=	'table, tr, td, th {';
		style +=		'border: 1px dotted black';
		style +=	'}';
		style +=	'pre {';
		style +=		'width: 800px;';
		style +=		'overflow: hidden;';
		style +=		'display: inline-block;';
		style +=	'}';
		style +=	'th {';
		style +=		'font-family: helvetica, arial;';
		style +=		'font-size: 12px;';
		style +=	'}';
		style +=	'</style>';
		var html = "<html><head>" + style + "</head><body><table>";
		html += "<tr><th>Repository</th><th>Code Snippet</th></tr>";
		for(var i = 0,l = jsonResponse.length; i < l; i++) {
			html += "<tr>";
			html += "<th class='repoName'><a href = '"+jsonResponse[i].repo+"'>"+jsonResponse[i].repoName+"</a></th><td><a href = '"+jsonResponse[i].file+"'><pre class='code'>"+jsonResponse[i].code+"</pre></a></td>";
			html += "</tr>";
		}
		html += "</table></body></html>";
		callback.call(this, html);
	});
}


