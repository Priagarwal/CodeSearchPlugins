function! s:open_github()
	let browser = "chrome"
	let lang = &filetype
	let word = expand("<cword>")
	let url = "\"https://github.com/search?l=".lang."\&q=".word."\&ref=searchresults\&type=Code\""
	let command = "!" . browser . " " . url
	execute command
endfunction

function! s:open_github_python()
	if !has('python')
		echoerr "Plugin requires python"
		finish
	endif

python << EOF
import vim, urllib2, json, string
curWord = vim.eval('expand("<cword>")')
lang = vim.eval('&filetype')

url = "http://d-maa-00387527:8000/search/" + curWord + "/" + lang;
print "Loading..."

try:
	vim.command('rightbelow vnew')
	request = urllib2.Request(url, headers={"Accept" : "application/json"})
	response = urllib2.urlopen(request).read();
	jsonResponse = json.loads(response);

	vim.current.buffer[0] = "Results for word: \"" + curWord + "\""
	vim.current.buffer.append(40*'=')

	for item in jsonResponse:
		repoName = item.get('repoName')
		repo = item.get('repo')
		filename = item.get('file')
		code = item.get('code')

		vim.current.buffer.append("%s: [%s]"%(repoName.encode('ascii', 'ignore'), filename.encode('ascii', 'ignore')))

		multiLineCode = code.encode('ascii', 'ignore').split('\n')
		for line in multiLineCode:
			vim.current.buffer.append("%s"%line)

		vim.current.buffer.append(40*'-')

	vim.current.buffer.append(40*'+')
		
except Exception, e:
	print e

EOF

endfunction

nmap <silent> <C-L> :call <SID>open_github()<CR>
nmap <silent> <C-K> :call <SID>open_github_python()<CR>
