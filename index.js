async function wait(time) {
  return new Promise(resolve => setTimeout(resolve, time)); 
} 

function getVisible(elements) {
   return [...elements].filter(element => 
      element.getBoundingClientRect().width > 0 && element.getBoundingClientRect().height > 0);
}

window.addEventListener('beforeunload', function (e) {
  // Cancel the event
  e.preventDefault();
  // Chrome requires returnValue to be set
  e.returnValue = 'Sure you want to navigate?';
});

async function enhancePhotos(photos) {
   var i = 0;

   for (const [url, type] of Object.entries(photos)) {
      if (type !== 'photo') {
        continue;
      }

      var a = document.createElement('a');
      a.href =  url;
      a.innerHTML = "Link";
      
      document.body.appendChild(a);

      a.click();

      await wait(2000);  

      if (getVisible(document.querySelectorAll('[title="Turn on motion"]')).length === 0
        && getVisible(document.querySelectorAll('[title="Turn off motion"]')).length === 0) {

        try {
          getVisible(document.querySelectorAll('[title="Edit"]'))[0].click()

          await wait(2000);  

          getVisible(document.querySelectorAll('[data-items-in-row="3"] div[aria-posinset]'))[3].click();

          await wait(2000);  

          getVisible(document.querySelectorAll('[title="Zoom"] + button + button'))[0].click();

          await wait(4000); 
        } catch(e) {
          console.error('Could not process:', url);
        }
      } 

      getVisible(document.querySelectorAll('[aria-label="Back to photos & videos"]'))[0].click();

      await wait(2000);  

      console.log(`Processed (${++i})`, url);
   }
}

var max = 50;

async function getSelectedPhotos() {
  var text = getVisible(document.querySelectorAll('button[aria-label="Clear selection"]'))[0].parentElement.parentElement.children[1].textContent;

  if (!text.includes('selected')) {
     throw Error('Did not select photos');
  }

  var selectedCount = Number(text.split(' ')[0]);
  var photos = {};

  console.log('Scanning for', selectedCount, 'photos');

  while(Object.keys(photos).length < selectedCount) {
    var bottomMostPhoto = null;

    for (const photo of [...document.querySelectorAll('c-wiz a ~ div[aria-checked="true"]')]) {
      var a = photo.parentElement.querySelector('a');
     
      photo.scrollIntoView({behavior: "smooth", block: "start"});
      photos[a.href] = photo.getAttribute('aria-label').split(' - ')[0].toLowerCase();

      if (
        bottomMostPhoto == null || 
        bottomMostPhoto.getBoundingClientRect().y < photo.getBoundingClientRect().y
      ) {
         bottomMostPhoto = photo;
      }
    }

    bottomMostPhoto.scrollIntoView({behavior: "smooth", block: "start"});

    await wait(1000);
  }

  return photos;
}

var photos = await getSelectedPhotos();

console.log('Starting process of', Object.keys(photos).length, 'photos');

getVisible(document.querySelectorAll('button[aria-label="Clear selection"]'))[0].click();

await wait(1000);

await enhancePhotos(photos);

console.log('Finished processing!');

