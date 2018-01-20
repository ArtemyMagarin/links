var detect = function(callback) {
    let input = document.getElementById('file-input');
    let reader = new FileReader();
    reader.onload = function() {
        callback(reader.result)
    }
    reader.readAsText(input.files[0]);                  
};

var processingData = function(text) {
    let bad_urls = document.getElementById('stop-list').value
                        .split('\n')
                        .map((item)=>{
                            return item.replace(/(https?)?(ftp)?(:\/\/)?(www\.)?/ig,"")
                        });

    let exp = /(https?)?(ftp)?(:\/\/)?(www)?\.?([a-zA-Zа-яА-ЯёЁ0-9-]+\.)+?[a-zрф]{2,3}[/?]?[a-zA-Zа-яА-ЯёЁ0-9-=%&.,/_?]*(?=["' ]|\n)/ig;                
    
    let raw_links = text.match(exp);

    links = raw_links.map((item) => {
        return item.replace(/(https?)?(ftp)?(:\/\/)?(www\.)?/ig,"")
    })

    links_tree = getLinksTree(links);
    censored_links_tree = censor(links_tree, bad_urls);

    render(censored_links_tree);
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

var getAccordionElement = function(header, links) {
    let title = header;
    header = header.replace(/[^\w\dа-яё]/ig, '');

    let card = document.createElement("div");
    card.className = "card";

    let cardHeader = document.createElement("div");
    cardHeader.className = "card-header";
    cardHeader.setAttribute("role", "tab");
    cardHeader.setAttribute("id", "heading_"+header);

    let cardHeaderTitle = document.createElement("h5");
    cardHeaderTitle.className = "mb-0";

    let cardHeaderTitleLink = document.createElement("a");
    cardHeaderTitleLink.setAttribute('data-toggle', 'collapse');
    cardHeaderTitleLink.setAttribute('data-parent', '#d_main');
    cardHeaderTitleLink.setAttribute('href', '#collapse_'+header);
    cardHeaderTitleLink.setAttribute('aria-expanded', 'true'); // true - open, false - close
    cardHeaderTitleLink.setAttribute('aria-controls', '#collapse_'+header);
    cardHeaderTitleLink.innerText = title;

    let cardHeaderTitleCounter = document.createElement('span');
        cardHeaderTitleCounter.className = 'badge badge-info';
        cardHeaderTitleCounter.style.float = "right";
        cardHeaderTitleCounter.innerText = links.reduce((count, item)=>{
            return count+=item[1]
        }, 0);



    cardHeaderTitle.appendChild(cardHeaderTitleLink);
    cardHeaderTitle.appendChild(cardHeaderTitleCounter);
    cardHeader.appendChild(cardHeaderTitle);
    card.appendChild(cardHeader);

    let cardBody = document.createElement('div');
    cardBody.className = "collapse";
    cardBody.setAttribute('id', 'collapse_'+header);
    cardBody.setAttribute('role', 'tabpanel');
    cardBody.setAttribute('aria-labelledby', 'heading_'+header);

    links.forEach((item)=>{
        let cardBodyBlock = document.createElement('div');
        cardBodyBlock.className = "card-block";

        let cardBodyBlockLink = document.createElement('a');
        cardBodyBlockLink.href = "#";
        cardBodyBlockLink.innerText = item[0];


        let cardBodyBlockCounter = document.createElement('span');
        cardBodyBlockCounter.className = 'badge badge-info';
        cardBodyBlockCounter.style.float = "right";
        cardBodyBlockCounter.style.fontSize = "1em";
        cardBodyBlockCounter.innerText = item[1];

        cardBodyBlock.appendChild(cardBodyBlockLink)
        cardBodyBlock.appendChild(cardBodyBlockCounter)
        cardBody.appendChild(cardBodyBlock);
    })

    card.appendChild(cardBody);

    return card
}


function render(obj) {
    let accordion = document.getElementById('d_main');
    for (key in obj) {
        accordion.appendChild(getAccordionElement(key, obj[key]))
    }
};  

var censor = function(links_tree, bad_urls) {
    links_tree = JSON.parse(JSON.stringify(links_tree)); //make a copy 
    
    bad_urls.forEach((bad_url) => {
        for (key in links_tree) {
            links_tree[key] = links_tree[key].map((item)=>{
                if (bad_url && ~item[0].indexOf(bad_url)) {
                    return ['[censored]', item[1]]
                } else {
                    return item
                }
            })
        }   
    });

    return links_tree
}
