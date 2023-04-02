const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '34744066-258cb09888b79ff1454a5a6f0';

import axios from 'axios';

export class PixabayAPI {
  #BASE_URL = 'https://pixabay.com/api/';
  #API_KEY = '34744066-258cb09888b79ff1454a5a6f0';

  page = 1;
  per_page = 40;
  q = null;

  async fetchPhotos() {
    try {
      return await axios.get(`${this.#BASE_URL}`, {
        params: {
          key: this.#API_KEY,
          q: this.q,
          orientation: 'horizontal',
          image_type: 'photo',
          safesearch: true,
          page: this.page,
          per_page: this.per_page,
        },
      });
    } catch (err) {
      throw new Error(err.message);
    }
  }
}


