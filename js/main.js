$('#go-step3').on('click', (event)=>{
    event.preventDefault();
    detect(processingData)
})


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
    
    let links_info = {};  
    let links = [];  
    let raw_links = text.match(exp).map((item)=>{
        return item.replace(/\/$/, '')
    });

    raw_links.forEach((item)=>{
        links_info[item] = [item.replace(/(https?)?(ftp)?(:\/\/)?(www\.)?/ig,"")];
        item.replace(/(https?)?(ftp)?(:\/\/)?(www\.)?/ig,"").replace(/\/$/i, '')&&links.push(item.replace(/(https?)?(ftp)?(:\/\/)?(www\.)?/ig,"").replace(/\/$/i, ''))
    })

    links_tree = getLinksTree(links);
    censored_links_tree = censor(links_tree, bad_urls, links_info);

    render(censored_links_tree);

    $('#d_main').on('click', 'a.changeLink', (event)=>{

        div1 = document.createElement('div'),
        input = document.createElement('input'),
        div2 = document.createElement('div'),
        button = document.createElement('button')

        div1.className = "input-group";      
        input.setAttribute('type', 'text');
        input.setAttribute('class', 'form-control')
        input.setAttribute('placeholder', event.target.innerText);
        input.setAttribute('value', event.target.innerText);
        input.setAttribute('aria-label', event.target.innerText);
        input.setAttribute('data-value', event.target.innerText);
        div2.className = "input-group-append";
        button.setAttribute('type', 'button');
        button.setAttribute('class', 'btn btn-primary save')
        button.innerText = "Replace"

        div2.appendChild(button);
        div1.appendChild(input);
        div1.appendChild(div2);

        $(event.target).replaceWith(div1);

    })

    $('#d_main').on('click', 'button.save', (event)=>{
        let input = $(event.target).closest('.input-group').find('input');
        let old_link = $(input).attr('data-value');
        let new_link = $(input).val();
        console.log(old_link, new_link)

        replaceLink(links_info, old_link, new_link);

        let cardBodyBlockLink = document.createElement('a');
        cardBodyBlockLink.className = "changeLink mb-1 mt-1"
        cardBodyBlockLink.href = "#";
        cardBodyBlockLink.innerText = new_link;
        cardBodyBlockLink.style.fontSize = '1.3em'

        $(event.target).closest('.input-group').replaceWith(cardBodyBlockLink);
        console.log(links_info)

    })


    $('#go-step4').on('click', (event)=>{
        event.preventDefault();
        text = getReplacedText(text, links_info);
        console.log(links_info)
        var textFile = null,
            makeTextFile = function (text) {
            var data = new Blob([text], {type: 'text/plain'});

            if (textFile !== null) {
              window.URL.revokeObjectURL(textFile);
            }

            textFile = window.URL.createObjectURL(data);

            return textFile;
        };

        let downloadLink = document.getElementById('save');
        downloadLink.href = makeTextFile(text);
        downloadLink.setAttribute('download', 'file.txt')

    })



}

var getLinksTree = function(links) {
    links_tree = {};

    links_tree = links
        .map((item) => {
            return item.replace(/[\/?]+.+/ig,'').match(/[\w\dа-яА-ЯёЁ]+\.[\wа-яА-ЯёЁ]{2,6}$/ig)
        })
        .reduce((data, current)=>{
            current==null || (data[current] = []);
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

    let cardHeaderTitle = document.createElement("h3");
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

    let cardBodyBlock = document.createElement('div');
        cardBodyBlock.className = "card-block";

    links.forEach((item)=>{
        let row = document.createElement('div'),
            col1 = document.createElement('div'),
            col2 = document.createElement('div');

        row.className = "row mb-2";
        col1.className = 'col-10';
        col2.className = 'col-2';

        let cardBodyBlockLink = document.createElement('a');
        cardBodyBlockLink.className = "changeLink mb-1 mt-1"
        cardBodyBlockLink.href = "#";
        cardBodyBlockLink.innerText = item[0];
        cardBodyBlockLink.style.fontSize = '1.3em'

        col1.appendChild(cardBodyBlockLink)


        let cardBodyBlockCounter = document.createElement('span');
        cardBodyBlockCounter.className = 'badge badge-info';
        cardBodyBlockCounter.style.float = "right";
        cardBodyBlockCounter.style.fontSize = "1.3em";
        cardBodyBlockCounter.innerText = item[1];

        col2.appendChild(cardBodyBlockCounter);

        row.appendChild(col1);
        row.appendChild(col2);

        cardBodyBlock.appendChild(row)    
    })

    cardBody.appendChild(cardBodyBlock);
    card.appendChild(cardBody);

    return card
}


function render(obj) {
    let accordion = document.getElementById('d_main');
    accordion.innerHTML = "";
    for (key in obj) {
        accordion.appendChild(getAccordionElement(key, obj[key]))
    }
};  

var censor = function(links_tree, bad_urls, links_info) {
    links_tree = JSON.parse(JSON.stringify(links_tree)); //make a copy 
    
    bad_urls.forEach((bad_url) => {
        for (key in links_tree) {
            links_tree[key] = links_tree[key].map((item)=>{
                if (bad_url && ~item[0].indexOf(bad_url)) {

                    for (link in links_info) {
                        if (links_info[link][0] === item[0]) {
                            links_info[link][1] = '[censored]'
                        }
                    }

                    return ['[censored]', item[1]]
                } else {

                    for (link in links_info) {
                        if (links_info[link][0] === item[0]) {
                            links_info[link][1] = item[0]
                        }
                    }

                    return item
                }
            })
        }   
    });

    return links_tree
}

var replaceLink = function(links_info, old_link, new_link) {
    if (link !== "[censored]") {
        for (key in links_info) {
            if (links_info[key][0] === old_link) {
                links_info[key][1] = new_link
            }
        }
    }
}

var getReplacedText = function(text, links_info) {
    for (key in links_info) {

        if (!links_info[key][1] || links_info[key][0] == links_info[key][1]) {
            continue
        }
        
        exp = "(?<=[\"' ]|\n)"+key+"(?=[\"' ]|\n)";
        regexp = new RegExp(exp, 'ig')

        if (links_info[key][1] !== '[censored]' && ~links_info[key][1].search(/(https?)?(ftp)?(:\/\/)?(www)?\.?([a-zA-Zа-яА-ЯёЁ0-9-]+\.)+?[a-zрф]{2,3}[/?]?[a-zA-Zа-яА-ЯёЁ0-9-=%&.,/_?]*/i)) {
            sub = ~links_info[key][1].indexOf(/^https?/ig) ? "" : (key.match(/https?:\/\//ig)||['http://'])[0];
            text = text.replace(regexp, sub+links_info[key][1])
        } else {
            text = text.replace(regexp, links_info[key][1])
        }

    };

    return text
}