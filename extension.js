// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const fetch = require('node-fetch');
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "code-plus" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('code-plus.searchOverflow', async function () {
		// Create Input Box and wait for query.
		let query = await vscode.window.showInputBox();

		// get data from StackOverflow API
		// Sample data should look something like
		// let res = [{item:{label:"sampleItem1"},url:"https:/www.google.com"},{item:{label:"sampleItem2"},url:"https:/www.stackoverflow.com"}]
		let data = await getData(query);

		// Map label to url
		var mp = new Map(data.map(i=>[i.item.label,i.url]))

		// Create Quick Pick
		var quickPick = vscode.window.createQuickPick();
		// Sample Output = [{label:"sampleItem1"},{label:"sampleItem2"}]
		quickPick.items = data.map(i=>i.item);
		quickPick.onDidChangeSelection(() =>{
			vscode.env.openExternal(vscode.Uri.parse(mp.get(quickPick.selectedItems[0].label)));
		});
		quickPick.show();
	});

	async function getData(query){
		let url ="https://api.stackexchange.com/2.2/search/advanced?order=desc&sort=relevance&q="+query+"&site=stackoverflow";
		if(vscode.window.activeTextEditor){
			let lang=vscode.window.activeTextEditor.document.languageId;
			if(lang=="cpp") lang="c++";
			url += '&tagged='+lang;
		}
		console.log(url);
		// @ts-ignore
		let response = await fetch(url);
		let json = await response.json();
		console.log(json);
		let data = [];
		for(let i=0; i<json.items.length; i++){
			// Title from api in form of HTML convert using decodeHTMLEntities
			// Why does this code using random strings print &quot;hello world&quot;?
			var heading;
			if(json.items[i].is_answered) heading = "✔️ "+decodeHTMLEntities(json.items[i].title)
			else heading = "❌ "+decodeHTMLEntities(json.items[i].title)
			data.push({item:{label:heading},url:json.items[i].link})
		}
		return data; 
	}

	function decodeHTMLEntities(text) {
		var entities = [
			['amp', '&'],
			['apos', '\''],
			['#x27', '\''],
			['#x2F', '/'],
			['#39', '\''],
			['#47', '/'],
			['lt', '<'],
			['gt', '>'],
			['nbsp', ' '],
			['quot', '"']
		];
	
		for (var i = 0, max = entities.length; i < max; ++i) 
			text = text.replace(new RegExp('&'+entities[i][0]+';', 'g'), entities[i][1]);
	
		return text;
	}

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
