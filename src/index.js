import throttle from 'lodash.throttle';

import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import './css/styles.css';

import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { PixabayAPI } from './pixabay-api';

import createGalleryCards from './templates/gallery-card.hbs';

const searchFormEl = document.querySelector('.js-search-form');
const galleryListEl = document.querySelector('.gallery');
const loadMoreBtnEl = document.querySelector('.js-load-more');
const endOfListEl = document.querySelector('.end-of-list');

const pixabayApi = new PixabayAPI();
const endOfList = `
  <p><b>We're sorry, but you've reached the end of search results.</b></p>
`;

let simpleLightBoxGallery = null;

const handleSearchFormSubmit = async event => {
  event.preventDefault();
  endOfListEl.innerHTML = '';
  galleryListEl.innerHTML = '';
  const searchQuery = event.currentTarget.elements['searchQuery'].value;
  pixabayApi.q = searchQuery;
  pixabayApi.page = 1;


  try {
    const { data } = await pixabayApi.fetchPhotos();
    // console.log(data);
    if (data.total === 0) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }

    Notify.success(`Hooray! We found ${data.totalHits} images.`);

    galleryListEl.innerHTML = createGalleryCards(data.hits);
    loadMoreBtnEl.classList.remove('is-hidden');
    simpleLightBoxGalleryInit();

    const pagesSum = Math.ceil(data.totalHits / pixabayApi.per_page);
    if (pixabayApi.page >= pagesSum) {
      loadMoreBtnEl.classList.add('is-hidden');
      Notify.info("We're sorry, but you've reached the end of search results.");
      endOfListEl.innerHTML = endOfList;
    }
  } catch (err) {
    console.log(err);
  }
};

const handleLoadMoreBtnClick = async () => {
  pixabayApi.page += 1;

  try {
    const { data } = await pixabayApi.fetchPhotos();

    galleryListEl.insertAdjacentHTML(
      'beforeend',
      createGalleryCards(data.hits)
    );
    smoothScroll();
    simpleLightBoxGalleryRefresh();

    const pagesSum = Math.ceil(data.totalHits / pixabayApi.per_page);

    if (pixabayApi.page >= pagesSum) {
      loadMoreBtnEl.classList.add('is-hidden');
      Notify.info("We're sorry, but you've reached the end of search results.");
      endOfListEl.innerHTML = endOfList;
    }
  } catch (err) {
    console.log(err);
  }
};

const handleScrollDown = async () => {
  pixabayApi.page += 1;

  try {
    const { data } = await pixabayApi.fetchPhotos();

    galleryListEl.insertAdjacentHTML(
      'beforeend',
      createGalleryCards(data.hits)
    );

    simpleLightBoxGalleryRefresh();

    const pagesSum = Math.ceil(data.totalHits / pixabayApi.per_page);

    if (pixabayApi.page >= pagesSum) {
      loadMoreBtnEl.classList.add('is-hidden');
      Notify.info("We're sorry, but you've reached the end of search results.");
      endOfListEl.innerHTML = endOfList;
    }
  } catch (err) {
    console.log(err);
  }
};

searchFormEl.addEventListener('submit', handleSearchFormSubmit);
loadMoreBtnEl.addEventListener('click', handleLoadMoreBtnClick);

function simpleLightBoxGalleryInit() {
  simpleLightBoxGallery = new SimpleLightbox('.gallery a', {
    captionsData: 'alt',
    captionDelay: 250,
  });
}

function simpleLightBoxGalleryRefresh() {
  simpleLightBoxGallery.refresh();
}

function smoothScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();
  // console.log(cardHeight);

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function checkPosition() {
  const height = document.body.offsetHeight;
  const screenHeight = window.innerHeight;
  const scrolled = window.scrollY;
  console.log(scrolled);
  const threshold = height - screenHeight / 4;
  const position = scrolled + screenHeight;

  if (position >= threshold && pixabayApi.page > 1) {
    handleScrollDown();
  }
}

(() => {
  window.addEventListener('scroll', throttle(checkPosition, 250));
  window.addEventListener('resize', throttle(checkPosition, 250));
})();
