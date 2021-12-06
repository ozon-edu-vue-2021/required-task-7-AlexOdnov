'use strict';

const app = document.querySelector('#container');
const contactsList = document.querySelector('.contacts-list');
const details = document.querySelector('#details');
const backButton = document.querySelector('.back');
const detailsName = document.querySelector('.name');
const detailsListTemplate = document.querySelector('#details-list');
const contactTemplate = document.querySelector('#contact');
const peopleTemplate = document.querySelector('#people');

async function fetchData(url) {
  const res = await fetch(url);
  const data = await res.json();
  return data;
}

function transformData(dataList) {
  const res = {
    data: {},
    nonFriend: {},
    mostPopular: [],
  };

  const popularity = {};
  const allId = [];

  dataList.forEach((el) => {
    res.data[el.id] = el;
    allId.push(el.id);
    const persPopular = { count: 0, id: el.id, name: el.name };
    res.mostPopular.push(persPopular);
    popularity[el.id] = persPopular;
  });

  for (const id in res.data) {
    res.data[id].friends.forEach((friendId) => {
      popularity[friendId].count++;
    });
    res.nonFriend[id] = allId.filter((el) => {
      return !res.data[id].friends.includes(el) && Number(id) !== el;
    });
  }

  res.mostPopular = res.mostPopular
    .sort(
      (a, b) =>
        (a.count < b.count) - (b.count < a.count) ||
        (b.name < a.name) - (a.name < b.name)
    )
    .map((el) => el.id);

  return res;
}

function renderContactsList(dataList) {
  const contactsListFragment = document.createDocumentFragment();

  dataList.forEach((el) => {
    const contact = contactTemplate.content.cloneNode(true);
    const li = contact.querySelector('li');
    const text = contact.querySelector('strong');
    li.dataset.id = el.id;
    text.textContent = el.name;
    contactsListFragment.append(contact);
  });

  contactsList.append(contactsListFragment);
}

function renderDetails({ data, mostPopular, nonFriend }, id) {
  const detailsListFragment = detailsListTemplate.content.cloneNode(true);
  const friends = detailsListFragment.querySelector('#friends');
  const nonFriends = detailsListFragment.querySelector('#non-friends');
  const popular = detailsListFragment.querySelector('#popular');

  const friendsFragment = createPeoplesFragment(data, data[id].friends);
  const nonFriendsFragment = createPeoplesFragment(
    data,
    nonFriend[id].slice(0, 3)
  );
  const popularFragment = createPeoplesFragment(data, mostPopular.slice(0, 3));
  friends.after(friendsFragment);
  nonFriends.after(nonFriendsFragment);
  popular.after(popularFragment);

  detailsName.textContent = data[id].name;
  details.append(detailsListFragment);
}

function createPeoplesFragment(data, idList) {
  const fragment = document.createDocumentFragment();

  idList.forEach((id) => {
    const people = peopleTemplate.content.cloneNode(true);
    const text = people.querySelector('span');
    text.textContent = data[id].name;
    fragment.append(people);
  });

  return fragment;
}

function openDetails(data, { target }) {
  const li = target.closest('[data-id]');
  if (li) {
    app.classList.add('details');
    const id = Number(li.dataset.id);
    renderDetails(data, id);
  }
}

function closeDetails() {
  app.classList.remove('details');
  details.innerHTML = '';
}

const pageInit = async () => {
  const dataList = await fetchData('../data.json');
  const data = transformData(dataList);
  contactsList.addEventListener('click', (e) => openDetails(data, e));
  backButton.addEventListener('click', closeDetails);
  renderContactsList(dataList);
};

pageInit();
