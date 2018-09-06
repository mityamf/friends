VK.init({
	apiId: 6681223
});

function auth() {
	return new Promise((resolve, reject) => {
		VK.Auth.login(response => {
			if (response.session) {
				resolve();
			} else {
				reject(new Error('Ошибка авторизации'));
			}
		}, 2);
	});
}

function callApi(method, params) {
	params.v = '5.80';

	return new Promise((resolve, reject) => {
		VK.api(method, params, (data) => {
			if (data.error) {
				reject(data.error);
			} else {
				resolve(data.response);
			}
		});
	})
}

let sourceArr = {};
let selectedArr = {
	items: []
}

auth().
	then(() => {
		return callApi('friends.get', {order: name, fields: 'photo_50'});
	})
	.then(list => {
		let savedFriends = localStorage.getItem('selectedFriends');
		if (savedFriends) {
			selectedArr = JSON.parse(savedFriends);
			renderFriends(selectedArr, '.friends-list--selected');
			sourceArr = deduction(list, selectedArr);
			renderFriends(sourceArr, '.friends-list--source');
		} else {
			renderFriends(list, '.friends-list--source');	
			sourceArr = list;
		}
		
		let filters = document.querySelectorAll('.friends__filter-input');
		filters.forEach( filter => {		
			const sourceName = filter.parentElement.classList[1].split('--')[1];
			let data = eval(sourceName + 'Arr');
			filter.addEventListener('keyup', filterFunction.bind(null, data, sourceName));
		});
	});

function renderFriends(data, selector) {
	const result = document.querySelector(selector);
	result.innerHTML = '';
	const template = document.querySelector('#template').textContent;
	const render = Handlebars.compile(template);
	//list.items.length = 10; // не забыть удалить!
	const html = render(data);
	
	result.innerHTML = html;
}

const sourceZone = document.querySelector('.source');
const targetZone = document.querySelector('.selected');

makeDnD([sourceZone, targetZone]);

function makeDnD(zones) {
    let currentDrag;
	sourceZone.addEventListener('dragstart', (e) => {
		e.dataTransfer.setData("text/plain", 'node');
        currentDrag = { source: sourceZone, node: e.target };
    });

    zones.forEach(zone => {
        zone.addEventListener('dragover', e => e.preventDefault());
    });

    targetZone.addEventListener('drop', (e) => {
        if (currentDrag) {
            e.preventDefault();

            if (currentDrag.source !== targetZone) {
                targetZone.querySelector('.friends-list').appendChild(currentDrag.node);
                const id = currentDrag.node.dataset.id;
                //selectedArr.push(id);
                moveDataToArray(sourceArr, selectedArr, id);
            }

            currentDrag = null;
        }
    });
}

document.querySelector('.main').addEventListener('click', elementClick);
function elementClick(e) {
	if (e.target.classList.contains('friends-list__btn')) {
		let btn = e.target;
		let currentNode = btn.parentNode;
		if (btn.parentNode.parentNode.classList.contains('friends-list--source')) {
			targetZone.querySelector('.friends-list').appendChild(currentNode);
			//selectedArr.push(currentNode.dataset.id);
			moveDataToArray(sourceArr, selectedArr, currentNode.dataset.id);
		} else if (btn.parentNode.parentNode.classList.contains('friends-list--selected')) {
			sourceZone.querySelector('.friends-list').appendChild(currentNode);
			//deleteRecord(selectedArr, currentNode.dataset.id);	
			moveDataToArray(selectedArr, sourceArr, currentNode.dataset.id);		
		}
	}
}

function deduction(source, subtrahend) {
	for (let i = 0; i < subtrahend.items.length; i++) {
		deleteRecord(source.items, subtrahend.items[i].id);
	}

	return source;
}



function filterFunction(data, source, e) {
	let chunk = e.target.value;

	let filtered = {
		items: []
	};
	data.items.forEach(item => {
		if (isMatching(item.first_name, chunk) || isMatching(item.last_name, chunk)) {
			filtered.items.push(item);
		}
	});
	let selector = '.friends-list--' + source.toString();
	renderFriends(filtered, selector);


}

function isMatching(full, chunk) {
    if (full.toLowerCase().indexOf(chunk.toLowerCase()) >= 0) {
        return true;
    }
}
/*
function convert(array) {
	let result = {};
	array.forEach((item, i) => {
		result[item.id] = {
			name: `${item.first_name} ${item.last_name}`,
			photo_50: item.photo_50
		};
	})
	return result;
}
function convertToArray(obj) {
	let result = [];
	for (let key in obj) {
		let item = {
			id: key,
			first_name: obj[key]['first_name'],
			last_name: obj[key]['last_name'],
			photo_50: obj[key]['photo_50']

		}
		result.push(item);
	}
	return result;
}

function moveDataToObj(source, target, id) {
    target[id] = {};
    for (let key in source[id]) {
    	target[id][key] = source[id][key];
    }
    delete source[id];
}
*/
function moveDataToArray(source, target, id) {
	source.items.forEach((item, i) => {
		if (item.id == id) {
			target.items.push(item);
			source.items.splice(i, 1);
		}
	})
}

document.querySelector('.footer__btn').addEventListener('click', () => {
	const data = JSON.stringify(selectedArr);
	localStorage.setItem('selectedFriends', data);
});

function deleteRecord(arr, id) {
	arr.forEach((item, i) => {
		if (item.id == id) {
			arr.splice(i, 1);
		}
	})
}