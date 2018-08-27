VK.init({
	apiId: 6673457
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

let targetObj = {};
let sourceObj = {};

auth().
	then(() => {
		return callApi('friends.get', {order: name, fields: 'photo_50'});
	})
	.then(list => {
		const template = document.querySelector('#template').textContent;
		const render = Handlebars.compile(template);
		list.items.length = 10;
		convert(list.items);
		const html = render(list);
		const result = document.querySelector('.friends-list');
		result.innerHTML = html;
		sourceObj = convert(list.items);
	});


const sourceZone = document.querySelector('.source');
const targetZone = document.querySelector('.selected');

makeDnD([sourceZone, targetZone]);

function makeDnD(zones) {
    let currentDrag;
	sourceZone.addEventListener('dragstart', (e) => {
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
                moveDataToObj(sourceObj, targetObj, id);
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
			moveDataToObj(sourceObj, targetObj, currentNode.dataset.id);
		} else if (btn.parentNode.parentNode.classList.contains('friends-list--selected')) {
			sourceZone.querySelector('.friends-list').appendChild(currentNode);
			moveDataToObj(targetObj, sourceObj, currentNode.dataset.id);


		}
	}
}

let filters = document.querySelectorAll('.friends__filter-input');

filters.forEach(filter => {
	filter.addEventListener('keyup', e => {
		console.log(targetArray);
	})
})

function convert(array) {
	let result = {};
	array.forEach((item, i) => {
		result[item.id] = {
			first_name: item.first_name,
			last_name: item.last_name,
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

document.querySelector('.footer__btn').addEventListener('click', () => {
	console.log(sourceObj);
	console.log(targetObj);
	console.log(convertToArray(targetObj));
	

})