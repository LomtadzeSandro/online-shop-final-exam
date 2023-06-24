const popularItemsEL = document.querySelector('.popular__items');
const catalogItemsEL = document.querySelector('.catalog__items');
const productEl = document.querySelector('.product__inner');
const basket = document.querySelector('.basket');
const addToBasketBtn = document.querySelector('.product__add');

let products = null;
let product = null;



if(popularItemsEL) {
  let popular = null;
  
  renderPopular();
  
  
  async function getPopularProducts() {
    if(popular) return popular;
  
    products = await getAllProducts();
    popular = products.sort((a, b) => b.rating.count - a.rating.count).slice(0, 8);

    return popular;
  }


  async function renderPopular() {
    popular = await getPopularProducts();
    popularItemsEL.innerHTML = getProductsHtml(popular);
  }
}



if(catalogItemsEL) {
  renderCatalog();

  async function renderCatalog() {
    products = await getAllProducts();
    catalogItemsEL.innerHTML = getProductsHtml(products);
  }
}



if(basket) {
  const basketOpenBtn = document.querySelector('.btn-basket-open');
  const basketCloseBtn = basket.parentElement.querySelector('.basket__close');

  basketOpenBtn.addEventListener('click', toggleBasket);
  if(basketCloseBtn) basketCloseBtn.addEventListener('click', closeBasket);
  basket.addEventListener('click', handleBasketClick);

  renderBasket();
}

if(addToBasketBtn) {
  addToBasketBtn.addEventListener('click', () => addToBasket(product));
}



if(productEl) {
  const productId = new URLSearchParams(window.location.search).get('id');
  
  (async () => {
    await renderProductById(productId);
    
    const addToBasketBtn = document.querySelector('.product__add');
    addToBasketBtn.addEventListener('click', () => addToBasket(product));
  })();
  

  async function getProductById(id) {
    if(product) return product;
  
    const response = await fetch('https://fakestoreapi.com/products/' + id);
    const result = await response.json();
  
    product = result;
  
    return result;
  }


  async function renderProductById(id) {
    product = await getProductById(id);

    const priceSplitted = String(product.price).split('.');
    
    const html = `
    <h1 class='product__title title title-lg'>${product.title}</h1>
    <div class='product__body'>
      <div class='product__image-wrapper'>
        <img src='${product.image}' alt='' class='product__image img-responsive'>
      </div>
      <div class='product__info'>
        <div class='product__category text'>Category: ${product.category}</div>
        <p class='product__description text'>${product.description}</p>
        <div class='product__price price'>
          <span class='currency'>$</span>
          <span class='price__whole'>${priceSplitted[0]}</span>
          <span class='price__fraction'>.${priceSplitted[1] ?? '00'}</span>
        </div>
        <div class='product__actions'>
          <button class='product__buy btn' type='button'>Buy</button>
          <button class='product__add btn' type='button'>Add to basket</button>
        </div>
      </div>
    </div>
    `;

    productEl.innerHTML = html;
  }
}



async function getAllProducts() {
  if(products) return products;

  const response = await fetch('https://fakestoreapi.com/products');
  const result = await response.json();

  return result;
}


function getProductsHtml(products) {
  let html = '';
  products.forEach(item => {
    const priceSplitted = String(item.price).split('.');
    html += `
    <li class='popular__item item-catalog'>
      <a href='./product.html?id=${item.id}' class='item-catalog__link item-catalog__img-wrapper'>
        <img class='item-catalog__img img-responsive' alt src="${item.image}">
      </a>
      <a href='./product.html?id=${item.id}' class='item-catalog__link item-catalog__title-link'>
        <h3 class='item-catalog__title title title-sm'>${item.title}</h3>
      </a>
      <div class='item-catalog__price price'>
        <span class='currency'>$</span>
        <span class='price__whole'>${priceSplitted[0]}</span>
        <span class='price__fraction'>.${priceSplitted[1] ?? '00'}</span>
      </div>
    </li>
    `;
  })

  return html;
}



function saveBasket() {
  localStorage.setItem('basket', basket.innerHTML);
}


function getBasket() {
  return localStorage.getItem('basket');
}


function renderBasket() {
  const basketHtml = getBasket();
  if(basketHtml && basketHtml !== '') basket.innerHTML = basketHtml;
}


function handleBasketClick(e) {
  const removeBtn = e.target.closest('.item-basket__remove');
  if(!removeBtn) return;

  const item = e.target.closest('.item-basket');
  
  item.classList.add('removing');

  message('Product has been removed from the basket')

  setTimeout(() => {
    item.remove();

    if(!basket.children.length) {
      localStorage.removeItem('basket');
      basket.innerHTML = "<div class='basket__empty'>Nothing is in basket</div>";
    }
    else saveBasket();
    
  }, 200);
}


function toggleBasket() {
  basket.parentElement.classList.toggle('open');
}


function closeBasket() {
  basket.parentElement.classList.remove('open');
}


function addToBasket(product) {
  const priceSplitted = String(product.price).split('.');
  const html = `
  <li class='basket__item item-basket'>
    <a class='item-basket__link' href='./product.html?id=${product.id}' ></a>
    <div class='item-basket__img-wrapper'>
      <img class='item-basket__img img-responsive' src='${product.image}' alt='' />
    </div>
    <h3 class='item-basket__title title title-sm'>${product.title}</h3>
    <div class='item-catalog__price price'>
      <span class='item-basket__currency currency'>$</span>
      <span class='item-basket__price-whole price__whole'>${priceSplitted[0]}</span>
      <span class='item-basket__price-fraction price__fraction'>.${priceSplitted[1] ?? '00'}</span>
      <button class='item-basket__remove btn' type='button'>Remove</button>
    </div>
  </li>
  `;

  if(!getBasket()) basket.innerHTML = html;
  else basket.insertAdjacentHTML('beforeend', html);

  saveBasket();
  message('Product has been added to basket');
}


function message(text, duration = 5000) {
  if(duration < 2000) duration = 2000;
  
  const messageElem = document.createElement('div');
  messageElem.classList.add('message');
  messageElem.textContent = text;
  document.body.append(messageElem);

  setTimeout(() => {
    messageElem.classList.add('closing');
  }, duration - 1000);

  setTimeout(() => {
    messageElem.remove();
  }, duration);
}
