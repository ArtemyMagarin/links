var detect = function(callback) {
	let input = document.getElementById('file-input');
	let reader = new FileReader();
	reader.onload = function() {
		callback(reader.result)
	}
	reader.readAsText(input.files[0]);					
};

var processingData = function(res) {
	let bad_urls = document.getElementById('stop-list').value.split('\n');
	let text = res;
	let exp = /(https?)?(ftp)?(:\/\/)?(www)?\.?([a-zA-Zа-яА-ЯёЁ0-9-]+\.)+?[a-zрф]{2,3}[/?]?[a-zA-Zа-яА-ЯёЁ0-9-=%&.,/_?]*(?=["' ]|\n)/ig;				
	
	let raw_links = text.match(exp);

	links = raw_links.map((item) => {
		return item.replace(/(https?)?(ftp)?(:\/\/)?(www\.)?/ig,"")
	})

	links_tree = getLinksTree(links);
	
	console.log(links_tree);
	interface(links_tree, 'main');
}

var getLinksTree = function(links) {
	links_tree = {};

	links_tree = links
		.map((item) => {
			return item.replace(/[\/?]+.+/ig,'').match(/[\w\dа-яА-ЯёЁ]{1,}\.[\wа-яА-ЯёЁ]{2,4}$/ig)
		})
		.reduce((data, current)=>{
			data[current] = [];
			return data
		}, {});

	links.forEach((item) => {
		for (key in links_tree) {
			if (~item.indexOf(key)) {
			  links_tree[key].push(item)
			}
		}	
	})

	for (key in links_tree) {
		temp = {};
		links_tree[key].forEach((item)=>{
			if (temp[item]) {
				temp[item] += 1
			} else {
				temp[item] = 1
			}
		});
		links_tree[key] = [];
		for (k in temp) {
			links_tree[key].push([k, temp[k]])
		}
	}

	return links_tree
}


function interface_number(array, id_name) {
	var new_element = "<div name='d_"+array[0]+"'><header>"+array[0]+"</header><count>"+array[1]+"</count></div>";
	$("div[name='d_"+id_name+"'").append(new_element);
}

function interface(array, id_name) {
	
	if (!Array.isArray(array)) {
		for (header in array) {					
			var new_element = "<div name='d_"+header+"'><header>"+header+"</header></div>";
			$("div[name='d_"+id_name+"'").append(new_element);									
			interface(array[header], header);
		}
	} else {
		for (header in array) {						
			if (typeof(array[header][1]) === "number") {							
				interface_number(array[header], id_name);
			} else {
				
				interface(array[header], id_name);
			}
		}
	}				
};