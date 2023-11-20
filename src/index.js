import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
document.addEventListener('DOMContentLoaded', () => {
  let page = 1;
  let totalHits = 0;
  let totalPages = 0;
  const searchForm = document.getElementById('search-form');
  const gallery = document.querySelector('.gallery');
  const loadMoreBtn = document.querySelector('.load-more');
  const fetchData = async (query, pageNum) => {
    try {
      const apiKey = '40791678-21bd493143af10c7aa2f36279';
      const perPage = 40;
      const url = `https://pixabay.com/api/?key=${apiKey}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${pageNum}&per_page=${perPage}`;
      const response = await axios.get(url);
      if (response.status !== 200) {
        throw new Error('');
      }
      totalHits = response.data.totalHits;
      totalPages = Math.ceil(totalHits / perPage);
      return response.data.hits;
    } catch (error) {
      console.error('Error fetching data:', error);
      return [];
    }
  };
  let lightbox;
  const renderImages = images => {
    if (images.length === 0 && page === 1) {
      Notify.warning(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    } else if (images.length === 0 && page > 1) {
      loadMoreBtn.style.display = 'none';
      Notify.warning(
        "We're sorry, but you've reached the end of search results."
      );
      return;
    }
    if (page === 1) {
      Notify.success(`Hooray! We found ${totalHits} images.`);
    }
    if (lightbox) {
      lightbox.destroy();
    }
    lightbox = new SimpleLightbox('.gallery a', {
      captionsData: 'alt',
      captionDelay: 250,
    });
    images.forEach(image => {
      const photoCard = document.createElement('div');
      photoCard.classList.add('photo-card');
      const a = document.createElement('a');
      a.href = image.largeImageURL;
      a.setAttribute('data-lightbox', 'photos');
      a.setAttribute('data-title', image.tags);
      const img = document.createElement('img');
      img.src = image.webformatURL;
      img.alt = image.tags;
      img.loading = 'lazy';
      const infoDiv = document.createElement('div');
      infoDiv.classList.add('info');
      const infoItems = ['Likes', 'Views', 'Comments', 'Downloads'];
      infoItems.forEach(item => {
        const p = document.createElement('p');
        p.classList.add('info-item');
        p.innerHTML = `<b>${item}:</b> ${image[item.toLowerCase()]}`;
        infoDiv.appendChild(p);
      });
      photoCard.appendChild(a);
      a.appendChild(img);
      photoCard.appendChild(infoDiv);
      gallery.appendChild(photoCard);
    });
    lightbox.refresh();
  };
  const handleSearch = async event => {
    event.preventDefault();
    const searchQuery = searchForm.elements.searchQuery.value.trim();
    if (searchQuery) {
      gallery.innerHTML = '';
      page = 1;
      const images = await fetchData(searchQuery, page);
      renderImages(images);
      if (images.length > 0) {
        loadMoreBtn.style.display = 'block';
      } else {
        loadMoreBtn.style.display = 'none';
        Notify.warning('No results found. Please try again.');
      }
      if (totalPages === 1) {
        loadMoreBtn.style.display = 'none';
        Notify.warning(
          "We're sorry, but you've reached the end of search results."
        );
      }
    } else {
      Notify.warning('Please enter a search query.');
    }
  };
  const handleLoadMore = async () => {
    page += 1;
    const searchQuery = searchForm.elements.searchQuery.value.trim();
    const images = await fetchData(searchQuery, page);
    if (images.length > 0) {
      renderImages(images);
    } else {
      loadMoreBtn.style.display = 'none';
      Notify.warning(
        "We're sorry, but you've reached the end of search results."
      );
    }
    if (page === totalPages) {
      loadMoreBtn.style.display = 'none';
      Notify.warning(
        "We're sorry, but you've reached the end of search results."
      );
    }
  };
  searchForm.addEventListener('submit', handleSearch);
  loadMoreBtn.addEventListener('click', handleLoadMore);
  loadMoreBtn.style.display = 'none';
});